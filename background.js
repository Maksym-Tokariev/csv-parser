console.log("Background script initializing...");

function isChromeAPIAvailable() {
    if (!chrome.tabs || !chrome.storage || !chrome.idle) {
        console.error("Required Chrome APIs are not available");
        return false;
    }
    return true;
}

class TimeTracker {

    constructor() {
        this.activeTabId = null;
        this.startTime = 0;
        this.currentDomain = "";
        this.isTracking = false;
        this.tickCount = 0;
        this.waitingTime = 3600;
        this.alarmName = 'timeTrackerKeepAlive';
        this.excludedDomains = new Set();

        this.init();
    }

    init() {
        if (!chrome.tabs || !chrome.storage) {
            confirm("Missing required APIs. Need to add permission")
            return;
        }

        if (!isChromeAPIAvailable()) {
            return;
        }

        chrome.storage.local.get('excludedDomains', result => {
            if (result.excludedDomains) {
                result.excludedDomains.forEach(domain => {
                    this.excludedDomains.add(domain);
                });
            }
        });

        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            this.handleMessage(message, sender, sendResponse);
        });

        chrome.tabs.onActivated.addListener(activeInfo => {
            this.saveCurrentTime();
            this.activeTabId = activeInfo.tabId;
            this.startTracking();
        });

        chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
            if (tabId === this.activeTabId && changeInfo.url) {
                this.saveCurrentTime();
                this.startTracking();
            }
        });

        chrome.tabs.onRemoved.addListener(tabId => {
            if (tabId === this.activeTabId) {
                this.saveCurrentTime();
                this.activeTabId = null;
            }
        });

        chrome.idle.onStateChanged.addListener((state) => {
            this.handleIdleStateChanged(state);
        });

        chrome.alarms.onAlarm.addListener((alarm) => {
            if (alarm.name !== this.alarmName) return;
            console.log("timeTrackerKeepAlive");

            chrome.idle.setDetectionInterval(this.waitingTime);

            if (this.isTracking) {
                this.tickCount++;
            }
        });

        console.log("Tracker initialized")
    }

    handleMessage(message, sender, sendResponse) {
        switch (message.type) {
            case "addExcludedDomain":
                this.excludedDomains.add(message.domain);
                sendResponse({success: true});
                return true;

            case "removeExcludedDomains":
                const deleted = this.excludedDomains.delete(message.domain);
                sendResponse({success: deleted});
                return true;

            case "getExcludedDomains":
                sendResponse({domains: [...this.excludedDomains]});
                return true;

            case "excludedDomain":
                this.excludedDomains.add(message.domain);
                chrome.storage.local.set({excludedDomains: [...this.excludedDomains]});

            case "saveExcludedDomains":
                chrome.storage.local.set({excludedDomains: [...this.excludedDomains]});
                sendResponse({success: true});
                return true;

            case "renameDomain":
                this.renameDomain(message.oldDomain, message.newDomain)
                    .then(() => sendResponse({success: true}), () => {
                        console.log(`Domain renamed from ${message.oldDomain} to ${message.newDomain}`);
                    })
                    .catch((e) => sendResponse({success: false, error: e.message}));
                return true;

            case "deleteDomain":
                this.deleteDomainData(message.domain)
                    .then(() => {
                        sendResponse({success: true})
                    })
                    .catch((e) => {
                        console.error('Error in deleteDomainData:', e);
                        sendResponse({success: false, error: e.message})
                    });
                return true;

            default:
                return false;
        }
    }

    async renameDomain(oldDomain, newDomain) {
        const allData = await chrome.storage.local.get();
        const dateKeys = Object.keys(allData).filter(key => /^\d{4}-\d{2}-\d{2}$/.test(key));

        for (const date of dateKeys) {
            const dailyData = allData[date];

            if (!dailyData || !(oldDomain in dailyData)) continue;

            const seconds = dailyData[oldDomain];
            delete dailyData[oldDomain];
            dailyData[newDomain] = (dailyData[newDomain] || 0) + seconds;

            if (Object.keys(dailyData).length === 0) {
                await chrome.storage.local.remove(date);
            } else {
                await chrome.storage.local.set({[date]: dailyData});
            }
        }

        if (this.currentDomain === oldDomain) {
            this.currentDomain = newDomain;
        }
    }

    async deleteDomainData(domain) {
        const allData = await chrome.storage.local.get();
        const dateKeys = Object.keys(allData).filter(key => /^\d{4}-\d{2}-\d{2}$/.test(key));

        for (const date of dateKeys) {
            const dailyData = allData[date];

            if (dailyData && domain in dailyData) {
                delete dailyData[domain];

                console.log(`${domain} deleted`);
                if (Object.keys(dailyData).length === 0) {
                    await chrome.storage.local.remove(date);
                } else {
                    await chrome.storage.local.set({[date]: dailyData})
                }
            }
        }

        if (this.currentDomain === domain) {
            this.currentDomain = "";
            this.isTracking = false;
        }
    }

    handleIdleStateChanged(state) {
        console.log("Idle state changed:", state);
        if (state === "idle" || state === "locked") {
            console.log(`User isn't active: state - ${state}`);
            setTimeout(() => this.saveCurrentTime(), 5000);
        } else if (state === "active") {
            console.log(`User active`);
            chrome.tabs.query({active: true, currentWindow: true}, tabs => {
                if (tabs[0] && tabs[0].id === this.activeTabId) {
                    this.startTracking();
                }
            });

        }
    }

    createAlarmTick() {
        chrome.alarms.create(this.alarmName, {periodInMinutes: 0.333});
        console.log("Alarm created");
    }

    removeAlarmTick() {
        chrome.alarms.clear(this.alarmName);
        console.log("Alarm removed");
    }

    async startTracking() {
        if (this.activeTabId === null) {
            return;
        }
        try {
            this.isTracking = true;

            this.createAlarmTick();

            const tab = await chrome.tabs.get(this.activeTabId);

            if (!tab.url) {
                console.warn("Active tab has no URL")
                this.currentDomain = "";
                this.isTracking = false;
                return;
            }

            let domain;
            try {
                const url = new URL(tab.url);
                domain = url.hostname;

                if (this.excludedDomains.has(domain)) {
                    console.log(`Skipping excluded domain: ${domain}`);
                    this.isTracking = false;
                    return;
                }

            } catch (e) {
                console.error("Error parsing URL:", tab.url, e);
                return;
            }

            if (domain === "") {
                domain = "undefined domain";
            }

            this.currentDomain = domain;
            this.startTime = Date.now();

            console.log(`Tracking started for: ${this.currentDomain}`);
        } catch (e) {
            console.error("Failed to start tracking: ", e);
            this.currentDomain = "";
            this.isTracking = false;
        }
    }

    saveCurrentTime() {
        if (!this.isTracking) return;

        if (!this.currentDomain || !this.startTime) {
            console.error(`Current time or domain is undefined: 
            [domain : ${this.currentDomain}, time : ${this.startTime}]`);

            this.isTracking = false;
            return;
        }

        const endTime = Date.now();
        const secondsSpent = Math.round((endTime - this.startTime) / 1000);

        if (secondsSpent < 10) {
            console.log("Skipping short session");
            return;
        }

        const today = new Date().toISOString().split('T')[0];


        const saveDomain = this.currentDomain;
        const saveStartTime = this.startTime;

        this.removeAlarmTick();
        this.startTime = 0;
        this.currentDomain = "";
        this.isTracking = false;
        this.tickCount = 0;

        try {
            chrome.storage.local.get([today], result => {
                const dailyData = result[today] || {};

                dailyData[saveDomain] = (dailyData[saveDomain] || 0) + secondsSpent;

                chrome.storage.local.set({[today]: dailyData}, () => {
                    console.log(`Saved ${secondsSpent}s for ${saveDomain}`);

                    chrome.runtime.sendMessage({
                        type: "timeUpdated",
                        domain: saveDomain,
                        seconds: secondsSpent,
                        date: today
                    }, () => {
                        if (chrome.runtime.lastError) {
                            console.log("Message receiver not available");
                        }
                    });
                });
            });

        } catch (e) {
            console.error(`Failed saving data to storage: ${saveDomain}, ${secondsSpent}`, e);
            this.isTracking = false;
        }
    }
}

console.log("Background script loaded successfully");

try {
    console.log("Creating TimeTracker instance...");
    const tracker = new TimeTracker();
} catch (error) {
    console.error("Failed to initialize TimeTracker:", error);
}

console.log("Background script loaded successfully");

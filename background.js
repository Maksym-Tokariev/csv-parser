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
        this.isTreking = false;

        this.init();
    }

    init() {
        if (!chrome.tabs || !chrome.storage) {
            console.error("Missing required APIs");
            return;
        }

        if (!isChromeAPIAvailable()) {
            return;
        }
        chrome.tabs.onActivated.addListener(activeInfo => {
            console.log("Domain 1 in onActivated: " + this.currentDomain);
            this.saveCurrentTime();
            console.log("Domain 3 in onActivated: " + this.currentDomain);
            this.activeTabId = activeInfo.tabId;
            this.startTracking();
        });

        chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
            if (tabId === this.activeTabId && changeInfo.url) {
                this.saveCurrentTime();
                this.startTracking();
            }
        });

        // chrome.idle.onStateChanged.addListener(state => {
        //     this.handleIdleStateChanged(state);
        // });

        chrome.tabs.onRemoved.addListener(tabId => {
           if (tabId == this.activeTabId) {
               this.saveCurrentTime();
               this.activeTabId = null;
           }
        });

        chrome.alarms.create('tick', {periodInMinutes: 0.333});

        chrome.alarms.onAlarm.addListener((alarm) => {
            if (alarm.name !== 'tick') return;
            console.log("Alarm: " + alarm);
        })

        // chrome.tabs.query({active: true, currentWindow: true}, tabs => {
        //     for (const tab of tabs) {
        //         if (tab) {
        //             this.activeTabId = tab.id;
        //             this.startTracking().then(() => {
        //                 console.log(`Starting tracking [${this.activeTabId}]`);
        //             })
        //         }
        //     }
        // });

        console.log("Tracker initialized")
    }


    // handleIdleStateChanged(state) {
    //     console.log("Idle state changed:", state);
    //     if (state === "idle" || state === "locked") {
    //         this.saveCurrentTime();
    //     }
    //
    //     if (state === "active") {
    //         this.startTracking();
    //     }
    // }

    // clearStorage() {
    //     chrome.storage.local.clear(() => {
    //         console.log("Clear storage");
    //         this.activeTabId = null;
    //         this.startTime = null;
    //         this.currentDomain = null;
    //     });
    // }

    async startTracking() {
        if (this.activeTabId === null ) {
            return;
        }
        try {
            this.isTreking = true;
            const tab = await chrome.tabs.get(this.activeTabId);

            if (!tab.url) {
                console.warn("Active tab has no URL")
                this.currentDomain = "";
                this.isTreking = false;
                return;
            }

            let domain;
            try {
                const url = new URL(tab.url);
                domain = url.hostname;

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
            this.isTreking = false;
        }
    }

    saveCurrentTime() {
        if (!this.isTreking) return;

        if (!this.currentDomain || !this.startTime) {
            console.error(`Current time or domain is undefined: 
            [domain : ${this.currentDomain}, time : ${this.startTime}]`);

            this.isTreking = false;
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

        this.startTime = 0;
        this.currentDomain = "";
        this.isTreking = false;

        try {
            chrome.storage.local.get([today], result => {
                const dailyData = result[today] || {};

                dailyData[saveDomain] = (dailyData[saveDomain] || 0) + secondsSpent;

                chrome.storage.local.set({ [today]: dailyData }, () => {
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
            this.isTreking = false;
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
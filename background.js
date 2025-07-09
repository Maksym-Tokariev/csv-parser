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
            this.saveCurrentTime();
            this.activeTabId = activeInfo.tabId;
            this.startTracking();
        });

        chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
            if (tabId == this.activeTabId && changeInfo.url) {
                this.saveCurrentTime();
                this.startTracking();
            }
        });

        chrome.idle.onStateChanged.addListener(state => {
            this.handleIdleStateChanged(state);
        });

        chrome.tabs.onRemoved.addListener(tabId => {
           if (tabId == this.activeTabId) {
               this.saveCurrentTime();
               this.activeTabId = null;
           }
        });


        chrome.tabs.query({active: true, currentWindow: true}, tabs => {
            if (tabs[0]) {
                this.activeTabId = tabs[0].id;
                this.startTracking();
            }
        });
        console.log("Tracker initialized")
    }


    handleIdleStateChanged(state) {
        console.log("Idle state changed:", state);
        if (state === "idle" || state === "locked") {
            this.saveCurrentTime();
        }

        if (state === "active") {
            this.startTracking();
        }
    }

    clearStorage() {
        chrome.storage.local.clear(() => {
            console.log("Clear storage");
            this.activeTabId = null;
            this.startTime = null;
            this.currentDomain = null;
        });
    }

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

            this.currentDomain = domain;
            this.startTime = Date.now();

            console.log(`Tracking started for: ${this.currentDomain}`);
        } catch (e) {
            console.error("Failed to start tracking: ", e);
            this.currentDomain = "";
            this.isTreking = false;
        }
    }

    clearOldData() {

    }

    saveCurrentTime() {
        if (!this.isTreking) return;

        if (!this.currentDomain || !this.startTime) {
            console.error("Current time or domain is undefined");
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

        try {
            chrome.storage.local.get([today], result => {
                const dailyData = result[today] || {};

                dailyData[this.currentDomain] = (dailyData[this.currentDomain] || 0) + secondsSpent;

                chrome.storage.local.set({ [today]: dailyData }, () => {
                    console.log(`Saved ${secondsSpent}s for ${this.currentDomain}`);
                });
            });
        } catch (e) {
            console.error(`Failed saving data to storage: ${this.currentDomain}, ${secondsSpent}`, e);
            this.isTreking = false;
        }

        this.startTime = 0;
        this.currentDomain = "";
        this.isTreking = false;
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
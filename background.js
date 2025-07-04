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
        this.startTime = null;
        this.currentDomain = null;

        this.init();
    }

    init() {
        if (!isChromeAPIAvailable()) return;

        console.log("Initializing event listeners...");

        chrome.tabs.onActivated.addListener(this.handleTabActivated.bind(this));
        chrome.tabs.onUpdated.addListener(this.handleTabUpdated.bind(this));
        chrome.idle.onStateChanged.addListener(this.handleIdleStateChanged.bind(this));

        // Инициализация при запуске
        chrome.runtime.onStartup.addListener(() => {
            console.log("Extension started");
        });

        chrome.runtime.onInstalled.addListener(() => {
            console.log("Extension installed");
        });

        console.log("TimeTracker initialized successfully");
    }

    async handleTabActivated(activeInfo) {
        console.log("Tab activated:", activeInfo);
        this.saveCurrentTime();
        this.activeTabId = activeInfo.tabId;
        await this.startTracking();
    }

    async handleTabUpdated(tabId, changeInfo) {
        if (tabId === this.activeTabId && changeInfo.url) {
            console.log("Tab updated:", tabId, changeInfo.url);
            this.saveCurrentTime();
            await this.startTracking();
        }
    }

    handleIdleStateChanged(state) {
        console.log("Idle state changed:", state);
        if (state === "idle" || state === "locked") {
            this.saveCurrentTime();
        }
    }

    async startTracking() {
        if (!this.activeTabId) {
            console.warn("No active tab ID");
            return;
        }

        try {
            const tab = await chrome.tabs.get(this.activeTabId);
            if (!tab.url) {
                console.warn("Tab has no URL");
                return;
            }

            const url = new URL(tab.url);
            this.currentDomain = url.hostname;
            this.startTime = Date.now();

            console.log(`Started tracking: ${this.currentDomain}`);
        } catch (error) {
            console.error("Error starting tracking:", error);
            this.currentDomain = null;
        }
    }

    saveCurrentTime() {
        if (!this.startTime || !this.currentDomain) {
            console.warn("Nothing to save - no start time or domain");
            return;
        }

        const endTime = Date.now();
        const secondsSpent = Math.round((endTime - this.startTime) / 1000);

        if (secondsSpent < 5) {
            console.log("Ignoring short session (<5s)");
            return;
        }

        const today = new Date().toLocaleDateString();
        console.log(`Saving ${secondsSpent}s for ${this.currentDomain} on ${today}`);

        chrome.storage.local.get([today], result => {
            const dailyData = result[today] || {};
            dailyData[this.currentDomain] = (dailyData[this.currentDomain] || 0) + secondsSpent;

            chrome.storage.local.set({ [today]: dailyData }, () => {
                console.log("Data saved:", dailyData);
                // Сбрасываем отслеживание после сохранения
                this.startTime = null;
                this.currentDomain = null;
            });
        });
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
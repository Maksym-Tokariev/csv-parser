console.log("Background script loaded!");
chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension installed");
});

let activeTabId = null;
let startTime = null;
let currentDomain = null;

chrome.tabs.onActivated.addListener(activeInfo => {
    trackTime();
    activeTabId = activeInfo.tabId;
    updateDomain();
});

chrome.tabs.onUpdate.addListener((tabId,changeInfo) => {
    if (tabId === activeTabId && changeInfo.url) {
        trackTime();
        updateDomain();
    }
});

async function updateDomain() {
    if (!activeTabId) {
        return;
    }

    const tab = await chrome.tabs.get(activeTabId);
    try {
        const url = new URL(tab.url);
        currentDomain = url.hostname;
        startTime = Date.now();
    } catch (e) {
        console.error(e);
        currentDomain = null;
    }
}

function trackTime() {
    if (!startTime && !currentDomain) return;

    const endTime = Date.now();
    const timeSpent = Math.round((endTime - startTime) / 1000);

    if (timeSpent < 5) return;

    saveTime(currentDomain, timeSpent);
}

function saveTime(currentDomain, timeSpent) {
    try {
        const today = new Date().toLocaleDateString();

        chrome.storage.local.get([today], data => {
            const dailyData = data[today] || {};
            dailyData[domain] = (dailyData[domain] || 0) + seconds;

            chrome.storage.local.set({ [today]: dailyData });
        })
    } catch (e) {
        console.error("Error saving time: ", e);
    }
}

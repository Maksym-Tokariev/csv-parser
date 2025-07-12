document.addEventListener("DOMContentLoaded", () => {
    const todayBtn = document.getElementById("todayBtn");
    const weekBtn = document.getElementById("weekBtn");
    const clearBtn = document.getElementById("clearBtn");
    const refreshBtn = document.getElementById("refreshBtn");
    const websiteList = document.getElementById("websiteList");

    let currentMod = "today";

    function formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else if (minutes > 0) {
            return `${minutes}m ${secs}s`;
        } else {
            return `${secs}s`;
        }
    }

    function renderWebsiteList(data) {
        websiteList.innerHTML = '';

        if (!data || Object.keys(data).length === 0) {
            websiteList.innerHTML = '<div class="website-item">No data available</div>';
            return;
        }

        const sortedData = Object.entries(data)
            .sort(([, timeA], [, timeB]) => timeB - timeA);

        sortedData.forEach(([domain, seconds]) => {
            const item = document.createElement('div');
            item.className = 'website-item';

            const domainEl = document.createElement('span');
            domainEl.textContent = domain;

            const timeEl = document.createElement('span');
            timeEl.className = 'time';
            timeEl.textContent = formatTime(seconds);

            item.appendChild(domainEl);
            item.appendChild(timeEl);
            websiteList.appendChild(item);
        });
    }

    async function loadData(day = 1) {
        const dates = [];
        const now = new Date();

        for (let i = 0; i < day; i++) {
            const date = new Date(now);
            date.setDate(now.getDate() - i);
            dates.push(date.toISOString().split('T')[0]);
        }

        const result = await chrome.storage.local.get(dates);

        const combineData = {};
        dates.forEach(date => {
            const dailyDate = result[date] || {};
            for (const [domain, seconds] of Object.entries(dailyDate)) {
                combineData[domain] = (combineData[domain] || 0) + seconds;
            }
        });

        return combineData;
    }

    async function updateUI() {
        websiteList.innerHTML = '<div class="website-item">Loading...</div>';

        try {
            const data = currentMod === "today"
                ? await loadData(1)
                : await loadData(7);
            renderWebsiteList(data);
        } catch (error) {
            websiteList.innerHTML = '<div class="website-item">Error loading data</div>';
        }
    }

    todayBtn.addEventListener("click", async () => {
        currentMod = "today";
        await updateUI();
    });

    weekBtn.addEventListener("click", async () => {
        currentMod = "week";
        await updateUI();
    });

    refreshBtn.addEventListener("click", async () => {
        await updateUI();
    });

    clearBtn.addEventListener("click", async () => {
        if (confirm("Are you sure you want to delete all tracking data?")) {
            await chrome.storage.local.clear();
            await updateUI();
        }
    });

    chrome.runtime.onMessage.addListener((message) => {
        if (message.type === 'timeUpdated' && currentMod === 'today') {
            updateUI();
        }
    });

    todayBtn.click();
});


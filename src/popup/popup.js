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

            const editBtn = document.createElement('button');
            editBtn.className = 'editBtn';
            editBtn.textContent = 'Edit domain';

            const excludeBtn = document.createElement('button');
            excludeBtn.className = 'excludeDomainBtnInList';
            excludeBtn.textContent = 'exclude';

            const deleteDomainBtn = document.createElement('button');
            deleteDomainBtn.className = 'deleteDomainBtnInList';
            deleteDomainBtn.textContent = 'delete';

            item.appendChild(domainEl);
            item.appendChild(editBtn);
            item.appendChild(excludeBtn);
            item.appendChild(deleteDomainBtn);
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

    const exclusionModal = document.getElementById('exclusionModal');
    const closeBtn = document.querySelector('.close');
    const domainInput = document.getElementById('domainInput');
    const addDomainBtn = document.getElementById('addDomainBtn');
    const excludedList = document.getElementById('excludedList');
    const excludeCurrentBtn = document.getElementById('excludeCurrentBtn');
    const saveExclusionsBtn = document.getElementById('saveExclusionsBtn');

    document.getElementById('excludeBtn').addEventListener('click', (e) => {
       exclusionModal.style.display = 'block';
        loadExcludedDomains();
    });

    closeBtn.addEventListener('click', () => {
       exclusionModal.style.display = 'none';
    });

    addDomainBtn.addEventListener('click', () => {
        const domain = domainInput.value.trim();
        if (domain) {
            addExcludedDomain(domain);
            domainInput.value = '';
        }
    });

    excludeCurrentBtn.addEventListener('click', async () => {
        const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
        if (tab && tab.url) {
            try {
                const url = new URL(tab.url);
                addExcludedDomain(url.hostname);
            } catch (e) {
                console.error("Error parsing URL:", e);
            }
        }
    });

    saveExclusionsBtn.addEventListener('click', () => {
        chrome.runtime.sendMessage({
            type: "saveExcludedDomains"
        }, () => {
            exclusionModal.style.display = 'none';
        });
    });

    function loadExcludedDomains() {
        chrome.runtime.sendMessage({type: "getExcludedDomains"}, response => {
            if (!response) {
                console.error("No response received");
                return;
            }
            excludedList.innerHTML = '';
            response.domains.forEach(domain => {
                const li = document.createElement('li');
                li.textContent = domain;

                const removeBtn = document.createElement('button');
                removeBtn.textContent = 'Remove';
                removeBtn.addEventListener('click', () => {
                    chrome.runtime.sendMessage({
                       type: "removeExcludedDomain",
                       domain: domain
                   }, (response) => {
                        if (response && response.success) {
                            li.remove();
                        } else {
                            console.error("Failed to remove domain");
                            confirm("Failed to remove domain");
                        }
                   });
                });

                li.appendChild(removeBtn);
                excludedList.appendChild(li);
            });
        });
    }

    function addExcludedDomain(domain) {
        const exists = Array.from(excludedList.children).some(
            li => li.textContent.includes(domain)
        );

        if (!exists) {
            chrome.runtime.sendMessage({
                type: "addExcludedDomain",
                domain: domain
            }, () => {
                loadExcludedDomains();
            });
        }
    }

    todayBtn.click();
});

try {
    console.log("Chart.js version:", Chart.version);
} catch (e) {
    console.error("Chart not loaded:", e);
}

console.log("chrome.storage:", chrome.storage);
console.log("chrome.storage.local:", chrome.storage.local);

const testDate = new Date().toLocaleDateString();
chrome.storage.local.set({
    [testDate]: {
        "example.com": 300,
        "test.org": 150
    }
});

chrome.storage.local.get(null, data => {
    console.log("All storage data:", data);
});

document.addEventListener('DOMContentLoaded', () => {
    const todayBtn = document.getElementById('todayBtn');
    const weekBtn = document.getElementById('weekBtn');
    const canvas = document.getElementById('timeChart');

    if (!todayBtn || !weekBtn || !canvas) {
        console.error("Critical elements not found!");
        return;
    }

    const ctx = canvas.getContext('2d');
    let timeChart = null;

    //Data downloading
    async function loadData(days = 1) {
        try {
            const dates = [];
            const now = new Date();

            for (let i = 0; i < days; i++) {
                const date = new Date();
                date.setDate(now.getDate() - i);
                dates.push(date.toLocaleDateString());
            }

            const result = await chrome.storage.local.get(dates);
            return  dates.map(date => result[date] || {});
        } catch (e) {
            console.error("Error loading data:", e);
            return Array(days).fill({});
        }
    }

    function renderChart(data, isWeekly = false) {
        if (timeChart) timeChart.destroy();

        const domains = {};
        data.forEach(dayData => {
            for (const [domain, seconds] of Object.entries(dayData)) {
                domains[domain] = (domains[domain] || 0) + seconds;
            }
        });

        const labels = Object.keys(domains);
        const timeData = Object.values(domains).map(sec => Math.round(sec / 60)); // min

        timeChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: isWeekly ? 'Minutes (Week)' : 'Minutes (Today)',
                    data: timeData,
                    backgroundColor: '#4e73df'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: value => value + ' min'
                        }
                    }
                }
            }
        });
    }

    // Обработчики кнопок
    todayBtn.addEventListener('click', async () => {
        const data = await loadData(1);
        renderChart(data);
    });

    weekBtn.addEventListener('click', async () => {
        const data = await loadData(7);
        renderChart(data, true);
    });

    // Инициализация
    todayBtn.click();
});


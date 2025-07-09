try {
    console.log("Chart.js version:", Chart.version);
} catch (e) {
    console.error("Chart not loaded:", e);
}

//
// const testDate = new Date().toLocaleDateString();
// chrome.storage.local.set({
//     [testDate]: {
//         "example.com": 300,
//         "test.org": 150
//     }
// });

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
            console.log("Loading data: ", days);
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
            console.error("Error loading data: ", e);
            return Array(days).fill({});
        }
    }

    todayBtn.addEventListener('click', async () => {
        const data = await loadData(1);
        // renderChart(data);
    });

    weekBtn.addEventListener('click', async () => {
        const data = await loadData(7);
        // renderChart(data, true);
    });

    todayBtn.click();
});


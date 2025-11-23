const fs = require('fs');
const readLine = require('readline');

const filePath = '../data/data.csv';
const arrColumns = ['id','category','country','price','quantity','sold_at'];

async function parseCSV(filePath) {
    if (!isFileFound()) {
        throw new Error('File not found');
    }
    const fileStream = fs.createReadStream(filePath);
    const rl = readLine.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });
    const iterator = rl[Symbol.asyncIterator]();

    const res = await iterator.next();
    const headerLine = res.value;
    const headers = headerLine.split(',');

    console.log(headers)
    const records= [];
    if (isHeaderCorrect(headers)) {
        for await (const line of rl) {
            const values = line.split(',');
            const record = Object.fromEntries(
                headers.map((str, i) => [str, values[i]])
            );
            records.push(record);
        }
    }
    return records;
}

function isFileFound() {
    return fs.existsSync(filePath);
}

function isHeaderCorrect(header) {
    const isHeaderValid = arrColumns.every((col) => header.includes(col));
    if (!isHeaderValid) {
        const missing = arrColumns.filter(col => !header.includes(col));
        throw new Error(`Some required fields are missing: ${missing}`)
    }
    console.log('First line correct');
    return true;
}
function parseLine(str) {
    console.log('Parsing');
}

function checkLineLength(line) {

}

(async () => {
    const data = await parseCSV(filePath);

    if (data.length === 0) {
        console.warn('No data found in CSV file');
    } else if (data.length === 1) {
        console.log('Incorrect data');
    }
    console.log('✅ Objects read: ' + data.length);
})();

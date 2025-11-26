const fs = require('fs');
const readLine = require('readline');

const FILE_PATH = '../data/data.csv';
const ARR_OF_COLUMNS = ['id','category','country','price','quantity','sold_at'];
const MAX_LINE_SIZE = 30;
const NUMBER_OF_COLUMNS = 5;

async function initializeFileReader() {
    if (!isFileFound()) {
        throw new Error('File not found');
    }
    const fileStream = fs.createReadStream(FILE_PATH);
    return readLine.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });
}

async function parseCSV() {
    const rl = await initializeFileReader();
    const iterator = rl[Symbol.asyncIterator]();

    const res = await iterator.next();
    const headerLine = res.value;
    const headers = headerLine.split(',');

    const records= [];
    if (isHeaderCorrect(headers)) {
        for await (const line of rl) {
            //Obj
            const values = line.split(',');
            const isLineValid = checkLineLength(values);
                // && checkMissing(values);
            // if (!isLineValid) {
            //     continue;
            // }

            const record = Object.fromEntries(
                headers.map((str, i) => [str, values[i]])
            );
            console.log('Record -------------')
            console.log(record);
            records.push(record);
        }
    }
    return records;
}

function checkLineLength(values) {
    return Object.entries(values).every(([key, value]) => {
        console.log(key + ' -- ' + value);
        if (value === undefined || value.length === 0) {
            console.warn(` The empty value in column : ${key}`);
            /*
            * Если значение поля пустое, то проходимся по всем полям и сравниеваем их со значениями ARR_OF_COLUMNS
            * находим недостающее поле, после, вписываем в него значение 0 и производим смещение
            * */
        }
        if (value.length > MAX_LINE_SIZE) {
            console.warn(`To long value in column [${key}] : ${value}`);
            console.warn('The object was not read');
            return false;
        }
        return true;
    });
}

function isFileFound() {
    return fs.existsSync(FILE_PATH);
}

function isHeaderCorrect(header) {
    const isHeaderValid = ARR_OF_COLUMNS.every((col) => header.includes(col));
    if (!isHeaderValid) {
        const missing = ARR_OF_COLUMNS.filter(col => !header.includes(col));
        throw new Error(`Some required fields are missing: ${missing}`);
    }
    return true;
}

(async () => {
    const data = await parseCSV(FILE_PATH);

    if (data.length === 0) {
        console.warn('No data found in CSV file');
    } else if (data.length === 1) {
        console.log('Incorrect data');
    }
    console.log('✅ Objects read: ' + data.length);
})();

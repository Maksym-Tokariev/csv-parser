import { CSVProcessor } from './utils/csv-processor';
import { Aggregator } from "./utils/aggregator";
import {
    ParseResult,
    StatData
} from "./types/types";

async function main(): Promise<void> {
    try {
        console.log('Start process...');
        const processor = new CSVProcessor();
        const aggregator = new Aggregator();
        const res: ParseResult = await processor.parseCSV();
        showResult(res);

        const stat: StatData = await aggregator.aggregateData(res);
        console.log('\n---- Stat ----\n');
        console.log(stat)

        if (res.validLines === 0 && res.totalLines > 0) {
            console.warn('All lines in CSV file were invalid');
        }

    } catch (error) {
        console.error('Error processing CSV file:', error instanceof Error ? error.message : error);
        process.exit(1);
    }
}

function showResult(res: ParseResult): void {
    console.log('\n---- Parsing Results ----\n');
    console.log(`Total lines processed: ${res.totalLines}`);
    console.log(`Valid records: ${res.validLines}`);
    console.log(`Invalid lines: ${res.invalidLines}`);
    console.log(`✅ Objects read: ${res.records.length}`);
}

main();

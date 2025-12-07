import { CSVProcessor } from './utils/csv-processor';
import { Aggregator } from "./utils/aggregator";
import { Writer } from "./utils/writer";
import {
    ParseResult,
    StatData
} from "./types/types";
import {RESULT_FILE_PATH} from "./config/constants";

async function main(): Promise<void> {
    try {
        const processor = new CSVProcessor();
        const aggregator = new Aggregator();

        const res: ParseResult = await processor.parseCSV();
        const stat: StatData = await aggregator.aggregateData(res);

        if (res.validLines === 0 && res.totalLines > 0) {
            console.warn('All lines in CSV file were invalid');
        }
        Writer.prototype.createJson(res, stat, RESULT_FILE_PATH);
    } catch (error) {
        console.error('Error processing CSV file:', error instanceof Error ? error.message : error);
        process.exit(1);
    }
}

main();

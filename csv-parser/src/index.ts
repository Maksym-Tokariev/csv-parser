import { CSVProcessor } from './utils/csv-processor';
import { Aggregator } from "./utils/aggregator";
import { Writer } from "./utils/writer";
import {
    ParseResult,
    StatData
} from "./types/types";
import {RESULT_FILE_PATH} from "./config/constants";
import {logger} from "./utils/logger";

async function main(): Promise<void> {
    try {
        const processor = new CSVProcessor();
        const aggregator = new Aggregator();

        const res: ParseResult = await processor.parseCSV();
        const stat: StatData = await aggregator.aggregateData(res);

        Writer.prototype.createJson(res, stat, RESULT_FILE_PATH);
    } catch (error) {
        logger.error('', error, 'main');
        process.exit(1);
    }
}
main();

import { CSVProcessor } from './utils/csv-processor';
import { Aggregator } from "./utils/aggregator";
import { Writer } from "./utils/writer";
import {
    ParseResult,
    StatData
} from "./types/types";
import {INPUT_FILE_PATH, RESULT_FILE_PATH} from "./config/constants";
import {logger} from "./utils/logger";

class Application {
    private readonly processor: CSVProcessor;
    private readonly aggregator: Aggregator;
    private readonly writer: Writer;

    constructor() {
        this.processor = new CSVProcessor();
        this.aggregator = new Aggregator();
        this.writer = new Writer();
    }

    async run(): Promise<void> {
        logger.info('Starting CSV processing application', {
            inputFile: INPUT_FILE_PATH,
            outputFile: RESULT_FILE_PATH
        }, 'Application');

        try {
            const startTime = Date.now();

            const parseResult: ParseResult = await this.processor.parseCSV();
            const stats: StatData = await this.aggregator.aggregateData(parseResult);
            await this.writer.createJson(parseResult, stats, RESULT_FILE_PATH);

            const duration = Date.now() - startTime;
            logger.info(`Processing completed in ${duration}ms`, null, 'Application');
        } catch (error) {
            logger.error('Application failed', {
                error: error.message,
                stack: error,
                timestamp: new Date().toISOString()
            }, 'Application')
        }
    }
}

async function main(): Promise<void> {
    const app = new Application();
    await app.run();
}
main()
    .then(() => {
    logger.debug('Main function completed', {}, 'main');
    })
    .catch((error) => {
        logger.error('Main function failed', { error }, 'main');
        process.exit(1);
    });

export {Application}

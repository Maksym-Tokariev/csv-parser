import { CSVProcessor } from './utils/csv-processor';
import { Aggregator } from "./utils/aggregator";
import { Writer } from "./utils/writer";
import { ParseResult } from "./types/parsingTypes";
import {logger} from "./utils/logger";
import {config} from "./utils/configurator";
import {configService} from "./services/config-service";
import {StatData} from "./types/statTypes";

class Application {
    private readonly processor: CSVProcessor;
    private readonly aggregator: Aggregator;
    private readonly writer: Writer;
    private readonly context: string;

    constructor(context: string = 'Application') {
        this.processor = new CSVProcessor();
        this.aggregator = new Aggregator();
        this.writer = new Writer();
        this.context = context;

    }

    async run(): Promise<void> {
        logger.info('Starting CSV processing application', {
            inputFile: configService.paths.inputFilePath,
            outputFile: configService.paths.resultFilePath
        }, 'Application');

        try {
            const startTime = Date.now();

            logger.debug('Section logging:\n', config.getAll(), this.context);

            const parseResult: ParseResult = await this.processor.parseCSV();
            const stats: StatData = await this.aggregator.aggregateData(parseResult);
            await this.writer.createJson(parseResult, stats, configService.paths.resultFileName);

            const duration = Date.now() - startTime;
            logger.info(`Processing completed in ${duration}ms`, null, this.context);
        } catch (error: any) {
            logger.error('Application failed', {
                error: error.message,
                stack: error,
            }, 'Application');
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

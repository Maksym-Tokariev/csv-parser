import { CSVProcessor } from './services/csv-processor';
import { Aggregator } from "./services/aggregator";
import { Writer } from "./services/writer";
import { ParseResult } from "./types/parsingTypes";
import {StatData} from "./types/statTypes";
import {logger} from "./services/logger";
import {config} from "./services/configurator";
import {configService} from "./services/config-service";
import {getContext} from "./utils/context";

export class Parser {
    private readonly processor: CSVProcessor;
    private readonly aggregator: Aggregator;
    private readonly writer: Writer;

    constructor() {
        this.processor = new CSVProcessor();
        this.aggregator = new Aggregator();
        this.writer = new Writer();
    }

    async run(filePath: string): Promise<void> {
        logger.info('Starting CSV processing application', {
            inputFile: configService.paths.inputFilePath,
            outputFile: configService.paths.resultFilePath
        }, getContext(this));

        try {
            const startTime = Date.now();

            logger.debug('Section logging:\n', config.getAll(), getContext(this));

            const parseResult: ParseResult = await this.processor.parseCSV();
            const stats: StatData = await this.aggregator.aggregateData(parseResult);
            await this.writer.createJson(parseResult, stats, filePath);

            const duration = Date.now() - startTime;
            logger.info(`Processing completed in ${duration}ms`, null, getContext(this));
        } catch (error: any) {
            logger.error('Application failed', {
                error: error.message,
                stack: error,
            }, getContext(this));
        }
    }
}

async function main(): Promise<void> {
    const app = new Parser();
    await app.run(configService.paths.resultFilePath);
}
main()
    .then(() => {
    logger.debug('Main function completed', {}, 'main');
    })
    .catch((error) => {
        logger.error('Main function failed', { error }, 'main');
        process.exit(1);
    });


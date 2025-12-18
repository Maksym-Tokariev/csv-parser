import {CSVProcessor} from './services/csv-processor';
import {Aggregator} from "./services/aggregator";
import {Writer} from "./services/writer";
import {ParseResult, ParserOptions, Report} from "./types/parsingTypes";
import {StatData} from "./types/statTypes";
import {Validator} from "./services/validator";
import {AppConfig} from "./types/configTypes";
import {DEFAULT_CONFIG} from "./config/defaultConfigs";
import {configService} from "./services/config-service";
import {Configurator} from "./services/configurator";

export class Parser {
    private readonly processor: CSVProcessor;
    private readonly configurator: Configurator;
    private readonly aggregator: Aggregator;
    private readonly validator: Validator;
    private readonly writer: Writer;

    private parseResult: ParseResult;
    private report: Report;
    private stat: StatData;

    constructor(options: AppConfig = {}) {
        this.configurator = new Configurator();
        this.processor = new CSVProcessor(this.options);
        this.aggregator = new Aggregator(this.options);
        this.validator = new Validator(this.options);
        this.writer = new Writer(this.options);
    }

    async parse(filePath?: string, source?: string | File | Buffer, options?: ParserOptions): Promise<this> {
        const mergedOptions = { ...this.options, ...options};
        try {

            this.parseResult = await this.processor.parseCSV(source, mergedOptions);
            return this;
        } catch (error: any) {
            throw new Error(`CSV parsing failed: ${error.message}`);
        }
        // logger.info('Starting CSV processing application', {
        //     inputFile: configService.paths.inputFilePath,
        //     outputFile: configService.paths.resultFilePath
        // }, getContext(this));
        //
        // try {
        //     const startTime: number = Date.now();
        //
        //     logger.debug('Section logging:\n', config.getAll(), getContext(this));
        //
        //     const parseResult: ParseResult = await this.processor.parseCSV();
        //     const stats: StatData = await this.aggregator.aggregateData(parseResult);
        //     await this.writer.createJson(parseResult, stats, filePath);
        //
        //     const duration: number = Date.now() - startTime;
        //     logger.info(`Processing completed in ${duration}ms`, null, getContext(this));
        // } catch (error: any) {
        //     logger.error('Application failed', {
        //         error: error.message,
        //         stack: error,
        //     }, getContext(this));
        // }
    }



    // async aggregate(aggregateOptions?: Partial<ParserOptions>): Promise<this> {
    //     if (!this.result) {
    //         throw new Error('No data to aggregate. Call parse() first.');
    //     }
    //
    //     const options = aggregateOptions ? { ...this.options, ...aggregateOptions } : this.options;
    //
    //     if (options.aggregate) {
    //         this.stat = await this.aggregator.aggregateData(this.result);
    //         this.result.stat = this.stat;
    //     }
    // }

    async parseFile(filePath: string, options?: Partial<ParserOptions> = {}): Promise<this> {
        return options? this.parse({ ...options, filePath }) : this.parse(filePath);
    }

    getConfig(): Readonly<Required<ParserOptions>> {
        return { ...this.options };
    }

    withOptions(options: Partial<ParserOptions>): Parser {
        return new Parser({ ...this.options, ...options });
    }
}


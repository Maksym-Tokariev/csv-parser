import {AppConfig} from "../types/config-types";
import {ParserServices} from "../interfaces/iconfig-service";
import {ConfigService} from "./config-service";
import {Logger} from "./logger";
import {CSVProcessor} from "./csv-processor";
import {Aggregator} from "./aggregator";
import {Writer} from "./writer";
import {ErrorReporter} from "./error-reporter";

export class ServicesFactory {
    static createServices(userConfig?: Partial<AppConfig>): ParserServices {
        const config = new ConfigService(userConfig);
        const logger = new Logger(config);
        const reporter = new ErrorReporter(logger);
        const processor = new CSVProcessor(config, logger, reporter);
        const aggregator = new Aggregator(config, logger);
        const writer = new Writer(config, logger);

        return {
            config,
            logger,
            processor,
            aggregator,
            writer,
            reporter
        };
    }
}
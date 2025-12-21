import {ConfigService} from "../services/config-service";
import {Logger} from "../services/logger";
import {CSVProcessor} from "../services/csv-processor";
import {Aggregator} from "../services/aggregator";
import {Writer} from "../services/writer";
import {ErrorReporter} from "../services/error-reporter";

export interface ParserServices {
    config: ConfigService;
    logger: Logger;
    processor: CSVProcessor;
    aggregator: Aggregator;
    writer: Writer;
    reporter: ErrorReporter;
}
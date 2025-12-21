import {ParseResult} from "./types/parsing-types";
import {AppConfig, RequiredAppConfig} from "./types/config-types";
import {ServicesFactory} from "./services/services-factory";
import {ParserServices} from "./interfaces/iconfig-service";
import {StatData} from "./types/stat-types";

export class Parser {
    private services: ParserServices;
    private parseResult: ParseResult = {} as ParseResult;

    constructor(services: ParserServices) {
        this.services = services;
    }

    async parse(filePath: string): Promise<this> {
        try {
            this.parseResult = await this.services.processor.parseCSV(filePath);
            return this;
        } catch (error: any) {
            throw new Error(`CSV parsing failed: ${error.message}`);
        }
    }

    configure(updates: Partial<AppConfig>): this {
        this.services.config.update(updates);
        return this;
    }

    async write(resDir: string): Promise<void> {
        await this.services.writer.writeOutput(this.parseResult, {} as StatData, resDir);
    }

    getConfig(): Readonly<RequiredAppConfig> {
        return this.services.config.getConfig();
    }

    getResult(): ParseResult {
        return this.parseResult;
    }

    static create(config?: Partial<AppConfig>): Parser {
        const services: ParserServices = ServicesFactory.createServices(config);
        return new Parser(services);
    }
}


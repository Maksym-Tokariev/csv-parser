import {ContextTypes} from "../types/contextTypes";
import {CONTEXTS} from "../config/constants";

class ContextService {
    private static instance: ContextService;

    private _contexts: ContextTypes;

    private constructor() {
        this._contexts = {
            parser: CONTEXTS.parser,
            processor: CONTEXTS.processor,
            validator: CONTEXTS.validator,
            configurator: CONTEXTS.configurator,
            errorReporter: CONTEXTS.errorReporter,
            writer: CONTEXTS.writer,
            aggregator: CONTEXTS.aggregator
        }
    }

    public static getInstance(): ContextService {
        if (!ContextService.instance) {
            ContextService.instance = new ContextService();
        }
        return ContextService.instance;
    }

    get parser(): ContextTypes['parser'] {
        return this._contexts.parser;
    }
    get processor(): ContextTypes['processor'] {
        return this._contexts.processor;
    }
    get validator(): ContextTypes['validator'] {
        return this._contexts.validator;
    }
    get configurator(): ContextTypes['configurator'] {
        return this._contexts.configurator
    }
    get errorReporter(): ContextTypes['errorReporter'] {
        return this._contexts.errorReporter;
    }
    get writer(): ContextTypes['writer'] {
        return this._contexts.writer;
    }
    get aggregator(): ContextTypes['aggregator'] {
        return this._contexts.aggregator;
    }
}

export const contextService: ContextService = ContextService.getInstance();
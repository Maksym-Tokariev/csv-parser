import {AppConfig} from "../types/configTypes";

export interface IConfigService {
    path: AppConfig['paths'],
    parsing: AppConfig['parsing'],
    validation: AppConfig['validation'],
    aggregation: AppConfig['aggregation'],
    logging: AppConfig['logging']
}
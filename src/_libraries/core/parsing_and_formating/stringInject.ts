import {Moment} from "moment";

export type ReplaceKeyValue = Record<string, string | number | Moment | string[]>;
export function replaceKeys(template: string, values: ReplaceKeyValue): string {
    return template.replaceAll(/{{(.*?)}}/g, (match, key) => {
        return key in values ? String(values[key]) : match;
    });
}


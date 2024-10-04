import {Moment} from "moment";


export function replaceKeys(template: string, values: { [key: string]: string | number | Moment | any }): string {
    return template.replaceAll(/{{(.*?)}}/g, (match, key) => {
        return key in values ? String(values[key]) : match;
    });
}


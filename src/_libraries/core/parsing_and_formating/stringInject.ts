import moment from "moment";
import {number, string} from "zod";
import {printPrettyArray} from "./printPrettyArray";


/**
 * How to Use it:
 *
 *
 * template: Hello {{name}}, it's {{time}} we have {{gift_name}} for you with nice {{design.color}}
 * values: {
 *     name: "Groupon",
 *     time: new Date()
 *     gift_name: "Voucher"
 *     design: {
 *         color: "red"
 *     }
 * }
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ReplaceKeyValue = Record<string, (string | number | Date | moment.Moment | string[] | any)>;


export function replaceKeys(template: string, values: ReplaceKeyValue, surfixkey?: string): string {

    for (const key in Object.keys(values)) {

        const replaceKey = surfixkey ? ('/{{' + surfixkey +'.' + key + '}}/g') : ('/{{' + key + '}}/g');

        if (values[key] instanceof Array) {
            const subString = printPrettyArray(values[key]);
            template = template.replaceAll( replaceKey, subString);
        }

        if (values[key] instanceof number) {
            template = template.replaceAll(replaceKey, values[key] + '');
        }

        if (values[key] instanceof string) {
            template = template.replaceAll(replaceKey, values[key] + '');
        }

        if (values[key] instanceof moment) {
            const mmn = values[key] as moment.Moment;
            template = template.replaceAll(replaceKey, mmn.format("YYYY-MM-DD HH:mm:ss"));
        }

        if (values[key] instanceof Date) {
            const date = values[key] as Date;
            template = template.replaceAll(replaceKey, date.toISOString());
        }

        if (typeof values[key] == 'object' && values[key] !== null) {
            template = replaceKeys(template, values[key], key);
        }
    }

    return template;

}


/**
 * How to Use it:
 *
 *
 * template: {
 *     "name": "Your name is {{full_name}},
 *     "address: {
 *         "full address": "Your address is {{street}}, {{city}}
 *     }
 * }
 * values: {
 *     full_name: "Jon Wick",
 *     street: "Rouse 54"
 *     city: "New York"
 * }
 */

export function replaceKeysInObject(json: Record<string, object>, injectionKeys: ReplaceKeyValue): object {

    function fillObjectWithKeys (obj: Record<string, object>) {

        for (const key in obj) {

            if (typeof obj[key] === "string") {
                // @ts-expect-error @ts-ignore
                obj[key] = replaceKeys(obj[key], injectionKeys);

            } else if (typeof obj[key] === 'object' && obj[key]) {
                // @ts-expect-error @ts-ignore
                fillObjectWithKeys(obj[key])
            }
        }

    }

    fillObjectWithKeys(json);
    return json;
}

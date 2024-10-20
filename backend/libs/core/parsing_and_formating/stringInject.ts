import moment from "moment";
import { printPrettyArray } from "./printPrettyArray";

/**
 * How to Use it:
 *
 *
 * template: Hello {name}, it's {time} we have {gift_name} for you with nice {design.color}
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
export type ReplaceKeyValue = Record<string, string | number | Date | moment.Moment | string[] | any>;

export function replaceKeys(template: string, values: ReplaceKeyValue, suffixKey?: string): string {
  // console.log("replaceKeys:: template", template)
  // console.log("replaceKeys:: values", values)

  for (const key of Object.keys(values)) {
    // console.log("replaceKeys:: for: key", key, "type", typeof values[key]);
    const replaceKey = suffixKey != null ? "{" + suffixKey + "." + key + "}" : "{" + key + "}";

    if (Array.isArray(values[key])) {
      // ?values[key] instanceof Array
      // console.log("replaceKeys:: key is Array", replaceKey);
      const subString = printPrettyArray(values[key]);
      // console.log("replaceKeys:: key is Array: subString. Value:", subString);
      template = template.replaceAll(replaceKey, subString);
    } else if (typeof values[key] === "number") {
      template = template.replaceAll(replaceKey, values[key] + "");
    } else if (typeof values[key] === "string") {
      template = template.replaceAll(replaceKey, values[key] + "");
    } else if (values[key] instanceof moment) {
      const mmn = values[key] as moment.Moment;
      template = template.replaceAll(replaceKey, mmn.format("YYYY-MM-DD HH:mm:ss"));
    } else if (values[key] instanceof Date) {
      const date = values[key] as Date;
      template = template.replaceAll(replaceKey, date.toISOString());
    } else if (typeof values[key] == "object" && values[key] !== null) {
      template = replaceKeys(template, values[key], key);
    } else {
      console.error("replaceKeys:: replaceKey", replaceKey, "value is not supported");
    }
  }

  // console.error("replaceKeys:: final Result", template);
  return template;
}

/**
 * How to Use it:
 *
 *
 * template: {
 *     "name": "Your name is {full_name},
 *     "address: {
 *         "full address": "Your address is {{street}}, {city}
 *     }
 * }
 * values: {
 *     full_name: "Jon Wick",
 *     street: "Rouse 54"
 *     city: "New York"
 * }
 */

export function replaceKeysInObject(json: Record<string, object>, injectionKeys: ReplaceKeyValue): object {
  function fillObjectWithKeys(obj: Record<string, object>) {
    for (const key in obj) {
      if (typeof obj[key] === "string") {
        // @ts-expect-error @ts-ignore
        obj[key] = replaceKeys(obj[key], injectionKeys);
      } else if (typeof obj[key] === "object" && obj[key]) {
        // @ts-expect-error @ts-ignore
        fillObjectWithKeys(obj[key]);
      }
    }
  }

  fillObjectWithKeys(json);
  return json;
}

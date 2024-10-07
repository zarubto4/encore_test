


export function printPrettyArray(array: string[]): string {

    let str = "";
    for(const element of array) {
        str = str + element + ", "
    }

    if (array.length > 4) {
        str = str.substring(0, str.length - 2);  // remove latest ", "
    }

    return str;
}

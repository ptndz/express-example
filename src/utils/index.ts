export * from "./jwt";
export * from "./createI18n";
export * from "./strFirstLetter";
export * from "./removeVietnameseTones";
export * from "./strToCapitalize";

function typeoOf(value: any) {
    return Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
}

function stringify(obj: any) {
    if (typeoOf(obj) === 'string') {
        return obj;
    }
    return JSON.stringify(obj);
}

function parse(str: any) {
    if (typeoOf(str) === "object") {
        return str;
    }
    if (
        typeoOf(str) !== "null" &&
        typeoOf(str) !== "undefined" &&
        isValidJSON(str)
    ) {
        return JSON.parse(str);
    }
    return null;
}

function isValidJSON(str: string) {
    try {
        JSON.parse(str);
        return true;
    } catch (e) {
        return false;
    }
}

function isNullOrUndefined(value: string) {
    return value === null || value === undefined;
}

function isAnyNullOrUndefined<T extends string>(...values: T[]) {
    for (const value of values) {
        if (isNullOrUndefined(value)) {
            return true;
        }
    }
    return false;
}

function checkObjectMissingAnyKey(obj: { [key: string]: any }) {
    for (const key in obj) {
        if (isNullOrUndefined(obj[key])) {
            return key;
        }
    }
    return null;
}

function removeOptionalKeys(obj: { [key: string]: any }) {
    const result: { [key: string]: any } = {};
    for (const key in obj) {
        if (!isNullOrUndefined(obj[key])) {
            result[key] = obj[key];
        }
    }
    return result;
}

function isEmptyObject(obj: { [key: string]: any }) {
    return Object.keys(obj).length === 0;
}

function removeKeyObject(obj: { [key: string]: any }, exclude: string[]) {
    for (const key of exclude) {
        delete obj[key];
    }
    return obj;
}

function removeKeyObjectArray(arr: { [key: string]: any }[], exclude: string[]) {
    return arr.map((obj) => {
        for (const key of exclude) {
            delete obj[key];
        }
        return obj;
    });
}

function dateNow() {
    const today = new Date();
    const yyyy = today.getFullYear();
    let mm: any = today.getMonth() + 1; // Months start at 0!
    let dd: any = today.getDate();

    if (dd < 10) dd = "0" + dd;
    if (mm < 10) mm = "0" + mm;

    const date = dd + "/" + mm + "/" + yyyy;
    const dateNoTiles = `${dd}${mm}${yyyy}`;
    const yearNoTiles = `${yyyy}${mm}${dd}`;
    return {date, dateNoTiles, yearNoTiles, dd, mm, yyyy};
}

export {
    removeKeyObject,
    isNullOrUndefined,
    isAnyNullOrUndefined,
    checkObjectMissingAnyKey,
    removeOptionalKeys,
    isEmptyObject,
    removeKeyObjectArray,
    dateNow,
    typeoOf,
    stringify,
    isValidJSON,
    parse
};

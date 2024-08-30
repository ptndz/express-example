import createI18n from '../utils/createI18n';
import {DEFAULT_APP_LANGUAGE, translation} from './translation';
import {Request, Response, NextFunction} from 'express-serve-static-core';

const _i18n = createI18n(translation);

export const i18n = {
    t: _i18n.t,
};

export const getLocale = _i18n.getLocale;

export const setLocale = (
    req: Request,
    _res: Response,
    next: NextFunction,
) => {
    let locale = DEFAULT_APP_LANGUAGE;
    const regex = /([a-z]{2})/; // Biểu thức chính quy để tìm hai ký tự chữ cái liền nhau
    const match = req.headers['accept-language']?.match(regex);

    if (match) {
        locale = match[1];
    }
    _i18n.setLocale(locale);
    return next();
};
import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import English from "./locale/en/translation.json";
import Khmer from "./locale/kh/translation.json";
import zhCNTranslation from './locale/zh-CN/translation.json';
import zhTWTranslation from './locale/zh-TW/translation.json';
import Vietnamese from './locale/vi/translation.json';

const defaultLanguage = 'vi';

i18next
    .use(initReactI18next)
    .init({
        lng: localStorage.getItem('language') || defaultLanguage,
        fallbackLng: defaultLanguage,
        resources: {
            vi: {
                translation: Vietnamese
            },
            en: {
                translation: English
            },
            kh: {
                translation: Khmer
            },
            'zh-CN': {
                translation: zhCNTranslation
            },
            'zh-TW': {
                translation: zhTWTranslation
            },
        }
    });

export default i18next;
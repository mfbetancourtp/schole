import {createI18n} from 'vue-i18n';

const i18n = createI18n({
    legacy: false,
    locale: 'es',
    fallbackLocale: 'es',
    numberFormats: {
        'es': {
            currency: {
                style: 'currency',
                currency: 'COP',
                currencyDisplay: 'symbol',
            },
        },
    },
});

export default i18n;
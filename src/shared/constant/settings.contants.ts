export const settings = {
    appName: import.meta.env.VITE_APP_NAME,
    appLogo: import.meta.env.VITE_APP_LOGO,
    appFavicon: import.meta.env.VITE_APP_FAVICON,
    appAllowRegistration: import.meta.env.VITE_APP_ALLOW_REGISTRATION === 'true',
    appFilterNameOnLocalStorage: 'filters',
    domainRedirect: import.meta.env.VITE_DOMAIN_REDIRECT,
    colors: {
        primary: import.meta.env.VITE_COLOR_PRIMARY as string,
        primaryRGB: import.meta.env.VITE_COLOR_PRIMARY_RGB as string,
        secondary: import.meta.env.VITE_COLOR_SECONDARY as string,
        secondaryRGB: import.meta.env.VITE_COLOR_SECONDARY_RGB as string,
    }
};

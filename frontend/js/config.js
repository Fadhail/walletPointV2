const DEFAULT_API_BASE_URL = 'https://walletpoint.xeroon.my.id/api/v1';

const CONFIG = {
    // Allow runtime override (via window.API_BASE_URL or localStorage) but default to production
    API_BASE_URL: (() => {
        if (typeof window !== 'undefined') {
            const runtimeOverride = window.API_BASE_URL || localStorage.getItem('API_BASE_URL');
            if (runtimeOverride) return runtimeOverride;
        }
        return DEFAULT_API_BASE_URL;
    })(),
    DEBUG: true
};

if (typeof window !== 'undefined' && CONFIG.DEBUG) {
    console.info(`[CONFIG] Using API base: ${CONFIG.API_BASE_URL}`);
}

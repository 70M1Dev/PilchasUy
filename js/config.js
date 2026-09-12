// ==========================================
// CONFIGURACIÓN WOOCOMMERCE (producción)
// ==========================================
// Este archivo es público (se sube a GitHub).
// NO contiene credenciales reales.
//
// En producción, las requests van a traves del proxy
// (Cloudflare Worker) que agrega las API keys de forma segura.
// En desarrollo local, crea js/config.local.js (gitignored)
// para sobreescribir esta configuracion con tu URL y keys locales.
// ==========================================

const WC_CONFIG = {
    // URL del proxy (Cloudflare Worker) — production
    // El Worker agrega las API keys internamente.
    PROXY_URL: 'https://api.pilchasuy.com.uy',

    // URL local de WordPress — solo si PROXY_URL está vacío (dev)
    URL: 'https://pilchasuyy.local',

    // Credenciales vacías en producción (el proxy las maneja)
    CONSUMER_KEY: '',
    CONSUMER_SECRET: ''
};

// ==========================================
// OVERRIDE DE DESARROLLO
// ==========================================
// js/config.local.js esta gitignored y solo existe en la maquina de desarrollo.
// Lo pedimos unicamente cuando el sitio corre en local, asi en produccion
// (GitHub Pages) no queda un 404 colgado en la consola.

const WC_IS_LOCAL_DEV =
    ['localhost', '127.0.0.1', '::1', ''].includes(location.hostname) ||
    location.hostname.endsWith('.local');

if (WC_IS_LOCAL_DEV) {
    document.write('<script src="js/config.local.js"><\/script>');
}

// ==========================================
// HELPERS
// ==========================================

function wcApiUrl(endpoint, params = {}) {
    let url;

    if (WC_CONFIG.PROXY_URL) {
        // Producción: el Worker maneja las API keys
        url = new URL(`${WC_CONFIG.PROXY_URL}/${endpoint}`);
    } else {
        // Desarrollo local: keys en query string (solo localhost)
        url = new URL(`${WC_CONFIG.URL}/wp-json/wc/v3/${endpoint}`);
        url.searchParams.set('consumer_key', WC_CONFIG.CONSUMER_KEY);
        url.searchParams.set('consumer_secret', WC_CONFIG.CONSUMER_SECRET);
    }

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            url.searchParams.set(key, value);
        }
    });
    return url.toString();
}

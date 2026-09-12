// ==========================================
// CONFIGURACIÓN WOOCOMMERCE
// ==========================================
// ⚠️ COPIA este archivo como "config.js" y reemplazá los valores:
//     cp js/config.example.js js/config.js
// NUNCA subas tu config.js real a un repo público.
//
// Encontrá tus credenciales en WooCommerce → WooCommerce → Ajustes → Avanzado → REST API
// ==========================================

const WC_CONFIG = {
    // URL de tu WordPress (ej: 'https://tienda.midominio.com')
    URL: 'https://tu-sitio.com',

    // Consumer Key que generaste en WooCommerce
    CONSUMER_KEY: 'ck_tu_consumer_key_aqui',

    // Consumer Secret que generaste en WooCommerce
    CONSUMER_SECRET: 'cs_tu_consumer_secret_aqui'
};

// Helper para armar la URL base de la API con auth incluida
function wcApiUrl(endpoint, params = {}) {
    const url = new URL(`${WC_CONFIG.URL}/wp-json/wc/v3/${endpoint}`);
    url.searchParams.set('consumer_key', WC_CONFIG.CONSUMER_KEY);
    url.searchParams.set('consumer_secret', WC_CONFIG.CONSUMER_SECRET);
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            url.searchParams.set(key, value);
        }
    });
    return url.toString();
}

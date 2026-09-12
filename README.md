# MiTienda — Tienda Online con WooCommerce

Frontend estático (HTML + Tailwind CSS) que consume la **WooCommerce REST API** para mostrar productos, carrito y checkout.

## 🏗️ Arquitectura

```
index.html          ← Home con productos destacados
productos.html      ← Catálogo con filtros (categoría, precio, búsqueda, orden)
producto.html       ← Detalle de producto con galería + talles
carrito.html        ← Carrito con cupones (localStorage)
checkout.html       ← Formulario de checkout
assets/logo.png     ← Logo
js/
├── config.js       ← [GITIGNORED] Configuración con credenciales reales
├── config.example.js ← Template de config.js (seguro para el repo)
├── cart.js         ← Carrito compartido (localStorage)
    ├── index.js        ← Carga productos destacados
    ├── productos.js     ← Lista con filtros
    ├── producto.js      ← Detalle + productos relacionados
    └── checkout.js      ← Formulario de checkout (simulado)
```

## 🚀 Setup rápido

### 1. Clonar e instalar

```bash
git clone https://github.com/tu-usuario/tu-repo.git
cd tu-repo
```

> No se necesita instalar dependencias. Es puro HTML/CSS/JS.

### 2. Configurar WooCommerce

1. En tu WordPress con WooCommerce, ve a **WooCommerce → Ajustes → Avanzado → REST API**.
2. Crea una **Clave de API**:
   - Descripción: `MiTienda Frontend`
   - Usuario: tu usuario admin
   - Permisos: **Lectura** (Read)
3. Copia el **Consumer Key** y **Consumer Secret**.
4. Asegúrate de que tu sitio tenga **CORS habilitado** para recibir requests desde tu dominio (o `localhost` en desarrollo).

### 3. Crear el config local

```bash
# Copia el template y reemplazá los valores
cp js/config.example.js js/config.js
```

Editá `js/config.js`:

```javascript
const WC_CONFIG = {
    URL: 'https://tu-tienda.com',          // ← tu dominio WordPress
    CONSUMER_KEY: 'ck_tu_key',              // ← tu Consumer Key
    CONSUMER_SECRET: 'cs_tu_secret'         // ← tu Consumer Secret
};
```

> ⚠️ **Nunca** subas `js/config.js` a GitHub. Está en `.gitignore`.

### 4. Probar localmente

Abrí `index.html` con Live Server en VS Code (o cualquier servidor local). El sitio hará requests directos a tu WooCommerce.

## 🌐 Deploy a GitHub Pages

### Opción A: GitHub Pages (estático, recomendado)

```bash
git init
git add -A
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/tu-usuario/tu-repo.git
git push -u origin main
```

Luego en GitHub → Settings → Pages → seleccioná `main` branch → ¡listo!

### 🔒 Consideraciones de seguridad en producción

El frontend estático expone las API keys en el cliente. Si vas a producción:

1. **Regenerá las keys** de WooCommerce (las que usaste localmente no deben quedar públicas).
2. **Usá un proxy inverso** (Cloudflare Workers, Vercel Edge Functions, etc.) para ocultar las keys. El frontend llama a tu proxy, y el proxy reenvía a WooCommerce.

### 🔧 CORS en WordPress

Si tu tienda está en otro dominio, agregá esto a `functions.php` o un plugin:

```php
add_action('rest_api_init', function () {
    remove_filter('rest_pre_serve_request', 'rest_send_headers');
    add_filter('rest_pre_serve_request', function ($value) {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Credentials: false');
        return $value;
    });
}, 1);
```

## 🛠️ Development

```bash
# Simplemente abrí index.html con Live Server
code .
```

El carrito funciona con `localStorage`, por lo que no necesitas backend para el flujo de compra. El checkout está simulado — para enviar órdenes reales a WooCommerce, implementá la integración en `checkout.js`.
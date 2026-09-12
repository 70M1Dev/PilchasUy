// ==========================================
// CARRITO COMPARTIDO (localStorage)
// Usado por index.html, productos.html, producto.html y carrito.html
// ==========================================

const CART_STORAGE_KEY = 'cart';

// Leer el carrito actual
function getCart() {
    return JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];
}

// Guardar el carrito y refrescar los contadores en pantalla
function saveCartToStorage(cart) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    updateCartCounters();
}

// Actualiza cualquier contador de carrito presente en la página actual
// (nav desktop, drawer mobile, etc. - busca por id conocido)
function updateCartCounters() {
    const cart = getCart();
    const total = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

    const navCount = document.getElementById('cart-count-nav');
    const drawerCount = document.getElementById('cart-count-drawer');
    if (navCount) navCount.textContent = total;
    if (drawerCount) drawerCount.textContent = total;
}

// Añade un producto al carrito (o suma cantidad si ya existe con el mismo talle).
// product = { id, name, price, image, size (opcional), quantity (opcional, default 1) }
function addToCart(product) {
    const cart = getCart();
    const size = product.size || null;
    const existing = cart.find(item => item.id === product.id && item.size === size);

    if (existing) {
        existing.quantity = (existing.quantity || 1) + (product.quantity || 1);
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            size: size,
            quantity: product.quantity || 1
        });
    }

    saveCartToStorage(cart);
    showCartNotification(`✅ ${product.name}${size ? ` (${size})` : ''} añadido al carrito`);
}

// Notificación visual reutilizable
function showCartNotification(message) {
    const notif = document.createElement('div');
    notif.className = 'fixed top-20 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    notif.textContent = message;
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 2500);
}

// Actualizar contadores apenas carga cualquier página que incluya este script
document.addEventListener('DOMContentLoaded', updateCartCounters);

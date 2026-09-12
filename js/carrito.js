// ==========================================
// ESTADO DEL CARRITO (usa el módulo compartido js/cart.js)
// ==========================================
let cart = getCart();
let appliedCoupon = null;

// ==========================================
// UTILIDADES
// ==========================================
function persistCart() {
    saveCartToStorage(cart);
}

function getSubtotal() {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

function getShipping(subtotal) {
    return subtotal >= 50 ? 0 : 5;
}

function getDiscount(subtotal) {
    if (!appliedCoupon) return 0;
    if (appliedCoupon === 'DESCUENTO10') return subtotal * 0.10;
    if (appliedCoupon === 'BIENVENIDO15') return subtotal * 0.15;
    return 0;
}

// ==========================================
// RENDERIZAR CARRITO
// ==========================================
function renderCart() {
    const emptyCart = document.getElementById('empty-cart');
    const cartContent = document.getElementById('cart-content');
    const cartItems = document.getElementById('cart-items');
    const subtitle = document.getElementById('cart-subtitle');

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    subtitle.textContent = `${totalItems} producto${totalItems !== 1 ? 's' : ''} en tu carrito`;

    if (cart.length === 0) {
        emptyCart.classList.remove('hidden');
        cartContent.classList.add('hidden');
        return;
    }

    emptyCart.classList.add('hidden');
    cartContent.classList.remove('hidden');

    cartItems.innerHTML = cart.map((item, index) => `
        <div class="bg-white rounded-lg shadow p-4 flex gap-4">
            <img src="${item.image}" alt="${item.name}" class="w-24 h-24 md:w-32 md:h-32 object-cover rounded-lg">
            
            <div class="flex-1">
                <div class="flex justify-between items-start gap-2">
                    <div>
                        <h3 class="font-bold text-lg">${item.name}</h3>
                        ${item.size ? `<p class="text-sm text-neutral-500">Talle: ${item.size}</p>` : ''}
                    </div>
                    <button onclick="removeItem(${index})" class="text-neutral-400 hover:text-red-500 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3"/>
                        </svg>
                    </button>
                </div>

                <div class="flex items-center justify-between mt-4">
                    <div class="flex items-center gap-2">
                        <button onclick="updateQty(${index}, -1)" class="w-8 h-8 bg-neutral-200 hover:bg-neutral-300 rounded-lg font-bold transition">−</button>
                        <span class="w-10 text-center font-bold">${item.quantity}</span>
                        <button onclick="updateQty(${index}, 1)" class="w-8 h-8 bg-neutral-200 hover:bg-neutral-300 rounded-lg font-bold transition">+</button>
                    </div>
                    <div class="text-right">
                        <p class="font-bold text-lg">$${(item.price * item.quantity).toFixed(2)}</p>
                        <p class="text-xs text-neutral-500">$${item.price} c/u</p>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    updateTotals();
}

// ==========================================
// ACCIONES DEL CARRITO
// ==========================================
function removeItem(index) {
    cart.splice(index, 1);
    persistCart();
    renderCart();
}

function updateQty(index, change) {
    cart[index].quantity += change;
    if (cart[index].quantity < 1) cart[index].quantity = 1;
    if (cart[index].quantity > 10) cart[index].quantity = 10;
    persistCart();
    renderCart();
}

function updateTotals() {
    const subtotal = getSubtotal();
    const shipping = getShipping(subtotal);
    const discount = getDiscount(subtotal);
    const total = subtotal + shipping - discount;

    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('shipping').textContent = shipping === 0 ? 'Gratis' : `$${shipping.toFixed(2)}`;
    document.getElementById('shipping').className = `font-semibold ${shipping === 0 ? 'text-green-600' : ''}`;
    document.getElementById('total').textContent = `$${total.toFixed(2)}`;

    const discountRow = document.getElementById('discount-row');
    if (discount > 0) {
        discountRow.classList.remove('hidden');
        document.getElementById('discount').textContent = `-$${discount.toFixed(2)}`;
    } else {
        discountRow.classList.add('hidden');
    }
}

// ==========================================
// CUPONES
// ==========================================
document.getElementById('apply-coupon').addEventListener('click', () => {
    const code = document.getElementById('coupon-input').value.trim().toUpperCase();
    const msgEl = document.getElementById('coupon-message');
    
    if (code === 'DESCUENTO10' || code === 'BIENVENIDO15') {
        appliedCoupon = code;
        msgEl.textContent = `✅ Cupón "${code}" aplicado`;
        msgEl.className = 'text-sm mt-2 text-green-600';
        msgEl.classList.remove('hidden');
        renderCart();
    } else if (code === '') {
        msgEl.textContent = '⚠️ Ingresá un código';
        msgEl.className = 'text-sm mt-2 text-amber-600';
        msgEl.classList.remove('hidden');
    } else {
        msgEl.textContent = '❌ Cupón inválido';
        msgEl.className = 'text-sm mt-2 text-red-600';
        msgEl.classList.remove('hidden');
        appliedCoupon = null;
        renderCart();
    }
});

// ==========================================
// CHECKOUT
// ==========================================
document.getElementById('checkout-btn').addEventListener('click', () => {
    if (cart.length === 0) return;
    window.location.href = 'checkout.html';
});

// ==========================================
// DRAWER + NAVBAR (igual que otras páginas)
// ==========================================
const toggle = document.getElementById('menu-toggle');
const drawer = document.getElementById('drawer');
const overlay = document.getElementById('drawer-overlay');
const iconHamburger = document.getElementById('icon-hamburger');
const iconClose = document.getElementById('icon-close');

function openDrawer() {
    drawer.classList.remove('translate-x-full');
    overlay.classList.remove('hidden');
    setTimeout(() => overlay.classList.add('opacity-100'), 10);
    iconHamburger.classList.add('hidden');
    iconClose.classList.remove('hidden');
}

function closeDrawer() {
    drawer.classList.add('translate-x-full');
    overlay.classList.remove('opacity-100');
    setTimeout(() => overlay.classList.add('hidden'), 300);
    iconHamburger.classList.remove('hidden');
    iconClose.classList.add('hidden');
}

if (toggle) {
    toggle.addEventListener('click', () => {
        if (drawer.classList.contains('translate-x-full')) openDrawer();
        else closeDrawer();
    });
    overlay.addEventListener('click', closeDrawer);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDrawer(); });
}

const navbar = document.getElementById('navbar-scroll');
let lastScroll = 0;
window.addEventListener('scroll', () => {
    if (!navbar) return;
    const currentScroll = window.pageYOffset;
    if (currentScroll > lastScroll && currentScroll > 100) navbar.classList.add('-translate-y-full');
    else if (currentScroll < lastScroll) navbar.classList.remove('-translate-y-full');
    lastScroll = currentScroll;
});

// ==========================================
// INIT
// ==========================================
renderCart();
updateCartCounters();

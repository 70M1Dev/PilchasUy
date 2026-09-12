// ==========================================
// PRODUCTOS DESTACADOS (HOME) - WooCommerce
// ==========================================

function getCategoryNameHome(cat) {
    const names = { remeras: 'Remeras', championes: 'Championes', buzos: 'Buzos', pantalones: 'Pantalones', gorros: 'Gorros' };
    return names[cat] || cat;
}

// Igual al mapeo usado en productos.js
function mapWCProductHome(p) {
    const price = parseFloat(p.price || p.regular_price || 0);
    const regular = parseFloat(p.regular_price || 0);
    const onSale = p.on_sale && regular > price;

    let badge = null;
    if (onSale) {
        const pct = Math.round(((regular - price) / regular) * 100);
        badge = `-${pct}%`;
    } else {
        const created = new Date(p.date_created);
        const days = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24);
        if (days <= 14) badge = 'NUEVO';
    }

    return {
        id: p.id,
        name: p.name,
        price: price,
        originalPrice: onSale ? regular : null,
        category: p.categories && p.categories.length ? p.categories[0].slug : '',
        image: p.images && p.images.length ? p.images[0].src : 'https://placehold.co/300x250/cccccc/666666?text=Sin+imagen',
        badge: badge
    };
}

// Lanza si la API no responde. El caller muestra el estado de error.
async function fetchFeaturedProducts() {
    if (wcBackendMissing()) throw new Error('PROXY_URL sin configurar');

    // Primero intentamos con productos marcados como "Destacado" en WooCommerce
    let url = wcApiUrl('products', { featured: true, per_page: 4, status: 'publish' });
    let res = await fetch(url);
    if (!res.ok) throw new Error(`WooCommerce API respondió ${res.status}`);
    let data = await res.json();

    // Si no marcaste ningún producto como destacado, mostramos los últimos publicados
    if (!data.length) {
        url = wcApiUrl('products', { per_page: 4, orderby: 'date', order: 'desc', status: 'publish' });
        res = await fetch(url);
        if (!res.ok) throw new Error(`WooCommerce API respondió ${res.status}`);
        data = await res.json();
    }

    return data.map(mapWCProductHome);
}

let featuredProductsData = [];

function renderFeaturedProducts(products) {
    const grid = document.getElementById('featured-products');
    const loading = document.getElementById('featured-loading');
    loading.classList.add('hidden');

    grid.innerHTML = products.map(product => `
        <div class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 group">
            <a href="producto.html?id=${product.id}" class="block">
                <div class="relative overflow-hidden">
                    <img src="${product.image}" 
                         alt="${product.name}"
                         class="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300">
                    ${product.badge ? `
                        <span class="absolute top-2 left-2 ${product.badge.includes('-') ? 'bg-red-500' : 'bg-amber-500'} text-white text-xs font-bold px-2 py-1 rounded">
                            ${product.badge}
                        </span>
                    ` : ''}
                </div>
                <div class="p-4">
                    <p class="text-xs text-neutral-500 uppercase mb-1">${getCategoryNameHome(product.category)}</p>
                    <h3 class="font-semibold text-lg mb-2 line-clamp-2 text-black">${product.name}</h3>
                    <div class="flex items-center gap-2 mb-3">
                        <span class="text-2xl font-bold text-black">${wcPrice(product.price)}</span>
                        ${product.originalPrice ? `<span class="text-sm text-neutral-400 line-through">${wcPrice(product.originalPrice)}</span>` : ''}
                    </div>
                </div>
            </a>
            <div class="px-4 pb-4">
                <button onclick="handleAddToCartHome(${product.id})" class="w-full bg-neutral-800 hover:bg-neutral-600 text-white py-2 rounded-lg transition font-semibold">
                    Añadir al carrito
                </button>
            </div>
        </div>
    `).join('');
}

function handleAddToCartHome(productId) {
    const product = featuredProductsData.find(p => p.id === productId);
    if (product) {
        addToCart({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image
        });
    }
}

async function initFeaturedProducts() {
    try {
        featuredProductsData = await fetchFeaturedProducts();
        renderFeaturedProducts(featuredProductsData);
    } catch (err) {
        const loading = document.getElementById('featured-loading');
        if (loading) loading.classList.add('hidden');
        wcRenderError('featured-products', err);
    }
}

initFeaturedProducts();

// ==========================================
// DATOS DE PRODUCTOS
// Se cargan desde WooCommerce en init(). Este array queda
// vacío hasta que llegue la respuesta de la API.
// ==========================================
let productsData = [];

// Guarda el error de la API para mostrar el estado correcto en pantalla
// (un cliente real no tiene que ver productos "demo" inventados).
let productsLoadError = null;

// ==========================================
// WOOCOMMERCE: TRAER PRODUCTOS
// ==========================================

// Convierte un producto de WooCommerce al formato que usa renderProducts()
function mapWCProduct(p) {
    const price = parseFloat(p.price || p.regular_price || 0);
    const regular = parseFloat(p.regular_price || 0);
    const onSale = p.on_sale && regular > price;

    let badge = null;
    if (onSale) {
        const pct = Math.round(((regular - price) / regular) * 100);
        badge = `-${pct}%`;
    } else {
        // "Nuevo" si se creó hace menos de 14 días
        const created = new Date(p.date_created);
        const days = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24);
        if (days <= 14) badge = 'NUEVO';
    }

    return {
        id: p.id,
        name: p.name,
        price: price,
        originalPrice: onSale ? regular : null,
        // Tomamos el slug de la primera categoría asignada en WooCommerce.
        // Tiene que coincidir con: remeras, championes, buzos, pantalones, gorros
        category: p.categories && p.categories.length ? p.categories[0].slug : '',
        image: p.images && p.images.length ? p.images[0].src : 'https://placehold.co/300x350/cccccc/666666?text=Sin+imagen',
        badge: badge,
        stockStatus: p.stock_status // 'instock' | 'outofstock' | 'onbackorder'
    };
}

async function fetchProductsFromWC() {
    productsLoadError = null;
    try {
        if (wcBackendMissing()) throw new Error('PROXY_URL sin configurar');

        const url = wcApiUrl('products', { per_page: 100, status: 'publish' });
        const res = await fetch(url);

        if (!res.ok) {
            const body = await res.text();
            throw new Error(`WooCommerce API respondió ${res.status}: ${body}`);
        }

        const data = await res.json();
        productsData = data.map(mapWCProduct);
    } catch (err) {
        productsData = [];
        productsLoadError = err;
    }
}

// ==========================================
// ESTADO GLOBAL
// ==========================================
let currentCategory = 'all';
let currentPriceRange = 'all';
let currentSort = 'default';
let currentSearch = '';

// ==========================================
// UTILIDADES
// ==========================================

// Leer parámetros de la URL
function getURLParam(param) {
    const params = new URLSearchParams(window.location.search);
    return params.get(param);
}

// Verificar rango de precio
function checkPrice(price, range) {
    if (range === 'all') return true;
    if (range === '0-25') return price < 25;
    if (range === '25-50') return price >= 25 && price < 50;
    if (range === '50-100') return price >= 50 && price < 100;
    if (range === '100+') return price >= 100;
    return true;
}

// Ordenar productos
function sortProducts(products, sort) {
    const sorted = [...products];
    switch(sort) {
        case 'price-asc': return sorted.sort((a, b) => a.price - b.price);
        case 'price-desc': return sorted.sort((a, b) => b.price - a.price);
        case 'name-asc': return sorted.sort((a, b) => a.name.localeCompare(b.name));
        case 'name-desc': return sorted.sort((a, b) => b.name.localeCompare(a.name));
        default: return sorted;
    }
}

// Obtener nombre legible de categoría
function getCategoryName(cat) {
    const names = {
        remeras: 'Remeras',
        championes: 'Championes',
        buzos: 'Buzos',
        pantalones: 'Pantalones',
        gorros: 'Gorros'
    };
    return names[cat] || cat;
}

// ==========================================
// RENDERIZAR PRODUCTOS
// ==========================================
function renderProducts() {
    const grid = document.getElementById('products-grid');
    const loading = document.getElementById('loading');
    const noResults = document.getElementById('no-results');
    const countEl = document.getElementById('products-count');

    loading.classList.remove('hidden');

    // Filtrar productos
    let filtered = productsData.filter(p => {
        const matchCategory = currentCategory === 'all' || p.category === currentCategory;
        const matchSearch = p.name.toLowerCase().includes(currentSearch.toLowerCase());
        const matchPrice = checkPrice(p.price, currentPriceRange);
        return matchCategory && matchSearch && matchPrice;
    });

    // Ordenar
    filtered = sortProducts(filtered, currentSort);

    // Simular carga
    setTimeout(() => {
        loading.classList.add('hidden');

        // Si la API falló, mostramos el estado de error en vez de
        // "no se encontraron productos", que confundiría al cliente.
        if (productsLoadError) {
            noResults.classList.add('hidden');
            countEl.textContent = '';
            wcRenderError('products-grid', productsLoadError);
            return;
        }

        if (filtered.length === 0) {
            grid.innerHTML = '';
            noResults.classList.remove('hidden');
            countEl.textContent = '0 productos';
            return;
        }

        noResults.classList.add('hidden');
        countEl.textContent = `${filtered.length} producto${filtered.length !== 1 ? 's' : ''}`;

        grid.innerHTML = filtered.map(product => `
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
                        <p class="text-xs text-neutral-500 uppercase mb-1">${getCategoryName(product.category)}</p>
                        <h3 class="font-semibold text-lg mb-2 line-clamp-2 text-black">${product.name}</h3>
                        <div class="flex items-center gap-2 mb-3">
                            <span class="text-2xl font-bold text-black">${wcPrice(product.price)}</span>
                            ${product.originalPrice ? `<span class="text-sm text-neutral-400 line-through">${wcPrice(product.originalPrice)}</span>` : ''}
                        </div>
                    </div>
                </a>
                <div class="px-4 pb-4">
                    <button onclick="handleAddToCart(${product.id})" 
                            class="w-full bg-neutral-800 hover:bg-neutral-600 text-white py-2 rounded-lg transition font-semibold">
                        Añadir al carrito
                    </button>
                </div>
            </div>
        `).join('');
    }, 300);
}

// ==========================================
// CARRITO (usa el módulo compartido js/cart.js)
// ==========================================
function handleAddToCart(productId) {
    const product = productsData.find(p => p.id === productId);
    if (product) {
        addToCart({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image
        });
    }
}

// ==========================================
// FILTROS DESKTOP
// ==========================================
function setupDesktopFilters() {
    // Categorías
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.category-btn').forEach(b => {
                b.classList.remove('bg-neutral-100', 'text-black', 'font-semibold');
                b.classList.add('text-neutral-700');
            });
            btn.classList.add('bg-neutral-100', 'text-black', 'font-semibold');
            btn.classList.remove('text-neutral-700');
            currentCategory = btn.dataset.category;
            renderProducts();
        });
    });

    // Precio
    document.querySelectorAll('input[name="precio"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            currentPriceRange = e.target.value;
            renderProducts();
        });
    });

    // Ordenar
    document.getElementById('sort-select').addEventListener('change', (e) => {
        currentSort = e.target.value;
        renderProducts();
    });
}

// ==========================================
// FILTROS MOBILE (DRAWER)
// ==========================================
function setupMobileFilters() {
    const filtrosDrawer = document.getElementById('filtros-drawer');
    const filtrosOverlay = document.getElementById('drawer-overlay');
    const filtrosToggle = document.getElementById('filtros-toggle');
    const closeFiltrosBtn = document.getElementById('close-filtros');
    const aplicarFiltrosBtn = document.getElementById('aplicar-filtros');

    function openFiltros() {
        filtrosDrawer.classList.remove('-translate-x-full');
        filtrosOverlay.classList.remove('hidden');
        setTimeout(() => filtrosOverlay.classList.add('opacity-100'), 10);
    }

    function closeFiltros() {
        filtrosDrawer.classList.add('-translate-x-full');
        filtrosOverlay.classList.remove('opacity-100');
        setTimeout(() => filtrosOverlay.classList.add('hidden'), 300);
    }

    filtrosToggle.addEventListener('click', openFiltros);
    closeFiltrosBtn.addEventListener('click', closeFiltros);
    filtrosOverlay.addEventListener('click', closeFiltros);

    // Categorías mobile
    document.querySelectorAll('.category-btn-mobile').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.category-btn-mobile').forEach(b => {
                b.classList.remove('bg-neutral-800', 'font-semibold');
            });
            btn.classList.add('bg-neutral-800', 'font-semibold');
            currentCategory = btn.dataset.category;
        });
    });

    // Precio mobile
    document.querySelectorAll('input[name="precio-mobile"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            currentPriceRange = e.target.value;
        });
    });

    // Aplicar filtros
    aplicarFiltrosBtn.addEventListener('click', () => {
        renderProducts();
        closeFiltros();
    });
}

// ==========================================
// BÚSQUEDA
// ==========================================
function setupSearch() {
    const searchInput = document.getElementById('search-input');
    let searchTimeout;

    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            currentSearch = e.target.value;
            renderProducts();
        }, 300);
    });
}

// ==========================================
// NAVBAR INTELIGENTE
// ==========================================
function setupNavbar() {
    const navbar = document.getElementById('navbar-scroll');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        if (currentScroll > lastScroll && currentScroll > 100) {
            navbar.classList.add('-translate-y-full');
        } else if (currentScroll < lastScroll) {
            navbar.classList.remove('-translate-y-full');
        }
        lastScroll = currentScroll;
    });
}

// ==========================================
// INICIALIZACIÓN
// ==========================================
async function init() {
    // Mostrar loading mientras llega la API
    document.getElementById('loading').classList.remove('hidden');

    // Traer productos reales de WooCommerce
    await fetchProductsFromWC();

    // Leer categoría de la URL
    const categoryFromURL = getURLParam('cat');
    if (categoryFromURL) {
        currentCategory = categoryFromURL;

        // Marcar botón en desktop
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('bg-neutral-100', 'text-black', 'font-semibold');
            btn.classList.add('text-neutral-700');
            if (btn.dataset.category === categoryFromURL) {
                btn.classList.add('bg-neutral-100', 'text-black', 'font-semibold');
                btn.classList.remove('text-neutral-700');
            }
        });

        // Marcar botón en mobile
        document.querySelectorAll('.category-btn-mobile').forEach(btn => {
            btn.classList.remove('bg-neutral-800', 'font-semibold');
            if (btn.dataset.category === categoryFromURL) {
                btn.classList.add('bg-neutral-800', 'font-semibold');
            }
        });
    }

    // Configurar event listeners
    setupDesktopFilters();
    setupMobileFilters();
    setupSearch();
    setupNavbar();

    // Renderizar productos
    renderProducts();
}

// Iniciar
init();

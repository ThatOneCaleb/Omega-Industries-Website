/**
 * Omega Industries Shop Logic
 * Product rendering, filtering, search, and page management
 */

const OmegaShop = {

  // ========================
  // PRODUCT CARD RENDERING
  // ========================

  /**
   * Generate HTML for a single product card
   */
  renderProductCard(product) {
    const stockBadge = product.quickShip
      ? '<span class="absolute top-3 left-3 bg-forge text-white font-display text-[9px] font-700 tracking-[0.15em] uppercase px-2.5 py-1 rounded-md z-10">Quick Ship</span>'
      : product.inStock
        ? '<span class="absolute top-3 left-3 bg-forge/80 text-white font-display text-[9px] font-700 tracking-[0.15em] uppercase px-2.5 py-1 rounded-md z-10">In Stock</span>'
        : '<span class="absolute top-3 left-3 bg-gray-600 text-white font-display text-[9px] font-700 tracking-[0.15em] uppercase px-2.5 py-1 rounded-md z-10">Made to Order</span>';

    return `
      <a href="shop-product.html?id=${product.id}" class="product-card group relative block rounded-xl overflow-hidden" style="background: #0A0E14;">
        <div class="aspect-square overflow-hidden relative">
          <img src="${product.image}" alt="${product.name}" class="card-image w-full h-full object-cover" loading="lazy">
          <div class="absolute inset-0 bg-gradient-to-t from-[#0A0E14] via-[#0A0E14]/20 to-transparent"></div>
          ${stockBadge}
        </div>
        <div class="p-4 lg:p-5">
          <span class="font-display text-[10px] tracking-[0.2em] uppercase text-gray-500 block mb-1">${product.partNumber}</span>
          <h3 class="font-display font-600 text-sm uppercase tracking-tight text-white mb-2 line-clamp-2 leading-snug">${product.name}</h3>
          <div class="flex items-center gap-1.5 mb-1">
            <span class="font-display text-[10px] tracking-[0.15em] uppercase text-gray-500">${product.brand}</span>
          </div>
          <div class="flex items-baseline gap-1.5 mb-4">
            <span class="font-display font-700 text-lg text-white">$${product.price.toFixed(2)}</span>
            <span class="font-display text-[10px] text-gray-500 tracking-wider uppercase">/${product.unit}</span>
          </div>
          <button
            onclick="event.preventDefault();"
            class="snipcart-add-item w-full bg-forge hover:bg-forge-bright text-white font-display text-xs font-700 tracking-wider uppercase py-2.5 px-4 rounded-lg transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-forge focus-visible:outline-offset-2"
            data-item-id="${product.id}"
            data-item-price="${product.price.toFixed(2)}"
            data-item-url="/products-validate.html"
            data-item-name="${product.name}"
            data-item-description="${product.partNumber} — ${product.brand}"
            data-item-image="${product.image}"
            data-item-quantity="1">
            Add to Cart
          </button>
        </div>
      </a>
    `;
  },

  /**
   * Render a grid of product cards into a container
   */
  renderProductGrid(products, containerId, limit) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const items = limit ? products.slice(0, limit) : products;

    if (items.length === 0) {
      container.innerHTML = `
        <div class="col-span-full text-center py-16">
          <svg class="mx-auto mb-4" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" style="color: #6B7280;">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <p class="font-display font-600 text-lg uppercase tracking-wide text-chrome mb-2">No Products Found</p>
          <p class="font-body text-alloy text-sm">Try adjusting your search or filters.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = items.map(p => this.renderProductCard(p)).join('');
  },


  // ========================
  // SEARCH
  // ========================

  /**
   * Search products by query string
   * Matches against: partNumber, name, brand, category, subcategory, description, tags
   */
  searchProducts(query) {
    if (!query || query.trim().length < 2) return [];

    const terms = query.toLowerCase().trim().split(/\s+/);

    return CATALOG.products
      .map(product => {
        const searchFields = [
          product.partNumber,
          product.name,
          product.brand,
          product.category,
          product.subcategory,
          product.description,
          ...(product.tags || [])
        ].join(' ').toLowerCase();

        // Also match category display name
        const cat = CATALOG.categories.find(c => c.id === product.category);
        const catName = cat ? cat.name.toLowerCase() : '';
        const subcat = cat ? (cat.subcategories.find(s => s.id === product.subcategory) || {}) : {};
        const subcatName = (subcat.name || '').toLowerCase();
        const fullText = searchFields + ' ' + catName + ' ' + subcatName;

        let score = 0;
        let allMatch = true;

        for (const term of terms) {
          if (fullText.includes(term)) {
            score++;
            // Bonus for part number match
            if (product.partNumber.toLowerCase().includes(term)) score += 3;
            // Bonus for name match
            if (product.name.toLowerCase().includes(term)) score += 2;
            // Bonus for brand match
            if (product.brand.toLowerCase().includes(term)) score += 1;
          } else {
            allMatch = false;
          }
        }

        return { product, score, allMatch };
      })
      .filter(r => r.allMatch && r.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(r => r.product);
  },

  /**
   * Initialize search bar with autocomplete dropdown
   */
  initSearch(inputId, dropdownId) {
    const input = document.getElementById(inputId);
    const dropdown = document.getElementById(dropdownId);
    if (!input || !dropdown) return;

    let debounceTimer;

    input.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const query = input.value.trim();
        if (query.length < 2) {
          dropdown.classList.add('hidden');
          return;
        }

        const results = this.searchProducts(query).slice(0, 8);

        if (results.length === 0) {
          dropdown.innerHTML = `
            <div class="p-4 text-center">
              <p class="font-body text-sm text-gray-400">No results for "${query}"</p>
            </div>
          `;
          dropdown.classList.remove('hidden');
          return;
        }

        dropdown.innerHTML = results.map(p => `
          <a href="shop-product.html?id=${p.id}" class="flex items-center gap-3 p-3 hover:bg-gray-800/50 transition-colors rounded-lg">
            <img src="${p.image}" alt="${p.name}" class="w-12 h-12 object-cover rounded-lg flex-shrink-0">
            <div class="flex-1 min-w-0">
              <p class="font-display text-[10px] tracking-[0.15em] uppercase text-forge">${p.partNumber}</p>
              <p class="font-display text-xs font-600 uppercase text-white truncate">${p.name}</p>
              <p class="font-body text-[11px] text-gray-500">${p.brand} — $${p.price.toFixed(2)}</p>
            </div>
          </a>
        `).join('') + `
          <a href="shop-category.html?search=${encodeURIComponent(query)}" class="block p-3 text-center border-t border-gray-700/50">
            <span class="font-display text-xs tracking-[0.15em] uppercase text-forge hover:text-forge-bright">View all results for "${query}"</span>
          </a>
        `;
        dropdown.classList.remove('hidden');
      }, 200);
    });

    // Handle Enter key — go to search results
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const query = input.value.trim();
        if (query.length >= 2) {
          window.location.href = `shop-category.html?search=${encodeURIComponent(query)}`;
        }
      }
    });

    // Close dropdown on outside click
    document.addEventListener('click', (e) => {
      if (!input.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.add('hidden');
      }
    });

    // Re-open on focus if has value
    input.addEventListener('focus', () => {
      if (input.value.trim().length >= 2) {
        input.dispatchEvent(new Event('input'));
      }
    });
  },


  // ========================
  // FILTERING & SORTING
  // ========================

  /**
   * Filter products by multiple criteria
   */
  filterProducts(options = {}) {
    let products = [...CATALOG.products];

    // Filter by category
    if (options.category) {
      products = products.filter(p => p.category === options.category);
    }

    // Filter by subcategory
    if (options.subcategory) {
      products = products.filter(p => p.subcategory === options.subcategory);
    }

    // Filter by subcategories (array)
    if (options.subcategories && options.subcategories.length > 0) {
      products = products.filter(p => options.subcategories.includes(p.subcategory));
    }

    // Filter by brand
    if (options.brand) {
      products = products.filter(p => p.brand === options.brand);
    }

    // Filter by brands (array)
    if (options.brands && options.brands.length > 0) {
      products = products.filter(p => options.brands.includes(p.brand));
    }

    // Filter by price range
    if (options.minPrice !== undefined) {
      products = products.filter(p => p.price >= options.minPrice);
    }
    if (options.maxPrice !== undefined) {
      products = products.filter(p => p.price <= options.maxPrice);
    }

    // Filter in-stock only
    if (options.inStockOnly) {
      products = products.filter(p => p.inStock);
    }

    // Filter by tag
    if (options.tag) {
      products = products.filter(p => p.tags && p.tags.includes(options.tag));
    }

    // Search query
    if (options.search && options.search.trim().length >= 2) {
      products = this.searchProducts(options.search).filter(p =>
        !options.category || p.category === options.category
      );
    }

    return products;
  },

  /**
   * Sort products array
   */
  sortProducts(products, sortBy) {
    const sorted = [...products];

    switch (sortBy) {
      case 'price-asc':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'part-number':
        sorted.sort((a, b) => a.partNumber.localeCompare(b.partNumber));
        break;
      default: // relevance — keep original order
        break;
    }

    return sorted;
  },


  // ========================
  // PRODUCT DETAIL
  // ========================

  /**
   * Load product detail from URL parameter
   */
  loadProductDetail(containerId) {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');
    const container = document.getElementById(containerId);

    if (!productId || !container) return null;

    const product = CATALOG.products.find(p => p.id === productId);

    if (!product) {
      container.innerHTML = `
        <div class="text-center py-20">
          <h2 class="font-display font-700 text-2xl uppercase tracking-tight text-chrome mb-3">Product Not Found</h2>
          <p class="font-body text-alloy mb-8">The product you're looking for doesn't exist or has been removed.</p>
          <a href="shop.html" class="btn-primary inline-flex items-center gap-2 bg-forge text-white font-display font-700 text-sm tracking-wider uppercase px-8 py-4 rounded-lg">
            Back to Shop
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
        </div>
      `;
      return null;
    }

    // Get category and subcategory names
    const cat = CATALOG.categories.find(c => c.id === product.category);
    const subcat = cat ? cat.subcategories.find(s => s.id === product.subcategory) : null;

    // Build specs table
    const specsHtml = Object.entries(product.specs || {}).map(([key, val]) => `
      <tr class="border-b border-gray-800/50">
        <td class="py-3 pr-4 font-display text-xs tracking-wider uppercase text-gray-400">${key.replace(/([A-Z])/g, ' $1').trim()}</td>
        <td class="py-3 font-body text-sm text-white">${val}</td>
      </tr>
    `).join('');

    // Related products (same category, different id)
    const related = CATALOG.products
      .filter(p => p.category === product.category && p.id !== product.id)
      .slice(0, 4);

    // Stock status
    const stockHtml = product.quickShip
      ? '<span class="inline-flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-forge"></span><span class="font-display text-xs tracking-wider uppercase text-forge">Quick Ship — Ships within 24hrs</span></span>'
      : product.inStock
        ? '<span class="inline-flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-forge"></span><span class="font-display text-xs tracking-wider uppercase text-forge">In Stock</span></span>'
        : '<span class="inline-flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-amber-500"></span><span class="font-display text-xs tracking-wider uppercase text-amber-500">Made to Order</span></span>';

    container.innerHTML = `
      <!-- Breadcrumbs -->
      <nav class="mb-8">
        <ol class="flex items-center gap-2 font-display text-xs tracking-wider uppercase text-gray-400">
          <li><a href="index.html" class="hover:text-forge transition-colors">Home</a></li>
          <li class="text-gray-600">/</li>
          <li><a href="shop.html" class="hover:text-forge transition-colors">Shop</a></li>
          <li class="text-gray-600">/</li>
          <li><a href="shop-category.html?cat=${product.category}" class="hover:text-forge transition-colors">${cat ? cat.name : ''}</a></li>
          <li class="text-gray-600">/</li>
          <li class="text-chrome">${product.name}</li>
        </ol>
      </nav>

      <!-- Product Layout -->
      <div class="grid lg:grid-cols-2 gap-10 lg:gap-16 mb-20">
        <!-- Image -->
        <div class="rounded-xl overflow-hidden" style="background: #0A0E14;">
          <img src="${product.image}" alt="${product.name}" class="w-full aspect-square object-cover">
        </div>

        <!-- Details -->
        <div>
          <!-- Part Number (prominent, copyable) -->
          <div class="flex items-center gap-2 mb-3">
            <span class="font-display text-xs tracking-[0.2em] uppercase text-forge">${product.partNumber}</span>
            <button onclick="navigator.clipboard.writeText('${product.partNumber}'); this.textContent='Copied!'; setTimeout(() => this.textContent='Copy', 1500);"
                    class="font-display text-[9px] tracking-wider uppercase text-gray-500 hover:text-forge border border-gray-700 hover:border-forge px-2 py-0.5 rounded transition-colors cursor-pointer">
              Copy
            </button>
          </div>

          <h1 class="font-display font-700 uppercase tracking-tight text-chrome mb-3" style="font-size: clamp(1.5rem, 3vw, 2.5rem); line-height: 1;">
            ${product.name}
          </h1>

          <p class="font-display text-sm tracking-wider uppercase text-alloy mb-4">${product.brand}</p>

          ${stockHtml}

          <div class="mt-6 mb-6">
            <span class="font-display font-800 text-chrome" style="font-size: clamp(1.75rem, 3vw, 2.5rem);">$${product.price.toFixed(2)}</span>
            <span class="font-display text-sm text-alloy tracking-wider uppercase ml-1">/ ${product.unit}</span>
          </div>

          <!-- Quantity + Add to Cart -->
          <div class="flex gap-3 mb-8">
            <div class="flex items-center border border-gunmetal rounded-lg overflow-hidden">
              <button onclick="const i=document.getElementById('qty-input'); i.value=Math.max(1,parseInt(i.value)-1);"
                      class="px-3 py-3 text-chrome hover:bg-steel transition-colors font-display text-lg focus-visible:outline-2 focus-visible:outline-forge">−</button>
              <input id="qty-input" type="number" value="1" min="1" max="999"
                     class="w-14 text-center font-display text-sm font-600 text-chrome bg-transparent border-x border-gunmetal py-3 focus:outline-none"
                     onchange="this.value=Math.max(1,parseInt(this.value)||1)">
              <button onclick="const i=document.getElementById('qty-input'); i.value=Math.min(999,parseInt(i.value)+1);"
                      class="px-3 py-3 text-chrome hover:bg-steel transition-colors font-display text-lg focus-visible:outline-2 focus-visible:outline-forge">+</button>
            </div>
            <button
              class="snipcart-add-item flex-1 btn-primary flex items-center justify-center gap-2 bg-forge text-white font-display font-700 text-sm tracking-wider uppercase py-3 px-6 rounded-lg"
              data-item-id="${product.id}"
              data-item-price="${product.price.toFixed(2)}"
              data-item-url="/products-validate.html"
              data-item-name="${product.name}"
              data-item-description="${product.partNumber} — ${product.brand}"
              data-item-image="${product.image}"
              data-item-quantity="1"
              onclick="this.setAttribute('data-item-quantity', document.getElementById('qty-input').value);">
              Add to Cart
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            </button>
          </div>

          <p class="font-body text-alloy leading-relaxed" style="line-height: 1.7;">${product.description}</p>
        </div>
      </div>

      <!-- Tabs: Specs + Reviews + Related -->
      <div class="mb-20">
        <div class="flex gap-1 border-b border-gunmetal/30 mb-8 overflow-x-auto no-scrollbar" id="product-tabs">
          <button onclick="OmegaShop.switchTab('specs')" data-tab="specs" class="product-tab flex-shrink-0 font-display text-xs font-600 tracking-[0.2em] uppercase px-6 py-3 border-b-2 border-forge text-chrome">Specifications</button>
          <button onclick="OmegaShop.switchTab('reviews')" data-tab="reviews" class="product-tab flex-shrink-0 font-display text-xs font-600 tracking-[0.2em] uppercase px-6 py-3 border-b-2 border-transparent text-alloy hover:text-chrome transition-colors">Reviews</button>
          <button onclick="OmegaShop.switchTab('related')" data-tab="related" class="product-tab flex-shrink-0 font-display text-xs font-600 tracking-[0.2em] uppercase px-6 py-3 border-b-2 border-transparent text-alloy hover:text-chrome transition-colors">Related Products</button>
        </div>

        <div id="tab-specs">
          <table class="w-full max-w-xl">
            <tbody>${specsHtml}</tbody>
          </table>
        </div>

        <div id="tab-reviews" class="hidden">
          ${this.renderReviews(product.id)}
        </div>

        <div id="tab-related" class="hidden">
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6" id="related-products-grid">
            ${related.map(p => this.renderProductCard(p)).join('')}
          </div>
        </div>
      </div>
    `;

    // Update page title
    document.title = `${product.name} — ${product.partNumber} | Omega Industries Shop`;

    return product;
  },

  /**
   * Switch between product detail tabs
   */
  switchTab(tabName) {
    document.querySelectorAll('.product-tab').forEach(btn => {
      const isActive = btn.dataset.tab === tabName;
      btn.classList.toggle('border-forge', isActive);
      btn.classList.toggle('text-chrome', isActive);
      btn.classList.toggle('border-transparent', !isActive);
      btn.classList.toggle('text-alloy', !isActive);
    });

    document.querySelectorAll('[id^="tab-"]').forEach(panel => {
      panel.classList.toggle('hidden', panel.id !== `tab-${tabName}`);
    });
  },


  // ========================
  // REVIEWS
  // ========================

  // Sample reviews data
  reviews: {
    'pc-001': [
      { name: 'Mike R.', rating: 5, date: '2024-11-15', title: 'Rock solid gun', text: 'Been running this in our shop for 6 months now. Consistent finish every time, great transfer efficiency. Worth every penny.' },
      { name: 'Dave S.', rating: 5, date: '2024-10-02', title: 'Best powder gun we\'ve owned', text: 'Upgraded from an older Wagner model. The difference in charging is night and day. Pattern control is excellent.' },
      { name: 'Jim T.', rating: 4, date: '2024-08-20', title: 'Great gun, pricey', text: 'Quality is top notch as expected from Wagner. Only knock is the price but you get what you pay for in this industry.' },
    ],
    'pc-005': [
      { name: 'Steve K.', rating: 5, date: '2024-12-01', title: 'OEM quality', text: 'Exact fit replacement. We go through these every few months and Omega always has them in stock and ships fast.' },
      { name: 'Carlos M.', rating: 5, date: '2024-09-14', title: 'Perfect', text: 'Genuine tungsten carbide pins. Arc is consistent and they last way longer than the knockoffs we tried before.' },
    ],
    'af-001': [
      { name: 'Brian L.', rating: 5, date: '2025-01-10', title: 'Great price for quality filters', text: 'We buy these in bulk for our warehouse. Good airflow, solid construction, and Omega\'s pricing can\'t be beat.' },
      { name: 'Tom W.', rating: 4, date: '2024-11-22', title: 'Standard quality', text: 'Does exactly what it should. MERV 8 performance is solid. We replace monthly and these hold up well.' },
    ],
    'af-003': [
      { name: 'Dr. Sarah P.', rating: 5, date: '2025-02-05', title: 'Critical application approved', text: 'Using these in our cleanroom. True HEPA performance verified with our particle counter. Excellent seal.' },
      { name: 'Mark H.', rating: 5, date: '2024-12-18', title: 'Premium quality HEPA', text: 'Donaldson makes a great product. No bypass leakage, gasket seals perfectly. Worth the investment for our paint line.' },
    ],
    'lf-001': [
      { name: 'Randy F.', rating: 5, date: '2025-01-28', title: 'Incredible atomization', text: 'The finish quality from this gun is outstanding. Fine atomization, minimal overspray. We\'re getting 70%+ TE on flat panels.' },
      { name: 'Jeff B.', rating: 4, date: '2024-10-30', title: 'Very good HVLP', text: 'Great for basecoats and clears. Cup size is perfect for our batch work. Only wish it came with a 1.4mm setup too.' },
      { name: 'Paul N.', rating: 5, date: '2024-09-08', title: 'Professional grade', text: 'After trying several cheaper alternatives, this is the one to buy. Balance and trigger feel are excellent for all-day spraying.' },
    ],
    'lf-004': [
      { name: 'Tony G.', rating: 5, date: '2025-03-01', title: 'Built like a tank', text: 'ASME coded, agitator works great, regulator holds steady. Been running this daily for a year with zero issues.' },
      { name: 'Chris D.', rating: 4, date: '2024-11-05', title: 'Solid pressure pot', text: 'Good build quality. Only suggestion would be a sight glass for fluid level. Otherwise works exactly as needed.' },
    ],
  },

  /**
   * Render reviews section for a product
   */
  renderReviews(productId) {
    const stored = JSON.parse(localStorage.getItem('omega-reviews') || '{}');
    const productReviews = [...(this.reviews[productId] || []), ...(stored[productId] || [])];

    const stars = (rating) => {
      return Array.from({length: 5}, (_, i) =>
        `<svg width="14" height="14" viewBox="0 0 24 24" fill="${i < rating ? '#2D8F4E' : 'none'}" stroke="${i < rating ? '#2D8F4E' : '#6B7280'}" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`
      ).join('');
    };

    if (productReviews.length === 0) {
      return `
        <div class="max-w-2xl">
          <div class="text-center py-12">
            <svg class="mx-auto mb-4" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#6B7280" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <p class="font-display font-600 text-sm uppercase tracking-wider text-chrome mb-2">No Reviews Yet</p>
            <p class="font-body text-sm text-alloy mb-6">Be the first to review this product.</p>
            <button onclick="OmegaShop.toggleReviewForm()" class="btn-primary inline-flex items-center gap-2 bg-forge text-white font-display font-700 text-xs tracking-wider uppercase px-6 py-3 rounded-lg">
              Write a Review
            </button>
          </div>
          <div id="review-form-container" class="hidden"></div>
        </div>
      `;
    }

    const avgRating = (productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length).toFixed(1);

    return `
      <div class="max-w-2xl">
        <!-- Summary -->
        <div class="flex items-center gap-4 mb-8 pb-6 border-b border-gunmetal/30">
          <div class="text-center">
            <span class="font-display font-800 text-3xl text-chrome">${avgRating}</span>
            <div class="flex items-center gap-0.5 mt-1">${stars(Math.round(avgRating))}</div>
          </div>
          <div class="flex-1">
            <p class="font-body text-sm text-alloy">${productReviews.length} review${productReviews.length > 1 ? 's' : ''}</p>
          </div>
          <button onclick="OmegaShop.toggleReviewForm()" class="btn-primary inline-flex items-center gap-2 bg-forge text-white font-display font-700 text-xs tracking-wider uppercase px-5 py-2.5 rounded-lg">
            Write a Review
          </button>
        </div>

        <!-- Review Form (hidden by default) -->
        <div id="review-form-container" class="hidden mb-8 p-6 rounded-xl border border-gunmetal/30 bg-steel/30">
          <h3 class="font-display font-700 text-sm uppercase tracking-wider text-chrome mb-4">Write Your Review</h3>
          <form onsubmit="OmegaShop.submitReview(event, '${productId}')">
            <div class="grid sm:grid-cols-2 gap-4 mb-4">
              <input type="text" placeholder="Your Name" required class="w-full px-4 py-3 rounded-lg border border-gunmetal bg-white font-body text-sm text-chrome placeholder:text-rivet focus:outline-none focus:border-forge">
              <div class="flex items-center gap-1">
                <span class="font-display text-xs tracking-wider uppercase text-alloy mr-2">Rating:</span>
                <button type="button" onclick="OmegaShop.setRating(1)" class="review-star" data-star="1"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></button>
                <button type="button" onclick="OmegaShop.setRating(2)" class="review-star" data-star="2"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></button>
                <button type="button" onclick="OmegaShop.setRating(3)" class="review-star" data-star="3"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></button>
                <button type="button" onclick="OmegaShop.setRating(4)" class="review-star" data-star="4"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></button>
                <button type="button" onclick="OmegaShop.setRating(5)" class="review-star" data-star="5"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></button>
                <input type="hidden" id="review-rating" value="5">
              </div>
            </div>
            <input type="text" placeholder="Review Title" required class="w-full px-4 py-3 mb-4 rounded-lg border border-gunmetal bg-white font-body text-sm text-chrome placeholder:text-rivet focus:outline-none focus:border-forge">
            <textarea placeholder="Share your experience with this product..." required rows="4" class="w-full px-4 py-3 mb-4 rounded-lg border border-gunmetal bg-white font-body text-sm text-chrome placeholder:text-rivet focus:outline-none focus:border-forge resize-none"></textarea>
            <button type="submit" class="btn-primary inline-flex items-center gap-2 bg-forge text-white font-display font-700 text-xs tracking-wider uppercase px-6 py-3 rounded-lg">
              Submit Review
            </button>
          </form>
        </div>

        <!-- Reviews List -->
        <div class="space-y-6">
          ${productReviews.map(r => `
            <div class="pb-6 border-b border-gunmetal/20 last:border-0">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-forge/10 flex items-center justify-center">
                    <span class="font-display text-xs font-700 text-forge">${r.name.charAt(0)}</span>
                  </div>
                  <span class="font-display text-xs font-600 tracking-wider uppercase text-chrome">${r.name}</span>
                </div>
                <span class="font-body text-[11px] text-rivet">${new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <div class="flex items-center gap-2 mb-2">
                <div class="flex items-center gap-0.5">${stars(r.rating)}</div>
                <span class="font-display text-xs font-600 uppercase tracking-wider text-chrome">${r.title}</span>
              </div>
              <p class="font-body text-sm text-alloy leading-relaxed">${r.text}</p>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  selectedRating: 5,

  toggleReviewForm() {
    const container = document.getElementById('review-form-container');
    if (container) container.classList.toggle('hidden');
  },

  setRating(rating) {
    this.selectedRating = rating;
    document.getElementById('review-rating').value = rating;
    document.querySelectorAll('.review-star').forEach(btn => {
      const star = parseInt(btn.dataset.star);
      const svg = btn.querySelector('svg polygon');
      if (star <= rating) {
        svg.setAttribute('fill', '#2D8F4E');
        svg.setAttribute('stroke', '#2D8F4E');
      } else {
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', '#6B7280');
      }
    });
  },

  submitReview(event, productId) {
    event.preventDefault();
    const form = event.target;
    const name = form.querySelector('input[type="text"]').value;
    const rating = parseInt(document.getElementById('review-rating').value);
    const title = form.querySelectorAll('input[type="text"]')[1].value;
    const text = form.querySelector('textarea').value;

    // Store in localStorage
    const stored = JSON.parse(localStorage.getItem('omega-reviews') || '{}');
    if (!stored[productId]) stored[productId] = [];
    stored[productId].push({ name, rating, date: new Date().toISOString().split('T')[0], title, text });
    localStorage.setItem('omega-reviews', JSON.stringify(stored));

    // Show success and reload reviews
    this.toggleReviewForm();
    OmegaCart.showToast('Review submitted! Thank you.');

    // Reload product detail to show new review
    setTimeout(() => this.loadProductDetail('product-detail'), 300);
  },


  // ========================
  // PAGINATION
  // ========================

  currentPage: 1,
  perPage: 12,
  currentProducts: [],

  /**
   * Initialize pagination with load-more button
   */
  initPagination(products, gridId, loadMoreId, countId) {
    this.currentProducts = products;
    this.currentPage = 1;

    this.renderPage(gridId, countId);

    const loadMoreBtn = document.getElementById(loadMoreId);
    if (loadMoreBtn) {
      const shown = this.currentPage * this.perPage;
      if (shown >= products.length) {
        loadMoreBtn.classList.add('hidden');
      } else {
        loadMoreBtn.classList.remove('hidden');
        loadMoreBtn.onclick = () => {
          this.currentPage++;
          this.renderPage(gridId, countId);
          const newShown = this.currentPage * this.perPage;
          if (newShown >= this.currentProducts.length) {
            loadMoreBtn.classList.add('hidden');
          }
        };
      }
    }
  },

  /**
   * Render current page of products
   */
  renderPage(gridId, countId) {
    const container = document.getElementById(gridId);
    if (!container) return;

    const shown = this.currentProducts.slice(0, this.currentPage * this.perPage);
    container.innerHTML = shown.map(p => this.renderProductCard(p)).join('');

    // Update count display
    const countEl = document.getElementById(countId);
    if (countEl) {
      countEl.textContent = `Showing ${shown.length} of ${this.currentProducts.length} products`;
    }
  },


  // ========================
  // UTILITY
  // ========================

  /**
   * Get URL parameters
   */
  getParams() {
    return new URLSearchParams(window.location.search);
  },

  /**
   * Get unique brands from a set of products
   */
  getBrands(products) {
    return [...new Set(products.map(p => p.brand))].sort();
  },

  /**
   * Get price range from a set of products
   */
  getPriceRange(products) {
    if (products.length === 0) return { min: 0, max: 0 };
    const prices = products.map(p => p.price);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  },

  /**
   * Get category object by slug
   */
  getCategory(slug) {
    return CATALOG.categories.find(c => c.slug === slug || c.id === slug);
  }
};

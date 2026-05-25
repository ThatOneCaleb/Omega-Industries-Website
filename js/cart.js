/**
 * Omega Industries Cart Management
 * localStorage-based cart with Stripe Checkout integration
 */

const OmegaCart = {
  STORAGE_KEY: 'omega-cart',

  init() {
    this.initToast();
    this.updateBadge();
    this.initCartDrawer();
  },

  // ========================
  // CART DATA (localStorage)
  // ========================

  getCart() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || [];
    } catch { return []; }
  },

  saveCart(cart) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cart));
    this.updateBadge();
  },

  addItem(product, quantity = 1) {
    const cart = this.getCart();
    const existing = cart.find(item => item.id === product.id);

    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        partNumber: product.partNumber,
        price: product.price,
        image: product.image,
        quantity: quantity,
      });
    }

    this.saveCart(cart);
    this.showToast(product.name);
    this.renderCartDrawer();
  },

  removeItem(productId) {
    const cart = this.getCart().filter(item => item.id !== productId);
    this.saveCart(cart);
    this.renderCartDrawer();
    // Also re-render cart page if on it
    if (document.getElementById('cart-content')) {
      this.renderCartPage('cart-content');
    }
  },

  updateQuantity(productId, quantity) {
    const cart = this.getCart();
    const item = cart.find(i => i.id === productId);
    if (item) {
      item.quantity = Math.max(1, Math.min(999, quantity));
      this.saveCart(cart);
      this.renderCartDrawer();
      if (document.getElementById('cart-content')) {
        this.renderCartPage('cart-content');
      }
    }
  },

  clearCart() {
    localStorage.removeItem(this.STORAGE_KEY);
    this.updateBadge();
    this.renderCartDrawer();
  },

  getTotal() {
    return this.getCart().reduce((sum, item) => sum + (item.price * item.quantity), 0);
  },

  getItemCount() {
    return this.getCart().reduce((sum, item) => sum + item.quantity, 0);
  },

  // ========================
  // BADGE
  // ========================

  updateBadge() {
    const badges = document.querySelectorAll('.cart-badge');
    const count = this.getItemCount();

    badges.forEach(badge => {
      if (count > 0) {
        badge.textContent = count > 99 ? '99+' : count;
        badge.style.display = 'flex';
      } else {
        badge.style.display = 'none';
      }
    });
  },

  // ========================
  // TOAST
  // ========================

  initToast() {
    if (document.getElementById('cart-toast')) return;
    const toast = document.createElement('div');
    toast.id = 'cart-toast';
    toast.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:10000;pointer-events:none;display:flex;flex-direction:column;gap:8px;align-items:flex-end;';
    document.body.appendChild(toast);
  },

  showToast(productName) {
    const container = document.getElementById('cart-toast');
    if (!container) return;

    const toast = document.createElement('div');
    toast.style.cssText = 'pointer-events:auto;display:flex;align-items:center;gap:10px;background:#0A0E14;border:1px solid rgba(45,143,78,0.4);border-radius:12px;padding:12px 18px;box-shadow:0 8px 32px rgba(0,0,0,0.3);transform:translateX(120%);transition:transform 0.4s cubic-bezier(0.23,1,0.32,1),opacity 0.3s;opacity:0;max-width:320px;';
    toast.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2D8F4E" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
      <span style="font-family:'DM Sans',sans-serif;font-size:13px;color:#fff;"><strong style="color:#2D8F4E;">Added</strong> ${productName.length > 30 ? productName.slice(0, 30) + '…' : productName}</span>
    `;
    container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.transform = 'translateX(0)';
      toast.style.opacity = '1';
    });

    setTimeout(() => {
      toast.style.transform = 'translateX(120%)';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 400);
    }, 3000);
  },

  // ========================
  // CART DRAWER (slide-in sidebar)
  // ========================

  initCartDrawer() {
    if (document.getElementById('cart-drawer')) return;

    const drawer = document.createElement('div');
    drawer.id = 'cart-drawer';
    drawer.style.cssText = 'position:fixed;top:0;right:0;bottom:0;width:100%;max-width:400px;background:#fff;z-index:9998;transform:translateX(100%);transition:transform 0.4s cubic-bezier(0.23,1,0.32,1);box-shadow:-8px 0 32px rgba(0,0,0,0.15);display:flex;flex-direction:column;';
    drawer.innerHTML = '<div id="cart-drawer-content"></div>';
    document.body.appendChild(drawer);

    // Backdrop
    const backdrop = document.createElement('div');
    backdrop.id = 'cart-backdrop';
    backdrop.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9997;opacity:0;pointer-events:none;transition:opacity 0.3s;';
    backdrop.onclick = () => this.closeDrawer();
    document.body.appendChild(backdrop);

    this.renderCartDrawer();
  },

  openDrawer() {
    const drawer = document.getElementById('cart-drawer');
    const backdrop = document.getElementById('cart-backdrop');
    if (drawer) {
      drawer.style.transform = 'translateX(0)';
      document.body.style.overflow = 'hidden';
    }
    if (backdrop) {
      backdrop.style.opacity = '1';
      backdrop.style.pointerEvents = 'auto';
    }
    this.renderCartDrawer();
  },

  closeDrawer() {
    const drawer = document.getElementById('cart-drawer');
    const backdrop = document.getElementById('cart-backdrop');
    if (drawer) {
      drawer.style.transform = 'translateX(100%)';
      document.body.style.overflow = '';
    }
    if (backdrop) {
      backdrop.style.opacity = '0';
      backdrop.style.pointerEvents = 'none';
    }
  },

  renderCartDrawer() {
    const drawer = document.getElementById('cart-drawer');
    if (!drawer) return;

    const cart = this.getCart();
    const total = this.getTotal();

    if (cart.length === 0) {
      drawer.innerHTML = `
        <div style="display:flex;flex-direction:column;height:100%;">
          <div style="display:flex;align-items:center;justify-content:space-between;padding:20px 24px;border-bottom:1px solid #E5E7EB;">
            <span style="font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:14px;text-transform:uppercase;letter-spacing:0.1em;color:#111827;">Your Cart</span>
            <button onclick="OmegaCart.closeDrawer()" style="padding:4px;color:#6B7280;cursor:pointer;background:none;border:none;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
          <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 24px;text-align:center;">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            <p style="font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:16px;text-transform:uppercase;letter-spacing:0.05em;color:#111827;margin-top:16px;">Cart is Empty</p>
            <p style="font-family:'DM Sans',sans-serif;font-size:13px;color:#6B7280;margin-top:4px;">Add items from the shop to get started.</p>
            <a href="shop.html" style="margin-top:20px;display:inline-flex;align-items:center;gap:6px;background:#2D8F4E;color:#fff;font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;padding:10px 20px;border-radius:8px;text-decoration:none;">Shop Now</a>
          </div>
        </div>
      `;
      return;
    }

    let itemsHtml = cart.map(item => `
      <div style="display:flex;gap:12px;padding:12px 0;border-bottom:1px solid #F3F4F6;">
        <img src="${item.image}" alt="${item.name}" style="width:56px;height:56px;object-fit:cover;border-radius:8px;background:#0A0E14;flex-shrink:0;">
        <div style="flex:1;min-width:0;">
          <p style="font-family:'Barlow Condensed',sans-serif;font-weight:600;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;color:#111827;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.name}</p>
          <p style="font-family:'DM Sans',sans-serif;font-size:11px;color:#6B7280;">${item.partNumber}</p>
          <div style="display:flex;align-items:center;gap:8px;margin-top:6px;">
            <button onclick="OmegaCart.updateQuantity('${item.id}', ${item.quantity - 1})" style="width:24px;height:24px;border:1px solid #D1D5DB;border-radius:4px;display:flex;align-items:center;justify-content:center;cursor:pointer;background:#fff;color:#111827;font-size:14px;">−</button>
            <span style="font-family:'DM Sans',sans-serif;font-size:12px;font-weight:600;color:#111827;min-width:16px;text-align:center;">${item.quantity}</span>
            <button onclick="OmegaCart.updateQuantity('${item.id}', ${item.quantity + 1})" style="width:24px;height:24px;border:1px solid #D1D5DB;border-radius:4px;display:flex;align-items:center;justify-content:center;cursor:pointer;background:#fff;color:#111827;font-size:14px;">+</button>
          </div>
        </div>
        <div style="text-align:right;flex-shrink:0;">
          <p style="font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:14px;color:#111827;">$${(item.price * item.quantity).toFixed(2)}</p>
          <button onclick="OmegaCart.removeItem('${item.id}')" style="background:none;border:none;cursor:pointer;color:#9CA3AF;margin-top:4px;padding:2px;" title="Remove">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      </div>
    `).join('');

    drawer.innerHTML = `
      <div style="display:flex;flex-direction:column;height:100%;">
        <div style="display:flex;align-items:center;justify-content:space-between;padding:20px 24px;border-bottom:1px solid #E5E7EB;">
          <span style="font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:14px;text-transform:uppercase;letter-spacing:0.1em;color:#111827;">Your Cart (${this.getItemCount()})</span>
          <button onclick="OmegaCart.closeDrawer()" style="padding:4px;color:#6B7280;cursor:pointer;background:none;border:none;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div style="flex:1;overflow-y:auto;padding:12px 24px;">
          ${itemsHtml}
        </div>
        <div style="padding:20px 24px;border-top:1px solid #E5E7EB;background:#F9FAFB;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
            <span style="font-family:'Barlow Condensed',sans-serif;font-weight:600;font-size:13px;text-transform:uppercase;letter-spacing:0.1em;color:#4B5563;">Subtotal</span>
            <span style="font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:20px;color:#111827;">$${total.toFixed(2)}</span>
          </div>
          <button onclick="OmegaCart.checkout()" style="width:100%;display:flex;align-items:center;justify-content:center;gap:8px;background:#2D8F4E;color:#fff;font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:13px;text-transform:uppercase;letter-spacing:0.1em;padding:14px;border-radius:8px;border:none;cursor:pointer;transition:background 0.2s;" onmouseover="this.style.background='#38B261'" onmouseout="this.style.background='#2D8F4E'">
            Checkout
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
          <a href="shop-cart.html" style="display:block;text-align:center;margin-top:10px;font-family:'Barlow Condensed',sans-serif;font-size:11px;text-transform:uppercase;letter-spacing:0.15em;color:#2D8F4E;text-decoration:none;">View Full Cart</a>
        </div>
      </div>
    `;
  },

  // ========================
  // STRIPE CHECKOUT
  // ========================

  async checkout() {
    const cart = this.getCart();
    if (cart.length === 0) return;

    const checkoutBtn = document.querySelector('[onclick="OmegaCart.checkout()"]');
    if (checkoutBtn) {
      checkoutBtn.textContent = 'Processing...';
      checkoutBtn.style.opacity = '0.7';
      checkoutBtn.style.pointerEvents = 'none';
    }

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(item => ({ id: item.id, quantity: item.quantity })),
          origin: window.location.origin,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      this.showToast('Checkout failed — please try again');
      if (checkoutBtn) {
        checkoutBtn.textContent = 'Checkout';
        checkoutBtn.style.opacity = '1';
        checkoutBtn.style.pointerEvents = 'auto';
      }
    }
  },

  // ========================
  // CART PAGE
  // ========================

  renderCartPage(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const cart = this.getCart();

    if (cart.length === 0) {
      // Check for success/cancel status
      const params = new URLSearchParams(window.location.search);
      if (params.get('success') === 'true') {
        this.clearCart();
        container.innerHTML = `
          <div class="text-center py-20">
            <svg class="mx-auto mb-6" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#2D8F4E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
            <h2 class="font-display font-700 text-2xl uppercase tracking-tight text-chrome mb-3">Order Confirmed!</h2>
            <p class="font-body text-alloy mb-8">Thank you for your purchase. You'll receive a confirmation email shortly.</p>
            <a href="shop.html" class="btn-primary inline-flex items-center gap-2 bg-forge text-white font-display font-700 text-sm tracking-wider uppercase px-8 py-4 rounded-lg">
              Continue Shopping
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
          </div>
        `;
        return;
      }

      container.innerHTML = `
        <div class="text-center py-20">
          <svg class="mx-auto mb-6" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" style="color: #6B7280;">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          <h2 class="font-display font-700 text-2xl uppercase tracking-tight text-chrome mb-3">Your Cart is Empty</h2>
          <p class="font-body text-alloy mb-8">Browse our catalog to find the parts you need.</p>
          <a href="shop.html" class="btn-primary inline-flex items-center gap-2 bg-forge text-white font-display font-700 text-sm tracking-wider uppercase px-8 py-4 rounded-lg">
            Continue Shopping
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
        </div>
      `;
      return;
    }

    const total = this.getTotal();

    let html = '<div class="space-y-4">';
    cart.forEach(item => {
      html += `
        <div class="flex items-center gap-4 p-4 rounded-xl" style="background: #0A0E14;">
          <img src="${item.image}" alt="${item.name}" class="w-20 h-20 object-cover rounded-lg flex-shrink-0">
          <div class="flex-1 min-w-0">
            <p class="font-display text-[10px] tracking-[0.2em] uppercase text-gray-500">${item.partNumber}</p>
            <h3 class="font-display font-600 text-sm uppercase text-white truncate">${item.name}</h3>
            <div class="flex items-center gap-2 mt-2">
              <button onclick="OmegaCart.updateQuantity('${item.id}', ${item.quantity - 1})" class="w-7 h-7 flex items-center justify-center rounded border border-gray-600 text-white hover:border-forge text-sm">−</button>
              <span class="font-body text-sm text-white min-w-[20px] text-center">${item.quantity}</span>
              <button onclick="OmegaCart.updateQuantity('${item.id}', ${item.quantity + 1})" class="w-7 h-7 flex items-center justify-center rounded border border-gray-600 text-white hover:border-forge text-sm">+</button>
              <button onclick="OmegaCart.removeItem('${item.id}')" class="ml-3 text-gray-500 hover:text-red-400 transition-colors" title="Remove">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          </div>
          <div class="text-right flex-shrink-0">
            <p class="font-display font-700 text-lg text-white">$${(item.price * item.quantity).toFixed(2)}</p>
            <p class="font-body text-xs text-gray-500">$${item.price.toFixed(2)} ea</p>
          </div>
        </div>
      `;
    });
    html += '</div>';

    html += `
      <div class="mt-8 p-6 rounded-xl border border-gunmetal/30">
        <div class="flex justify-between items-center mb-6">
          <span class="font-display font-600 text-lg uppercase tracking-wide text-chrome">Subtotal</span>
          <span class="font-display font-700 text-2xl text-chrome">$${total.toFixed(2)}</span>
        </div>
        <button onclick="OmegaCart.checkout()" class="btn-primary w-full flex items-center justify-center gap-2 bg-forge text-white font-display font-700 text-sm tracking-wider uppercase px-8 py-4 rounded-lg">
          Proceed to Checkout
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
        <a href="shop.html" class="block text-center mt-4 font-display text-xs tracking-[0.2em] uppercase text-forge hover:text-forge-bright">
          Continue Shopping
        </a>
      </div>
    `;

    container.innerHTML = html;
  }
};

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  OmegaCart.init();
});

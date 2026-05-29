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
          <a href="shop-cart.html" style="display:block;text-align:center;margin-top:12px;font-family:'Barlow Condensed',sans-serif;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:#2D8F4E;text-decoration:none;padding:10px;">View Full Cart</a>
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

    // Check for success/cancel status FIRST (before reading cart)
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

    if (params.get('invoice_sent') === 'true') {
      this.clearCart();
      const email = decodeURIComponent(params.get('email') || 'your email');
      container.innerHTML = `
        <div class="text-center py-20">
          <svg class="mx-auto mb-6" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#2D8F4E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
          </svg>
          <h2 class="font-display font-700 text-2xl uppercase tracking-tight text-chrome mb-3">Invoice Sent!</h2>
          <p class="font-body text-alloy mb-3">A Stripe invoice has been sent to <strong class="text-chrome">${email}</strong>.</p>
          <p class="font-body text-alloy mb-8">Payment is due within 30 days. You can pay directly via the link in the email.</p>
          <a href="shop.html" class="btn-primary inline-flex items-center gap-2 bg-forge text-white font-display font-700 text-sm tracking-wider uppercase px-8 py-4 rounded-lg">
            Continue Shopping
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
        </div>
      `;
      return;
    }

    const cart = this.getCart();

    if (cart.length === 0) {
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
        <div class="flex items-center gap-4 my-4">
          <div class="flex-1 h-px bg-gunmetal/30"></div>
          <span class="font-display text-[10px] tracking-[0.2em] uppercase text-rivet">or</span>
          <div class="flex-1 h-px bg-gunmetal/30"></div>
        </div>
        <button onclick="OmegaCart.openInvoiceModal()" class="w-full flex items-center justify-center gap-2 border-2 border-forge text-forge font-display font-700 text-sm tracking-wider uppercase px-8 py-4 rounded-lg hover:bg-forge hover:text-white transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          Request B2B Invoice
        </button>
        <p class="text-center mt-2 font-body text-[11px] text-rivet">Net-30 payment terms for business customers</p>
        <a href="shop.html" class="block text-center mt-4 font-display text-xs tracking-[0.2em] uppercase text-forge hover:text-forge-bright">
          Continue Shopping
        </a>
      </div>
    `;

    container.innerHTML = html;
  },

  // ========================
  // B2B INVOICE MODAL
  // ========================

  US_STATES: [
    'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
    'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
    'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC',
  ],

  openInvoiceModal() {
    if (document.getElementById('invoice-backdrop')) return;

    const cart = this.getCart();
    const total = this.getTotal();
    const itemCount = this.getItemCount();

    const backdrop = document.createElement('div');
    backdrop.id = 'invoice-backdrop';
    backdrop.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9998;opacity:0;transition:opacity 0.3s;cursor:pointer;';
    backdrop.onclick = () => this.closeInvoiceModal();

    const modal = document.createElement('div');
    modal.id = 'invoice-modal';
    modal.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) scale(0.95);max-width:540px;width:calc(100% - 32px);max-height:90vh;overflow-y:auto;background:#fff;border-radius:16px;z-index:9999;opacity:0;transition:transform 0.3s cubic-bezier(0.23,1,0.32,1),opacity 0.3s;box-shadow:0 24px 64px rgba(0,0,0,0.2);';
    modal.onclick = (e) => e.stopPropagation();

    const stateOptions = this.US_STATES.map(s => `<option value="${s}">${s}</option>`).join('');

    modal.innerHTML = `
      <div style="padding:24px 28px 0;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
          <h2 style="font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:20px;text-transform:uppercase;letter-spacing:0.05em;color:#111827;margin:0;">Request B2B Invoice</h2>
          <button onclick="OmegaCart.closeInvoiceModal()" style="padding:4px;color:#6B7280;cursor:pointer;background:none;border:none;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div style="background:#F9FAFB;border-radius:8px;padding:12px 16px;margin-bottom:20px;display:flex;justify-content:space-between;align-items:center;">
          <span style="font-family:'DM Sans',sans-serif;font-size:13px;color:#4B5563;">${itemCount} item${itemCount !== 1 ? 's' : ''} in cart</span>
          <span style="font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:18px;color:#111827;">$${total.toFixed(2)}</span>
        </div>
        <div id="invoice-error" style="display:none;background:#FEF2F2;border:1px solid #FECACA;border-radius:8px;padding:10px 14px;margin-bottom:16px;font-family:'DM Sans',sans-serif;font-size:13px;color:#DC2626;"></div>
      </div>
      <form id="invoice-form" onsubmit="OmegaCart.submitInvoice(event)" style="padding:0 28px 24px;">
        <div style="margin-bottom:14px;">
          <label style="font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:#4B5563;display:block;margin-bottom:6px;">Company Name <span style="color:#DC2626;">*</span></label>
          <input type="text" name="companyName" required minlength="2" style="width:100%;padding:10px 14px;border:1px solid #D1D5DB;border-radius:8px;font-family:'DM Sans',sans-serif;font-size:14px;color:#111827;outline:none;transition:border-color 0.2s,box-shadow 0.2s;" onfocus="this.style.borderColor='#2D8F4E';this.style.boxShadow='0 0 0 3px rgba(45,143,78,0.15)'" onblur="this.style.borderColor='#D1D5DB';this.style.boxShadow='none'">
        </div>
        <div style="margin-bottom:14px;">
          <label style="font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:#4B5563;display:block;margin-bottom:6px;">Billing Email <span style="color:#DC2626;">*</span></label>
          <input type="email" name="billingEmail" required style="width:100%;padding:10px 14px;border:1px solid #D1D5DB;border-radius:8px;font-family:'DM Sans',sans-serif;font-size:14px;color:#111827;outline:none;transition:border-color 0.2s,box-shadow 0.2s;" onfocus="this.style.borderColor='#2D8F4E';this.style.boxShadow='0 0 0 3px rgba(45,143,78,0.15)'" onblur="this.style.borderColor='#D1D5DB';this.style.boxShadow='none'" placeholder="accounts@company.com">
        </div>
        <div style="margin-bottom:14px;">
          <label style="font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:#4B5563;display:block;margin-bottom:6px;">Address Line 1 <span style="color:#DC2626;">*</span></label>
          <input type="text" name="line1" required minlength="3" style="width:100%;padding:10px 14px;border:1px solid #D1D5DB;border-radius:8px;font-family:'DM Sans',sans-serif;font-size:14px;color:#111827;outline:none;transition:border-color 0.2s,box-shadow 0.2s;" onfocus="this.style.borderColor='#2D8F4E';this.style.boxShadow='0 0 0 3px rgba(45,143,78,0.15)'" onblur="this.style.borderColor='#D1D5DB';this.style.boxShadow='none'">
        </div>
        <div style="margin-bottom:14px;">
          <label style="font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:#4B5563;display:block;margin-bottom:6px;">Address Line 2</label>
          <input type="text" name="line2" style="width:100%;padding:10px 14px;border:1px solid #D1D5DB;border-radius:8px;font-family:'DM Sans',sans-serif;font-size:14px;color:#111827;outline:none;transition:border-color 0.2s,box-shadow 0.2s;" onfocus="this.style.borderColor='#2D8F4E';this.style.boxShadow='0 0 0 3px rgba(45,143,78,0.15)'" onblur="this.style.borderColor='#D1D5DB';this.style.boxShadow='none'" placeholder="Suite, floor, etc.">
        </div>
        <div style="display:grid;grid-template-columns:1fr 80px 120px;gap:10px;margin-bottom:14px;">
          <div>
            <label style="font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:#4B5563;display:block;margin-bottom:6px;">City <span style="color:#DC2626;">*</span></label>
            <input type="text" name="city" required minlength="2" style="width:100%;padding:10px 14px;border:1px solid #D1D5DB;border-radius:8px;font-family:'DM Sans',sans-serif;font-size:14px;color:#111827;outline:none;transition:border-color 0.2s,box-shadow 0.2s;" onfocus="this.style.borderColor='#2D8F4E';this.style.boxShadow='0 0 0 3px rgba(45,143,78,0.15)'" onblur="this.style.borderColor='#D1D5DB';this.style.boxShadow='none'">
          </div>
          <div>
            <label style="font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:#4B5563;display:block;margin-bottom:6px;">State <span style="color:#DC2626;">*</span></label>
            <select name="state" required style="width:100%;padding:10px 8px;border:1px solid #D1D5DB;border-radius:8px;font-family:'DM Sans',sans-serif;font-size:14px;color:#111827;outline:none;background:#fff;transition:border-color 0.2s,box-shadow 0.2s;" onfocus="this.style.borderColor='#2D8F4E';this.style.boxShadow='0 0 0 3px rgba(45,143,78,0.15)'" onblur="this.style.borderColor='#D1D5DB';this.style.boxShadow='none'">
              <option value="">--</option>
              ${stateOptions}
            </select>
          </div>
          <div>
            <label style="font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:#4B5563;display:block;margin-bottom:6px;">ZIP <span style="color:#DC2626;">*</span></label>
            <input type="text" name="postal_code" required pattern="\\d{5}(-\\d{4})?" style="width:100%;padding:10px 14px;border:1px solid #D1D5DB;border-radius:8px;font-family:'DM Sans',sans-serif;font-size:14px;color:#111827;outline:none;transition:border-color 0.2s,box-shadow 0.2s;" onfocus="this.style.borderColor='#2D8F4E';this.style.boxShadow='0 0 0 3px rgba(45,143,78,0.15)'" onblur="this.style.borderColor='#D1D5DB';this.style.boxShadow='none'" placeholder="49548">
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px;">
          <div>
            <label style="font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:#4B5563;display:block;margin-bottom:6px;">Tax ID / EIN</label>
            <input type="text" name="taxId" style="width:100%;padding:10px 14px;border:1px solid #D1D5DB;border-radius:8px;font-family:'DM Sans',sans-serif;font-size:14px;color:#111827;outline:none;transition:border-color 0.2s,box-shadow 0.2s;" onfocus="this.style.borderColor='#2D8F4E';this.style.boxShadow='0 0 0 3px rgba(45,143,78,0.15)'" onblur="this.style.borderColor='#D1D5DB';this.style.boxShadow='none'" placeholder="XX-XXXXXXX">
          </div>
          <div>
            <label style="font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:#4B5563;display:block;margin-bottom:6px;">PO Number</label>
            <input type="text" name="poNumber" maxlength="50" style="width:100%;padding:10px 14px;border:1px solid #D1D5DB;border-radius:8px;font-family:'DM Sans',sans-serif;font-size:14px;color:#111827;outline:none;transition:border-color 0.2s,box-shadow 0.2s;" onfocus="this.style.borderColor='#2D8F4E';this.style.boxShadow='0 0 0 3px rgba(45,143,78,0.15)'" onblur="this.style.borderColor='#D1D5DB';this.style.boxShadow='none'" placeholder="PO-2026-001">
          </div>
        </div>
        <button type="submit" id="invoice-submit-btn" style="width:100%;display:flex;align-items:center;justify-content:center;gap:8px;background:#2D8F4E;color:#fff;font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:14px;text-transform:uppercase;letter-spacing:0.1em;padding:14px;border-radius:8px;border:none;cursor:pointer;transition:background 0.2s;" onmouseover="this.style.background='#38B261'" onmouseout="this.style.background='#2D8F4E'">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          Send Invoice
        </button>
        <p style="text-align:center;margin-top:10px;font-family:'DM Sans',sans-serif;font-size:11px;color:#6B7280;">Invoice will be emailed via Stripe with Net-30 payment terms</p>
      </form>
    `;

    document.body.appendChild(backdrop);
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';

    // Animate in
    requestAnimationFrame(() => {
      backdrop.style.opacity = '1';
      modal.style.opacity = '1';
      modal.style.transform = 'translate(-50%,-50%) scale(1)';
    });

    // Close on Escape
    this._invoiceEscHandler = (e) => {
      if (e.key === 'Escape') this.closeInvoiceModal();
    };
    document.addEventListener('keydown', this._invoiceEscHandler);
  },

  closeInvoiceModal() {
    const backdrop = document.getElementById('invoice-backdrop');
    const modal = document.getElementById('invoice-modal');

    if (modal) {
      modal.style.opacity = '0';
      modal.style.transform = 'translate(-50%,-50%) scale(0.95)';
    }
    if (backdrop) {
      backdrop.style.opacity = '0';
    }

    setTimeout(() => {
      backdrop?.remove();
      modal?.remove();
      document.body.style.overflow = '';
    }, 300);

    if (this._invoiceEscHandler) {
      document.removeEventListener('keydown', this._invoiceEscHandler);
      this._invoiceEscHandler = null;
    }
  },

  async submitInvoice(event) {
    event.preventDefault();

    const form = document.getElementById('invoice-form');
    const btn = document.getElementById('invoice-submit-btn');
    const errorDiv = document.getElementById('invoice-error');

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const data = new FormData(form);

    // Loading state
    btn.innerHTML = 'Submitting...';
    btn.style.opacity = '0.7';
    btn.style.pointerEvents = 'none';
    errorDiv.style.display = 'none';

    try {
      const cart = this.getCart();
      const response = await fetch('/api/invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(item => ({ id: item.id, quantity: item.quantity })),
          company: {
            name: data.get('companyName'),
            email: data.get('billingEmail'),
            address: {
              line1: data.get('line1'),
              line2: data.get('line2') || '',
              city: data.get('city'),
              state: data.get('state'),
              postal_code: data.get('postal_code'),
            },
            taxId: data.get('taxId') || '',
            poNumber: data.get('poNumber') || '',
          },
        }),
      });

      const result = await response.json();

      if (result.success) {
        this.closeInvoiceModal();
        this.clearCart();
        window.location.href = `shop-cart.html?invoice_sent=true&email=${encodeURIComponent(result.email)}`;
      } else {
        throw new Error(result.error || 'Failed to create invoice');
      }
    } catch (err) {
      console.error('Invoice error:', err);
      errorDiv.textContent = err.message || 'Something went wrong. Please try again.';
      errorDiv.style.display = 'block';
      btn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
        Send Invoice
      `;
      btn.style.opacity = '1';
      btn.style.pointerEvents = 'auto';
    }
  },
};

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  OmegaCart.init();
});

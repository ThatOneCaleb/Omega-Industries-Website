/**
 * Omega Industries Cart Management
 * Integrates with Snipcart for purchasable items
 * Manages header cart badge and cart page rendering
 */

const OmegaCart = {
  /**
   * Initialize cart badge and Snipcart event listeners
   */
  init() {
    this.updateBadge();

    // Listen for Snipcart ready event
    document.addEventListener('snipcart.ready', () => {
      Snipcart.store.subscribe(() => {
        this.updateBadge();
      });
      this.updateBadge();
    });
  },

  /**
   * Update the cart badge count in the header
   */
  updateBadge() {
    const badges = document.querySelectorAll('.cart-badge');
    let count = 0;

    // Get Snipcart count if available
    if (typeof Snipcart !== 'undefined' && Snipcart.store) {
      try {
        const state = Snipcart.store.getState();
        count = state.cart.items.count || 0;
      } catch (e) {
        count = 0;
      }
    }

    badges.forEach(badge => {
      if (count > 0) {
        badge.textContent = count > 99 ? '99+' : count;
        badge.style.display = 'flex';
      } else {
        badge.style.display = 'none';
      }
    });
  },

  /**
   * Open the Snipcart cart sidebar
   */
  openCart() {
    if (typeof Snipcart !== 'undefined') {
      Snipcart.api.theme.cart.open();
    }
  },

  /**
   * Get cart items from Snipcart
   */
  getItems() {
    if (typeof Snipcart !== 'undefined' && Snipcart.store) {
      try {
        const state = Snipcart.store.getState();
        return state.cart.items.items || [];
      } catch (e) {
        return [];
      }
    }
    return [];
  },

  /**
   * Get cart total from Snipcart
   */
  getTotal() {
    if (typeof Snipcart !== 'undefined' && Snipcart.store) {
      try {
        const state = Snipcart.store.getState();
        return state.cart.total || 0;
      } catch (e) {
        return 0;
      }
    }
    return 0;
  },

  /**
   * Render cart items on the full cart page
   */
  renderCartPage(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const items = this.getItems();

    if (items.length === 0) {
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

    let html = '<div class="space-y-4">';
    items.forEach(item => {
      html += `
        <div class="flex items-center gap-4 p-4 rounded-xl" style="background: #0A0E14;">
          <img src="${item.image || 'https://placehold.co/80x80/1a1a2e/2D8F4E?text=Item'}" alt="${item.name}" class="w-20 h-20 object-cover rounded-lg flex-shrink-0">
          <div class="flex-1 min-w-0">
            <p class="font-display text-[10px] tracking-[0.2em] uppercase text-gray-500">${item.id}</p>
            <h3 class="font-display font-600 text-sm uppercase text-white truncate">${item.name}</h3>
            <p class="font-body text-sm text-gray-400">Qty: ${item.quantity}</p>
          </div>
          <div class="text-right flex-shrink-0">
            <p class="font-display font-700 text-lg text-white">$${(item.price * item.quantity).toFixed(2)}</p>
            <p class="font-body text-xs text-gray-500">$${item.price.toFixed(2)} ea</p>
          </div>
        </div>
      `;
    });
    html += '</div>';

    const total = this.getTotal();
    html += `
      <div class="mt-8 p-6 rounded-xl border border-gunmetal/30">
        <div class="flex justify-between items-center mb-6">
          <span class="font-display font-600 text-lg uppercase tracking-wide text-chrome">Subtotal</span>
          <span class="font-display font-700 text-2xl text-chrome">$${total.toFixed(2)}</span>
        </div>
        <button onclick="Snipcart.api.theme.cart.open()" class="btn-primary w-full flex items-center justify-center gap-2 bg-forge text-white font-display font-700 text-sm tracking-wider uppercase px-8 py-4 rounded-lg">
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

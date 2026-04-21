import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '@/lib/api';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      sessionToken: null,
      loading: false,
      error: null,

      addItem: async (productId, quantity = 1, variantId = null) => {
        set({ loading: true, error: null });
        try {
          const { sessionToken } = get();
          await api.post('/cart/items', {
            product_id: productId,
            quantity,
            variant_id: variantId
          }, {
            headers: sessionToken ? { 'X-Session-Token': sessionToken } : {}
          });
          await get().fetchCart();
        } catch (error) {
          set({ error: error.response?.data?.message || 'Failed to add item' });
        } finally {
          set({ loading: false });
        }
      },

      removeItem: async (itemId) => {
        set({ loading: true });
        try {
          await api.delete(`/cart/items/${itemId}`);
          await get().fetchCart();
        } catch (error) {
          set({ error: error.response?.data?.message || 'Failed to remove item' });
        } finally {
          set({ loading: false });
        }
      },

      updateItemQuantity: async (itemId, quantity) => {
        set({ loading: true });
        try {
          await api.patch(`/cart/items/${itemId}`, { quantity });
          await get().fetchCart();
        } catch (error) {
          set({ error: error.response?.data?.message || 'Failed to update item' });
        } finally {
          set({ loading: false });
        }
      },

      // Silently fetch cart — never throws, never crashes the page
      fetchCart: async () => {
        try {
          const { sessionToken } = get();
          const response = await api.get('/cart', {
            headers: sessionToken ? { 'X-Session-Token': sessionToken } : {}
          });
          set({
            items: response.data.items || [],
            sessionToken: response.data.sessionToken || sessionToken
          });
        } catch (error) {
          // API is offline or DB not connected — just use localStorage items silently
          console.warn('Cart sync skipped (API unavailable):', error.message);
        }
      },

      clearCart: async () => {
        set({ loading: true });
        try {
          await api.delete('/cart');
          set({ items: [] });
        } catch (error) {
          set({ error: error.response?.data?.message || 'Failed to clear cart' });
        } finally {
          set({ loading: false });
        }
      },

      getTotal: () => {
        return get().items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      }
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? localStorage : {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {}
        }
      ),
      partialize: (state) => ({ items: state.items, sessionToken: state.sessionToken })
    }
  )
);

export default useCartStore;

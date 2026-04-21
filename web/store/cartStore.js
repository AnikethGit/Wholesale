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
          const res = await api.post('/cart/items', {
            product_id: productId,
            quantity,
            variant_id: variantId
          }, {
            headers: sessionToken ? { 'X-Session-Token': sessionToken } : {}
          });
          if (res?.data !== null) await get().fetchCart();
        } catch (error) {
          set({ error: error.message || 'Failed to add item' });
        } finally {
          set({ loading: false });
        }
      },

      removeItem: async (itemId) => {
        // Optimistic update — remove from local state immediately
        set((state) => ({
          items: state.items.filter((i) => i.id !== itemId),
          loading: true
        }));
        try {
          await api.delete(`/cart/items/${itemId}`);
          await get().fetchCart();
        } catch {
          // Keep local removal even if API fails
        } finally {
          set({ loading: false });
        }
      },

      updateItemQuantity: async (itemId, quantity) => {
        // Optimistic update
        set((state) => ({
          items: state.items.map((i) =>
            i.id === itemId
              ? { ...i, quantity, subtotal: quantity * i.unit_price }
              : i
          ),
          loading: true
        }));
        try {
          await api.patch(`/cart/items/${itemId}`, { quantity });
          await get().fetchCart();
        } catch {
          // Keep local change even if API fails
        } finally {
          set({ loading: false });
        }
      },

      // Silently fetch cart from server — never crashes the page
      fetchCart: async () => {
        try {
          const { sessionToken } = get();
          const res = await api.get('/cart', {
            headers: sessionToken ? { 'X-Session-Token': sessionToken } : {}
          });

          // res.data is null when API is offline (our interceptor returns null)
          if (!res || res.data === null || res.offline) return;

          set({
            items: res.data.items || [],
            sessionToken: res.data.sessionToken || sessionToken
          });
        } catch {
          // API error — silently keep localStorage items
        }
      },

      clearCart: async () => {
        set({ items: [], loading: true });
        try {
          await api.delete('/cart');
        } catch {
          // Already cleared locally
        } finally {
          set({ loading: false });
        }
      },

      getTotal: () =>
        get().items.reduce((sum, item) => sum + (item.subtotal || 0), 0),

      getItemCount: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0)
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined'
          ? localStorage
          : { getItem: () => null, setItem: () => {}, removeItem: () => {} }
      ),
      partialize: (state) => ({
        items: state.items,
        sessionToken: state.sessionToken
      })
    }
  )
);

export default useCartStore;

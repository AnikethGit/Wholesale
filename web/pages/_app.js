import { useEffect } from 'react';
import useAuthStore from '@/store/authStore';
import useCartStore from '@/store/cartStore';
import '@/styles/globals.css';

export default function App({ Component, pageProps }) {
  const hydrateAuth = useAuthStore((state) => state.hydrate);
  const fetchCart = useCartStore((state) => state.fetchCart);

  useEffect(() => {
    // Rehydrate auth token from localStorage on app load
    hydrateAuth();
    // Sync cart from server
    fetchCart();
  }, []);

  return <Component {...pageProps} />;
}

import { useEffect } from 'react';
import useAuthStore from '@/store/authStore';
import useCartStore from '@/store/cartStore';
import '@/styles/globals.css';

export default function App({ Component, pageProps }) {
  const hydrateAuth = useAuthStore((state) => state.hydrate);
  const fetchCart = useCartStore((state) => state.fetchCart);

  useEffect(() => {
    // Rehydrate JWT from localStorage
    hydrateAuth();

    // Sync cart silently — errors are swallowed inside fetchCart itself
    fetchCart();
  }, []);

  return <Component {...pageProps} />;
}

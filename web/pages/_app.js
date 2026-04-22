import { useEffect } from 'react';
import useAuthStore from '@/store/authStore';
import useCartStore from '@/store/cartStore';
import '@/styles/globals.css';

export default function App({ Component, pageProps }) {
  const hydrateAuth = useAuthStore((s) => s.hydrate);
  const fetchCart  = useCartStore((s) => s.fetchCart);

  useEffect(() => {
    hydrateAuth();
    fetchCart();
  }, []);

  // Pages can opt out of the default Layout by setting Component.noLayout = true
  return <Component {...pageProps} />;
}

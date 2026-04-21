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

    // Only sync cart with server if API is likely running
    // (avoids the AxiosError 500 splash when API is offline)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    fetch(`${apiUrl.replace('/api', '')}/health`)
      .then((res) => {
        if (res.ok) fetchCart();
      })
      .catch(() => {
        // API not running — cart works from localStorage only
        console.warn('API server not reachable. Cart running in offline mode.');
      });
  }, []);

  return <Component {...pageProps} />;
}

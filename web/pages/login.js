import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import useAuthStore from '@/store/authStore';
import Layout from '@/components/Layout';
import styles from '@/styles/Auth.module.css';

export default function Login() {
  const router = useRouter();
  const { login, loading, error } = useAuthStore();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await login(formData.email, formData.password);
      router.push('/account');
    } catch (error) {
      setErrors({ submit: error.response?.data?.message || 'Login failed' });
    }
  };

  return (
    <Layout title="Sign In" description="Sign in to your TechWholesale account">
      <div className={styles.container}>
      <div className={styles.formWrapper}>
        <div className={styles.formBox}>
          <h1>Welcome Back</h1>
          <p className={styles.subtitle}>Sign in to your account</p>

          {error && <div className={styles.errorBox}>{error}</div>}
          {errors.submit && <div className={styles.errorBox}>{errors.submit}</div>}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                disabled={loading}
              />
              {errors.email && <span className={styles.error}>{errors.email}</span>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                disabled={loading}
              />
              {errors.password && <span className={styles.error}>{errors.password}</span>}
            </div>

            <Link href="/forgot-password" className={styles.forgotLink}>
              Forgot password?
            </Link>

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className={styles.divider}>
            <span>Don't have an account?</span>
          </div>

          <Link href="/register" className={styles.registerLink}>
            Create an account
          </Link>

          <div className={styles.socialLogin}>
            <button className={styles.socialBtn} disabled={loading}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </button>
          </div>
        </div>

        <div className={styles.infoBox}>
          <h2>BestWholesale</h2>
          <p>Premium products at wholesale prices</p>
          <ul className={styles.benefits}>
            <li>✓ Free shipping on orders over $150</li>
            <li>✓ Secure checkout with SSL encryption</li>
            <li>✓ 30-day money-back guarantee</li>
            <li>✓ 24/7 customer support</li>
          </ul>
        </div>
      </div>
    </div>
    </Layout>
  );
}

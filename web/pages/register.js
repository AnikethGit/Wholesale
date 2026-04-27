import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import useAuthStore from '@/store/authStore';
import Layout from '@/components/Layout';
import styles from '@/styles/Auth.module.css';

export default function Register() {
  const router = useRouter();
  const { register, loading, error } = useAuthStore();
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    confirmPassword: ''
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
    if (!formData.first_name) newErrors.first_name = 'First name is required';
    if (!formData.last_name) newErrors.last_name = 'Last name is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await register(
        formData.email,
        formData.password,
        formData.first_name,
        formData.last_name
      );
      router.push('/account');
    } catch (error) {
      setErrors({ submit: error.response?.data?.message || 'Registration failed' });
    }
  };

  return (
    <Layout title="Create Account" description="Sign up for a BestWholesale account">
      <div className={styles.container}>
      <div className={styles.formWrapper}>
        <div className={styles.formBox}>
          <h1>Create Account</h1>
          <p className={styles.subtitle}>Join BestWholesale today</p>

          {error && <div className={styles.errorBox}>{error}</div>}
          {errors.submit && <div className={styles.errorBox}>{errors.submit}</div>}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="first_name">First Name</label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="John"
                  disabled={loading}
                />
                {errors.first_name && <span className={styles.error}>{errors.first_name}</span>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="last_name">Last Name</label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Doe"
                  disabled={loading}
                />
                {errors.last_name && <span className={styles.error}>{errors.last_name}</span>}
              </div>
            </div>

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
              <small className={styles.hint}>Minimum 6 characters</small>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                disabled={loading}
              />
              {errors.confirmPassword && <span className={styles.error}>{errors.confirmPassword}</span>}
            </div>

            <label className={styles.checkbox}>
              <input type="checkbox" required disabled={loading} />
              <span>I agree to the Terms of Service and Privacy Policy</span>
            </label>

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className={styles.divider}>
            <span>Already have an account?</span>
          </div>

          <Link href="/login" className={styles.registerLink}>
            Sign in here
          </Link>
        </div>

        <div className={styles.infoBox}>
          <h2>Join Our Community</h2>
          <p>Start shopping premium products at wholesale prices</p>
          <ul className={styles.benefits}>
            <li>✓ Exclusive member pricing</li>
            <li>✓ Fast & free shipping</li>
            <li>✓ Easy order tracking</li>
            <li>✓ Loyalty rewards program</li>
          </ul>
        </div>
      </div>
    </div>
    </Layout>
  );
}

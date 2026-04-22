import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import useAuthStore from '@/store/authStore';
import api from '@/lib/api';
import Layout from '@/components/Layout';
import styles from '@/styles/Account.module.css';

export default function AccountDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch user profile
        const profileRes = await api.get('/users/profile');
        setProfile(profileRes.data.user);

        // Fetch recent orders
        const ordersRes = await api.get('/orders?limit=5');
        setOrders(ordersRes.data.data || []);
      } catch (error) {
        console.error('Failed to fetch account data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (loading) {
    return <div className={styles.loading}>Loading your account...</div>;
  }

  return (
    <Layout title="My Account" description="View your account dashboard">
      <div className={styles.container}>
      <div className={styles.header}>
        <h1>My Account</h1>
        <p>Welcome, {profile?.first_name}!</p>
      </div>

      <div className={styles.content}>
        {/* Sidebar Navigation */}
        <aside className={styles.sidebar}>
          <nav className={styles.nav}>
            <Link href="/account" className={`${styles.navItem} ${styles.active}`}>
              <span>📊</span> Dashboard
            </Link>
            <Link href="/account/orders" className={styles.navItem}>
              <span>📦</span> Orders
            </Link>
            <Link href="/account/addresses" className={styles.navItem}>
              <span>📍</span> Addresses
            </Link>
            <Link href="/account/settings" className={styles.navItem}>
              <span>⚙️</span> Settings
            </Link>
          </nav>

          <button className={styles.logoutBtn} onClick={handleLogout}>
            Sign Out
          </button>
        </aside>

        {/* Main Content */}
        <main className={styles.main}>
          {/* Profile Card */}
          <section className={styles.card}>
            <h2>Profile Information</h2>
            <div className={styles.profileInfo}>
              <div className={styles.infoRow}>
                <span className={styles.label}>Name</span>
                <span className={styles.value}>
                  {profile?.first_name} {profile?.last_name}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Email</span>
                <span className={styles.value}>{profile?.email}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Member Since</span>
                <span className={styles.value}>
                  {new Date(profile?.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
            <Link href="/account/settings" className={styles.editBtn}>
              Edit Profile
            </Link>
          </section>

          {/* Quick Stats */}
          <section className={styles.statsGrid}>
            <div className={styles.stat}>
              <div className={styles.statIcon}>📦</div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{orders.length}</div>
                <div className={styles.statLabel}>Total Orders</div>
              </div>
            </div>

            <div className={styles.stat}>
              <div className={styles.statIcon}>💰</div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>
                  ${orders.reduce((sum, o) => sum + (o.total_amount || 0), 0).toFixed(2)}
                </div>
                <div className={styles.statLabel}>Total Spent</div>
              </div>
            </div>

            <div className={styles.stat}>
              <div className={styles.statIcon}>📍</div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>+</div>
                <div className={styles.statLabel}>Saved Addresses</div>
              </div>
            </div>
          </section>

          {/* Recent Orders */}
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>Recent Orders</h2>
              <Link href="/account/orders" className={styles.viewAll}>
                View All →
              </Link>
            </div>

            {orders.length === 0 ? (
              <div className={styles.empty}>
                <p>You haven't placed any orders yet.</p>
                <Link href="/catalog" className={styles.browseBtn}>
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className={styles.ordersList}>
                {orders.map((order) => (
                  <div key={order.id} className={styles.orderItem}>
                    <div className={styles.orderInfo}>
                      <div className={styles.orderNumber}>
                        Order #{order.order_number}
                      </div>
                      <div className={styles.orderDate}>
                        {new Date(order.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    <div className={styles.orderStatus}>
                      <span className={`${styles.status} ${styles[order.status]}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>

                    <div className={styles.orderPrice}>
                      ${order.total_amount.toFixed(2)}
                    </div>

                    <Link href={`/orders/${order.id}`} className={styles.viewBtn}>
                      View
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Quick Actions */}
          <section className={styles.actionsGrid}>
            <Link href="/account/addresses" className={styles.actionCard}>
              <div className={styles.actionIcon}>📍</div>
              <h3>Manage Addresses</h3>
              <p>Add or edit shipping addresses</p>
              <span className={styles.arrow}>→</span>
            </Link>

            <Link href="/catalog" className={styles.actionCard}>
              <div className={styles.actionIcon}>🛍️</div>
              <h3>Continue Shopping</h3>
              <p>Browse our catalog</p>
              <span className={styles.arrow}>→</span>
            </Link>

            <Link href="/account/settings" className={styles.actionCard}>
              <div className={styles.actionIcon}>⚙️</div>
              <h3>Account Settings</h3>
              <p>Update your preferences</p>
              <span className={styles.arrow}>→</span>
            </Link>

            <a href="mailto:support@techwholesale.com" className={styles.actionCard}>
              <div className={styles.actionIcon}>💬</div>
              <h3>Contact Support</h3>
              <p>Get help with your account</p>
              <span className={styles.arrow}>→</span>
            </a>
          </section>
        </main>
      </div>
    </div>
    </Layout>
  );
}

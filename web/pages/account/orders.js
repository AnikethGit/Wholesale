import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import useAuthStore from '@/store/authStore';
import api from '@/lib/api';
import styles from '@/styles/AccountOrders.module.css';

const STATUS_COLORS = {
  pending: 'orange', processing: 'blue', shipped: 'teal',
  delivered: 'green', cancelled: 'red', refunded: 'purple'
};

export default function AccountOrders() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    fetchOrders();
  }, [isAuthenticated, filter, page]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      if (filter !== 'all') params.append('status', filter);
      const res = await api.get(`/orders?${params}`);
      if (res.data) {
        setOrders(res.data.data || []);
        setTotal(res.data.pagination?.total || 0);
      }
    } catch { setOrders([]); }
    finally { setLoading(false); }
  };

  const handleCancel = async (orderId) => {
    if (!confirm('Cancel this order?')) return;
    try {
      await api.post(`/orders/${orderId}/cancel`);
      fetchOrders();
    } catch { alert('Could not cancel order.'); }
  };

  const tabs = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  return (
    <Layout title="My Orders" description="View your TechWholesale order history">
      <div className={styles.hero}>
        <h1>My Orders</h1>
        <p>Track and manage all your purchases</p>
      </div>

      <div className={styles.container}>
        {/* Account sidebar */}
        <aside className={styles.sidebar}>
          <nav className={styles.nav}>
            <Link href="/account" className={styles.navItem}><i className="fas fa-tachometer-alt" /> Dashboard</Link>
            <Link href="/account/orders" className={`${styles.navItem} ${styles.active}`}><i className="fas fa-box" /> Orders</Link>
            <Link href="/account/addresses" className={styles.navItem}><i className="fas fa-map-marker-alt" /> Addresses</Link>
            <Link href="/account/settings" className={styles.navItem}><i className="fas fa-cog" /> Settings</Link>
          </nav>
        </aside>

        <main className={styles.main}>
          {/* Filter tabs */}
          <div className={styles.tabs}>
            {tabs.map((t) => (
              <button
                key={t}
                className={`${styles.tab} ${filter === t ? styles.activeTab : ''}`}
                onClick={() => { setFilter(t); setPage(1); }}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {loading ? (
            <div className={styles.loading}><i className="fas fa-spinner fa-spin" /> Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>📦</div>
              <h3>No orders yet</h3>
              <p>{filter !== 'all' ? `No ${filter} orders found.` : "You haven't placed any orders yet."}</p>
              <Link href="/catalog" className={styles.shopBtn}>Start Shopping</Link>
            </div>
          ) : (
            <>
              <div className={styles.ordersList}>
                {orders.map((order) => (
                  <div key={order.id} className={styles.orderCard}>
                    <div className={styles.orderTop}>
                      <div className={styles.orderMeta}>
                        <h3>Order #{order.order_number}</h3>
                        <span className={styles.orderDate}>
                          {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                      </div>
                      <div className={styles.orderRight}>
                        <span className={`${styles.status} ${styles[STATUS_COLORS[order.status]]}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                        <span className={styles.total}>${parseFloat(order.total_amount).toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Items preview */}
                    {order.items?.length > 0 && (
                      <div className={styles.itemsPreview}>
                        {order.items.slice(0, 3).map((item) => (
                          <div key={item.id} className={styles.previewItem}>
                            <span className={styles.previewIcon}>📦</span>
                            <span className={styles.previewName}>{item.product_name}</span>
                            <span className={styles.previewQty}>× {item.quantity}</span>
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <span className={styles.moreItems}>+{order.items.length - 3} more items</span>
                        )}
                      </div>
                    )}

                    <div className={styles.orderActions}>
                      <Link href={`/track?order=${order.order_number}`} className={styles.trackBtn}>
                        <i className="fas fa-map-marker-alt" /> Track
                      </Link>
                      <Link href={`/orders/${order.id}`} className={styles.viewBtn}>
                        View Details
                      </Link>
                      {['pending', 'processing'].includes(order.status) && (
                        <button className={styles.cancelBtn} onClick={() => handleCancel(order.id)}>
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {Math.ceil(total / 10) > 1 && (
                <div className={styles.pagination}>
                  <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className={styles.pageBtn}>← Prev</button>
                  <span className={styles.pageInfo}>Page {page} of {Math.ceil(total / 10)}</span>
                  <button disabled={page >= Math.ceil(total / 10)} onClick={() => setPage(p => p + 1)} className={styles.pageBtn}>Next →</button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </Layout>
  );
}

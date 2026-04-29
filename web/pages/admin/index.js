import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/AdminLayout';
import api from '@/lib/api';
import styles from '@/styles/AdminDashboard.module.css';

export default function AdminDashboard() {
  const [stats, setStats]   = useState(null);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    api.get('/admin/analytics').then((res) => {
      if (res.data) {
        setStats(res.data.summary);
        setRecent(res.data.recentOrders?.slice(0, 5) || []);
      }
    }).catch(() => {});
  }, []);

  const STATUS_COLOR = {
    pending:'orange', processing:'blue', shipped:'teal',
    delivered:'green', cancelled:'red', refunded:'purple'
  };

  return (
    <AdminLayout title="Dashboard">
      {/* Stats cards */}
      <div className={styles.statsGrid}>
        {[
          { label: 'Total Revenue',  value: stats ? `$${Number(stats.revenue).toLocaleString('en-US',{minimumFractionDigits:2})}` : '—', icon: 'fas fa-dollar-sign', color: 'green' },
          { label: 'Total Orders',   value: stats?.orders  ?? '—', icon: 'fas fa-box',        color: 'blue'   },
          { label: 'Products',       value: stats?.products ?? '—', icon: 'fas fa-tags',       color: 'purple' },
          { label: 'Customers',      value: stats?.users    ?? '—', icon: 'fas fa-users',      color: 'orange' },
        ].map((s) => (
          <div key={s.label} className={`${styles.statCard} ${styles[s.color]}`}>
            <div className={styles.statIcon}><i className={s.icon} /></div>
            <div>
              <div className={styles.statValue}>{s.value}</div>
              <div className={styles.statLabel}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className={styles.quickActions}>
        <Link href="/admin/orders/create" className={styles.actionBtn}>
          <i className="fas fa-plus" /> Create Manual Order
        </Link>
        <Link href="/admin/orders" className={styles.actionBtnOutline}>
          <i className="fas fa-list" /> View All Orders
        </Link>
      </div>

      {/* Recent orders */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2>Recent Orders</h2>
          <Link href="/admin/orders" className={styles.viewAll}>View all →</Link>
        </div>
        {recent.length === 0 ? (
          <p className={styles.empty}>No orders yet.</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Order #</th><th>Date</th><th>Status</th>
                <th>Payment</th><th>Total</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((o) => (
                <tr key={o.id}>
                  <td><span className={styles.mono}>{o.order_number}</span></td>
                  <td>{new Date(o.created_at).toLocaleDateString()}</td>
                  <td><span className={`${styles.badge} ${styles[STATUS_COLOR[o.status]]}`}>{o.status}</span></td>
                  <td><span className={`${styles.badge} ${o.payment_status==='paid' ? styles.green : styles.orange}`}>{o.payment_status}</span></td>
                  <td className={styles.bold}>${Number(o.total_amount).toFixed(2)}</td>
                  <td className={styles.actionCell}>
                    <Link href={`/admin/orders?id=${o.id}`} className={styles.linkBtn}>View</Link>
                    <a href={`/invoice/${o.id}`} target="_blank" rel="noreferrer" className={styles.invoiceBtn}>
                      <i className="fas fa-file-invoice" /> Invoice
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
}

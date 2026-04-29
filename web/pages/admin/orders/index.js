import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/AdminLayout';
import api from '@/lib/api';
import styles from '@/styles/AdminOrders.module.css';

const STATUS_COLORS = {
  pending:'orange', processing:'blue', shipped:'teal',
  delivered:'green', cancelled:'red', refunded:'purple'
};

export default function AdminOrders() {
  const router = useRouter();
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('all');
  const [page, setPage]         = useState(1);
  const [total, setTotal]       = useState(0);
  const [search, setSearch]     = useState('');
  const [selected, setSelected] = useState(null); // order detail panel

  useEffect(() => { fetchOrders(); }, [filter, page]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (filter !== 'all') params.append('status', filter);
      const res = await api.get(`/admin/orders?${params}`);
      if (res.data) {
        setOrders(res.data.data || []);
        setTotal(res.data.pagination?.total || 0);
      }
    } catch {} finally { setLoading(false); }
  };

  const handleStatusChange = async (orderId, status) => {
    await api.patch(`/admin/orders/${orderId}`, { status });
    fetchOrders();
    if (selected?.id === orderId) setSelected({ ...selected, status });
  };

  const filtered = search
    ? orders.filter(o =>
        o.order_number?.toLowerCase().includes(search.toLowerCase()) ||
        o.guest_email?.toLowerCase().includes(search.toLowerCase())
      )
    : orders;

  const TABS = ['all','pending','processing','shipped','delivered','cancelled'];

  return (
    <AdminLayout title="Orders">
      <div className={styles.toolbar}>
        <div className={styles.tabs}>
          {TABS.map(t => (
            <button
              key={t}
              className={`${styles.tab} ${filter===t ? styles.activeTab : ''}`}
              onClick={() => { setFilter(t); setPage(1); }}
            >
              {t.charAt(0).toUpperCase()+t.slice(1)}
            </button>
          ))}
        </div>
        <div className={styles.toolbarRight}>
          <input
            className={styles.searchBox}
            placeholder="Search order # or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <Link href="/admin/orders/create" className={styles.createBtn}>
            <i className="fas fa-plus" /> New Order
          </Link>
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}><i className="fas fa-spinner fa-spin" /> Loading…</div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>No orders found.</div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Order #</th><th>Date</th><th>Customer</th>
                <th>Status</th><th>Payment</th><th>Total</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => (
                <tr key={o.id} className={selected?.id===o.id ? styles.selectedRow : ''}>
                  <td><span className={styles.mono}>{o.order_number}</span></td>
                  <td>{new Date(o.created_at).toLocaleDateString()}</td>
                  <td className={styles.email}>{o.guest_email || '—'}</td>
                  <td>
                    <select
                      className={`${styles.statusSelect} ${styles[STATUS_COLORS[o.status]]}`}
                      value={o.status}
                      onChange={e => handleStatusChange(o.id, e.target.value)}
                    >
                      {['pending','processing','shipped','delivered','cancelled','refunded'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <span className={`${styles.badge} ${o.payment_status==='paid' ? styles.green : styles.orange}`}>
                      {o.payment_status}
                    </span>
                  </td>
                  <td className={styles.total}>${Number(o.total_amount).toFixed(2)}</td>
                  <td>
                    <div className={styles.actions}>
                      <a
                        href={`/invoice/${o.id}`}
                        target="_blank" rel="noreferrer"
                        className={styles.invoiceBtn}
                        title="View / Download Invoice"
                      >
                        <i className="fas fa-file-invoice-dollar" /> Invoice
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {Math.ceil(total/20) > 1 && (
        <div className={styles.pagination}>
          <button disabled={page===1} onClick={()=>setPage(p=>p-1)} className={styles.pageBtn}>← Prev</button>
          <span className={styles.pageInfo}>Page {page} of {Math.ceil(total/20)}</span>
          <button disabled={page>=Math.ceil(total/20)} onClick={()=>setPage(p=>p+1)} className={styles.pageBtn}>Next →</button>
        </div>
      )}
    </AdminLayout>
  );
}

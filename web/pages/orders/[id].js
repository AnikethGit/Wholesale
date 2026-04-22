import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '@/components/Layout';
import useAuthStore from '@/store/authStore';
import api from '@/lib/api';
import styles from '@/styles/OrderDetail.module.css';

export default function OrderDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { isAuthenticated } = useAuthStore();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    if (!id) return;
    api.get(`/orders/${id}`)
      .then((res) => { if (res.data?.order) setOrder(res.data.order); else setError('Order not found.'); })
      .catch(() => setError('Order not found.'))
      .finally(() => setLoading(false));
  }, [id, isAuthenticated]);

  const handleCancel = async () => {
    if (!confirm('Cancel this order?')) return;
    try {
      await api.post(`/orders/${id}/cancel`);
      const res = await api.get(`/orders/${id}`);
      if (res.data?.order) setOrder(res.data.order);
    } catch { alert('Could not cancel this order.'); }
  };

  const statusStep = { pending: 0, processing: 1, shipped: 2, delivered: 3 };
  const steps = ['Order Placed', 'Processing', 'Shipped', 'Delivered'];

  if (loading) return <Layout title="Order Details"><div className={styles.loading}><i className="fas fa-spinner fa-spin" /></div></Layout>;
  if (error)   return <Layout title="Order Details"><div className={styles.errorPage}><h2>{error}</h2><Link href="/account/orders">Back to Orders</Link></div></Layout>;
  if (!order)  return null;

  const current = statusStep[order.status] ?? 0;

  return (
    <Layout title={`Order #${order.order_number}`} description="Order details and tracking">
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <Link href="/account/orders" className={styles.back}><i className="fas fa-arrow-left" /> My Orders</Link>
          <h1>Order #{order.order_number}</h1>
          <p>Placed on {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      <div className={styles.container}>
        {/* Left column */}
        <div className={styles.left}>
          {/* Status tracker */}
          {!['cancelled','refunded'].includes(order.status) && (
            <div className={styles.card}>
              <h3>Order Status</h3>
              <div className={styles.tracker}>
                {steps.map((step, i) => (
                  <div key={step} className={`${styles.step} ${i <= current ? styles.done : ''} ${i === current ? styles.active : ''}`}>
                    <div className={styles.stepCircle}>{i < current ? <i className="fas fa-check" /> : i + 1}</div>
                    <span>{step}</span>
                    {i < steps.length - 1 && <div className={`${styles.line} ${i < current ? styles.lineDone : ''}`} />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {['cancelled','refunded'].includes(order.status) && (
            <div className={styles.cancelledBox}>
              <i className="fas fa-times-circle" />
              <div>
                <h4>Order {order.status.charAt(0).toUpperCase() + order.status.slice(1)}</h4>
                <p>This order has been {order.status}.</p>
              </div>
            </div>
          )}

          {/* Shipment */}
          {order.shipment && (
            <div className={styles.card}>
              <h3><i className="fas fa-truck" /> Shipment</h3>
              <div className={styles.shipGrid}>
                <div><span>Carrier</span><strong>{order.shipment.carrier}</strong></div>
                <div><span>Tracking</span><strong className={styles.trackNum}>{order.shipment.tracking_number}</strong></div>
                <div><span>Status</span><strong>{order.shipment.status?.replace(/_/g,' ')}</strong></div>
                {order.shipment.estimated_delivery && (
                  <div><span>Est. Delivery</span><strong>{new Date(order.shipment.estimated_delivery).toLocaleDateString()}</strong></div>
                )}
              </div>
              <Link href={`/track?order=${order.order_number}`} className={styles.trackLink}>
                <i className="fas fa-map-marker-alt" /> Live Tracking
              </Link>
            </div>
          )}

          {/* Items */}
          <div className={styles.card}>
            <h3>Items Ordered</h3>
            <div className={styles.items}>
              {order.items?.map((item) => (
                <div key={item.id} className={styles.item}>
                  <div className={styles.itemImg}>📦</div>
                  <div className={styles.itemInfo}>
                    <strong>{item.product_name}</strong>
                    <span>SKU: {item.product_sku}</span>
                    <span>Qty: {item.quantity} × ${parseFloat(item.unit_price).toFixed(2)}</span>
                  </div>
                  <div className={styles.itemTotal}>${(item.quantity * item.unit_price).toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className={styles.right}>
          {/* Summary */}
          <div className={styles.card}>
            <h3>Order Summary</h3>
            <div className={styles.summaryRows}>
              <div className={styles.summaryRow}><span>Subtotal</span><span>${parseFloat(order.subtotal).toFixed(2)}</span></div>
              <div className={styles.summaryRow}><span>Tax</span><span>${parseFloat(order.tax_amount || 0).toFixed(2)}</span></div>
              <div className={styles.summaryRow}><span>Shipping</span><span>{parseFloat(order.shipping_cost || 0) === 0 ? 'FREE' : `$${parseFloat(order.shipping_cost).toFixed(2)}`}</span></div>
              {parseFloat(order.discount_amount || 0) > 0 && (
                <div className={`${styles.summaryRow} ${styles.discount}`}><span>Discount</span><span>-${parseFloat(order.discount_amount).toFixed(2)}</span></div>
              )}
            </div>
            <div className={styles.summaryTotal}><span>Total</span><strong>${parseFloat(order.total_amount).toFixed(2)}</strong></div>
          </div>

          {/* Payment */}
          {order.payment && (
            <div className={styles.card}>
              <h3><i className="fas fa-credit-card" /> Payment</h3>
              <div className={styles.paymentInfo}>
                <div><span>Method</span><strong>{order.payment_method?.replace(/_/g,' ')}</strong></div>
                <div><span>Status</span><strong className={order.payment_status === 'paid' ? styles.paid : ''}>{order.payment_status}</strong></div>
                {order.payment?.transaction_id && <div><span>Transaction</span><strong className={styles.trackNum}>{order.payment.transaction_id}</strong></div>}
              </div>
            </div>
          )}

          {/* Addresses */}
          {order.addresses?.shipping && (
            <div className={styles.card}>
              <h3><i className="fas fa-map-marker-alt" /> Shipping To</h3>
              <address className={styles.address}>
                <strong>{order.addresses.shipping.first_name} {order.addresses.shipping.last_name}</strong>
                <p>{order.addresses.shipping.street_address}</p>
                <p>{order.addresses.shipping.city}, {order.addresses.shipping.state_province} {order.addresses.shipping.postal_code}</p>
                <p>{order.addresses.shipping.country}</p>
              </address>
            </div>
          )}

          {/* Actions */}
          <div className={styles.actions}>
            <Link href={`/track?order=${order.order_number}`} className={styles.primaryBtn}>
              <i className="fas fa-shipping-fast" /> Track Order
            </Link>
            {['pending','processing'].includes(order.status) && (
              <button className={styles.cancelBtn} onClick={handleCancel}>Cancel Order</button>
            )}
            <Link href="/account/orders" className={styles.secondaryBtn}>All Orders</Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}

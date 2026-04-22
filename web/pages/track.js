import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '@/components/Layout';
import api from '@/lib/api';
import styles from '@/styles/Track.module.css';

export default function TrackOrder() {
  const router = useRouter();
  const { order: queryOrder } = router.query;

  const [orderInput, setOrderInput] = useState(queryOrder || '');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (queryOrder) {
      setOrderInput(queryOrder);
      fetchOrder(queryOrder);
    }
  }, [queryOrder]);

  const fetchOrder = async (id) => {
    if (!id?.trim()) return;
    setLoading(true);
    setError('');
    setOrder(null);
    try {
      const res = await api.get(`/checkout/order/${id.trim()}`);
      if (res.data?.order) {
        setOrder(res.data);
      } else {
        setError('Order not found. Please check your order number.');
      }
    } catch {
      setError('Order not found. Please check your order number.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    router.push(`/track?order=${orderInput.trim()}`, undefined, { shallow: true });
    fetchOrder(orderInput);
  };

  const steps = [
    { key: 'pending',    label: 'Order Placed',    icon: 'fas fa-check-circle' },
    { key: 'processing', label: 'Processing',       icon: 'fas fa-cog' },
    { key: 'shipped',    label: 'Shipped',          icon: 'fas fa-shipping-fast' },
    { key: 'delivered',  label: 'Delivered',        icon: 'fas fa-box-open' },
  ];

  const stepIndex = (status) => {
    const map = { pending: 0, processing: 1, shipped: 2, delivered: 3, cancelled: -1, refunded: -1 };
    return map[status] ?? 0;
  };

  const current = order ? stepIndex(order.order.status) : -1;

  return (
    <Layout title="Track Order" description="Track your TechWholesale order status">
      <div className={styles.hero}>
        <h1>Track Your Order</h1>
        <p>Enter your order number to see the latest status</p>
      </div>

      <div className={styles.container}>
        {/* Search box */}
        <form className={styles.searchBox} onSubmit={handleSubmit}>
          <div className={styles.inputWrap}>
            <i className="fas fa-search" />
            <input
              type="text"
              placeholder="Enter order number  e.g. ORD-1745123456789"
              value={orderInput}
              onChange={(e) => setOrderInput(e.target.value)}
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Searching...' : 'Track Order'}
          </button>
        </form>

        {error && (
          <div className={styles.errorBox}>
            <i className="fas fa-exclamation-circle" /> {error}
          </div>
        )}

        {order && (
          <div className={styles.result}>
            {/* Order header */}
            <div className={styles.orderHeader}>
              <div>
                <h2>Order #{order.order.order_number}</h2>
                <p className={styles.orderDate}>
                  Placed on {new Date(order.order.created_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <span className={`${styles.statusBadge} ${styles[order.order.status]}`}>
                {order.order.status.charAt(0).toUpperCase() + order.order.status.slice(1)}
              </span>
            </div>

            {/* Progress tracker */}
            {!['cancelled', 'refunded'].includes(order.order.status) && (
              <div className={styles.tracker}>
                {steps.map((step, idx) => (
                  <div
                    key={step.key}
                    className={`${styles.step} ${idx <= current ? styles.done : ''} ${idx === current ? styles.active : ''}`}
                  >
                    <div className={styles.stepIcon}>
                      <i className={step.icon} />
                    </div>
                    <div className={styles.stepLabel}>{step.label}</div>
                    {idx < steps.length - 1 && (
                      <div className={`${styles.connector} ${idx < current ? styles.connectorDone : ''}`} />
                    )}
                  </div>
                ))}
              </div>
            )}

            {order.order.status === 'cancelled' && (
              <div className={styles.cancelledBanner}>
                <i className="fas fa-times-circle" /> This order has been cancelled.
              </div>
            )}

            {/* Shipment info */}
            {order.shipment && (
              <div className={styles.shipmentCard}>
                <h3><i className="fas fa-truck" /> Shipment Details</h3>
                <div className={styles.shipmentGrid}>
                  <div>
                    <span className={styles.label}>Carrier</span>
                    <strong>{order.shipment.carrier}</strong>
                  </div>
                  <div>
                    <span className={styles.label}>Tracking Number</span>
                    <strong className={styles.tracking}>{order.shipment.tracking_number}</strong>
                  </div>
                  {order.shipment.estimated_delivery && (
                    <div>
                      <span className={styles.label}>Estimated Delivery</span>
                      <strong>{new Date(order.shipment.estimated_delivery).toLocaleDateString()}</strong>
                    </div>
                  )}
                  <div>
                    <span className={styles.label}>Status</span>
                    <strong>{order.shipment.status?.replace('_', ' ')}</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Items */}
            <div className={styles.itemsCard}>
              <h3>Items in This Order</h3>
              <div className={styles.items}>
                {order.items?.map((item) => (
                  <div key={item.id} className={styles.item}>
                    <div className={styles.itemIcon}>📦</div>
                    <div className={styles.itemInfo}>
                      <strong>{item.product_name}</strong>
                      <span>SKU: {item.product_sku} &nbsp;·&nbsp; Qty: {item.quantity}</span>
                    </div>
                    <div className={styles.itemPrice}>${(item.unit_price * item.quantity).toFixed(2)}</div>
                  </div>
                ))}
              </div>
              <div className={styles.orderTotal}>
                <span>Order Total</span>
                <strong>${parseFloat(order.order.total_amount).toFixed(2)}</strong>
              </div>
            </div>

            <div className={styles.actions}>
              <Link href="/catalog" className={styles.shopBtn}>Continue Shopping</Link>
              <Link href="/account/orders" className={styles.ordersBtn}>View All Orders</Link>
            </div>
          </div>
        )}

        {/* Help section */}
        {!order && !loading && !error && (
          <div className={styles.help}>
            <h3>Need Help?</h3>
            <div className={styles.helpGrid}>
              <div className={styles.helpCard}>
                <i className="fas fa-envelope" />
                <h4>Email Support</h4>
                <p>hello@techwholesale.com</p>
              </div>
              <div className={styles.helpCard}>
                <i className="fas fa-phone" />
                <h4>Phone Support</h4>
                <p>+1 (800) 555-TECH</p>
              </div>
              <div className={styles.helpCard}>
                <i className="fas fa-comments" />
                <h4>Live Chat</h4>
                <p>Mon–Fri, 9am–6pm PST</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

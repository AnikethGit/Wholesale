import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import useCartStore from '@/store/cartStore';
import useAuthStore from '@/store/authStore';
import Layout from '@/components/Layout';
import styles from '@/styles/Cart.module.css';

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateItemQuantity, getTotal } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className={styles.loading}>Loading cart...</div>;
  }

  const subtotal = getTotal();
  const tax = subtotal * 0.08;
  const shipping = subtotal > 150 ? 0 : 9.99;
  const total = subtotal + tax + shipping;

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      await removeItem(itemId);
    } else {
      await updateItemQuantity(itemId, newQuantity);
    }
  };

  if (items.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Shopping Cart</h1>
        </div>

        <div className={styles.emptyCart}>
          <div className={styles.emptyIcon}>🛒</div>
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added anything to your cart yet.</p>
          <Link href="/catalog" className={styles.continueBtn}>
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <Layout title="Shopping Cart" description="View and manage your shopping cart">
      <div className={styles.container}>
      <div className={styles.header}>
        <h1>Shopping Cart</h1>
        <p>{items.length} item{items.length !== 1 ? 's' : ''} in your cart</p>
      </div>

      <div className={styles.content}>
        {/* Cart Items */}
        <div className={styles.cartItems}>
          <div className={styles.itemsHeader}>
            <span>Product</span>
            <span>Price</span>
            <span>Quantity</span>
            <span>Total</span>
            <span></span>
          </div>

          <div className={styles.items}>
            {items.map((item) => (
              <div key={item.id} className={styles.item}>
                <div className={styles.itemImage}>
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #1a2340 0%, #2a3560 100%)',
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '32px'
                    }}
                  >
                    📦
                  </div>
                </div>

                <div className={styles.itemDetails}>
                  <h3>{item.product_name}</h3>
                  <p className={styles.sku}>SKU: {item.product_sku}</p>
                </div>

                <div className={styles.itemPrice}>
                  ${item.unit_price.toFixed(2)}
                </div>

                <div className={styles.itemQuantity}>
                  <button
                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                    className={styles.quantityBtn}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      handleQuantityChange(item.id, parseInt(e.target.value) || 1)
                    }
                    className={styles.quantityInput}
                  />
                  <button
                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                    className={styles.quantityBtn}
                  >
                    +
                  </button>
                </div>

                <div className={styles.itemTotal}>
                  ${(item.unit_price * item.quantity).toFixed(2)}
                </div>

                <button
                  onClick={() => removeItem(item.id)}
                  className={styles.removeBtn}
                  title="Remove item"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <aside className={styles.summary}>
          <h2>Order Summary</h2>

          <div className={styles.summaryRows}>
            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>

            <div className={styles.summaryRow}>
              <span>Tax (8%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>

            <div className={styles.summaryRow}>
              <span>Shipping</span>
              <span>
                {shipping === 0 ? (
                  <span className={styles.free}>FREE</span>
                ) : (
                  `$${shipping.toFixed(2)}`
                )}
              </span>
            </div>

            {subtotal < 150 && (
              <div className={styles.freeShippingNote}>
                Free shipping on orders over $150
              </div>
            )}
          </div>

          <div className={styles.total}>
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>

          <Link href="/checkout" className={styles.checkoutBtn}>
            Proceed to Checkout
          </Link>

          <Link href="/catalog" className={styles.continueBtn}>
            Continue Shopping
          </Link>

          <div className={styles.security}>
            <p>🔒 Secure checkout with SSL encryption</p>
          </div>
        </aside>
      </div>

      {/* Features */}
      <section className={styles.features}>
        <div className={styles.feature}>
          <div className={styles.featureIcon}>✓</div>
          <h3>Free Returns</h3>
          <p>30-day returns on all items</p>
        </div>

        <div className={styles.feature}>
          <div className={styles.featureIcon}>⚡</div>
          <h3>Fast Shipping</h3>
          <p>2-5 business days delivery</p>
        </div>

        <div className={styles.feature}>
          <div className={styles.featureIcon}>💬</div>
          <h3>24/7 Support</h3>
          <p>Expert help whenever you need it</p>
        </div>

        <div className={styles.feature}>
          <div className={styles.featureIcon}>🏆</div>
          <h3>Quality Guaranteed</h3>
          <p>Premium products from trusted brands</p>
        </div>
      </section>
    </div>
    </Layout>
  );
}

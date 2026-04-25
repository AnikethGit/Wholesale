import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '@/components/Layout';
import api from '@/lib/api';
import useCartStore from '@/store/cartStore';
import useAuthStore from '@/store/authStore';
import styles from '@/styles/Checkout.module.css';

export default function Checkout() {
  const router = useRouter();
  const { items } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const [step, setStep] = useState('shipping'); // shipping -> billing -> payment -> confirmation
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const [formData, setFormData] = useState({
    email: user?.email || '',
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: '',
    shipping_address: {
      street_address: '',
      apt_suite: '',
      city: '',
      state_province: '',
      postal_code: '',
      country: 'United States'
    },
    billing_address: {
      street_address: '',
      apt_suite: '',
      city: '',
      state_province: '',
      postal_code: '',
      country: 'United States'
    },
    same_as_shipping: true,
    payment_method: 'credit_card',
    card_number: '',
    cvv: '',
    expiry: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart');
    }
  }, [items, router]);

  const handleInputChange = (e, section = null) => {
    const { name, value } = e.target;

    if (section) {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [name]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateStep = (currentStep) => {
    const newErrors = {};

    if (currentStep === 'shipping') {
      if (!formData.first_name) newErrors.first_name = 'First name required';
      if (!formData.last_name) newErrors.last_name = 'Last name required';
      if (!formData.phone) newErrors.phone = 'Phone required';
      if (!formData.shipping_address.street_address) newErrors.street_address = 'Street address required';
      if (!formData.shipping_address.city) newErrors.city = 'City required';
      if (!formData.shipping_address.postal_code) newErrors.postal_code = 'Postal code required';
    } else if (currentStep === 'payment') {
      if (formData.payment_method === 'credit_card') {
        if (!formData.card_number || formData.card_number.length !== 16) {
          newErrors.card_number = 'Valid card number required';
        }
        if (!formData.cvv || formData.cvv.length < 3) {
          newErrors.cvv = 'Valid CVV required';
        }
        if (!formData.expiry) newErrors.expiry = 'Expiry date required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (!validateStep(step)) return;

    if (step === 'shipping') {
      setStep('billing');
    } else if (step === 'billing') {
      setStep('payment');
    }
  };

  const handleSubmitOrder = async () => {
    if (!validateStep('payment')) return;

    setLoading(true);
    try {
      // Create checkout session
      const sessionResponse = await api.post('/checkout/session', {
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        shipping_address: formData.shipping_address,
        billing_address: formData.same_as_shipping ? formData.shipping_address : formData.billing_address
      });

      if (!sessionResponse.data?.sessionToken) {
        throw new Error(sessionResponse.data?.message || 'Failed to create checkout session');
      }

      // Process payment
      const paymentResponse = await api.post('/checkout/payment', {
        sessionToken: sessionResponse.data.sessionToken,
        payment_method: formData.payment_method,
        card_number: formData.card_number,
        cvv: formData.cvv
      });

      if (!paymentResponse.data?.success) {
        throw new Error(paymentResponse.data?.message || 'Payment failed');
      }

      setOrderId(paymentResponse.data.order.id);
      setStep('confirmation');
    } catch (error) {
      setErrors({
        submit: error.response?.data?.message || 'Payment failed. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
  const tax = subtotal * 0.08;
  const shipping = subtotal > 150 ? 0 : 9.99;
  const total = subtotal + tax + shipping;

  return (
    <Layout title="Checkout" description="Complete your purchase securely">
      <div className={styles.container}>
      <div className={styles.checkoutMain}>
        {/* Steps Progress */}
        <div className={styles.progress}>
          <div className={`${styles.step} ${step === 'shipping' ? styles.active : ''}`}>
            <span>1. Shipping</span>
          </div>
          <div className={`${styles.step} ${step === 'billing' ? styles.active : ''}`}>
            <span>2. Billing</span>
          </div>
          <div className={`${styles.step} ${step === 'payment' ? styles.active : ''}`}>
            <span>3. Payment</span>
          </div>
        </div>

        {step !== 'confirmation' && (
          <form className={styles.form}>
            {/* Shipping Step */}
            {step === 'shipping' && (
              <div className={styles.stepContent}>
                <h2>Shipping Information</h2>

                <div className={styles.formGroup}>
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={isAuthenticated}
                  />
                  {errors.email && <span className={styles.error}>{errors.email}</span>}
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>First Name *</label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                    />
                    {errors.first_name && <span className={styles.error}>{errors.first_name}</span>}
                  </div>
                  <div className={styles.formGroup}>
                    <label>Last Name *</label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                    />
                    {errors.last_name && <span className={styles.error}>{errors.last_name}</span>}
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                  {errors.phone && <span className={styles.error}>{errors.phone}</span>}
                </div>

                <h3>Shipping Address</h3>

                <div className={styles.formGroup}>
                  <label>Street Address *</label>
                  <input
                    type="text"
                    name="street_address"
                    value={formData.shipping_address.street_address}
                    onChange={(e) => handleInputChange(e, 'shipping_address')}
                  />
                  {errors.street_address && <span className={styles.error}>{errors.street_address}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label>Apt, suite, etc. (optional)</label>
                  <input
                    type="text"
                    name="apt_suite"
                    value={formData.shipping_address.apt_suite}
                    onChange={(e) => handleInputChange(e, 'shipping_address')}
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>City *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.shipping_address.city}
                      onChange={(e) => handleInputChange(e, 'shipping_address')}
                    />
                    {errors.city && <span className={styles.error}>{errors.city}</span>}
                  </div>
                  <div className={styles.formGroup}>
                    <label>State / Province</label>
                    <input
                      type="text"
                      name="state_province"
                      value={formData.shipping_address.state_province}
                      onChange={(e) => handleInputChange(e, 'shipping_address')}
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Postal Code *</label>
                    <input
                      type="text"
                      name="postal_code"
                      value={formData.shipping_address.postal_code}
                      onChange={(e) => handleInputChange(e, 'shipping_address')}
                    />
                    {errors.postal_code && <span className={styles.error}>{errors.postal_code}</span>}
                  </div>
                  <div className={styles.formGroup}>
                    <label>Country *</label>
                    <select
                      name="country"
                      value={formData.shipping_address.country}
                      onChange={(e) => handleInputChange(e, 'shipping_address')}
                    >
                      <option>United States</option>
                      <option>Canada</option>
                      <option>Mexico</option>
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  className={styles.nextBtn}
                  onClick={handleNextStep}
                >
                  Continue to Billing
                </button>
              </div>
            )}

            {/* Billing Step */}
            {step === 'billing' && (
              <div className={styles.stepContent}>
                <h2>Billing Address</h2>

                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    name="same_as_shipping"
                    checked={formData.same_as_shipping}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        same_as_shipping: e.target.checked
                      }));
                    }}
                  />
                  Same as shipping address
                </label>

                {!formData.same_as_shipping && (
                  <div className={styles.billingForm}>
                    <div className={styles.formGroup}>
                      <label>Street Address *</label>
                      <input
                        type="text"
                        name="street_address"
                        value={formData.billing_address.street_address}
                        onChange={(e) => handleInputChange(e, 'billing_address')}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>City *</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.billing_address.city}
                        onChange={(e) => handleInputChange(e, 'billing_address')}
                      />
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label>Postal Code *</label>
                        <input
                          type="text"
                          name="postal_code"
                          value={formData.billing_address.postal_code}
                          onChange={(e) => handleInputChange(e, 'billing_address')}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className={styles.buttonGroup}>
                  <button
                    type="button"
                    className={styles.backBtn}
                    onClick={() => setStep('shipping')}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    className={styles.nextBtn}
                    onClick={() => setStep('payment')}
                  >
                    Continue to Payment
                  </button>
                </div>
              </div>
            )}

            {/* Payment Step */}
            {step === 'payment' && (
              <div className={styles.stepContent}>
                <h2>Payment Method</h2>

                <div className={styles.paymentMethods}>
                  <label className={styles.paymentOption}>
                    <input
                      type="radio"
                      name="payment_method"
                      value="credit_card"
                      checked={formData.payment_method === 'credit_card'}
                      onChange={handleInputChange}
                    />
                    <span>Credit Card</span>
                  </label>
                  <label className={styles.paymentOption}>
                    <input
                      type="radio"
                      name="payment_method"
                      value="debit_card"
                      checked={formData.payment_method === 'debit_card'}
                      onChange={handleInputChange}
                    />
                    <span>Debit Card</span>
                  </label>
                </div>

                {['credit_card', 'debit_card'].includes(formData.payment_method) && (
                  <div className={styles.cardForm}>
                    <div className={styles.formGroup}>
                      <label>Card Number *</label>
                      <input
                        type="text"
                        name="card_number"
                        placeholder="1234 5678 9012 3456"
                        value={formData.card_number}
                        onChange={handleInputChange}
                        maxLength="16"
                      />
                      {errors.card_number && <span className={styles.error}>{errors.card_number}</span>}
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label>Expiry Date *</label>
                        <input
                          type="text"
                          name="expiry"
                          placeholder="MM/YY"
                          value={formData.expiry}
                          onChange={handleInputChange}
                        />
                        {errors.expiry && <span className={styles.error}>{errors.expiry}</span>}
                      </div>
                      <div className={styles.formGroup}>
                        <label>CVV *</label>
                        <input
                          type="text"
                          name="cvv"
                          placeholder="123"
                          value={formData.cvv}
                          onChange={handleInputChange}
                          maxLength="4"
                        />
                        {errors.cvv && <span className={styles.error}>{errors.cvv}</span>}
                      </div>
                    </div>
                  </div>
                )}

                {errors.submit && <div className={styles.errorBox}>{errors.submit}</div>}

                <div className={styles.buttonGroup}>
                  <button
                    type="button"
                    className={styles.backBtn}
                    onClick={() => setStep('billing')}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    className={styles.submitBtn}
                    onClick={handleSubmitOrder}
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : 'Complete Purchase'}
                  </button>
                </div>
              </div>
            )}
          </form>
        )}

        {/* Confirmation Step */}
        {step === 'confirmation' && (
          <div className={styles.confirmation}>
            <div className={styles.successIcon}>✓</div>
            <h2>Order Confirmed!</h2>
            <p>Thank you for your purchase.</p>
            <div className={styles.orderDetails}>
              <div className={styles.detail}>
                <span>Order ID:</span>
                <strong>ORD-{orderId}</strong>
              </div>
              <div className={styles.detail}>
                <span>Total:</span>
                <strong>${total.toFixed(2)}</strong>
              </div>
            </div>
            <div className={styles.actionButtons}>
              <Link href={`/orders/${orderId}`} className={styles.primaryBtn}>
                View Order
              </Link>
              <Link href="/catalog" className={styles.secondaryBtn}>
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Order Summary Sidebar */}
      <aside className={styles.summary}>
        <h3>Order Summary</h3>
        <div className={styles.items}>
          {items.map((item) => (
            <div key={item.id} className={styles.item}>
              <span>{item.product_name}</span>
              <span>
                {item.quantity}x ${item.unit_price.toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        <div className={styles.totals}>
          <div className={styles.totalRow}>
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className={styles.totalRow}>
            <span>Tax</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className={styles.totalRow}>
            <span>Shipping</span>
            <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
          </div>
          <div className={`${styles.totalRow} ${styles.total}`}>
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        {subtotal < 150 && (
          <div className={styles.freeShipping}>
            Free shipping on orders over $150
          </div>
        )}
      </aside>
    </div>
    </Layout>
  );
}

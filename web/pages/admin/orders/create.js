import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/AdminLayout';
import api from '@/lib/api';
import styles from '@/styles/AdminCreateOrder.module.css';

const EMPTY_ITEM = { name: '', sku: '', quantity: 1, unit_price: '' };

export default function CreateOrder() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');
  const [products, setProducts] = useState([]);

  const [form, setForm] = useState({
    customer_first_name: '', customer_last_name: '',
    customer_email: '', customer_phone: '',
    shipping_address: { street_address:'', city:'', state_province:'', postal_code:'', country:'United States' },
    same_billing: true,
    billing_address:  { street_address:'', city:'', state_province:'', postal_code:'', country:'United States' },
    items: [{ ...EMPTY_ITEM }],
    tax_amount: '', shipping_cost: '0', discount_amount: '0',
    payment_method: 'manual', payment_status: 'paid',
    order_status: 'processing', notes: '',
  });

  useEffect(() => {
    api.get('/products?limit=100').then(res => {
      if (res.data) setProducts(res.data.data || []);
    }).catch(() => {});
  }, []);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const setAddr = (type, key, val) =>
    setForm(f => ({ ...f, [type]: { ...f[type], [key]: val } }));
  const setItem = (idx, key, val) =>
    setForm(f => {
      const items = [...f.items];
      items[idx] = { ...items[idx], [key]: val };
      return { ...f, items };
    });
  const addItem    = () => setForm(f => ({ ...f, items: [...f.items, { ...EMPTY_ITEM }] }));
  const removeItem = (idx) => setForm(f => ({ ...f, items: f.items.filter((_,i)=>i!==idx) }));

  // Derived totals
  const subtotal = form.items.reduce((s,i) => s + (parseFloat(i.unit_price)||0)*(parseInt(i.quantity)||0), 0);
  const taxAmt   = parseFloat(form.tax_amount !== '' ? form.tax_amount : (subtotal * 0.08).toFixed(2)) || 0;
  const shipAmt  = parseFloat(form.shipping_cost) || 0;
  const discAmt  = parseFloat(form.discount_amount) || 0;
  const total    = subtotal + taxAmt + shipAmt - discAmt;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.customer_email) { setError('Customer email is required.'); return; }
    if (form.items.some(i => !i.name || !i.unit_price)) {
      setError('All line items need a name and unit price.'); return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        billing_address: form.same_billing ? form.shipping_address : form.billing_address,
        tax_amount:       taxAmt,
        shipping_cost:    shipAmt,
        discount_amount:  discAmt,
        items: form.items.map(i => ({
          ...i,
          quantity:   parseInt(i.quantity),
          unit_price: parseFloat(i.unit_price),
        })),
      };
      const res = await api.post('/admin/orders/manual', payload);
      if (res.status === 201 && res.data?.order) {
        router.push(`/invoice/${res.data.order.id}?created=1`);
      } else {
        setError(res.data?.message || res.data?.errors?.[0]?.msg || 'Failed to create order.');
      }
    } catch (err) {
      setError(err.message || 'Unexpected error.');
    } finally { setSaving(false); }
  };

  const COUNTRIES = ['United States','Canada','United Kingdom','Australia','Germany','France','India','Japan','Singapore'];

  return (
    <AdminLayout title="Create Manual Order">
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.columns}>
          {/* ── LEFT ── */}
          <div className={styles.left}>

            {/* Customer */}
            <section className={styles.card}>
              <h2 className={styles.cardTitle}><i className="fas fa-user" /> Customer</h2>
              <div className={styles.row2}>
                <div className={styles.field}>
                  <label>First Name *</label>
                  <input value={form.customer_first_name} onChange={e=>set('customer_first_name',e.target.value)} required />
                </div>
                <div className={styles.field}>
                  <label>Last Name *</label>
                  <input value={form.customer_last_name} onChange={e=>set('customer_last_name',e.target.value)} required />
                </div>
              </div>
              <div className={styles.row2}>
                <div className={styles.field}>
                  <label>Email *</label>
                  <input type="email" value={form.customer_email} onChange={e=>set('customer_email',e.target.value)} required />
                </div>
                <div className={styles.field}>
                  <label>Phone</label>
                  <input type="tel" value={form.customer_phone} onChange={e=>set('customer_phone',e.target.value)} />
                </div>
              </div>
            </section>

            {/* Shipping Address */}
            <section className={styles.card}>
              <h2 className={styles.cardTitle}><i className="fas fa-map-marker-alt" /> Shipping Address</h2>
              <div className={styles.field}>
                <label>Street Address *</label>
                <input value={form.shipping_address.street_address} onChange={e=>setAddr('shipping_address','street_address',e.target.value)} required />
              </div>
              <div className={styles.row3}>
                <div className={styles.field}>
                  <label>City *</label>
                  <input value={form.shipping_address.city} onChange={e=>setAddr('shipping_address','city',e.target.value)} required />
                </div>
                <div className={styles.field}>
                  <label>State / Province</label>
                  <input value={form.shipping_address.state_province} onChange={e=>setAddr('shipping_address','state_province',e.target.value)} />
                </div>
                <div className={styles.field}>
                  <label>Postal Code *</label>
                  <input value={form.shipping_address.postal_code} onChange={e=>setAddr('shipping_address','postal_code',e.target.value)} required />
                </div>
              </div>
              <div className={styles.field}>
                <label>Country</label>
                <select value={form.shipping_address.country} onChange={e=>setAddr('shipping_address','country',e.target.value)}>
                  {COUNTRIES.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <label className={styles.checkRow}>
                <input type="checkbox" checked={form.same_billing} onChange={e=>set('same_billing',e.target.checked)} />
                Billing address same as shipping
              </label>
            </section>

            {/* Line Items */}
            <section className={styles.card}>
              <div className={styles.cardHeaderRow}>
                <h2 className={styles.cardTitle}><i className="fas fa-list" /> Line Items</h2>
                <button type="button" className={styles.addRowBtn} onClick={addItem}>
                  <i className="fas fa-plus" /> Add Item
                </button>
              </div>

              <div className={styles.itemsTable}>
                <div className={styles.itemsHead}>
                  <span>Product / Description</span>
                  <span>SKU</span>
                  <span>Qty</span>
                  <span>Unit Price</span>
                  <span>Line Total</span>
                  <span></span>
                </div>
                {form.items.map((item, idx) => (
                  <div key={idx} className={styles.itemRow}>
                    <div className={styles.itemNameCell}>
                      <input
                        list={`prod-list-${idx}`}
                        placeholder="Product name…"
                        value={item.name}
                        onChange={e => {
                          const match = products.find(p=>p.name===e.target.value);
                          setItem(idx, 'name', e.target.value);
                          if (match) {
                            setItem(idx, 'sku', match.sku || '');
                            setItem(idx, 'unit_price', match.price || '');
                            setItem(idx, 'product_id', match.id);
                          }
                        }}
                        required
                      />
                      <datalist id={`prod-list-${idx}`}>
                        {products.map(p=><option key={p.id} value={p.name}>{p.name} — ${p.price}</option>)}
                      </datalist>
                    </div>
                    <input className={styles.skuInput} placeholder="SKU" value={item.sku} onChange={e=>setItem(idx,'sku',e.target.value)} />
                    <input className={styles.qtyInput} type="number" min="1" value={item.quantity} onChange={e=>setItem(idx,'quantity',e.target.value)} />
                    <input className={styles.priceInput} type="number" step="0.01" min="0" placeholder="0.00" value={item.unit_price} onChange={e=>setItem(idx,'unit_price',e.target.value)} required />
                    <span className={styles.lineTotal}>
                      ${((parseFloat(item.unit_price)||0)*(parseInt(item.quantity)||0)).toFixed(2)}
                    </span>
                    {form.items.length > 1 && (
                      <button type="button" className={styles.removeRowBtn} onClick={()=>removeItem(idx)}>
                        <i className="fas fa-times" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Notes */}
            <section className={styles.card}>
              <h2 className={styles.cardTitle}><i className="fas fa-sticky-note" /> Internal Notes</h2>
              <textarea className={styles.textarea} rows={3} value={form.notes} onChange={e=>set('notes',e.target.value)} placeholder="Add notes for this order…" />
            </section>
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <div className={styles.right}>

            {/* Order Summary */}
            <section className={styles.card}>
              <h2 className={styles.cardTitle}><i className="fas fa-receipt" /> Order Summary</h2>
              <div className={styles.summaryRows}>
                <div className={styles.summaryRow}>
                  <label>Subtotal</label>
                  <span className={styles.summaryValue}>${subtotal.toFixed(2)}</span>
                </div>
                <div className={styles.summaryRow}>
                  <label>Tax ($)</label>
                  <input className={styles.smallInput} type="number" step="0.01" min="0"
                    placeholder={`${(subtotal*0.08).toFixed(2)}`}
                    value={form.tax_amount}
                    onChange={e=>set('tax_amount',e.target.value)} />
                </div>
                <div className={styles.summaryRow}>
                  <label>Shipping ($)</label>
                  <input className={styles.smallInput} type="number" step="0.01" min="0"
                    value={form.shipping_cost}
                    onChange={e=>set('shipping_cost',e.target.value)} />
                </div>
                <div className={styles.summaryRow}>
                  <label>Discount ($)</label>
                  <input className={styles.smallInput} type="number" step="0.01" min="0"
                    value={form.discount_amount}
                    onChange={e=>set('discount_amount',e.target.value)} />
                </div>
              </div>
              <div className={styles.summaryTotal}>
                <span>Total</span>
                <strong>${total.toFixed(2)}</strong>
              </div>
            </section>

            {/* Payment & Status */}
            <section className={styles.card}>
              <h2 className={styles.cardTitle}><i className="fas fa-credit-card" /> Payment & Status</h2>
              <div className={styles.field}>
                <label>Payment Method</label>
                <select value={form.payment_method} onChange={e=>set('payment_method',e.target.value)}>
                  <option value="manual">Manual / Offline</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="paypal">PayPal</option>
                  <option value="cash">Cash</option>
                </select>
              </div>
              <div className={styles.field}>
                <label>Payment Status</label>
                <select value={form.payment_status} onChange={e=>set('payment_status',e.target.value)}>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
              <div className={styles.field}>
                <label>Order Status</label>
                <select value={form.order_status} onChange={e=>set('order_status',e.target.value)}>
                  <option value="processing">Processing</option>
                  <option value="pending">Pending</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                </select>
              </div>
            </section>

            {error && <div className={styles.errorBox}><i className="fas fa-exclamation-circle" /> {error}</div>}

            <button type="submit" className={styles.submitBtn} disabled={saving}>
              {saving ? <><i className="fas fa-spinner fa-spin" /> Creating…</> : <><i className="fas fa-check" /> Create Order & View Invoice</>}
            </button>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}

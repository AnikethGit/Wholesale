import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import useAuthStore from '@/store/authStore';
import api from '@/lib/api';
import styles from '@/styles/AccountAddresses.module.css';

const EMPTY_FORM = {
  type: 'shipping', first_name: '', last_name: '',
  street_address: '', apt_suite: '', city: '',
  state_province: '', postal_code: '', country: 'United States', phone: '', is_default: false
};

const COUNTRIES = ['United States','Canada','United Kingdom','Australia','Germany','France','India','Japan'];

export default function AccountAddresses() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState(null);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [saving, setSaving]     = useState(false);
  const [errors, setErrors]     = useState({});

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    fetchAddresses();
  }, [isAuthenticated]);

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users/addresses');
      if (res.data) setAddresses(res.data.data || []);
    } catch { setAddresses([]); }
    finally { setLoading(false); }
  };

  const validate = () => {
    const e = {};
    if (!form.first_name)     e.first_name     = 'Required';
    if (!form.last_name)      e.last_name      = 'Required';
    if (!form.street_address) e.street_address = 'Required';
    if (!form.city)           e.city           = 'Required';
    if (!form.postal_code)    e.postal_code    = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      if (editing) {
        await api.patch(`/users/addresses/${editing}`, form);
      } else {
        await api.post('/users/addresses', form);
      }
      await fetchAddresses();
      setShowForm(false);
      setEditing(null);
      setForm(EMPTY_FORM);
    } catch { alert('Failed to save address.'); }
    finally { setSaving(false); }
  };

  const handleEdit = (addr) => {
    setForm({
      type: addr.type, first_name: addr.first_name, last_name: addr.last_name,
      street_address: addr.street_address, apt_suite: addr.apt_suite || '',
      city: addr.city, state_province: addr.state_province || '',
      postal_code: addr.postal_code, country: addr.country,
      phone: addr.phone || '', is_default: addr.is_default
    });
    setEditing(addr.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this address?')) return;
    try {
      await api.delete(`/users/addresses/${id}`);
      fetchAddresses();
    } catch { alert('Failed to delete address.'); }
  };

  const f = (name) => ({
    value: form[name],
    onChange: (e) => setForm(p => ({ ...p, [name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })),
  });

  return (
    <Layout title="My Addresses" description="Manage your saved addresses">
      <div className={styles.hero}>
        <h1>My Addresses</h1>
        <p>Manage your shipping and billing addresses</p>
      </div>

      <div className={styles.container}>
        <aside className={styles.sidebar}>
          <nav className={styles.nav}>
            <Link href="/account" className={styles.navItem}><i className="fas fa-tachometer-alt" /> Dashboard</Link>
            <Link href="/account/orders" className={styles.navItem}><i className="fas fa-box" /> Orders</Link>
            <Link href="/account/addresses" className={`${styles.navItem} ${styles.active}`}><i className="fas fa-map-marker-alt" /> Addresses</Link>
            <Link href="/account/settings" className={styles.navItem}><i className="fas fa-cog" /> Settings</Link>
          </nav>
        </aside>

        <main className={styles.main}>
          {/* Add form */}
          {showForm ? (
            <div className={styles.formCard}>
              <h2>{editing ? 'Edit Address' : 'Add New Address'}</h2>
              <form onSubmit={handleSave} className={styles.form}>
                <div className={styles.formRow}>
                  <div className={styles.group}>
                    <label>Type</label>
                    <select {...f('type')}>
                      <option value="shipping">Shipping</option>
                      <option value="billing">Billing</option>
                      <option value="both">Both</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.group}>
                    <label>First Name *</label>
                    <input type="text" {...f('first_name')} />
                    {errors.first_name && <span className={styles.err}>{errors.first_name}</span>}
                  </div>
                  <div className={styles.group}>
                    <label>Last Name *</label>
                    <input type="text" {...f('last_name')} />
                    {errors.last_name && <span className={styles.err}>{errors.last_name}</span>}
                  </div>
                </div>

                <div className={styles.group}>
                  <label>Street Address *</label>
                  <input type="text" placeholder="123 Main St" {...f('street_address')} />
                  {errors.street_address && <span className={styles.err}>{errors.street_address}</span>}
                </div>

                <div className={styles.group}>
                  <label>Apt, Suite, etc. (optional)</label>
                  <input type="text" placeholder="Apt 4B" {...f('apt_suite')} />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.group}>
                    <label>City *</label>
                    <input type="text" {...f('city')} />
                    {errors.city && <span className={styles.err}>{errors.city}</span>}
                  </div>
                  <div className={styles.group}>
                    <label>State / Province</label>
                    <input type="text" {...f('state_province')} />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.group}>
                    <label>Postal Code *</label>
                    <input type="text" {...f('postal_code')} />
                    {errors.postal_code && <span className={styles.err}>{errors.postal_code}</span>}
                  </div>
                  <div className={styles.group}>
                    <label>Country *</label>
                    <select {...f('country')}>
                      {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div className={styles.group}>
                  <label>Phone</label>
                  <input type="tel" placeholder="+1 (555) 000-0000" {...f('phone')} />
                </div>

                <label className={styles.checkboxLabel}>
                  <input type="checkbox" {...f('is_default')} />
                  Set as default address
                </label>

                <div className={styles.formActions}>
                  <button type="button" className={styles.cancelFormBtn} onClick={() => { setShowForm(false); setEditing(null); setForm(EMPTY_FORM); }}>
                    Cancel
                  </button>
                  <button type="submit" className={styles.saveBtn} disabled={saving}>
                    {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Address'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <button className={styles.addBtn} onClick={() => setShowForm(true)}>
              <i className="fas fa-plus" /> Add New Address
            </button>
          )}

          {/* Address list */}
          {loading ? (
            <div className={styles.loading}><i className="fas fa-spinner fa-spin" /> Loading addresses...</div>
          ) : addresses.length === 0 && !showForm ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>📍</div>
              <h3>No addresses saved</h3>
              <p>Add a shipping or billing address to speed up checkout.</p>
            </div>
          ) : (
            <div className={styles.addrGrid}>
              {addresses.map((addr) => (
                <div key={addr.id} className={`${styles.addrCard} ${addr.is_default ? styles.defaultCard : ''}`}>
                  {addr.is_default && <span className={styles.defaultBadge}>Default</span>}
                  <div className={styles.addrType}>
                    <i className={`fas fa-${addr.type === 'billing' ? 'credit-card' : 'truck'}`} />
                    {addr.type.charAt(0).toUpperCase() + addr.type.slice(1)}
                  </div>
                  <div className={styles.addrBody}>
                    <strong>{addr.first_name} {addr.last_name}</strong>
                    <p>{addr.street_address}{addr.apt_suite ? `, ${addr.apt_suite}` : ''}</p>
                    <p>{addr.city}{addr.state_province ? `, ${addr.state_province}` : ''} {addr.postal_code}</p>
                    <p>{addr.country}</p>
                    {addr.phone && <p>{addr.phone}</p>}
                  </div>
                  <div className={styles.addrActions}>
                    <button className={styles.editBtn} onClick={() => handleEdit(addr)}>
                      <i className="fas fa-edit" /> Edit
                    </button>
                    <button className={styles.deleteBtn} onClick={() => handleDelete(addr.id)}>
                      <i className="fas fa-trash" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </Layout>
  );
}

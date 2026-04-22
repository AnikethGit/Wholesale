import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import useAuthStore from '@/store/authStore';
import api from '@/lib/api';
import styles from '@/styles/AccountSettings.module.css';

export default function AccountSettings() {
  const router = useRouter();
  const { isAuthenticated, logout } = useAuthStore();

  const [profile, setProfile] = useState({ first_name: '', last_name: '', phone: '' });
  const [pwForm, setPwForm]   = useState({ current: '', newPw: '', confirm: '' });
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile]   = useState(false);
  const [savingPw, setSavingPw]             = useState(false);
  const [profileMsg, setProfileMsg]         = useState('');
  const [pwMsg, setPwMsg]                   = useState('');
  const [pwError, setPwError]               = useState('');

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    api.get('/users/profile').then((res) => {
      if (res.data?.user) setProfile({ first_name: res.data.user.first_name, last_name: res.data.user.last_name, phone: res.data.user.phone || '' });
    }).finally(() => setLoading(false));
  }, [isAuthenticated]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg('');
    try {
      await api.patch('/users/profile', profile);
      setProfileMsg('✓ Profile updated successfully!');
      setTimeout(() => setProfileMsg(''), 3000);
    } catch { setProfileMsg('Failed to update profile.'); }
    finally { setSavingProfile(false); }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure? This action cannot be undone.')) return;
    if (!confirm('Final confirmation: Delete your account and all data?')) return;
    await logout();
    router.push('/');
  };

  if (loading) return <Layout title="Settings"><div className={styles.loadingPage}><i className="fas fa-spinner fa-spin" /></div></Layout>;

  return (
    <Layout title="Account Settings" description="Manage your TechWholesale account settings">
      <div className={styles.hero}>
        <h1>Account Settings</h1>
        <p>Manage your profile and preferences</p>
      </div>

      <div className={styles.container}>
        <aside className={styles.sidebar}>
          <nav className={styles.nav}>
            <Link href="/account" className={styles.navItem}><i className="fas fa-tachometer-alt" /> Dashboard</Link>
            <Link href="/account/orders" className={styles.navItem}><i className="fas fa-box" /> Orders</Link>
            <Link href="/account/addresses" className={styles.navItem}><i className="fas fa-map-marker-alt" /> Addresses</Link>
            <Link href="/account/settings" className={`${styles.navItem} ${styles.active}`}><i className="fas fa-cog" /> Settings</Link>
          </nav>
        </aside>

        <main className={styles.main}>
          {/* Profile */}
          <div className={styles.card}>
            <h2><i className="fas fa-user" /> Personal Information</h2>
            <form onSubmit={handleProfileSave} className={styles.form}>
              <div className={styles.formRow}>
                <div className={styles.group}>
                  <label>First Name</label>
                  <input type="text" value={profile.first_name} onChange={(e) => setProfile(p => ({ ...p, first_name: e.target.value }))} />
                </div>
                <div className={styles.group}>
                  <label>Last Name</label>
                  <input type="text" value={profile.last_name} onChange={(e) => setProfile(p => ({ ...p, last_name: e.target.value }))} />
                </div>
              </div>
              <div className={styles.group}>
                <label>Phone Number</label>
                <input type="tel" value={profile.phone} onChange={(e) => setProfile(p => ({ ...p, phone: e.target.value }))} placeholder="+1 (555) 000-0000" />
              </div>
              {profileMsg && <p className={profileMsg.includes('✓') ? styles.success : styles.error}>{profileMsg}</p>}
              <button type="submit" className={styles.saveBtn} disabled={savingProfile}>
                {savingProfile ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>

          {/* Preferences */}
          <div className={styles.card}>
            <h2><i className="fas fa-bell" /> Notifications</h2>
            <div className={styles.prefList}>
              {[
                { label: 'Order status updates', sub: 'Get notified when your order status changes', checked: true },
                { label: 'Shipping notifications', sub: 'Track your packages with email updates', checked: true },
                { label: 'Promotional emails', sub: 'Deals, new products, and special offers', checked: false },
                { label: 'Wholesale alerts', sub: 'New bulk pricing and B2B offers', checked: false },
              ].map((pref) => (
                <label key={pref.label} className={styles.prefItem}>
                  <div className={styles.prefText}>
                    <span className={styles.prefLabel}>{pref.label}</span>
                    <span className={styles.prefSub}>{pref.sub}</span>
                  </div>
                  <div className={styles.toggle}>
                    <input type="checkbox" defaultChecked={pref.checked} />
                    <span className={styles.toggleSlider} />
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div className={styles.card}>
            <h2><i className="fas fa-link" /> Quick Links</h2>
            <div className={styles.linkGrid}>
              <Link href="/account/addresses" className={styles.quickLink}>
                <i className="fas fa-map-marker-alt" />
                <span>Manage Addresses</span>
                <i className="fas fa-chevron-right" />
              </Link>
              <Link href="/account/orders" className={styles.quickLink}>
                <i className="fas fa-box" />
                <span>Order History</span>
                <i className="fas fa-chevron-right" />
              </Link>
              <Link href="/track" className={styles.quickLink}>
                <i className="fas fa-shipping-fast" />
                <span>Track an Order</span>
                <i className="fas fa-chevron-right" />
              </Link>
              <Link href="/help/faq" className={styles.quickLink}>
                <i className="fas fa-question-circle" />
                <span>Help & FAQ</span>
                <i className="fas fa-chevron-right" />
              </Link>
            </div>
          </div>

          {/* Danger zone */}
          <div className={`${styles.card} ${styles.dangerCard}`}>
            <h2><i className="fas fa-exclamation-triangle" /> Danger Zone</h2>
            <p>Permanently delete your account and all associated data. This action cannot be undone.</p>
            <button className={styles.deleteBtn} onClick={handleDeleteAccount}>Delete Account</button>
          </div>
        </main>
      </div>
    </Layout>
  );
}

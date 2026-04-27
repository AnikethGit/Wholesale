import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import useCartStore from '@/store/cartStore';
import useAuthStore from '@/store/authStore';
import styles from '@/styles/Header.module.css';

export default function Header() {
  const router = useRouter();
  const { items } = useCartStore();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const cartCount = mounted ? items.reduce((s, i) => s + i.quantity, 0) : 0;
  const cartTotal = mounted ? items.reduce((s, i) => s + (i.subtotal || 0), 0) : 0;

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) router.push(`/catalog?search=${encodeURIComponent(search.trim())}`);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const navLinks = [
    { href: '/', label: 'Home' },
    // { href: '/catalog?category=smartphones', label: 'Phones' },
    // { href: '/catalog?category=earbuds-audio', label: 'Audio' },
    // { href: '/catalog?category=laptops', label: 'Laptops' },
    // { href: '/catalog?category=accessories', label: 'Accessories' },
    { href: '/catalog', label: 'All Products' },
  ];

  return (
    <>
      {/* Top bar */}
      <div className={styles.topbar}>
        🚚 Free shipping on orders over <span>$150</span> &nbsp;|&nbsp; Wholesale pricing on bulk orders &nbsp;|&nbsp; 30-day returns
      </div>

      <header className={styles.header}>
        <div className={styles.inner}>
          {/* Logo */}
          <Link href="/" className={styles.logo}>
            Best<span>Whole</span>sale
          </Link>

          {/* Desktop Nav */}
          <nav className={styles.nav}>
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`${styles.navLink} ${router.pathname === l.href || (l.href !== '/' && router.asPath.startsWith(l.href.split('?')[0])) ? styles.active : ''}`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className={styles.right}>
            {/* Search */}
            <form className={styles.searchForm} onSubmit={handleSearch}>
              <i className="fas fa-search" />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </form>

            {/* Cart */}
            <Link href="/cart" className={styles.cartBtn}>
              <i className="fas fa-shopping-cart" />
              <span className={styles.cartTotal}>${cartTotal.toFixed(2)}</span>
              {cartCount > 0 && <span className={styles.badge}>{cartCount}</span>}
            </Link>

            {/* Auth */}
            {mounted && isAuthenticated ? (
              <div className={styles.userMenu}>
                <button className={styles.userBtn}>
                  <i className="fas fa-user-circle" />
                  <span>{user?.first_name}</span>
                  <i className="fas fa-chevron-down" style={{ fontSize: '10px' }} />
                </button>
                <div className={styles.dropdown}>
                  <Link href="/account" className={styles.dropItem}>
                    <i className="fas fa-tachometer-alt" /> Dashboard
                  </Link>
                  <Link href="/account/orders" className={styles.dropItem}>
                    <i className="fas fa-box" /> My Orders
                  </Link>
                  <Link href="/account/addresses" className={styles.dropItem}>
                    <i className="fas fa-map-marker-alt" /> Addresses
                  </Link>
                  <Link href="/account/settings" className={styles.dropItem}>
                    <i className="fas fa-cog" /> Settings
                  </Link>
                  <div className={styles.dropDivider} />
                  <button className={styles.dropItem} onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt" /> Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.authLinks}>
                <Link href="/login" className={styles.loginBtn}>Sign In</Link>
                <Link href="/register" className={styles.registerBtn}>Register</Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button className={styles.menuToggle} onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
              <i className={`fas ${menuOpen ? 'fa-times' : 'fa-bars'}`} />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className={styles.mobileMenu}>
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href} className={styles.mobileLink} onClick={() => setMenuOpen(false)}>
                {l.label}
              </Link>
            ))}
            <div className={styles.mobileDivider} />
            {mounted && isAuthenticated ? (
              <>
                <Link href="/account" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>My Account</Link>
                <Link href="/account/orders" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>My Orders</Link>
                <button className={styles.mobileLink} onClick={() => { handleLogout(); setMenuOpen(false); }}>Sign Out</button>
              </>
            ) : (
              <>
                <Link href="/login" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Sign In</Link>
                <Link href="/register" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Register</Link>
              </>
            )}
          </div>
        )}
      </header>
    </>
  );
}

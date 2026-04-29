import { useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import useAuthStore from '@/store/authStore';
import styles from '@/styles/AdminLayout.module.css';

export default function AdminLayout({ children, title = 'Admin' }) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login?redirect=' + router.asPath); return; }
    if (user && user.role !== 'admin') router.push('/');
  }, [isAuthenticated, user]);

  if (!isAuthenticated || !user || user.role !== 'admin') return null;

  const navLinks = [
    { href: '/admin',              label: 'Dashboard',    icon: 'fas fa-tachometer-alt' },
    { href: '/admin/orders',       label: 'Orders',       icon: 'fas fa-box' },
    { href: '/admin/orders/create',label: 'Create Order', icon: 'fas fa-plus-circle' },
    { href: '/admin/products',     label: 'Products',     icon: 'fas fa-tags' },
  ];

  return (
    <>
      <Head>
        <title>{title} — TechWholesale Admin</title>
        <meta name="robots" content="noindex,nofollow" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
      </Head>

      <div className={styles.shell}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <Link href="/admin" className={styles.brand}>
            Tech<span>Wholesale</span>
            <small>Admin Panel</small>
          </Link>

          <nav className={styles.nav}>
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`${styles.navLink} ${router.pathname === l.href ? styles.active : ''}`}
              >
                <i className={l.icon} />
                {l.label}
              </Link>
            ))}
          </nav>

          <div className={styles.sidebarFooter}>
            <div className={styles.adminUser}>
              <i className="fas fa-user-shield" />
              <span>{user.first_name} {user.last_name}</span>
            </div>
            <Link href="/" className={styles.backBtn}>
              <i className="fas fa-arrow-left" /> Back to Store
            </Link>
          </div>
        </aside>

        {/* Main */}
        <div className={styles.main}>
          <header className={styles.topbar}>
            <h1 className={styles.pageTitle}>{title}</h1>
            <div className={styles.topbarRight}>
              <span className={styles.adminBadge}><i className="fas fa-shield-alt" /> Admin</span>
            </div>
          </header>
          <div className={styles.content}>{children}</div>
        </div>
      </div>
    </>
  );
}

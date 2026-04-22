import Layout from '@/components/Layout';
import Link from 'next/link';
import styles from '@/styles/Sitemap.module.css';

export default function Sitemap() {
  const sections = [
    {
      title: 'Main',
      links: [
        { label: 'Home', href: '/' },
        { label: 'Shop Catalog', href: '/catalog' },
        { label: 'Track Order', href: '/track' },
      ]
    },
    {
      title: 'Account',
      links: [
        { label: 'Dashboard', href: '/account' },
        { label: 'My Orders', href: '/account/orders' },
        { label: 'Addresses', href: '/account/addresses' },
        { label: 'Settings', href: '/account/settings' },
      ]
    },
    {
      title: 'Shopping',
      links: [
        { label: 'Shopping Cart', href: '/cart' },
        { label: 'Checkout', href: '/checkout' },
        { label: 'Sign In', href: '/login' },
        { label: 'Register', href: '/register' },
      ]
    },
    {
      title: 'Help & Support',
      links: [
        { label: 'Help Center', href: '/help/faq' },
        { label: 'Shipping Policy', href: '/help/shipping' },
        { label: 'Returns & Refunds', href: '/help/returns' },
        { label: 'Privacy Policy', href: '/help/privacy' },
        { label: 'Terms & Conditions', href: '/help/terms' },
      ]
    },
    {
      title: 'Categories',
      links: [
        { label: 'Smartphones', href: '/catalog?category=smartphones' },
        { label: 'Laptops', href: '/catalog?category=laptops' },
        { label: 'Audio & Headphones', href: '/catalog?category=earbuds-audio' },
        { label: 'Accessories', href: '/catalog?category=accessories' },
        { label: 'Computer Parts', href: '/catalog?category=computer-parts' },
        { label: 'Wearables', href: '/catalog?category=wearables' },
      ]
    }
  ];

  return (
    <Layout title="Sitemap" description="Complete sitemap of TechWholesale website">
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Sitemap</h1>
          <p>Navigate all pages and sections of TechWholesale</p>
        </div>

        <div className={styles.sitemapGrid}>
          {sections.map((section, idx) => (
            <div key={idx} className={styles.section}>
              <h2>{section.title}</h2>
              <ul>
                {section.links.map((link, linkIdx) => (
                  <li key={linkIdx}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className={styles.info}>
          <h3>About This Sitemap</h3>
          <p>This page provides a complete overview of all publicly accessible pages on TechWholesale. Click any link to navigate to that section. For a machine-readable XML sitemap used by search engines, <a href="/sitemap.xml">download our XML sitemap</a>.</p>
        </div>
      </div>
    </Layout>
  );
}

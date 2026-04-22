import Link from 'next/link';
import { useState } from 'react';
import Layout from '@/components/Layout';
import useCartStore from '@/store/cartStore';
import styles from '@/styles/Home.module.css';

export default function Home() {
  const { addItem } = useCartStore();
  const [addedProduct, setAddedProduct] = useState(null);

  const products = [
    { id: 1, name: 'Samsung Galaxy S24 Ultra 256GB', category: 'Smartphones', price: 899, rating: 5, reviews: 284, badge: 'Hot', icon: '📱', bg: '#1a2340' },
    { id: 2, name: 'Bose S1 Pro+ Bluetooth Speaker', category: 'Audio', price: 549, rating: 5, reviews: 142, badge: 'New', icon: '🎵', bg: '#1e3a2f' },
    { id: 3, name: 'Sony WH-1000XM5 Noise Cancelling', category: 'Earbuds', price: 279, rating: 5, reviews: 519, badge: 'Sale', icon: '🎧', bg: '#2a1a3d' },
    { id: 4, name: 'MacBook Pro M3 14" 512GB', category: 'Laptops', price: 1749, rating: 5, reviews: 87, badge: 'Hot', icon: '💻', bg: '#3d1a1a' },
    { id: 5, name: 'iPhone 16 Pro 128GB Natural Titanium', category: 'Smartphones', price: 999, rating: 4, reviews: 203, badge: 'New', icon: '📱', bg: '#1a2a3d' },
    { id: 6, name: 'NVIDIA RTX 4070 Super 12GB GDDR6X', category: 'Computer Parts', price: 599, rating: 5, reviews: 76, icon: '🖥️', bg: '#1e2a1a' },
    { id: 7, name: 'Anker 240W USB-C Charging Hub 6-Port', category: 'Accessories', price: 79, rating: 4, reviews: 338, badge: 'Sale', icon: '🔌', bg: '#3d2a1a' },
    { id: 8, name: 'Apple Watch Series 10 45mm GPS+Cell', category: 'Wearables', price: 449, rating: 5, reviews: 194, badge: 'Hot', icon: '⌚', bg: '#1a1a2a' }
  ];

  const handleAddToCart = (product) => {
    addItem(product.id, 1);
    setAddedProduct(product.id);
    setTimeout(() => setAddedProduct(null), 2000);
  };

  return (
    <Layout>
      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroGrid} />
        <div className={styles.heroInner}>
          <div className={styles.heroEyebrow}>New Season Arrivals</div>
          <h1>Where <span>Quality</span> Meets Wholesale Value</h1>
          <p className={styles.heroSub}>Premium tech products at unbeatable wholesale prices. From flagship phones to pro audio gear — shop smarter, save bigger.</p>
          <div className={styles.heroCtas}>
            <Link href="/catalog" className={styles.btnPrimary}>Start Shopping</Link>
            <Link href="/catalog" className={styles.btnAccent}>Browse Categories</Link>
          </div>
        </div>
      </section>

      {/* FEATURES BAR */}
      <section className={styles.featuresBar}>
        <div className={styles.featuresInner}>
          {[
            { icon: 'fas fa-shipping-fast', title: 'Free Shipping', sub: 'On all orders over $150. Fast 2–5 day delivery.' },
            { icon: 'fas fa-shield-alt', title: 'Secure Payments', sub: '256-bit SSL encryption on all transactions.' },
            { icon: 'fas fa-undo-alt', title: '30-Day Returns', sub: 'No questions asked return policy.' },
            { icon: 'fas fa-headset', title: '24/7 Support', sub: 'Expert help whenever you need it.' }
          ].map((f) => (
            <div key={f.title} className={styles.featureItem}>
              <div className={styles.featureIcon}><i className={f.icon} /></div>
              <div>
                <div className={styles.featureTitle}>{f.title}</div>
                <div className={styles.featureSub}>{f.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className={styles.featured}>
        <div className={styles.inner}>
          <div className={styles.sectionHead}>
            <h2>Featured Products</h2>
            <p>Handpicked bestsellers at wholesale prices</p>
          </div>

          <div className={styles.productGrid}>
            {products.map((product) => (
              <div key={product.id} className={styles.productCard} style={{ background: product.bg }}>
                {product.badge && <span className={`${styles.badge} ${styles[product.badge.toLowerCase()]}`}>{product.badge}</span>}
                <div className={styles.productIcon}>{product.icon}</div>
                <div className={styles.productInfo}>
                  <div className={styles.productName}>{product.name}</div>
                  <div className={styles.productCategory}>{product.category}</div>
                  <div className={styles.productRating}>
                    {[...Array(product.rating)].map((_, i) => <span key={i}>⭐</span>)}
                    <span className={styles.reviews}>({product.reviews})</span>
                  </div>
                  <div className={styles.productPrice}>${product.price}</div>
                  <button
                    className={`${styles.addBtn} ${addedProduct === product.id ? styles.added : ''}`}
                    onClick={() => handleAddToCart(product)}
                  >
                    {addedProduct === product.id ? '✓ Added' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.viewAll}>
            <Link href="/catalog" className={styles.viewAllLink}>View all products →</Link>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className={styles.categories}>
        <div className={styles.inner}>
          <div className={styles.sectionHead}>
            <h2>Shop by Category</h2>
            <p>Browse our curated collections</p>
          </div>
          <div className={styles.categoryGrid}>
            {[
              { name: 'Smartphones', icon: '📱', href: '/catalog?category=smartphones' },
              { name: 'Laptops & Desktops', icon: '💻', href: '/catalog?category=laptops' },
              { name: 'Audio & Headphones', icon: '🎧', href: '/catalog?category=earbuds-audio' },
              { name: 'Accessories', icon: '🔌', href: '/catalog?category=accessories' },
              { name: 'Computer Parts', icon: '🖥️', href: '/catalog?category=computer-parts' },
              { name: 'Wearables', icon: '⌚', href: '/catalog?category=wearables' },
            ].map((cat) => (
              <Link key={cat.name} href={cat.href} className={styles.categoryCard}>
                <div className={styles.categoryIcon}>{cat.icon}</div>
                <span>{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className={styles.ctaSection}>
        <div className={styles.inner}>
          <div className={styles.ctaContent}>
            <h2>Wholesale Pricing for B2B Customers</h2>
            <p>Join our wholesale program and enjoy bulk discounts on all products. Perfect for resellers, retailers, and corporate bulk purchases.</p>
            <Link href="/register" className={styles.btnAccent}>Apply for Wholesale Access</Link>
          </div>
          <div className={styles.ctaImage}>📦</div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className={styles.testimonials}>
        <div className={styles.inner}>
          <div className={styles.sectionHead}>
            <h2>What Our Customers Say</h2>
          </div>
          <div className={styles.testimonialGrid}>
            {[
              { name: 'Alex Johnson', role: 'Tech Reviewer', text: 'TechWholesale offers the best prices I\'ve found. Their service is fast and reliable.' },
              { name: 'Sarah Chen', role: 'Retail Store Owner', text: 'As a retailer, the wholesale pricing has transformed my margins. Highly recommended!' },
              { name: 'Marcus Rodriguez', role: 'B2B Manager', text: 'Professional, responsive, and competitive pricing. We\'ve found our new supplier.' }
            ].map((t) => (
              <div key={t.name} className={styles.testimonialCard}>
                <div className={styles.testimonialRating}>{'⭐'.repeat(5)}</div>
                <p className={styles.testimonialText}>"{t.text}"</p>
                <div className={styles.testimonialAuthor}>
                  <strong>{t.name}</strong>
                  <span>{t.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className={styles.faq}>
        <div className={styles.inner}>
          <div className={styles.sectionHead}>
            <h2>Frequently Asked Questions</h2>
          </div>
          <div className={styles.faqGrid}>
            {[
              { q: 'Do you offer bulk discounts?', a: 'Yes! We offer tiered wholesale pricing for bulk orders. Contact us for a custom quote.' },
              { q: 'How fast is shipping?', a: 'Most orders ship within 24 hours. Standard delivery is 2–5 business days.' },
              { q: 'What\'s your return policy?', a: '30-day hassle-free returns on all products in original condition.' },
              { q: 'Do you ship internationally?', a: 'Yes, we ship to most countries. International orders may incur additional shipping fees.' }
            ].map((item, i) => (
              <div key={i} className={styles.faqItem}>
                <h4>{item.q}</h4>
                <p>{item.a}</p>
              </div>
            ))}
          </div>
          <div className={styles.faqLink}>
            <Link href="/help/faq">View All FAQs →</Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}

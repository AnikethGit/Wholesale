import Link from 'next/link';
import { useState } from 'react';
import Layout from '@/components/Layout';
import useCartStore from '@/store/cartStore';
import styles from '@/styles/Home.module.css';

export default function Home() {
  const { addItem } = useCartStore();
  const [addedProduct, setAddedProduct] = useState(null);

  const products = [
    { id: 1, name: 'Samsung Galaxy S24 Ultra 256GB', category: 'Smartphones', price: 899, comparePrice: 1099, rating: 5, reviews: 284, badge: 'Hot', badgeHot: true,  icon: '📱', bg: 'prodBg1' },
    { id: 2, name: 'Bose S1 Pro+ Bluetooth Speaker',  category: 'Audio',       price: 549, comparePrice: 699,  rating: 5, reviews: 142, badge: 'New', badgeHot: false, icon: '🎵', bg: 'prodBg2' },
    { id: 3, name: 'Sony WH-1000XM5 Noise Cancelling',category: 'Earbuds',     price: 279, comparePrice: 379,  rating: 5, reviews: 519, badge: 'Sale',badgeHot: false, icon: '🎧', bg: 'prodBg3' },
    { id: 4, name: 'MacBook Pro M3 14" 512GB',         category: 'Laptops',     price: 1749,comparePrice: 1999, rating: 5, reviews: 87,  badge: 'Hot', badgeHot: true,  icon: '💻', bg: 'prodBg4' },
    { id: 5, name: 'iPhone 16 Pro 128GB Natural Titanium', category: 'Smartphones', price: 999, comparePrice: 1099, rating: 4, reviews: 203, badge: 'New', badgeHot: false, icon: '📱', bg: 'prodBg5' },
    { id: 6, name: 'NVIDIA RTX 4070 Super 12GB GDDR6X',category: 'Computer Parts', price: 599, comparePrice: 649, rating: 5, reviews: 76,  badge: null,  badgeHot: false, icon: '🖥️', bg: 'prodBg6' },
    { id: 7, name: 'Anker 240W USB-C Charging Hub 6-Port', category: 'Accessories', price: 79, comparePrice: 109, rating: 4, reviews: 338, badge: 'Sale',badgeHot: false, icon: '🔌', bg: 'prodBg7' },
    { id: 8, name: 'Apple Watch Series 10 45mm GPS+Cell',  category: 'Wearables',   price: 449, comparePrice: 499, rating: 5, reviews: 194, badge: 'Hot', badgeHot: true,  icon: '⌚', bg: 'prodBg8' },
  ];

  const categories = [
    { name: 'Smartphones',    icon: '📱', href: '/catalog?category=smartphones',   bg: 'bentoPhones',       large: true  },
    { name: 'Earbuds & Audio',icon: '🎧', href: '/catalog?category=earbuds-audio', bg: 'bentoAudio',        large: false },
    { name: 'Accessories',    icon: '🔌', href: '/catalog?category=accessories',   bg: 'bentoAccessories',  large: false },
    { name: 'Laptops',        icon: '💻', href: '/catalog?category=laptops',       bg: 'bentoLaptops',      large: false },
    { name: 'Computer Parts', icon: '🔧', href: '/catalog?category=computer-parts',bg: 'bentoParts',        large: false },
  ];

  const stars = (n) => '★'.repeat(n) + (n < 5 ? '☆'.repeat(5 - n) : '');

  const handleAddToCart = (product) => {
    addItem(product.id, 1);
    setAddedProduct(product.id);
    setTimeout(() => setAddedProduct(null), 2000);
  };

  return (
    <Layout>

      {/* ── HERO ─────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroGrid} />
        <div className={styles.heroInner}>
          <div className={styles.heroEyebrow}>New Season Arrivals</div>
          <h1>Where <span>Quality</span> Meets Wholesale Value</h1>
          <p className={styles.heroSub}>
            Premium products at unbeatable wholesale prices. From flagship phones to pro audio gear — shop smarter, save bigger.
          </p>
          <div className={styles.heroCtas}>
            <Link href="/catalog" className={styles.btnPrimary}>Start Shopping</Link>
            <Link href="#categories" className={styles.btnAccent}>Browse Categories</Link>
          </div>
        </div>
      </section>

      {/* ── FEATURES BAR ─────────────────────────────── */}
      <section className={styles.featuresBar}>
        <div className={styles.featuresInner}>
          {[
            { icon: 'fas fa-shipping-fast', title: 'Free Shipping',    sub: 'On all orders over $150. Fast 2–5 day delivery.' },
            { icon: 'fas fa-shield-alt',    title: 'Secure Payments',  sub: '256-bit SSL encryption on all transactions.' },
            { icon: 'fas fa-undo-alt',      title: '30-Day Returns',   sub: 'No questions asked return policy.' },
            { icon: 'fas fa-headset',       title: '24/7 Support',     sub: 'Expert help whenever you need it.' },
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

      {/* ── CATEGORIES — BENTO GRID ───────────────────── */}
      <section className={styles.categoriesSection} id="categories">
        <div className={styles.categoriesInner}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionLabel}>Explore</div>
            <h2 className={styles.sectionTitle}>Shop by Category</h2>
            <p className={styles.sectionSub}>Find exactly what you're looking for</p>
          </div>
          <div className={styles.bentoGrid}>
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={cat.href}
                className={`${styles.bentoItem} ${cat.large ? styles.bentoLarge : ''}`}
              >
                <div className={`${styles.bentoBg} ${styles[cat.bg]}`} />
                <div className={styles.bentoEmoji} style={{ fontSize: cat.large ? '120px' : '80px' }}>
                  {cat.icon}
                </div>
                <div className={styles.bentoOverlay} />
                <div className={styles.bentoContent}>
                  <span className={styles.bentoLabel}>{cat.name}</span>
                  <span className={styles.bentoBtn}>Shop Now</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRENDING PRODUCTS ────────────────────────── */}
      <section className={styles.trendingSection} id="trending">
        <div className={styles.trendingInner}>
          <div className={styles.trendingHeader}>
            <div>
              <div className={styles.sectionLabel}>What's Hot</div>
              <h2 className={styles.sectionTitle}>Trending <em>Right Now</em></h2>
              <p className={styles.sectionSub}>Our best-selling products this season</p>
            </div>
            <Link href="/catalog" className={styles.viewAll}>View all products →</Link>
          </div>

          <div className={styles.productsGrid}>
            {products.map((product) => (
              <div key={product.id} className={styles.productCard}>
                <div className={`${styles.productImgWrap} ${styles[product.bg]}`}>
                  <div className={styles.productIconCenter}>{product.icon}</div>
                  {product.badge && (
                    <span className={`${styles.productBadge} ${product.badgeHot ? styles.hot : ''}`}>
                      {product.badge}
                    </span>
                  )}
                </div>
                <div className={styles.productBody}>
                  <div className={styles.productCat}>{product.category}</div>
                  <div className={styles.productName}>{product.name}</div>
                  <div className={styles.productStars}>
                    {stars(product.rating)} <span>({product.reviews})</span>
                  </div>
                  <div className={styles.productFooter}>
                    <div>
                      <div className={styles.productPrice}>${product.price.toLocaleString()}</div>
                      <div className={styles.productPriceOld}>${product.comparePrice.toLocaleString()}</div>
                    </div>
                    <button
                      className={`${styles.addCartBtn} ${addedProduct === product.id ? styles.addedCartBtn : ''}`}
                      onClick={() => handleAddToCart(product)}
                    >
                      {addedProduct === product.id ? '✓ Added' : '+ Add'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROMO BANNER ─────────────────────────────── */}
      <section className={styles.promoBanner}>
        <div className={styles.promoBannerInner}>
          <div className={styles.promoTag}>Wholesale Program</div>
          <h2>Buy More, Save More</h2>
          <p>Join our wholesale program and unlock tiered pricing on bulk orders. Perfect for retailers, resellers, and businesses.</p>
          <Link href="/register" className={styles.btnAccentHero}>Apply for Wholesale Access</Link>
        </div>
      </section>

      {/* ── CHAT FAB ─────────────────────────────────── */}
      <button className={styles.chatFab} title="Chat with us" aria-label="Chat with us">
        <i className="fas fa-comment-dots" />
      </button>

    </Layout>
  );
}

import Head from 'next/head';
import Link from 'next/link';
import useCartStore from '@/store/cartStore';
import styles from '@/styles/Home.module.css';

export default function Home() {
  const { items, addItem } = useCartStore();

  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const cartTotal = items.reduce((sum, i) => sum + (i.subtotal || 0), 0);

  const prices = {
    'Samsung Galaxy S24 Ultra 256GB': 899,
    'Bose S1 Pro+ Bluetooth Speaker': 549,
    'Sony WH-1000XM5 Noise Cancelling': 279,
    'MacBook Pro M3 14" 512GB': 1749,
    'iPhone 16 Pro 128GB Natural Titanium': 999,
    'NVIDIA RTX 4070 Super 12GB GDDR6X': 599,
    'Anker 240W USB-C Charging Hub 6-Port': 79,
    'Apple Watch Series 10 45mm GPS+Cell': 449
  };

  const products = [
    { id: 1, name: 'Samsung Galaxy S24 Ultra 256GB', category: 'Smartphones', rating: 5, reviews: 284, badge: 'Hot', badgeType: 'hot', icon: '📱', bg: '#1a2340' },
    { id: 2, name: 'Bose S1 Pro+ Bluetooth Speaker', category: 'Audio', rating: 5, reviews: 142, badge: 'New', icon: '🎵', bg: '#1e3a2f' },
    { id: 3, name: 'Sony WH-1000XM5 Noise Cancelling', category: 'Earbuds', rating: 5, reviews: 519, badge: 'Sale', icon: '🎧', bg: '#2a1a3d' },
    { id: 4, name: 'MacBook Pro M3 14" 512GB', category: 'Laptops', rating: 5, reviews: 87, badge: 'Hot', badgeType: 'hot', icon: '💻', bg: '#3d1a1a' },
    { id: 5, name: 'iPhone 16 Pro 128GB Natural Titanium', category: 'Smartphones', rating: 4, reviews: 203, badge: 'New', icon: '📱', bg: '#1a2a3d' },
    { id: 6, name: 'NVIDIA RTX 4070 Super 12GB GDDR6X', category: 'Computer Parts', rating: 5, reviews: 76, icon: '🖥️', bg: '#1e2a1a' },
    { id: 7, name: 'Anker 240W USB-C Charging Hub 6-Port', category: 'Accessories', rating: 4, reviews: 338, badge: 'Sale', icon: '🔌', bg: '#3d2a1a' },
    { id: 8, name: 'Apple Watch Series 10 45mm GPS+Cell', category: 'Wearables', rating: 5, reviews: 194, badge: 'Hot', badgeType: 'hot', icon: '⌚', bg: '#1a1a2a' }
  ];

  const handleAddToCart = async (productName) => {
    const price = prices[productName];
    // For demo, directly update local store
    useCartStore.setState((state) => ({
      items: (() => {
        const existing = state.items.find(i => i.product_name === productName);
        if (existing) {
          return state.items.map(i =>
            i.product_name === productName
              ? { ...i, quantity: i.quantity + 1, subtotal: (i.quantity + 1) * i.unit_price }
              : i
          );
        }
        return [...state.items, {
          id: Date.now(),
          product_name: productName,
          product_sku: 'DEMO',
          unit_price: price,
          quantity: 1,
          subtotal: price
        }];
      })()
    }));
  };

  return (
    <>
      <Head>
        <title>TechWholesale — Where Quality Meets Wholesale Value</title>
        <meta name="description" content="Premium tech products at wholesale prices." />
      </Head>

      {/* TOP BAR */}
      <div className={styles.topbar}>
        🚚 Free shipping on orders over <span>$150</span> &nbsp;|&nbsp; Wholesale pricing on bulk orders &nbsp;|&nbsp; 30-day returns
      </div>

      {/* HEADER */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.logo}>Tech<span>Whole</span>sale</Link>
          <nav className={styles.nav}>
            <Link href="/" className={styles.active}>Home</Link>
            <Link href="/catalog?category=smartphones">Phones</Link>
            <Link href="/catalog?category=earbuds-audio">Audio</Link>
            <Link href="/catalog?category=laptops">Laptops</Link>
            <Link href="/catalog?category=accessories">Accessories</Link>
            <Link href="/catalog">Wholesale</Link>
          </nav>
          <div className={styles.headerRight}>
            <div className={styles.searchBar}>
              <i className="fas fa-search" />
              <input type="text" placeholder="Search products..." onKeyDown={(e) => {
                if (e.key === 'Enter') window.location.href = `/catalog?search=${e.target.value}`;
              }} />
            </div>
            <Link href="/cart" className={styles.cartBtn}>
              <i className="fas fa-shopping-cart" />
              ${cartTotal.toFixed(2)}
              {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
            </Link>
          </div>
        </div>
      </header>

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

      {/* TRENDING PRODUCTS */}
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
            {products.map((p) => (
              <div key={p.id} className={styles.productCard}>
                <div className={styles.productImgWrap} style={{ background: `linear-gradient(135deg, ${p.bg} 0%, ${p.bg}dd 100%)` }}>
                  <div className={styles.productIcon}>{p.icon}</div>
                  {p.badge && (
                    <span className={`${styles.productBadge} ${p.badgeType === 'hot' ? styles.hot : ''}`}>{p.badge}</span>
                  )}
                </div>
                <div className={styles.productBody}>
                  <div className={styles.productCat}>{p.category}</div>
                  <div className={styles.productName}>{p.name}</div>
                  <div className={styles.productStars}>
                    {'★'.repeat(p.rating)}{'☆'.repeat(5 - p.rating)} <span>({p.reviews})</span>
                  </div>
                  <div className={styles.productFooter}>
                    <div>
                      <div className={styles.productPrice}>${prices[p.name]}</div>
                    </div>
                    <button
                      className={styles.addCartBtn}
                      onClick={() => handleAddToCart(p.name)}
                    >
                      + Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROMO BANNER */}
      <section className={styles.promoBanner}>
        <div className={styles.promoBannerInner}>
          <div className={styles.promoTag}>Wholesale Program</div>
          <h2>Buy More, Save More</h2>
          <p>Join our wholesale program and unlock tiered pricing on bulk orders. Perfect for retailers, resellers, and businesses.</p>
          <Link href="/register" className={styles.btnAccent}>Apply for Wholesale Access</Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.footerMain}>
          <div>
            <Link href="/" className={styles.footerLogo}>Tech<span>Whole</span>sale</Link>
            <p className={styles.footerBio}>Your trusted source for premium tech at wholesale prices.</p>
          </div>
          <div className={styles.footerCol}>
            <h4>Products</h4>
            <ul>
              {['Phones','Earbuds & Audio','Phone Cases','Laptops','Computer Parts','Wearables'].map(i => (
                <li key={i}><Link href="/catalog">{i}</Link></li>
              ))}
            </ul>
          </div>
          <div className={styles.footerCol}>
            <h4>Support</h4>
            <ul>
              {['Privacy Policy','Shipping Policy','Return Policy','Terms & Conditions','FAQ'].map(i => (
                <li key={i}><a href="#">{i}</a></li>
              ))}
            </ul>
          </div>
          <div className={styles.footerCol}>
            <h4>Contact Us</h4>
            <div className={styles.footerContact}>
              <p><i className="fas fa-envelope" /> hello@techwholesale.com</p>
              <p><i className="fas fa-phone" /> +1 (800) 555-TECH</p>
              <p><i className="fas fa-clock" /> Mon–Fri: 9am – 6pm PST</p>
            </div>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <div>© 2026 <span>TechWholesale</span>. All rights reserved.</div>
          <div className={styles.footerLegal}>
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
          </div>
        </div>
      </footer>
    </>
  );
}

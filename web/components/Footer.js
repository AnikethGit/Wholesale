import Link from 'next/link';
import styles from '@/styles/Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.main}>
        <div className={styles.brand}>
          <Link href="/" className={styles.logo}>Best<span>Whole</span>sale</Link>
          <p className={styles.bio}>Your trusted source for premium products at wholesale prices. We connect consumers and businesses with the best products at unbeatable value.</p>
          <div className={styles.socials}>
            {[
              { icon: 'fab fa-instagram', href: '#' },
              { icon: 'fab fa-facebook-f', href: '#' },
              { icon: 'fab fa-twitter', href: '#' },
              { icon: 'fab fa-youtube', href: '#' },
            ].map((s) => (
              <a key={s.icon} href={s.href} className={styles.social} aria-label={s.icon}>
                <i className={s.icon} />
              </a>
            ))}
          </div>
        </div>

        <div className={styles.col}>
          <h4>Products</h4>
          <ul>
            <li><Link href="/catalog?category=smartphones">Phones</Link></li>
            <li><Link href="/catalog?category=earbuds-audio">Earbuds & Audio</Link></li>
            <li><Link href="/catalog?category=accessories">Phone Cases</Link></li>
            <li><Link href="/catalog?category=laptops">Laptops</Link></li>
            <li><Link href="/catalog?category=computer-parts">Computer Parts</Link></li>
            <li><Link href="/catalog?category=wearables">Wearables</Link></li>
          </ul>
        </div>

        <div className={styles.col}>
          <h4>Support</h4>
          <ul>
            <li><Link href="/help/privacy">Privacy Policy</Link></li>
            <li><Link href="/help/shipping">Shipping Policy</Link></li>
            <li><Link href="/help/returns">Return Policy</Link></li>
            <li><Link href="/help/terms">Terms & Conditions</Link></li>
            <li><Link href="/help/faq">FAQ</Link></li>
          </ul>
        </div>

        <div className={styles.col}>
          <h4>Account</h4>
          <ul>
            <li><Link href="/account">My Account</Link></li>
            <li><Link href="/account/orders">Order History</Link></li>
            <li><Link href="/account/addresses">Addresses</Link></li>
            <li><Link href="/cart">Cart</Link></li>
            <li><Link href="/track">Track Order</Link></li>
          </ul>
        </div>

        <div className={styles.col}>
          <h4>Contact Us</h4>
          <div className={styles.contact}>
            <p><i className="fas fa-map-marker-alt" /> 123 Tech Plaza, San Francisco, CA 94102</p>
            <p><i className="fas fa-phone" /> +1 (800) 555-BEST</p>
            <p><i className="fas fa-envelope" /> hello@bestwholesale.com</p>
            <p><i className="fas fa-clock" /> Mon–Fri: 9am – 6pm PST</p>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <p>© 2026 <span>BestWholesale</span>. All rights reserved. Built with ♥ for value lovers.</p>
        <div className={styles.legal}>
          <Link href="/help/privacy">Privacy</Link>
          <Link href="/help/terms">Terms</Link>
          <Link href="/sitemap">Sitemap</Link>
        </div>
      </div>
    </footer>
  );
}

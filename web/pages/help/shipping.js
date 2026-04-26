import Layout from '@/components/Layout';
import Link from 'next/link';
import styles from '@/styles/HelpPage.module.css';

export default function ShippingPolicy() {
  return (
    <Layout title="Shipping Policy" description="Learn about our shipping options and delivery times">
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.eyebrow}>Policies &amp; Info</div>
          <h1>Shipping Policy</h1>
          <p>Fast, reliable delivery to your door</p>
        </div>

        <div className={styles.content}>
          <section>
            <h2>Shipping Methods</h2>
            <p>We offer multiple shipping options to suit your needs:</p>
            <ul>
              <li><strong>Standard Shipping (2-5 days):</strong> $9.99 (free on orders over $150)</li>
              <li><strong>Express Shipping (1-2 days):</strong> $24.99</li>
              <li><strong>Overnight Shipping:</strong> $49.99</li>
              <li><strong>International Shipping:</strong> Contact us for rates</li>
            </ul>
          </section>

          <section>
            <h2>Processing Time</h2>
            <p>Most orders are processed and shipped within 24 hours. Orders placed on weekends or holidays ship the next business day. Custom orders may take 3-5 business days.</p>
          </section>

          <section>
            <h2>Tracking</h2>
            <p>You'll receive a tracking number via email once your order ships. Use it to monitor your package in real-time at <Link href="/track">our tracking page</Link> or the carrier's website.</p>
          </section>

          <section>
            <h2>Delivery</h2>
            <p>Packages are delivered to the address provided at checkout. Signature may be required for high-value items. We recommend choosing a secure delivery location or providing delivery instructions.</p>
          </section>

          <section>
            <h2>Shipping Restrictions</h2>
            <p>We currently ship to:</p>
            <ul>
              <li>All 50 US states and territories</li>
              <li>Canada</li>
              <li>Select international destinations</li>
            </ul>
            <p>Some items may have shipping restrictions. We'll notify you at checkout if an item can't ship to your location.</p>
          </section>

          <section>
            <h2>Lost or Damaged Packages</h2>
            <p>If your package arrives damaged or lost:</p>
            <ol>
              <li>Report the issue within 30 days of delivery</li>
              <li>Provide photos of the damage and tracking number</li>
              <li>We'll investigate with the carrier and send a replacement or refund</li>
            </ol>
          </section>

          <section>
            <h2>International Orders</h2>
            <p>International orders may incur additional customs duties and taxes. These are the responsibility of the recipient. Delivery times vary by country (typically 7-21 days).</p>
          </section>

          <section>
            <h2>Contact Us</h2>
            <p>Shipping questions? Reach out:</p>
            <ul>
              <li>Email: shipping@techwholesale.com</li>
              <li>Phone: +1 (800) 555-TECH</li>
              <li>Hours: Mon–Fri, 9am–6pm PST</li>
            </ul>
          </section>
        </div>

        <div className={styles.backLink}>
          <Link href="/help/faq">← Back to Help Center</Link>
        </div>
      </div>
    </Layout>
  );
}

import Layout from '@/components/Layout';
import Link from 'next/link';
import styles from '@/styles/HelpPage.module.css';

export default function PrivacyPolicy() {
  return (
    <Layout title="Privacy Policy" description="Our commitment to your data privacy">
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.eyebrow}>Policies &amp; Info</div>
          <h1>Privacy Policy</h1>
          <p>Last updated: April 2026</p>
        </div>

        <div className={styles.content}>
          <section>
            <h2>1. Introduction</h2>
            <p>TechWholesale ("Company," "we," "us," or "our") operates the techwholesale.com website. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.</p>
          </section>

          <section>
            <h2>2. Information We Collect</h2>
            <p>We collect information you provide directly, including:</p>
            <ul>
              <li><strong>Account Information:</strong> Name, email, password, phone number</li>
              <li><strong>Billing & Shipping:</strong> Address, payment method details (processed securely)</li>
              <li><strong>Order Information:</strong> Products purchased, quantities, transaction history</li>
              <li><strong>Communication:</strong> Messages, support tickets, feedback you send us</li>
            </ul>
            <p>We also automatically collect:</p>
            <ul>
              <li>Browser type, IP address, pages visited, time spent on site</li>
              <li>Cookies and similar tracking technologies</li>
              <li>Device information and location data (with permission)</li>
            </ul>
          </section>

          <section>
            <h2>3. How We Use Your Information</h2>
            <p>We use collected information to:</p>
            <ul>
              <li>Process and fulfill your orders</li>
              <li>Send transactional emails (confirmations, tracking, receipts)</li>
              <li>Provide customer support and respond to inquiries</li>
              <li>Improve our website and user experience</li>
              <li>Detect and prevent fraudulent activity</li>
              <li>Comply with legal obligations</li>
              <li>Send marketing communications (with your consent)</li>
            </ul>
          </section>

          <section>
            <h2>4. Data Security</h2>
            <p>We implement industry-standard security measures including SSL encryption, secure payment processing, and restricted data access. However, no method of transmission over the internet is 100% secure. If you have security concerns, contact us immediately.</p>
          </section>

          <section>
            <h2>5. Your Rights</h2>
            <p>Depending on your location, you may have the right to:</p>
            <ul>
              <li>Access your personal data</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of marketing communications</li>
              <li>Data portability</li>
            </ul>
            <p>To exercise these rights, contact us at privacy@techwholesale.com</p>
          </section>

          <section>
            <h2>6. Third-Party Sharing</h2>
            <p>We do not sell your personal data. We may share information with:</p>
            <ul>
              <li>Payment processors (for secure transactions)</li>
              <li>Shipping carriers (for order delivery)</li>
              <li>Analytics providers (aggregated, non-identifying data)</li>
              <li>Legal authorities (when required by law)</li>
            </ul>
          </section>

          <section>
            <h2>7. Cookies</h2>
            <p>We use cookies to enhance your experience. You can control cookies through your browser settings, but this may limit site functionality.</p>
          </section>

          <section>
            <h2>8. Changes to This Policy</h2>
            <p>We may update this Privacy Policy periodically. Changes take effect when posted. Continued use of our site constitutes acceptance of changes.</p>
          </section>

          <section>
            <h2>9. Contact Us</h2>
            <p>For privacy concerns or questions:</p>
            <ul>
              <li>Email: privacy@techwholesale.com</li>
              <li>Mail: TechWholesale, 123 Tech Plaza, San Francisco, CA 94102</li>
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

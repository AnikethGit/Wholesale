import Layout from '@/components/Layout';
import Link from 'next/link';
import styles from '@/styles/HelpPage.module.css';

export default function ReturnsPolicy() {
  return (
    <Layout title="Returns Policy" description="Easy 30-day returns on all products">
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Returns & Refunds Policy</h1>
          <p>Hassle-free returns within 30 days</p>
        </div>

        <div className={styles.content}>
          <section>
            <h2>Return Window</h2>
            <p>You have <strong>30 days</strong> from the delivery date to return any item for a full refund, no questions asked. Items must be in original condition with all packaging and accessories.</p>
          </section>

          <section>
            <h2>What Can Be Returned?</h2>
            <p>Most items are returnable, including:</p>
            <ul>
              <li>Electronics</li>
              <li>Accessories</li>
              <li>Open-box items (if unused)</li>
              <li>Defective or damaged products</li>
            </ul>
            <p><strong>Non-returnable items:</strong> Items marked "final sale," custom orders, clearance items, or items without packaging/serial numbers.</p>
          </section>

          <section>
            <h2>How to Return</h2>
            <ol>
              <li>Log into your account at <Link href="/account/orders">My Orders</Link></li>
              <li>Select the order and click "Request Return"</li>
              <li>Choose a reason and generate a prepaid shipping label</li>
              <li>Pack the item securely with all original materials</li>
              <li>Drop off at any carrier location or arrange pickup</li>
            </ol>
          </section>

          <section>
            <h2>Refund Processing</h2>
            <p>Once we receive and inspect your return:</p>
            <ul>
              <li>Inspection: 3-5 business days</li>
              <li>Refund processing: 5-7 business days</li>
              <li>Bank deposit: 3-5 business days (varies by bank)</li>
            </ul>
            <p>Original shipping costs are non-refundable. Return shipping is prepaid by us.</p>
          </section>

          <section>
            <h2>Defective or Damaged Items</h2>
            <p>If you receive a defective or damaged item:</p>
            <ol>
              <li>Report within 14 days of delivery</li>
              <li>Provide photos showing the damage</li>
              <li>We'll send a replacement or process a refund immediately</li>
              <li>Return shipping label provided at no cost</li>
            </ol>
          </section>

          <section>
            <h2>Wholesale Returns</h2>
            <p>Bulk orders have a 14-day return window. Contact our wholesale team for specific terms and return processes.</p>
          </section>

          <section>
            <h2>Exceptions</h2>
            <p>We may deny returns for:</p>
            <ul>
              <li>Items with visible signs of use or wear</li>
              <li>Missing original packaging or accessories</li>
              <li>Items returned after 30 days</li>
              <li>Unauthorized returns without RMA number</li>
            </ul>
          </section>

          <section>
            <h2>Contact Support</h2>
            <p>Return questions?</p>
            <ul>
              <li>Email: returns@techwholesale.com</li>
              <li>Phone: +1 (800) 555-TECH</li>
              <li>Chat: Available 9am–6pm PST, Mon–Fri</li>
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

import Layout from '@/components/Layout';
import Link from 'next/link';
import { useState } from 'react';
import styles from '@/styles/FAQ.module.css';

export default function FAQ() {
  const [expanded, setExpanded] = useState(null);

  const faqs = [
    {
      category: 'Account & Orders',
      items: [
        { q: 'How do I create an account?', a: 'Click "Register" at the top of the page. Fill in your email, password, and personal details. Your account is instant!' },
        { q: 'Can I change my email address?', a: 'Yes, go to Settings in your Account and update your email. You\'ll need to verify the new email address.' },
        { q: 'How do I reset my password?', a: 'Click "Forgot Password" on the login page. We\'ll send you a reset link via email.' },
        { q: 'How long do orders take?', a: 'Most orders ship within 24 hours. Delivery is 2–5 days for standard shipping, 1–2 days for express.' },
        { q: 'Can I modify or cancel my order?', a: 'If your order hasn\'t shipped, contact us at support@techwholesale.com within 2 hours. Most shipping orders can\'t be stopped.' }
      ]
    },
    {
      category: 'Shipping & Delivery',
      items: [
        { q: 'Do you offer free shipping?', a: 'Yes! Free standard shipping on orders over $150. Otherwise, standard shipping is $9.99.' },
        { q: 'Where do you ship?', a: 'We ship to all 50 US states, Canada, and select international locations.' },
        { q: 'How do I track my order?', a: 'You\'ll receive a tracking number via email. Use our Track Order page or the carrier\'s website to monitor your package.' },
        { q: 'What if my package is lost or damaged?', a: 'Report it within 30 days with photos and your tracking number. We\'ll work with the carrier to send a replacement or refund.' },
        { q: 'Do you ship internationally?', a: 'Yes, to select countries. International orders may incur customs duties and taxes payable by the recipient.' }
      ]
    },
    {
      category: 'Returns & Refunds',
      items: [
        { q: 'What\'s your return policy?', a: '30-day hassle-free returns. Items must be in original condition with all packaging and accessories.' },
        { q: 'How do I return an item?', a: 'Go to My Orders, select the item, and click "Request Return". We\'ll email you a prepaid shipping label.' },
        { q: 'How long until I get my refund?', a: 'After we receive your return (3–5 days), we process the refund in 5–7 business days. Your bank takes 3–5 more days to deposit it.' },
        { q: 'Do you refund shipping costs?', a: 'Original shipping is non-refundable, but we provide prepaid return shipping at no cost.' },
        { q: 'Can I return defective items?', a: 'Absolutely! Report defects within 14 days. We\'ll replace or refund immediately with prepaid return shipping.' }
      ]
    },
    {
      category: 'Payments & Pricing',
      items: [
        { q: 'What payment methods do you accept?', a: 'Credit cards (Visa, Mastercard, Amex), debit cards, PayPal, and Apple Pay.' },
        { q: 'Is my payment secure?', a: 'Yes! We use 256-bit SSL encryption and PCI-compliant payment processors. Your card details are never stored.' },
        { q: 'Do you offer payment plans?', a: 'Currently no, but we accept all major payment methods. Check back for financing options.' },
        { q: 'Why is tax applied?', a: 'We collect sales tax based on your shipping address as required by law. Tax rates vary by state.' },
        { q: 'Do you price match?', a: 'We offer competitive pricing. Contact us with a quote from another retailer, and we\'ll consider matching it.' }
      ]
    },
    {
      category: 'Products & Stock',
      items: [
        { q: 'Are products brand new?', a: 'Yes, all items are new and sealed unless marked as "open-box" or "refurbished" in the listing.' },
        { q: 'Do you carry refurbished items?', a: 'Some products are available refurbished at a discount. Check the product page for condition details.' },
        { q: 'How do I know if something is in stock?', a: 'Check the product page. "In Stock" means it\'s ready to ship. Pre-orders will show the expected ship date.' },
        { q: 'Can I reserve an out-of-stock item?', a: 'Yes, click "Notify Me" on the product page. We\'ll email when it\'s back in stock.' },
        { q: 'Do you accept bulk orders?', a: 'Yes! Join our wholesale program for bulk pricing. Email wholesale@techwholesale.com or call +1 (800) 555-TECH.' }
      ]
    },
    {
      category: 'Wholesale & B2B',
      items: [
        { q: 'How do I access wholesale pricing?', a: 'Apply for our wholesale program at Register > Wholesale Option. Bulk orders get tiered discounts.' },
        { q: 'What discount does wholesale offer?', a: 'Discounts scale with order volume: 5–10% for 10+ units, 15–25% for 50+ units, and custom rates for 200+ unit orders.' },
        { q: 'Do you offer net payment terms?', a: 'Yes, approved B2B customers can request net 30 or net 60 payment terms.' },
        { q: 'Who do I contact for wholesale questions?', a: 'Email wholesale@techwholesale.com or call +1 (800) 555-TECH, ext. 2. Available Mon–Fri, 9am–6pm PST.' }
      ]
    }
  ];

  const toggleExpand = (index) => {
    setExpanded(expanded === index ? null : index);
  };

  return (
    <Layout title="FAQ" description="Frequently asked questions and answers">
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.eyebrow}>Help Center</div>
          <h1>Frequently Asked Questions</h1>
          <p>Find answers to common questions about TechWholesale</p>
        </div>

        <div className={styles.content}>
          {faqs.map((section, sectionIdx) => (
            <div key={sectionIdx} className={styles.section}>
              <h2>{section.category}</h2>
              <div className={styles.faqList}>
                {section.items.map((faq, itemIdx) => {
                  const globalIdx = faqs.slice(0, sectionIdx).reduce((sum, s) => sum + s.items.length, 0) + itemIdx;
                  return (
                    <div key={itemIdx} className={styles.faqItem}>
                      <button
                        className={`${styles.question} ${expanded === globalIdx ? styles.expanded : ''}`}
                        onClick={() => toggleExpand(globalIdx)}
                      >
                        <span>{faq.q}</span>
                        <i className="fas fa-chevron-down" />
                      </button>
                      {expanded === globalIdx && (
                        <div className={styles.answer}>
                          <p>{faq.a}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className={styles.contactSection}>
          <h2>Didn't find your answer?</h2>
          <p>We're here to help! Reach out to our support team.</p>
          <div className={styles.contactLinks}>
            <a href="mailto:support@techwholesale.com" className={styles.contactBtn}>
              <i className="fas fa-envelope" /> Email Support
            </a>
            <a href="tel:+18005555832" className={styles.contactBtn}>
              <i className="fas fa-phone" /> +1 (800) 555-TECH
            </a>
            <Link href="/help/shipping" className={styles.contactBtn}>
              <i className="fas fa-book" /> View All Policies
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}

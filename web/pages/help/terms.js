import Layout from '@/components/Layout';
import Link from 'next/link';
import styles from '@/styles/HelpPage.module.css';

export default function Terms() {
  return (
    <Layout title="Terms & Conditions" description="Our terms of service and conditions">
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Terms & Conditions</h1>
          <p>Last updated: April 2026</p>
        </div>

        <div className={styles.content}>
          <section>
            <h2>1. Acceptance of Terms</h2>
            <p>By accessing and using the TechWholesale website and services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.</p>
          </section>

          <section>
            <h2>2. Use License</h2>
            <p>Permission is granted to temporarily download one copy of the materials (information or software) on TechWholesale's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
            <ul>
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or any public display</li>
              <li>Attempt to decompile or reverse engineer any software</li>
              <li>Remove any copyright or other proprietary notations</li>
              <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
            </ul>
          </section>

          <section>
            <h2>3. Disclaimer</h2>
            <p>The materials on TechWholesale's website are provided on an 'as is' basis. TechWholesale makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
          </section>

          <section>
            <h2>4. Limitations of Liability</h2>
            <p>In no event shall TechWholesale or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on TechWholesale's website, even if TechWholesale or a TechWholesale authorized representative has been notified orally or in writing of the possibility of such damage.</p>
          </section>

          <section>
            <h2>5. Accuracy of Materials</h2>
            <p>The materials appearing on TechWholesale's website could include technical, typographical, or photographic errors. TechWholesale does not warrant that any of the materials on its website are accurate, complete, or current. TechWholesale may make changes to the materials contained on its website at any time without notice.</p>
          </section>

          <section>
            <h2>6. Materials, Products, and Services</h2>
            <p>The materials and products on TechWholesale's website are subject to change without notice. We reserve the right to limit quantities and discontinue any products at any time. Prices are subject to change without notice.</p>
          </section>

          <section>
            <h2>7. Account Responsibility</h2>
            <p>If you create an account on our website, you are responsible for maintaining the confidentiality of your account information and password and for restricting access to your computer. You agree to accept responsibility for all activities that occur under your account. You agree to notify us immediately of any unauthorized uses of your account.</p>
          </section>

          <section>
            <h2>8. Prohibited Conduct</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on any intellectual property rights</li>
              <li>Harass, threaten, defame, or abuse anyone</li>
              <li>Post spam, viruses, or malicious code</li>
              <li>Attempt to gain unauthorized access to our systems</li>
            </ul>
          </section>

          <section>
            <h2>9. Third-Party Links</h2>
            <p>TechWholesale has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by TechWholesale of the site. Use of any such linked website is at the user's own risk.</p>
          </section>

          <section>
            <h2>10. Modifications</h2>
            <p>TechWholesale may revise these terms and conditions for its website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms and conditions.</p>
          </section>

          <section>
            <h2>11. Governing Law</h2>
            <p>The materials and information on TechWholesale's website are governed by and construed in accordance with the laws of California, United States, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.</p>
          </section>

          <section>
            <h2>12. Contact</h2>
            <p>If you have any questions about these terms, please contact us:</p>
            <ul>
              <li>Email: legal@techwholesale.com</li>
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

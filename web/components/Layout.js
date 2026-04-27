import Head from 'next/head';
import Header from './Header';
import Footer from './Footer';

export default function Layout({ children, title = 'BestWholesale', description = 'Premium products at wholesale prices' }) {
  return (
    <>
      <Head>
        <title>{title === 'BestWholesale' ? title : `${title} | BestWholesale`}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header />
        <main style={{ flex: 1 }}>{children}</main>
        <Footer />
      </div>
    </>
  );
}

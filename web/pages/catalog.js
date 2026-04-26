import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import api from '@/lib/api';
import styles from '@/styles/Catalog.module.css';

// Category-to-gradient and emoji mapping for visual variety
const CATEGORY_STYLE = {
  smartphones:    { bg: 'linear-gradient(135deg,#1a2340 0%,#2a3560 100%)', icon: '📱' },
  'earbuds-audio':{ bg: 'linear-gradient(135deg,#1e3a2f 0%,#2a5240 100%)', icon: '🎧' },
  laptops:        { bg: 'linear-gradient(135deg,#3d1a1a 0%,#5a2020 100%)', icon: '💻' },
  accessories:    { bg: 'linear-gradient(135deg,#3d2a1a 0%,#5a3d2a 100%)', icon: '🔌' },
  'computer-parts':{ bg: 'linear-gradient(135deg,#1e2a1a 0%,#2a3d2a 100%)', icon: '🖥️' },
  wearables:      { bg: 'linear-gradient(135deg,#1a1a2a 0%,#2a2a40 100%)', icon: '⌚' },
  default:        { bg: 'linear-gradient(135deg,#2a1a3d 0%,#3d2a54 100%)', icon: '📦' },
};

function getCategoryStyle(slug) {
  return CATEGORY_STYLE[slug] || CATEGORY_STYLE.default;
}

export default function Catalog() {
  const router = useRouter();
  const { search, category, sort, page = 1 } = router.query;

  const [products, setProducts]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, pages: 0 });
  const [filters, setFilters]       = useState({
    search: search || '', category: category || '',
    sort: sort || 'newest', minPrice: '', maxPrice: ''
  });

  useEffect(() => {
    api.get('/products/categories/list').then((res) => {
      if (res.data) setCategories(res.data.data || []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filters.search)   params.append('search',   filters.search);
        if (filters.category) params.append('category', filters.category);
        if (filters.sort)     params.append('sort',     filters.sort);
        if (filters.minPrice) params.append('minPrice', filters.minPrice);
        if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
        params.append('page',  page);
        params.append('limit', pagination.limit);
        const res = await api.get(`/products?${params}`);
        if (res.data) {
          setProducts(res.data.data || []);
          setPagination(res.data.pagination || { page: 1, limit: 12, total: 0, pages: 0 });
        }
      } catch {}
      finally { setLoading(false); }
    };
    fetchProducts();
  }, [filters, page]);

  const handleFilterChange = (key, value) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
    const params = new URLSearchParams();
    Object.entries(next).forEach(([k, v]) => { if (v) params.append(k, v); });
    router.push(`/catalog?${params}`);
  };

  const clearFilters = () => {
    setFilters({ search: '', category: '', sort: 'newest', minPrice: '', maxPrice: '' });
    router.push('/catalog');
  };

  const stars = (r) => '★'.repeat(Math.floor(r || 0)) + (r % 1 ? '★' : '');

  return (
    <Layout title="Shop Products" description="Browse our complete product catalog">
      <div className={styles.container}>

        {/* ── PAGE HERO ── */}
        <div className={styles.header}>
          <div className={styles.headerEyebrow}>Our Catalogue</div>
          <h1>Shop Products</h1>
          <p>Find exactly what you're looking for</p>
        </div>

        <div className={styles.content}>
          {/* ── SIDEBAR FILTERS ── */}
          <aside className={styles.sidebar}>
            <div className={styles.filterGroup}>
              <h3>Search</h3>
              <input type="text" placeholder="Search products…"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className={styles.searchInput}
              />
            </div>

            <div className={styles.filterGroup}>
              <h3>Category</h3>
              <select value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className={styles.select}
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <h3>Price Range</h3>
              <div className={styles.priceInputs}>
                <input type="number" placeholder="Min" value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  className={styles.priceInput}
                />
                <input type="number" placeholder="Max" value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className={styles.priceInput}
                />
              </div>
            </div>

            <div className={styles.filterGroup}>
              <h3>Sort By</h3>
              <select value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className={styles.select}
              >
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>

            <button className={styles.clearBtn} onClick={clearFilters}>
              Clear Filters
            </button>
          </aside>

          {/* ── PRODUCTS GRID ── */}
          <main className={styles.main}>
            {loading ? (
              <div className={styles.loading}>Loading products…</div>
            ) : products.length === 0 ? (
              <div className={styles.empty}>
                <p>No products found. Try adjusting your filters.</p>
              </div>
            ) : (
              <>
                <div className={styles.grid}>
                  {products.map((product) => {
                    const { bg, icon } = getCategoryStyle(product.category_slug || '');
                    return (
                      <Link key={product.id} href={`/product/${product.id}`} className={styles.cardLink}>
                        <div className={styles.card}>
                          {/* Coloured image area */}
                          <div className={styles.imageContainer}>
                            <div className={styles.image} style={{ background: bg }}>
                              <div className={styles.cardIcon}>{icon}</div>
                              {product.is_featured && (
                                <span className={styles.badge}>Featured</span>
                              )}
                            </div>
                          </div>
                          {/* Card body */}
                          <div className={styles.body}>
                            <p className={styles.category}>{product.category_name}</p>
                            <h3 className={styles.name}>{product.name}</h3>
                            <div className={styles.rating}>
                              <span className={styles.stars}>{stars(product.rating || 0)}</span>
                              <span className={styles.ratingCount}>({product.review_count || 0})</span>
                            </div>
                            <div className={styles.footer}>
                              <span className={styles.price}>${product.price}</span>
                              {product.compare_at_price && (
                                <span className={styles.oldPrice}>${product.compare_at_price}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className={styles.pagination}>
                    <button
                      className={styles.pageBtn}
                      disabled={Number(page) <= 1}
                      onClick={() => router.push(`/catalog?page=${Number(page) - 1}`)}
                    >← Prev</button>
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        className={`${styles.pageBtn} ${p === Number(page) ? styles.active : ''}`}
                        onClick={() => router.push(`/catalog?page=${p}`)}
                      >{p}</button>
                    ))}
                    <button
                      className={styles.pageBtn}
                      disabled={Number(page) >= pagination.pages}
                      onClick={() => router.push(`/catalog?page=${Number(page) + 1}`)}
                    >Next →</button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </Layout>
  );
}

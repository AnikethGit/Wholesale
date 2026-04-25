import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import api from '@/lib/api';
import styles from '@/styles/Catalog.module.css';

export default function Catalog() {
  const router = useRouter();
  const { search, category, sort, page = 1 } = router.query;

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0 });
  const [filters, setFilters] = useState({
    search: search || '',
    category: category || '',
    sort: sort || 'newest',
    minPrice: '',
    maxPrice: ''
  });

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/products/categories/list');
        if (response.data) setCategories(response.data.data || []);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filters.search) params.append('search', filters.search);
        if (filters.category) params.append('category', filters.category);
        if (filters.sort) params.append('sort', filters.sort);
        if (filters.minPrice) params.append('minPrice', filters.minPrice);
        if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
        params.append('page', page);
        params.append('limit', pagination.limit);

        const response = await api.get(`/products?${params.toString()}`);
        if (response.data) {
          setProducts(response.data.data || []);
          setPagination(response.data.pagination || { page: 1, limit: 12, total: 0, pages: 0 });
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters, page, pagination.limit]);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    // Update URL
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.append(k, v);
    });
    router.push(`/catalog?${params.toString()}`);
  };

  return (
    <Layout title="Shop Products" description="Browse our complete product catalog">
      <div className={styles.container}>
      <div className={styles.header}>
        <h1>Shop Products</h1>
        <p>Find exactly what you're looking for</p>
      </div>

      <div className={styles.content}>
        {/* Sidebar Filters */}
        <aside className={styles.sidebar}>
          <div className={styles.filterGroup}>
            <h3>Search</h3>
            <input
              type="text"
              placeholder="Search products..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.filterGroup}>
            <h3>Category</h3>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className={styles.select}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <h3>Price Range</h3>
            <div className={styles.priceInputs}>
              <input
                type="number"
                placeholder="Min"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                className={styles.priceInput}
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                className={styles.priceInput}
              />
            </div>
          </div>

          <div className={styles.filterGroup}>
            <h3>Sort By</h3>
            <select
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              className={styles.select}
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>

          <button
            className={styles.clearBtn}
            onClick={() => {
              setFilters({
                search: '',
                category: '',
                sort: 'newest',
                minPrice: '',
                maxPrice: ''
              });
              router.push('/catalog');
            }}
          >
            Clear Filters
          </button>
        </aside>

        {/* Products Grid */}
        <main className={styles.main}>
          {loading ? (
            <div className={styles.loading}>Loading products...</div>
          ) : products.length === 0 ? (
            <div className={styles.empty}>
              <p>No products found. Try adjusting your filters.</p>
            </div>
          ) : (
            <>
              <div className={styles.grid}>
                {products.map((product) => (
                  <Link key={product.id} href={`/product/${product.id}`}>
                    <div className={styles.card}>
                      <div className={styles.imageContainer}>
                        <div
                          className={styles.image}
                          style={{
                            background: `linear-gradient(135deg, #1a2340 0%, #2a3560 100%)`
                          }}
                        >
                          {product.is_featured && (
                            <span className={styles.badge}>Featured</span>
                          )}
                        </div>
                      </div>
                      <div className={styles.body}>
                        <p className={styles.category}>{product.category_name}</p>
                        <h3 className={styles.name}>{product.name}</h3>
                        <div className={styles.rating}>
                          {'★'.repeat(Math.floor(product.rating || 0))}
                          {product.rating % 1 !== 0 ? '★' : ''}
                          {' '}
                          <span>({product.review_count})</span>
                        </div>
                        <div className={styles.footer}>
                          <div>
                            <span className={styles.price}>${product.price}</span>
                            {product.compare_at_price && (
                              <span className={styles.oldPrice}>
                                ${product.compare_at_price}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className={styles.pagination}>
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(
                    (p) => (
                      <button
                        key={p}
                        className={`${styles.pageBtn} ${p === pagination.page ? styles.active : ''}`}
                        onClick={() => router.push(`/catalog?page=${p}`)}
                      >
                        {p}
                      </button>
                    )
                  )}
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

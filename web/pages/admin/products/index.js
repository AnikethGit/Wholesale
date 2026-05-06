import { useState, useEffect, useCallback, useRef } from 'react';
import AdminLayout from '@/components/AdminLayout';
import api from '@/lib/api';
import styles from '@/styles/AdminProducts.module.css';

const EMPTY_FORM = {
  name: '', sku: '', slug: '', category_id: '',
  price: '', compare_at_price: '', cost_price: '',
  quantity: '', description: '', short_description: '',
  is_featured: false, is_active: true,
  image_url: '',
};

function slugify(str) {
  return str.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace('/api', '');

// Resolve image URL — handles both absolute URLs and relative /uploads/... paths
function resolveImg(url) {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${API_BASE}${url}`;
}

export default function AdminProducts() {
  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [pagination, setPagination] = useState({ page: 1, total: 0 });
  const [search,     setSearch]     = useState('');
  const [modal,      setModal]      = useState(null);
  const [selected,   setSelected]   = useState(null);
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState('');
  const [imgPreview, setImgPreview] = useState('');
  const [uploading,  setUploading]  = useState(false);
  const fileRef = useRef(null);

  const fetchProducts = useCallback(async (page = 1, q = search) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (q) params.append('search', q);
      const res = await api.get(`/admin/products?${params}`);
      if (res.data) {
        setProducts(res.data.data || []);
        setPagination({ page, total: res.data.pagination?.total || 0 });
      }
    } catch {} finally { setLoading(false); }
  }, [search]);

  useEffect(() => {
    fetchProducts(1, '');
    api.get('/products/categories/list').then(r => {
      if (r.data) setCategories(r.data.data || []);
    }).catch(() => {});
  }, []);

  // ── Image upload ───────────────────────────────────────────────────────────
  const handleImagePick = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Local preview
    const reader = new FileReader();
    reader.onload = (ev) => setImgPreview(ev.target.result);
    reader.readAsDataURL(file);

    // Upload to server
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const raw = localStorage.getItem('auth-storage');
      const token = raw ? JSON.parse(raw)?.state?.accessToken : null;
      const res = await fetch(`${API_BASE}/api/admin/products/upload-image`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      const data = await res.json();
      if (data.url) {
        setForm(prev => ({ ...prev, image_url: data.url }));
      } else {
        setError(data.message || 'Image upload failed');
      }
    } catch {
      setError('Image upload failed');
    } finally { setUploading(false); }
  };

  // ── Modal helpers ──────────────────────────────────────────────────────────
  const openCreate = () => {
    setForm(EMPTY_FORM); setImgPreview(''); setError(''); setModal('create');
  };
  const openEdit = (p) => {
    setSelected(p);
    setForm({
      name:              p.name              || '',
      sku:               p.sku               || '',
      slug:              p.slug              || '',
      category_id:       p.category_id       || '',
      price:             p.price             || '',
      compare_at_price:  p.compare_at_price  || '',
      cost_price:        p.cost_price        || '',
      quantity:          p.quantity          ?? '',
      description:       p.description       || '',
      short_description: p.short_description || '',
      is_featured:       !!p.is_featured,
      is_active:         p.is_active === undefined ? true : !!p.is_active,
      image_url:         p.image_url         || '',
    });
    setImgPreview(p.image_url || '');
    setError(''); setModal('edit');
  };
  const openDelete = (p) => { setSelected(p); setModal('delete'); };
  const closeModal = () => { setModal(null); setSelected(null); setError(''); setImgPreview(''); };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        ...form,
        category_id:      parseInt(form.category_id),
        price:            parseFloat(form.price),
        compare_at_price: form.compare_at_price ? parseFloat(form.compare_at_price) : null,
        cost_price:       form.cost_price        ? parseFloat(form.cost_price)       : null,
        quantity:         parseInt(form.quantity) || 0,
        thumbnail_url:    form.image_url || null,
      };
      let res;
      if (modal === 'create') {
        res = await api.post('/admin/products', payload);
        if (res.status !== 201) throw new Error(res.data?.errors?.[0]?.msg || res.data?.message || 'Failed to create');
      } else {
        res = await api.patch(`/admin/products/${selected.id}`, payload);
        if (res.status !== 200) throw new Error(res.data?.message || 'Failed to update');
      }
      closeModal();
      fetchProducts(pagination.page, search);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await api.delete(`/admin/products/${selected.id}`);
      closeModal();
      fetchProducts(pagination.page, search);
    } catch { setError('Failed to delete product'); }
    finally { setSaving(false); }
  };

  const handleSearch = (e) => { e.preventDefault(); fetchProducts(1, search); };

  const f = (key) => ({
    value: form[key],
    onChange: (e) => {
      const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
      setForm(prev => {
        const next = { ...prev, [key]: val };
        if (key === 'name' && modal === 'create') next.slug = slugify(val);
        return next;
      });
    },
  });

  const totalPages = Math.ceil(pagination.total / 20);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <AdminLayout title="Products">

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <form className={styles.searchWrap} onSubmit={handleSearch}>
          <i className="fas fa-search" />
          <input placeholder="Search by name or SKU…" value={search} onChange={e => setSearch(e.target.value)} />
          <button type="submit">Search</button>
        </form>
        <button className={styles.createBtn} onClick={openCreate}>
          <i className="fas fa-plus" /> Add Product
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className={styles.loading}><i className="fas fa-spinner fa-spin" /> Loading…</div>
      ) : products.length === 0 ? (
        <div className={styles.empty}>
          No products found.{' '}
          <button className={styles.inlineBtn} onClick={openCreate}>Add the first one →</button>
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Product</th><th>SKU</th><th>Category</th>
                <th>Price</th><th>Stock</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td>
                    <div className={styles.productCell}>
                      <div className={styles.productThumb}>
                        {p.image_url || p.thumbnail_url
                          ? <img src={resolveImg(p.image_url || p.thumbnail_url)} alt={p.name} />
                          : <span>📦</span>
                        }
                      </div>
                      <div>
                        <div className={styles.productName}>{p.name}</div>
                        {p.is_featured && <span className={styles.featuredTag}>Featured</span>}
                      </div>
                    </div>
                  </td>
                  <td><span className={styles.mono}>{p.sku}</span></td>
                  <td className={styles.muted}>{p.category_name || '—'}</td>
                  <td>
                    <div className={styles.priceCell}>
                      <span className={styles.price}>${Number(p.price).toFixed(2)}</span>
                      {p.compare_at_price && <span className={styles.comparePrice}>${Number(p.compare_at_price).toFixed(2)}</span>}
                    </div>
                  </td>
                  <td>
                    <span className={`${styles.stockBadge} ${p.quantity <= 0 ? styles.stockOut : p.quantity <= (p.low_stock_level || 10) ? styles.stockLow : styles.stockOk}`}>
                      {p.quantity}
                    </span>
                  </td>
                  <td>
                    <span className={`${styles.statusDot} ${p.is_active ? styles.active : styles.inactive}`}>
                      {p.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button className={styles.editBtn} onClick={() => openEdit(p)}><i className="fas fa-pen" /> Edit</button>
                      <button className={styles.deleteBtn} onClick={() => openDelete(p)}><i className="fas fa-trash" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button disabled={pagination.page <= 1} onClick={() => fetchProducts(pagination.page - 1, search)} className={styles.pageBtn}>← Prev</button>
          <span className={styles.pageInfo}>Page {pagination.page} of {totalPages} · {pagination.total} products</span>
          <button disabled={pagination.page >= totalPages} onClick={() => fetchProducts(pagination.page + 1, search)} className={styles.pageBtn}>Next →</button>
        </div>
      )}

      {/* ── Create / Edit Modal ── */}
      {(modal === 'create' || modal === 'edit') && (
        <div className={styles.overlay} onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>{modal === 'create' ? 'Add New Product' : 'Edit Product'}</h2>
              <button className={styles.closeBtn} onClick={closeModal}><i className="fas fa-times" /></button>
            </div>

            <form onSubmit={handleSubmit} className={styles.modalForm}>
              <div className={styles.modalBody}>

                {/* Image upload */}
                <div className={styles.imageSection}>
                  <div className={styles.imagePreviewWrap} onClick={() => fileRef.current?.click()}>
                    {imgPreview || form.image_url ? (
                      <img src={imgPreview || resolveImg(form.image_url)} alt="Product" className={styles.imagePreview} />
                    ) : (
                      <div className={styles.imagePlaceholder}>
                        <i className="fas fa-cloud-upload-alt" />
                        <span>Click to upload image</span>
                        <small>JPG, PNG, WebP · Max 5 MB</small>
                      </div>
                    )}
                    {uploading && (
                      <div className={styles.imageUploading}>
                        <i className="fas fa-spinner fa-spin" /> Uploading…
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileRef} type="file" accept="image/*"
                    className={styles.fileInput} onChange={handleImagePick}
                  />
                  <div className={styles.imageActions}>
                    <button type="button" className={styles.uploadBtn} onClick={() => fileRef.current?.click()} disabled={uploading}>
                      <i className="fas fa-upload" /> {imgPreview || form.image_url ? 'Change Image' : 'Upload Image'}
                    </button>
                    {(imgPreview || form.image_url) && (
                      <button type="button" className={styles.removeImgBtn} onClick={() => { setImgPreview(''); setForm(p => ({ ...p, image_url: '' })); }}>
                        <i className="fas fa-times" /> Remove
                      </button>
                    )}
                  </div>
                  {form.image_url && !uploading && (
                    <div className={styles.imageUrlNote}><i className="fas fa-check-circle" /> Image uploaded</div>
                  )}
                </div>

                {/* Row 1 */}
                <div className={styles.row2}>
                  <div className={styles.field}>
                    <label>Product Name *</label>
                    <input {...f('name')} placeholder="e.g. iPhone 16 Pro" required />
                  </div>
                  <div className={styles.field}>
                    <label>SKU *</label>
                    <input {...f('sku')} placeholder="e.g. APPLE-IP16PRO" required />
                  </div>
                </div>

                {/* Row 2 */}
                <div className={styles.row2}>
                  <div className={styles.field}>
                    <label>Slug *</label>
                    <input {...f('slug')} placeholder="auto-generated from name" required />
                    <span className={styles.hint}>Auto-filled from name.</span>
                  </div>
                  <div className={styles.field}>
                    <label>Category *</label>
                    <select {...f('category_id')} required>
                      <option value="">Select category…</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>

                {/* Prices */}
                <div className={styles.row3}>
                  <div className={styles.field}>
                    <label>Price ($) *</label>
                    <input type="number" step="0.01" min="0" {...f('price')} placeholder="0.00" required />
                  </div>
                  <div className={styles.field}>
                    <label>Compare-at ($)</label>
                    <input type="number" step="0.01" min="0" {...f('compare_at_price')} placeholder="0.00" />
                    <span className={styles.hint}>Shown as strikethrough.</span>
                  </div>
                  <div className={styles.field}>
                    <label>Cost ($)</label>
                    <input type="number" step="0.01" min="0" {...f('cost_price')} placeholder="0.00" />
                    <span className={styles.hint}>Internal only.</span>
                  </div>
                </div>

                {/* Stock + Short desc */}
                <div className={styles.row2}>
                  <div className={styles.field}>
                    <label>Stock Quantity *</label>
                    <input type="number" min="0" {...f('quantity')} placeholder="0" required />
                  </div>
                  <div className={styles.field}>
                    <label>Short Description</label>
                    <input {...f('short_description')} placeholder="One-line summary…" />
                  </div>
                </div>

                {/* Description */}
                <div className={styles.field}>
                  <label>Full Description</label>
                  <textarea rows={4} value={form.description}
                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                    placeholder="Detailed product description…" className={styles.textarea} />
                </div>

                {/* Toggles */}
                <div className={styles.toggleRow}>
                  <label className={styles.toggle}>
                    <input type="checkbox" checked={form.is_featured}
                      onChange={e => setForm(p => ({ ...p, is_featured: e.target.checked }))} />
                    <span className={styles.toggleSlider} /> Featured product
                  </label>
                  <label className={styles.toggle}>
                    <input type="checkbox" checked={form.is_active}
                      onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))} />
                    <span className={styles.toggleSlider} /> Active (visible in store)
                  </label>
                </div>

                {error && <div className={styles.errorBox}><i className="fas fa-exclamation-circle" /> {error}</div>}
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelBtn} onClick={closeModal}>Cancel</button>
                <button type="submit" className={styles.saveBtn} disabled={saving || uploading}>
                  {saving
                    ? <><i className="fas fa-spinner fa-spin" /> Saving…</>
                    : <><i className="fas fa-check" /> {modal === 'create' ? 'Create Product' : 'Save Changes'}</>
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Modal ── */}
      {modal === 'delete' && selected && (
        <div className={styles.overlay} onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className={`${styles.modal} ${styles.modalSm}`}>
            <div className={styles.modalHeader}>
              <h2>Delete Product</h2>
              <button className={styles.closeBtn} onClick={closeModal}><i className="fas fa-times" /></button>
            </div>
            <div className={styles.deleteBody}>
              <div className={styles.deleteIcon}><i className="fas fa-trash-alt" /></div>
              <p>Are you sure you want to delete</p>
              <strong>"{selected.name}"</strong>
              <p className={styles.deleteWarn}>This permanently removes the product and cannot be undone.</p>
              {error && <div className={styles.errorBox}>{error}</div>}
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={closeModal}>Cancel</button>
              <button className={styles.confirmDeleteBtn} onClick={handleDelete} disabled={saving}>
                {saving ? 'Deleting…' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import api from '@/lib/api';
import useCartStore from '@/store/cartStore';
import styles from '@/styles/Product.module.css';

export default function ProductDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const { addItem } = useCartStore();

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`);
        setProduct(response.data.product);
        if (response.data.product.variants?.length > 0) {
          setSelectedVariant(response.data.product.variants[0]);
        }
      } catch (error) {
        console.error('Failed to fetch product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    setAddingToCart(true);
    try {
      await addItem(product.id, quantity, selectedVariant?.id);
      // Show success message
      alert('Added to cart!');
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (!product) {
    return <div className={styles.error}>Product not found</div>;
  }

  const discount = product.compare_at_price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0;

  return (
    <div className={styles.container}>
      <nav className={styles.breadcrumb}>
        <Link href="/catalog">Catalog</Link>
        <span>/</span>
        <span>{product.category_name}</span>
        <span>/</span>
        <span>{product.name}</span>
      </nav>

      <div className={styles.content}>
        {/* Product Images */}
        <div className={styles.imageSection}>
          <div className={styles.mainImage}>
            <div
              style={{
                background: `linear-gradient(135deg, #1a2340 0%, #2a3560 100%)`,
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '120px'
              }}
            >
              📱
            </div>
          </div>

          {product.images?.length > 0 && (
            <div className={styles.thumbnails}>
              {product.images.map((img, idx) => (
                <div key={idx} className={styles.thumbnail}></div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className={styles.infoSection}>
          <div className={styles.header}>
            <h1>{product.name}</h1>
            <p className={styles.sku}>SKU: {product.sku}</p>
          </div>

          <div className={styles.rating}>
            <div className={styles.stars}>
              {'★'.repeat(Math.floor(product.rating))}
              {product.rating % 1 !== 0 ? '★' : ''}
            </div>
            <span>({product.review_count} reviews)</span>
          </div>

          <div className={styles.pricing}>
            <span className={styles.price}>${product.price}</span>
            {product.compare_at_price && (
              <>
                <span className={styles.oldPrice}>${product.compare_at_price}</span>
                <span className={styles.discount}>Save {discount}%</span>
              </>
            )}
          </div>

          <p className={styles.description}>{product.description}</p>

          {/* Variants */}
          {product.variants?.length > 0 && (
            <div className={styles.variants}>
              <label>Choose Option:</label>
              <select
                value={selectedVariant?.id || ''}
                onChange={(e) => {
                  const variant = product.variants.find(
                    (v) => v.id === parseInt(e.target.value)
                  );
                  setSelectedVariant(variant);
                }}
                className={styles.variantSelect}
              >
                {product.variants.map((variant) => (
                  <option key={variant.id} value={variant.id}>
                    {variant.option_value}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Quantity & Add to Cart */}
          <div className={styles.purchase}>
            <div className={styles.quantityControl}>
              <label>Quantity:</label>
              <div className={styles.quantityInput}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  −
                </button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                />
                <button onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>
            </div>

            <button
              className={styles.addToCartBtn}
              onClick={handleAddToCart}
              disabled={addingToCart || product.quantity <= 0}
            >
              {product.quantity <= 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>

          <div className={styles.inventory}>
            {product.quantity > 0 ? (
              <span className={styles.inStock}>
                ✓ {product.quantity} in stock
              </span>
            ) : (
              <span className={styles.outOfStock}>Out of stock</span>
            )}
          </div>

          {/* Specifications */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className={styles.specifications}>
              <h3>Specifications</h3>
              <table>
                <tbody>
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <tr key={key}>
                      <td className={styles.specKey}>{key}</td>
                      <td className={styles.specValue}>{String(value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      {product.reviews?.length > 0 && (
        <div className={styles.reviewsSection}>
          <h2>Customer Reviews</h2>
          <div className={styles.reviews}>
            {product.reviews.slice(0, 5).map((review) => (
              <div key={review.id} className={styles.review}>
                <div className={styles.reviewHeader}>
                  <div>
                    <strong>
                      {review.first_name} {review.last_name}
                    </strong>
                    <div className={styles.reviewRating}>
                      {'★'.repeat(review.rating)}
                    </div>
                  </div>
                  {review.verified_purchase && (
                    <span className={styles.verified}>Verified Purchase</span>
                  )}
                </div>
                <h4>{review.title}</h4>
                <p>{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

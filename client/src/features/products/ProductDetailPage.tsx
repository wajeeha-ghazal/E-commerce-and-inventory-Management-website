import React, { useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { Container, Row, Col, Button, Badge, Spinner, Alert, Breadcrumb } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchProductById, clearSelected } from './productSlice';
import { addToCart, openCart, selectCartItemByProductId } from '../cart/cartSlice';
import StockBadge from '../../components/ui/StockBadge';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { selected: product, detailStatus, error } = useAppSelector((s) => s.products);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const location = useLocation();

  const cartItem = useAppSelector(selectCartItemByProductId(product?.id ?? -1));
  const inCartQty = cartItem?.quantity ?? 0;
  const availableToAdd = product ? Math.max(0, product.stock - inCartQty) : 0;

  const handleAddToCart = () => {
    // If not logged in, redirect to register
    if (!isAuthenticated) {
      navigate('/register', { state: { from: location } });
      return;
    }
    if (!product || availableToAdd <= 0) return;
    dispatch(addToCart({ product, quantity: 1 }));
    dispatch(openCart());
  };

  useEffect(() => {
    if (id) {
      dispatch(fetchProductById(Number(id)));
    }
    return () => {
      dispatch(clearSelected());
    };
  }, [dispatch, id]);

  const fallbackImage = 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800&q=80';

  if (detailStatus === 'loading') {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" className="text-terracotta" role="status" />
        <p className="mt-3 text-muted">Loading product…</p>
      </Container>
    );
  }

  if (detailStatus === 'failed') {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <i className="bi bi-exclamation-triangle me-2" />
          {error || 'Product not found'}
        </Alert>
        <Button variant="outline-secondary" className="border-warm" onClick={() => navigate(-1)}>
          <i className="bi bi-arrow-left me-2" />
          Go Back
        </Button>
      </Container>
    );
  }

  if (!product) return null;

  return (
    <div className="min-vh-100 py-5" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
      <Container>
        {/* Breadcrumb */}
        <Breadcrumb
          className="mb-4"
          style={{ '--bs-breadcrumb-divider': "'>'" } as React.CSSProperties}
        >
          <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/' }}>
            Catalog
          </Breadcrumb.Item>
          {product.category && (
            <Breadcrumb.Item linkAs={Link} linkProps={{ to: `/?categoryId=${product.categoryId}` }}>
              {product.category.name}
            </Breadcrumb.Item>
          )}
          <Breadcrumb.Item active>{product.title}</Breadcrumb.Item>
        </Breadcrumb>

        <Row className="g-5 align-items-start">
          {/* Product Image */}
          <Col md={6}>
            <div
              className="rounded-4 overflow-hidden border border-warm warm-shadow"
              style={{ height: '460px', backgroundColor: '#f5f0ea' }}
            >
              <img
                src={product.imageUrl || fallbackImage}
                alt={product.title}
                className="w-100 h-100 object-fit-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = fallbackImage;
                }}
              />
            </div>
          </Col>

          {/* Product Info */}
          <Col md={6}>
            {/* Title */}
            <h1 className="serif-display fw-semibold mb-2" style={{ fontSize: '2rem' }}>
              {product.title}
            </h1>

            {/* Category below product name */}
            {product.category && (
              <div className="mb-3">
                <Badge bg="cream-alt" className="text-muted border border-warm px-2 py-1">
                  {product.category.name}
                </Badge>
              </div>
            )}

            {/* Price */}
            <div className="d-flex align-items-center gap-3 mb-4">
              <span className="display-6 text-terracotta fw-bold">${product.price.toFixed(2)}</span>
              <StockBadge stock={product.stock} />
            </div>

            {/* Product Description */}
            <div className="mb-4">
              <h5 className="serif-display text-dark fw-semibold mb-2">Product Description</h5>
              <p className="text-muted lh-lg mb-0">{product.description}</p>
            </div>

            <hr className="border-warm my-4" />

            {/* Add to Cart */}
            {product.stock > 0 ? (
              <Button
                className="btn-terracotta w-100 py-3 rounded-3 fw-semibold text-center"
                disabled={availableToAdd <= 0}
                onClick={handleAddToCart}
              >
                <i className="bi bi-cart-plus me-2" />
                {availableToAdd <= 0 ? 'Max in Cart' : 'Add to Cart'}
              </Button>
            ) : (
              <Alert variant="secondary" className="border-warm rounded-3 py-2 text-center">
                <i className="bi bi-clock me-2" />
                This item is currently out of stock
              </Alert>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ProductDetailPage;

import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import type { ProductDTO } from '@ecomm/shared/src/product';
import StockBadge from '../../components/ui/StockBadge';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { addToCart, selectAvailableStock } from '../cart/cartSlice';

interface ProductCardProps {
  product: ProductDTO;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const dispatch = useAppDispatch();
  const availableStock = useAppSelector(selectAvailableStock(product));

  const fallbackImage = 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=400&q=80';

  return (
    <Card className="h-100 card-hover card-product-hover border-warm warm-shadow">
      {/* Product Image + Hover Add to Cart Bar */}
      <div
        className="position-relative overflow-hidden"
        style={{
          height: '240px',
          borderRadius: '0.375rem 0.375rem 0 0',
          backgroundColor: '#f5f0ea',
        }}
      >
        <img
          src={product.imageUrl || fallbackImage}
          alt={product.title}
          className="w-100 h-100 object-fit-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = fallbackImage;
          }}
          loading="lazy"
        />

        {/* Hover Add to Cart Button (appears on card hover) */}
        {product.stock > 0 && (
          <div className="product-card-hover-bar">
            <Button
              variant="light"
              className="w-100 py-2 border-0 rounded-0 fw-semibold text-uppercase small d-flex align-items-center justify-content-center gap-2 hover-add-btn"
              style={{
                letterSpacing: '0.08em',
                fontSize: '0.78rem',
              }}
              disabled={availableStock <= 0}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                dispatch(addToCart({ product, quantity: 1 }));
              }}
            >
              <i className="bi bi-cart-plus me-1" />
              {availableStock <= 0 ? 'Max in Cart' : 'Add to Cart'}
            </Button>
          </div>
        )}
      </div>

      <Card.Body className="d-flex flex-column gap-1 p-3">
        {/* Title */}
        <Card.Title className="mb-0 fs-6 fw-semibold lh-sm">
          <Link
            to={`/products/${product.id}`}
            className="text-dark text-decoration-none stretched-link"
          >
            {product.title}
          </Link>
        </Card.Title>

        {/* Category Name as normal text below Product title */}
        {product.category && (
          <div className="text-muted small" style={{ fontSize: '0.8rem' }}>
            {product.category.name}
          </div>
        )}

        {/* Price + Stock row */}
        <div className="d-flex align-items-center justify-content-between mt-auto pt-2 border-top border-warm">
          <span className="h5 mb-0 text-terracotta fw-bold">
            ${(product.price ?? 0).toFixed(2)}
          </span>
          <StockBadge stock={product.stock} />
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProductCard;

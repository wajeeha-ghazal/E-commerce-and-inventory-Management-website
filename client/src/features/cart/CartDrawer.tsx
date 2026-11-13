import React ,{useState} from 'react';
import { Offcanvas, Button, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  closeCart,
  updateQuantity,
  removeFromCart,
  clearCart,
  selectCartItems,
  selectCartIsOpen,
  selectCartItemCount,
  selectCartSubtotal,
  selectCartTax,
  selectCartTotal,
} from './cartSlice';

export const CartDrawer: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const isOpen = useAppSelector(selectCartIsOpen);
  const items = useAppSelector(selectCartItems);
  const itemCount = useAppSelector(selectCartItemCount);
  const subtotal = useAppSelector(selectCartSubtotal);
  const tax = useAppSelector(selectCartTax);
  const total = useAppSelector(selectCartTotal);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [requiresAuth, setRequiresAuth] = useState(false);

  const handleClose = () => {
    setRequiresAuth(false);
    dispatch(closeCart());
  };

  const handleGoToAuth = (path: '/login' | '/register') => {
    setRequiresAuth(false);
    dispatch(closeCart());
    navigate(path, { state: { from: '/checkout' } });
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      setRequiresAuth(true);
      return;
    }
    setRequiresAuth(false);
    dispatch(closeCart());
    navigate('/checkout');
  };

  return (
    <Offcanvas
      show={isOpen}
      onHide={handleClose}
      placement="end"
      className="bg-white border-start border-warm"
      style={{ maxWidth: '420px', width: '100%' }}
    >
      <Offcanvas.Header closeButton className="border-bottom border-warm py-3 px-4">
        <Offcanvas.Title className="serif-display h4 mb-0 text-dark d-flex align-items-center gap-2">
          <span>Your Cart</span>
          {itemCount > 0 && (
            <Badge bg="cream-alt" className="text-terracotta border border-warm fs-6 fw-normal">
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </Badge>
          )}
        </Offcanvas.Title>
      </Offcanvas.Header>

      <Offcanvas.Body className="d-flex flex-column p-0">
        {items.length === 0 ? (
          <div className="flex-grow-1 d-flex flex-column align-items-center justify-content-center p-4 text-center">
            <div
              className="rounded-circle bg-cream border border-warm d-flex align-items-center justify-content-center mb-3 text-secondary"
              style={{ width: '72px', height: '72px', fontSize: '28px' }}
            >
              <i className="bi bi-bag" />
            </div>
            <h5 className="serif-display text-dark mb-2">Your cart is empty</h5>
            <p className="text-muted small mb-4" style={{ maxWidth: '240px' }}>
              Explore our collection of handcrafted artisan goods and find something unique.
            </p>
            <Button
              className="btn-terracotta px-4 py-2 rounded-3"
              onClick={() => {
                handleClose();
                navigate('/');
              }}
            >
              Explore Collection
            </Button>
          </div>
        ) : (
          <>
            {/* Items List */}
            <div className="flex-grow-1 overflow-y-auto px-4 py-3">
              {items.map((item) => {
                const isMaxStock = item.quantity >= item.stock;
                return (
                  <div
                    key={item.productId}
                    className="py-3 border-bottom border-warm d-flex gap-3 align-items-start"
                  >
                    {/* Item Image */}
                    <div
                      className="rounded-3 overflow-hidden border border-warm flex-shrink-0"
                      style={{ width: '70px', height: '70px', backgroundColor: '#f5f0ea' }}
                    >
                      <img
                        src={
                          item.imageUrl ||
                          'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=200&q=80'
                        }
                        alt={item.title}
                        className="w-100 h-100 object-fit-cover"
                      />
                    </div>

                    {/* Item Details */}
                    <div className="flex-grow-1 min-w-0">
                      <div className="d-flex justify-content-between align-items-start gap-2">
                        <Link
                          to={`/products/${item.productId}`}
                          onClick={handleClose}
                          className="text-dark fw-medium text-decoration-none text-truncate d-block small mb-1"
                        >
                          {item.title}
                        </Link>
                        <button
                          type="button"
                          className="btn btn-link text-muted p-0 text-decoration-none border-0"
                          title="Remove item"
                          onClick={() => dispatch(removeFromCart(item.productId))}
                        >
                          <i className="bi bi-trash3" style={{ fontSize: '0.85rem' }} />
                        </button>
                      </div>

                      <div className="text-terracotta fw-semibold small mb-2">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>

                      {/* Quantity Controls */}
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="input-group input-group-sm" style={{ width: '100px' }}>
                          <button
                            className="btn btn-outline-secondary border-warm px-2"
                            type="button"
                            onClick={() =>
                              dispatch(
                                updateQuantity({
                                  productId: item.productId,
                                  quantity: item.quantity - 1,
                                })
                              )
                            }
                          >
                            <i className="bi bi-dash" />
                          </button>
                          <span className="input-group-text bg-white border-warm text-dark justify-content-center flex-grow-1 px-1">
                            {item.quantity}
                          </span>
                          <button
                            className="btn btn-outline-secondary border-warm px-2"
                            type="button"
                            disabled={isMaxStock}
                            title={isMaxStock ? 'Max stock reached' : 'Add one more'}
                            onClick={() =>
                              dispatch(
                                updateQuantity({
                                  productId: item.productId,
                                  quantity: item.quantity + 1,
                                })
                              )
                            }
                          >
                            <i className="bi bi-plus" />
                          </button>
                        </div>

                        {isMaxStock && (
                          <span className="text-muted" style={{ fontSize: '0.7rem' }}>
                            Max stock ({item.stock})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cart Summary & Actions */}
            <div className="border-top border-warm p-4 bg-cream">
              <div className="d-flex justify-content-between small text-muted mb-2">
                <span>Subtotal</span>
                <span className="text-dark fw-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between small text-muted mb-2">
                <span>Estimated Tax (8%)</span>
                <span className="text-dark fw-medium">${tax.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between fs-5 fw-bold text-dark mb-4 pt-2 border-top border-warm">
                <span className="serif-display">Total</span>
                <span className="text-terracotta">${total.toFixed(2)}</span>
              </div>

              <div className="d-flex flex-column gap-2">
                {requiresAuth && (
                  <div className="p-3 rounded-3 bg-cream border border-warm text-center mb-1">
                    <p className="small text-muted mb-2">
                      Please sign in or create an account to complete your checkout.
                    </p>
                    <div className="d-flex justify-content-center gap-2">
                      <Button
                        size="sm"
                        variant="outline-dark"
                        className="px-3 rounded-2"
                        onClick={() => handleGoToAuth('/login')}
                      >
                        Sign In
                      </Button>
                      <Button
                        size="sm"
                        className="btn-terracotta px-3 rounded-2"
                        onClick={() => handleGoToAuth('/register')}
                      >
                        Create Account
                      </Button>
                    </div>
                  </div>
                )}

                <Button
                  className="btn-terracotta w-100 py-2 rounded-3 fw-semibold"
                  onClick={handleCheckout}
                >
                  <i className="bi bi-lock me-2" />
                  Proceed to Checkout
                </Button>
                <button
                  type="button"
                  className="btn btn-link text-muted small text-decoration-none border-0 text-center"
                  onClick={() => dispatch(clearCart())}
                >
                  Clear Bag
                </button>
              </div>
            </div>
          </>
        )}
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default CartDrawer;

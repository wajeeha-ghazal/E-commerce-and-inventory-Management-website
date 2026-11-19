import React, { useState, useEffect, useMemo } from 'react';
import { Card, Table, Button, Badge, Form, InputGroup, Spinner } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../../../../app/hooks';
import {
  fetchAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  restoreAdminProduct,
} from '../../adminSlice';
import ProductModal from '../modals/ProductModal';
import AdminPagination from '../AdminPagination';
import type { ProductDTO, CreateProductInput } from '@ecomm/shared';

export const ProductsTab: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);
  const { products, productsLoading, categories } = useAppSelector((state) => state.admin);

  const [search, setSearch] = useState('');
  const [includeDeleted, setIncludeDeleted] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductDTO | null>(null);

  const isSuperAdmin = currentUser?.role === 'super_admin';

  useEffect(() => {
    dispatch(fetchAdminProducts(includeDeleted));
  }, [dispatch, includeDeleted]);

  // Client-side search filtering
  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) => p.title.toLowerCase().includes(q) || 
      p.description.toLowerCase().includes(q)
    );
  }, [products, search]);

  // Pagination calculations
  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / limit) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredProducts.slice(start, start + limit);
  }, [filteredProducts, page, limit]);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (p: ProductDTO) => {
    setEditingProduct(p);
    setModalOpen(true);
  };

  const handleSubmitModal = async (values: CreateProductInput) => {
    if (editingProduct) {
      const res = await dispatch(updateAdminProduct({ id: editingProduct.id, data: values }));
      if (updateAdminProduct.fulfilled.match(res)) {
        return true;
      }
      return false;
    } else {
      const res = await dispatch(createAdminProduct(values));
      if (createAdminProduct.fulfilled.match(res)) {
        return true;
      }
      return false;
    }
  };

  const handleDelete = async (p: ProductDTO) => {
    if (window.confirm(`Are you sure you want to soft-delete product "${p.title}"?`)) {
      await dispatch(deleteAdminProduct(p.id));
    }
  };

  const handleRestore = async (p: ProductDTO) => {
    await dispatch(restoreAdminProduct(p.id));
  };

  return (
    <>
      <Card className="border-warm shadow-sm rounded-3 bg-white mb-4">
        <Card.Header className="bg-white border-bottom border-warm p-3 p-sm-4 d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
          <div className="d-flex align-items-center gap-3 flex-wrap">
            <Button
              className="btn-terracotta px-3 py-2 rounded-3 text-nowrap"
              onClick={handleOpenAdd}
            >
              <i className="bi bi-plus-lg me-1" /> Add Product
            </Button>
            <Form.Check
              type="switch"
              id="toggle-deleted-products"
              label="Show Soft-Deleted"
              checked={includeDeleted}
              onChange={(e) => {
                setIncludeDeleted(e.target.checked);
                setPage(1);
              }}
              className="small text-muted"
            />
          </div>
          <InputGroup style={{ maxWidth: '280px' }}>
            <InputGroup.Text className="bg-white border-warm">
              <i className="bi bi-search text-muted" />
            </InputGroup.Text>
            <Form.Control
              placeholder="Search by title or SKU..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="border-warm"
            />
          </InputGroup>
        </Card.Header>

        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="align-middle mb-0">
              <thead className="bg-cream small text-muted text-uppercase">
                <tr>
                  <th style={{ width: '60px' }}>Item</th>
                  <th>Title &amp; SKU</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th className="text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {productsLoading && products.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-4 text-muted">
                      <Spinner animation="border" size="sm" className="me-2" />
                      Loading products...
                    </td>
                  </tr>
                ) : paginatedProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-4 text-muted">
                      No products found matching criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedProducts.map((p) => {
                    const isDeleted = Boolean(p.deletedAt);
                    const canModify =
                      isSuperAdmin ||
                      (p.createdBy != null && Number(p.createdBy) === Number(currentUser?.id));

                    return (
                      <tr key={p.id} className={isDeleted ? 'opacity-75 bg-light' : ''}>
                        <td>
                          <div
                            className="rounded overflow-hidden border border-warm flex-shrink-0"
                            style={{ width: '48px', height: '48px', backgroundColor: '#f5f0ea' }}
                          >
                            <img
                              src={
                                p.imageUrl ||
                                'https://images.unsplash.com/photo-1544816155-12df9643f363?w=100&q=80'
                              }
                              alt={p.title}
                              className="w-100 h-100 object-fit-cover"
                            />
                          </div>
                        </td>
                        <td>
                          <div
                            className="fw-medium text-dark text-truncate"
                            style={{ maxWidth: '260px' }}
                          >
                            {p.title}
                          </div>
                          <code className="text-muted small">{p.sku}</code>
                        </td>
                        <td>
                          <Badge bg="cream" className="text-dark border border-warm fw-normal">
                            {p.category?.name || `Cat #${p.categoryId}`}
                          </Badge>
                        </td>
                        <td className="fw-semibold text-dark">${Number(p.price).toFixed(2)}</td>
                        <td>
                          {p.stock === 0 ? (
                            <Badge bg="danger">0 (Out)</Badge>
                          ) : p.stock <= 5 ? (
                            <Badge bg="warning" text="dark">
                              Low: {p.stock}
                            </Badge>
                          ) : (
                            <Badge bg="success">{p.stock} units</Badge>
                          )}
                        </td>
                        <td>
                          {isDeleted ? (
                            <Badge bg="secondary">Soft-Deleted</Badge>
                          ) : (
                            <Badge bg="success" bg-opacity="25" text="dark">
                              Active
                            </Badge>
                          )}
                        </td>
                        <td className="text-end pe-4 text-nowrap">
                          {canModify ? (
                            isDeleted ? (
                              <Button
                                variant="outline-success"
                                size="sm"
                                className="py-0 px-2"
                                onClick={() => handleRestore(p)}
                                title="Restore product to catalog"
                              >
                                <i className="bi bi-arrow-counterclockwise me-1" /> Restore
                              </Button>
                            ) : (
                              <>
                                <Button
                                  variant="outline-secondary"
                                  size="sm"
                                  className="me-2 py-1 px-2 border-warm"
                                  onClick={() => handleOpenEdit(p)}
                                  title="Edit details"
                                >
                                  <i className="bi bi-pencil" />
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  className="py-1 px-2"
                                  onClick={() => handleDelete(p)}
                                  title="Soft-delete product"
                                >
                                  <i className="bi bi-trash" />
                                </Button>
                              </>
                            )
                          ) : null}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>

        <AdminPagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalItems}
          limit={limit}
          onPageChange={setPage}
          onLimitChange={(newLimit) => {
            setLimit(newLimit);
            setPage(1);
          }}
        />
      </Card>

      <ProductModal
        show={modalOpen}
        onHide={() => setModalOpen(false)}
        product={editingProduct}
        categories={categories}
        onSubmit={handleSubmitModal}
      />
    </>
  );
};

export default ProductsTab;

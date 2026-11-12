import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Tab,
  Nav,
  Table,
  Button,
  Badge,
  Modal,
  Form,
  Alert,
  Spinner,
  InputGroup,
} from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  fetchAdminStats,
  fetchAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  restoreAdminProduct,
  fetchAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory,
  fetchAdminOrders,
  updateAdminOrderStatus,
  fetchAdminUsers,
  updateAdminUserRole,
  clearAdminError,
  clearAdminSuccess,
} from './adminSlice';
import type {
  ProductDTO,
  CategoryDTO,
  OrderDTO,
  OrderStatus,
  UserRole,
  CreateProductInput,
  CreateCategoryInput,
} from '@ecomm/shared';
import { ORDER_STATUSES } from '@ecomm/shared';

export const AdminDashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const {
    stats,
    statsLoading,
    products,
    productsLoading,
    categories,
    categoriesLoading,
    orders,
    ordersLoading,
    users,
    usersLoading,
    error,
    successMessage,
  } = useAppSelector((state) => state.admin);

  const [activeTab, setActiveTab] = useState<string>('overview');

  // Product Tab States
  const [productSearch, setProductSearch] = useState('');
  const [includeDeleted, setIncludeDeleted] = useState(true);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductDTO | null>(null);
  const [productForm, setProductForm] = useState<CreateProductInput>({
    categoryId: 1,
    title: '',
    description: '',
    sku: '',
    price: 0,
    stock: 0,
    imageUrl: '',
  });

  // Category Tab States
  const [showAddCatModal, setShowAddCatModal] = useState(false);
  const [showEditCatModal, setShowEditCatModal] = useState(false);
  const [editingCat, setEditingCat] = useState<CategoryDTO | null>(null);
  const [catForm, setCatForm] = useState<CreateCategoryInput>({
    name: '',
    slug: '',
    description: '',
  });

  // Order Tab States
  const [orderStatusFilter, setOrderStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [viewingOrder, setViewingOrder] = useState<OrderDTO | null>(null);

  // Initial Load
  useEffect(() => {
    dispatch(fetchAdminStats());
    dispatch(fetchAdminProducts(true));
    dispatch(fetchAdminCategories());
    dispatch(fetchAdminOrders());
    dispatch(fetchAdminUsers());
  }, [dispatch]);

  // Handle Tab Switch
  const handleTabSelect = (tab: string | null) => {
    if (!tab) return;
    setActiveTab(tab);
    if (tab === 'overview') dispatch(fetchAdminStats());
    if (tab === 'products') dispatch(fetchAdminProducts(includeDeleted));
    if (tab === 'categories') dispatch(fetchAdminCategories());
    if (tab === 'orders')
      dispatch(fetchAdminOrders(orderStatusFilter === 'all' ? undefined : orderStatusFilter));
    if (tab === 'users') dispatch(fetchAdminUsers());
  };

  // ================= Product Handlers =================
  const handleOpenAddProduct = () => {
    setProductForm({
      categoryId: categories[0]?.id || 1,
      title: '',
      description: '',
      sku: `SKU-${Date.now().toString().slice(-6)}`,
      price: 19.99,
      stock: 10,
      imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&q=80',
    });
    setShowAddProductModal(true);
  };

  const handleOpenEditProduct = (prod: ProductDTO) => {
    setEditingProduct(prod);
    setProductForm({
      categoryId: prod.categoryId,
      title: prod.title,
      description: prod.description || '',
      sku: prod.sku,
      price: prod.price,
      stock: prod.stock,
      imageUrl: prod.imageUrl || '',
    });
    setShowEditProductModal(true);
  };

  const handleSubmitAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await dispatch(createAdminProduct(productForm));
    if (createAdminProduct.fulfilled.match(res)) {
      setShowAddProductModal(false);
      dispatch(fetchAdminStats());
    }
  };

  const handleSubmitEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    const res = await dispatch(updateAdminProduct({ id: editingProduct.id, data: productForm }));
    if (updateAdminProduct.fulfilled.match(res)) {
      setShowEditProductModal(false);
      dispatch(fetchAdminStats());
    }
  };

  const handleDeleteProduct = async (prod: ProductDTO) => {
    if (
      window.confirm(
        `Are you sure you want to soft-delete "${prod.title}"? It will be hidden from customer catalogs but preserved for orders.`
      )
    ) {
      await dispatch(deleteAdminProduct(prod.id));
      dispatch(fetchAdminStats());
    }
  };

  const handleRestoreProduct = async (prod: ProductDTO) => {
    await dispatch(restoreAdminProduct(prod.id));
    dispatch(fetchAdminStats());
  };

  // ================= Category Handlers =================
  const handleOpenAddCat = () => {
    setCatForm({ name: '', slug: '', description: '' });
    setShowAddCatModal(true);
  };

  const handleOpenEditCat = (cat: CategoryDTO) => {
    setEditingCat(cat);
    setCatForm({ name: cat.name, slug: cat.slug, description: cat.description || '' });
    setShowEditCatModal(true);
  };

  const handleSubmitAddCat = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await dispatch(createAdminCategory(catForm));
    if (createAdminCategory.fulfilled.match(res)) {
      setShowAddCatModal(false);
    }
  };

  const handleSubmitEditCat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCat) return;
    const res = await dispatch(updateAdminCategory({ id: editingCat.id, data: catForm }));
    if (updateAdminCategory.fulfilled.match(res)) {
      setShowEditCatModal(false);
    }
  };

  const handleDeleteCat = async (cat: CategoryDTO) => {
    if (window.confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
      await dispatch(deleteAdminCategory(cat.id));
    }
  };

  // ================= Order Handlers =================
  const handleOrderStatusChange = async (orderId: number, status: OrderStatus) => {
    await dispatch(updateAdminOrderStatus({ id: orderId, status }));
    dispatch(fetchAdminStats());
  };

  const handleFilterOrdersByStatus = (status: OrderStatus | 'all') => {
    setOrderStatusFilter(status);
    dispatch(fetchAdminOrders(status === 'all' ? undefined : status));
  };

  // ================= User Handlers =================
  const handleToggleUserRole = async (targetUser: any) => {
    const newRole: UserRole = targetUser.role === 'admin' ? 'customer' : 'admin';
    if (
      window.confirm(
        `Change role of "${targetUser.email}" from "${targetUser.role}" to "${newRole}"?`
      )
    ) {
      await dispatch(updateAdminUserRole({ id: targetUser.id, role: newRole }));
      dispatch(fetchAdminStats());
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.sku.toLowerCase().includes(productSearch.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="py-2 py-md-4 w-100 overflow-hidden">
      {/* Admin Top Banner */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mb-4">
        <div>
          <h1 className="serif-display h2 text-dark mb-1">Welcome StoreAdmin!</h1>
          <p className="text-secondary small mb-0">
            Platform inventory control, product catalog, orders fulfillment, and user access.
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <Badge bg="dark" className="px-3 py-2 text-white fs-6 fw-normal rounded-pill">
            <i className="bi bi-shield-check text-success me-1" />
            Admin: {user?.email}
          </Badge>
        </div>
      </div>

      {/* Global Alerts */}
      {error && (
        <Alert
          variant="danger"
          dismissible
          onClose={() => dispatch(clearAdminError())}
          className="rounded-3 shadow-sm border-0 mb-4 d-flex align-items-center gap-2"
        >
          <i className="bi bi-exclamation-triangle-fill flex-shrink-0" />
          <div>{error}</div>
        </Alert>
      )}

      {successMessage && (
        <Alert
          variant="success"
          dismissible
          onClose={() => dispatch(clearAdminSuccess())}
          className="rounded-3 shadow-sm border-0 mb-4 d-flex align-items-center gap-2"
        >
          <i className="bi bi-check-circle-fill flex-shrink-0" />
          <div>{successMessage}</div>
        </Alert>
      )}

      {/* Admin Tab Navigation */}
      <Tab.Container activeKey={activeTab} onSelect={handleTabSelect}>
        <Nav
          variant="pills"
          className="bg-white border border-warm rounded-3 p-1 mb-4 gap-1 flex-nowrap overflow-x-auto"
        >
          <Nav.Item>
            <Nav.Link
              eventKey="overview"
              className="text-dark small fw-medium py-2 px-3 text-nowrap rounded-2"
            >
              <i className="bi bi-speedometer2 me-1 text-terracotta" /> Overview &amp; Stats
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              eventKey="products"
              className="text-dark small fw-medium py-2 px-3 text-nowrap rounded-2"
            >
              <i className="bi bi-box-seam me-1 text-terracotta" /> Products &amp; Stock (
              {products.length})
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              eventKey="categories"
              className="text-dark small fw-medium py-2 px-3 text-nowrap rounded-2"
            >
              <i className="bi bi-tags me-1 text-terracotta" /> Categories ({categories.length})
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              eventKey="orders"
              className="text-dark small fw-medium py-2 px-3 text-nowrap rounded-2"
            >
              <i className="bi bi-receipt me-1 text-terracotta" /> Orders ({orders.length})
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              eventKey="users"
              className="text-dark small fw-medium py-2 px-3 text-nowrap rounded-2"
            >
              <i className="bi bi-people me-1 text-terracotta" /> Users ({users.length})
            </Nav.Link>
          </Nav.Item>
        </Nav>

        <Tab.Content>
          {/* ================= TAB 1: OVERVIEW & STATS ================= */}
          <Tab.Pane eventKey="overview">
            {statsLoading && !stats ? (
              <div className="py-5 text-center">
                <Spinner animation="border" variant="secondary" />
                <p className="text-muted mt-2 small">Loading live store statistics...</p>
              </div>
            ) : stats ? (
              <div>
                <Row className="g-3 mb-4">
                  {/* Revenue Card */}
                  <Col xs={12} sm={6} lg={3}>
                    <Card className="border-warm shadow-sm rounded-3 p-3 bg-white h-100 admin-stat-card">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="text-muted small">Total Revenue</span>
                        <div className="p-2 rounded-2 bg-cream text-terracotta">
                          <i className="bi bi-cash-stack fs-5" />
                        </div>
                      </div>
                      <h3 className="serif-display text-dark mb-1">
                        ${stats.orders.totalRevenue.toFixed(2)}
                      </h3>
                      <small className="text-muted">
                        {stats.orders.totalOrders} total orders processed
                      </small>
                    </Card>
                  </Col>

                  {/* Active Products */}
                  <Col xs={12} sm={6} lg={3}>
                    <Card className="border-warm shadow-sm rounded-3 p-3 bg-white h-100 admin-stat-card">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="text-muted small">Active Products</span>
                        <div className="p-2 rounded-2 bg-cream text-terracotta">
                          <i className="bi bi-box-seam fs-5" />
                        </div>
                      </div>
                      <h3 className="serif-display text-dark mb-1">
                        {stats.inventory.distinctProducts}
                      </h3>
                      <small className="text-muted">
                        {stats.inventory.totalUnits} total units in stock
                      </small>
                    </Card>
                  </Col>

                  {/* Low Stock Alerts */}
                  <Col xs={12} sm={6} lg={3}>
                    <Card className="border-warm shadow-sm rounded-3 p-3 bg-white h-100 admin-stat-card">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="text-muted small">Low Stock Alert (&le; 5)</span>
                        <div className="p-2 rounded-2 bg-warning bg-opacity-25 text-warning">
                          <i className="bi bi-exclamation-triangle fs-5" />
                        </div>
                      </div>
                      <h3 className="serif-display text-warning mb-1">
                        {stats.inventory.lowStockCount}
                      </h3>
                      <small className="text-muted">Items needing replenishment soon</small>
                    </Card>
                  </Col>

                  {/* Out of Stock */}
                  <Col xs={12} sm={6} lg={3}>
                    <Card className="border-warm shadow-sm rounded-3 p-3 bg-white h-100 admin-stat-card">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="text-muted small">Out of Stock (0)</span>
                        <div className="p-2 rounded-2 bg-danger bg-opacity-10 text-danger">
                          <i className="bi bi-x-circle fs-5" />
                        </div>
                      </div>
                      <h3 className="serif-display text-danger mb-1">
                        {stats.inventory.outOfStockCount}
                      </h3>
                      <small className="text-muted">Products currently unavailable</small>
                    </Card>
                  </Col>
                </Row>

                {/* Orders by Status & Users */}
                <Row className="g-4">
                  <Col lg={7}>
                    <Card className="border-warm shadow-sm rounded-3 p-4 bg-white h-100 admin-stat-card">
                      <h5 className="serif-display text-dark mb-3">Order Status Distribution</h5>
                      <div className="d-flex flex-wrap gap-2">
                        {ORDER_STATUSES.map((st) => (
                          <div
                            key={st}
                            className="p-3 bg-cream rounded-3 border border-warm flex-grow-1 min-w-140 admin-stat-mini-card"
                            style={{ minWidth: '130px' }}
                          >
                            <span className="text-capitalize small text-muted d-block mb-1">
                              {st}
                            </span>
                            <span className="fs-4 fw-bold text-dark">
                              {stats.orders.byStatus[st] || 0}
                            </span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </Col>

                  <Col lg={5}>
                    <Card className="border-warm shadow-sm rounded-3 p-4 bg-white h-100 admin-stat-card">
                      <h5 className="serif-display text-dark mb-3">User Accounts</h5>
                      <div className="p-3 bg-cream rounded-3 border border-warm mb-3 d-flex justify-content-between align-items-center">
                        <div>
                          <div className="small text-muted">Total Registered Accounts</div>
                          <span className="fs-4 fw-bold text-dark">{stats.users.totalUsers}</span>
                        </div>
                        <i className="bi bi-people fs-3 text-secondary" />
                      </div>
                      <div className="d-flex gap-2">
                        <div className="p-2 bg-white rounded border border-warm flex-grow-1 text-center admin-stat-mini-card">
                          <span className="small text-muted d-block">Customers</span>
                          <strong>{stats.users.customerCount}</strong>
                        </div>
                        <div className="p-2 bg-white rounded border border-warm flex-grow-1 text-center admin-stat-mini-card">
                          <span className="small text-muted d-block">Admins</span>
                          <strong className="text-terracotta">{stats.users.adminCount}</strong>
                        </div>
                      </div>
                    </Card>
                  </Col>
                </Row>
              </div>
            ) : null}
          </Tab.Pane>

          {/* ================= TAB 2: PRODUCTS CRUD ================= */}
          <Tab.Pane eventKey="products">
            <Card className="border-warm shadow-sm rounded-3 bg-white mb-4">
              <Card.Header className="bg-white border-bottom border-warm p-3 p-sm-4 d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
                <div className="d-flex align-items-center gap-3 flex-wrap">
                  <Button
                    className="btn-terracotta px-3 py-2 rounded-3 text-nowrap"
                    onClick={handleOpenAddProduct}
                  >
                    <i className="bi bi-plus-lg me-1" /> Add Product
                  </Button>
                  <Form.Check
                    type="switch"
                    id="toggle-deleted"
                    label="Show Soft-Deleted"
                    checked={includeDeleted}
                    onChange={(e) => {
                      setIncludeDeleted(e.target.checked);
                      dispatch(fetchAdminProducts(e.target.checked));
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
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
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
                      {productsLoading ? (
                        <tr>
                          <td colSpan={7} className="text-center py-4 text-muted">
                            <Spinner animation="border" size="sm" className="me-2" />
                            Loading products...
                          </td>
                        </tr>
                      ) : filteredProducts.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-4 text-muted">
                            No products found matching criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredProducts.map((p) => {
                          const isDeleted = Boolean(p.deletedAt);
                          return (
                            <tr key={p.id} className={isDeleted ? 'opacity-75 bg-light' : ''}>
                              <td>
                                <div
                                  className="rounded overflow-hidden border border-warm flex-shrink-0"
                                  style={{
                                    width: '48px',
                                    height: '48px',
                                    backgroundColor: '#f5f0ea',
                                  }}
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
                                <Badge
                                  bg="cream"
                                  className="text-dark border border-warm fw-normal"
                                >
                                  {p.category?.name || `Cat #${p.categoryId}`}
                                </Badge>
                              </td>
                              <td className="fw-semibold text-dark">
                                ${Number(p.price).toFixed(2)}
                              </td>
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
                              <td
                                className={`${isDeleted ? 'text-center' : 'text-end pe-4'} text-nowrap`}
                              >
                                {isDeleted ? (
                                  <Button
                                    variant="outline-success"
                                    size="sm"
                                    className="py-0 px-1"
                                    onClick={() => handleRestoreProduct(p)}
                                    title="Restore product to catalog"
                                  >
                                    <i className="bi bi-arrow-counterclockwise" /> Restore
                                  </Button>
                                ) : (
                                  <>
                                    <Button
                                      variant="outline-secondary"
                                      size="sm"
                                      className="me-2 py-1 px-2 border-warm"
                                      onClick={() => handleOpenEditProduct(p)}
                                      title="Edit details"
                                    >
                                      <i className="bi bi-pencil" />
                                    </Button>
                                    <Button
                                      variant="outline-danger"
                                      size="sm"
                                      className="py-1 px-2"
                                      onClick={() => handleDeleteProduct(p)}
                                      title="Soft-delete product"
                                    >
                                      <i className="bi bi-trash" />
                                    </Button>
                                  </>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </Tab.Pane>

          {/* ================= TAB 3: CATEGORIES ================= */}
          <Tab.Pane eventKey="categories">
            <Card className="border-warm shadow-sm rounded-3 bg-white mb-4">
              <Card.Header className="bg-white border-bottom border-warm p-3 p-sm-4 d-flex justify-content-between align-items-center">
                <h5 className="serif-display text-dark mb-0">Store Categories</h5>
                <Button
                  className="btn-terracotta px-3 py-2 rounded-3 text-nowrap"
                  onClick={handleOpenAddCat}
                >
                  <i className="bi bi-plus-lg me-1" /> Add Category
                </Button>
              </Card.Header>

              <Card.Body className="p-0">
                <div className="table-responsive">
                  <Table hover className="align-middle mb-0">
                    <thead className="bg-cream small text-muted text-uppercase">
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Slug</th>
                        <th>Description</th>
                        <th className="text-end pe-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categoriesLoading ? (
                        <tr>
                          <td colSpan={5} className="text-center py-4 text-muted">
                            <Spinner animation="border" size="sm" className="me-2" />
                            Loading categories...
                          </td>
                        </tr>
                      ) : categories.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-4 text-muted">
                            No categories created yet.
                          </td>
                        </tr>
                      ) : (
                        categories.map((c) => (
                          <tr key={c.id}>
                            <td className="text-muted small">#{c.id}</td>
                            <td className="fw-semibold text-dark">{c.name}</td>
                            <td>
                              <code>{c.slug}</code>
                            </td>
                            <td
                              className="text-muted small text-truncate"
                              style={{ maxWidth: '280px' }}
                            >
                              {c.description || '—'}
                            </td>
                            <td className="text-end pe-4 text-nowrap">
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                className="me-2 py-1 px-2 border-warm"
                                onClick={() => handleOpenEditCat(c)}
                              >
                                <i className="bi bi-pencil" />
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                className="py-1 px-2"
                                onClick={() => handleDeleteCat(c)}
                              >
                                <i className="bi bi-trash" />
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </Tab.Pane>

          {/* ================= TAB 4: GLOBAL ORDERS ================= */}
          <Tab.Pane eventKey="orders">
            <Card className="border-warm shadow-sm rounded-3 bg-white mb-4">
              <Card.Header className="bg-white border-bottom border-warm p-3 p-sm-4 d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
                <div className="d-flex align-items-center gap-1 flex-wrap">
                  <span className="small text-muted me-2">Status:</span>
                  <Button
                    size="sm"
                    variant={orderStatusFilter === 'all' ? 'dark' : 'outline-secondary'}
                    className="rounded-pill px-3 py-1 border-warm"
                    onClick={() => handleFilterOrdersByStatus('all')}
                  >
                    All
                  </Button>
                  {ORDER_STATUSES.map((st) => (
                    <Button
                      key={st}
                      size="sm"
                      variant={orderStatusFilter === st ? 'terracotta' : 'outline-secondary'}
                      className="rounded-pill px-3 py-1 border-warm text-capitalize"
                      onClick={() => handleFilterOrdersByStatus(st)}
                    >
                      {st}
                    </Button>
                  ))}
                </div>
              </Card.Header>

              <Card.Body className="p-0">
                <div className="table-responsive">
                  <Table hover className="align-middle mb-0">
                    <thead className="bg-cream small text-muted text-uppercase">
                      <tr>
                        <th>Order</th>
                        <th>Customer</th>
                        <th>Date</th>
                        <th>Shipping Address</th>
                        <th>Total</th>
                        <th>Fulfillment Status</th>
                        <th className="text-end pe-4">Items</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ordersLoading ? (
                        <tr>
                          <td colSpan={7} className="text-center py-4 text-muted">
                            <Spinner animation="border" size="sm" className="me-2" />
                            Loading orders...
                          </td>
                        </tr>
                      ) : orders.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-4 text-muted">
                            No orders found with status "{orderStatusFilter}".
                          </td>
                        </tr>
                      ) : (
                        orders.map((o) => (
                          <tr key={o.id}>
                            <td>
                              <strong className="serif-display text-dark">#{o.id}</strong>
                            </td>
                            <td>
                              <div className="text-dark small fw-medium">{o.user?.email}</div>
                              <small className="text-muted">
                                {o.user?.profile?.fullName || '—'}
                              </small>
                            </td>
                            <td className="small text-muted text-nowrap">
                              {new Date(o.createdAt).toLocaleDateString()}
                            </td>
                            <td>
                              <div
                                className="small text-truncate"
                                style={{ maxWidth: '200px' }}
                                title={o.shippingAddress}
                              >
                                {o.shippingAddress}
                              </div>
                            </td>
                            <td className="fw-semibold text-terracotta">
                              ${Number(o.total).toFixed(2)}
                            </td>
                            <td>
                              <Form.Select
                                size="sm"
                                value={o.status}
                                onChange={(e) =>
                                  handleOrderStatusChange(o.id, e.target.value as OrderStatus)
                                }
                                className="border-warm text-capitalize"
                                style={{ width: '135px' }}
                              >
                                {ORDER_STATUSES.map((st) => (
                                  <option key={st} value={st}>
                                    {st}
                                  </option>
                                ))}
                              </Form.Select>
                            </td>
                            <td className="text-end pe-4 text-nowrap">
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                className="border-warm py-1 px-2"
                                onClick={() => setViewingOrder(o)}
                              >
                                <i className="bi bi-box me-1" /> View ({o.items?.length || 0})
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </Tab.Pane>

          {/* ================= TAB 5: USERS ================= */}
          <Tab.Pane eventKey="users">
            <Card className="border-warm shadow-sm rounded-3 bg-white mb-4">
              <Card.Header className="bg-white border-bottom border-warm p-3 p-sm-4">
                <h5 className="serif-display text-dark mb-0">Registered User Accounts</h5>
              </Card.Header>

              <Card.Body className="p-0">
                <div className="table-responsive">
                  <Table hover className="align-middle mb-0">
                    <thead className="bg-cream small text-muted text-uppercase">
                      <tr>
                        <th>ID</th>
                        <th>Email</th>
                        <th>Full Name</th>
                        <th>Phone</th>
                        <th>Role</th>
                        <th>Joined</th>
                        <th className="text-end pe-4">Role Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersLoading ? (
                        <tr>
                          <td colSpan={7} className="text-center py-4 text-muted">
                            <Spinner animation="border" size="sm" className="me-2" />
                            Loading users...
                          </td>
                        </tr>
                      ) : users.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-4 text-muted">
                            No users registered.
                          </td>
                        </tr>
                      ) : (
                        users.map((u: any) => (
                          <tr key={u.id}>
                            <td className="text-muted small">#{u.id}</td>
                            <td className="fw-medium text-dark">{u.email}</td>
                            <td className="small text-muted">{u.profile?.fullName || '—'}</td>
                            <td className="small text-muted">{u.profile?.phone || '—'}</td>
                            <td>
                              <Badge
                                bg={u.role === 'admin' ? 'dark' : 'cream'}
                                className={u.role === 'admin' ? 'text-white' : 'text-dark border'}
                              >
                                {u.role}
                              </Badge>
                            </td>
                            <td className="small text-muted">
                              {new Date(u.createdAt).toLocaleDateString()}
                            </td>
                            <td className="text-end pe-4 text-nowrap">
                              {u.role === 'admin' ? (
                                <span className="text-muted small">
                                  <i className="bi bi-lock-fill me-1" />
                                  Protected
                                </span>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline-dark"
                                  className="py-1 px-2 border-warm"
                                  onClick={() => handleToggleUserRole(u)}
                                >
                                  Make Admin
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>

      {/* ================= MODAL: ADD / EDIT PRODUCT ================= */}
      <Modal
        show={showAddProductModal || showEditProductModal}
        onHide={() => {
          setShowAddProductModal(false);
          setShowEditProductModal(false);
        }}
        centered
        size="lg"
      >
        <Modal.Header closeButton className="border-bottom border-warm">
          <Modal.Title className="serif-display text-dark h5 mb-0">
            {showAddProductModal
              ? 'Add New Product to Catalog'
              : `Edit Product #${editingProduct?.id}`}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={showAddProductModal ? handleSubmitAddProduct : handleSubmitEditProduct}>
          <Modal.Body className="p-4">
            <Row className="g-3">
              <Col md={8}>
                <Form.Group controlId="productTitle">
                  <Form.Label className="small fw-medium">Product Title *</Form.Label>
                  <Form.Control
                    required
                    value={productForm.title}
                    onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                    placeholder="e.g. Handcrafted Ceramic Mug"
                    className="border-warm"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="productCategory">
                  <Form.Label className="small fw-medium">Category *</Form.Label>
                  <Form.Select
                    value={productForm.categoryId}
                    onChange={(e) =>
                      setProductForm({ ...productForm, categoryId: Number(e.target.value) })
                    }
                    className="border-warm"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group controlId="productSku">
                  <Form.Label className="small fw-medium">SKU *</Form.Label>
                  <Form.Control
                    required
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    placeholder="e.g. MUG-001"
                    className="border-warm"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="productPrice">
                  <Form.Label className="small fw-medium">Price ($) *</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={productForm.price}
                    onChange={(e) =>
                      setProductForm({ ...productForm, price: parseFloat(e.target.value) || 0 })
                    }
                    className="border-warm"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="productStock">
                  <Form.Label className="small fw-medium">Stock Count *</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    required
                    value={productForm.stock}
                    onChange={(e) =>
                      setProductForm({ ...productForm, stock: parseInt(e.target.value, 10) || 0 })
                    }
                    className="border-warm"
                  />
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group controlId="productImage">
                  <Form.Label className="small fw-medium">Image URL</Form.Label>
                  <Form.Control
                    value={productForm.imageUrl}
                    onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                    placeholder="https://..."
                    className="border-warm"
                  />
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group controlId="productDescription">
                  <Form.Label className="small fw-medium">Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={productForm.description}
                    onChange={(e) =>
                      setProductForm({ ...productForm, description: e.target.value })
                    }
                    placeholder="Handcrafted details, materials, origin..."
                    className="border-warm"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer className="border-top border-warm">
            <Button
              variant="outline-secondary"
              onClick={() => {
                setShowAddProductModal(false);
                setShowEditProductModal(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" className="btn-terracotta">
              {showAddProductModal ? 'Create Product' : 'Save Changes'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* ================= MODAL: ADD / EDIT CATEGORY ================= */}
      <Modal
        show={showAddCatModal || showEditCatModal}
        onHide={() => {
          setShowAddCatModal(false);
          setShowEditCatModal(false);
        }}
        centered
      >
        <Modal.Header closeButton className="border-bottom border-warm">
          <Modal.Title className="serif-display text-dark h5 mb-0">
            {showAddCatModal ? 'Add New Category' : `Edit Category #${editingCat?.id}`}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={showAddCatModal ? handleSubmitAddCat : handleSubmitEditCat}>
          <Modal.Body className="p-4">
            <Form.Group className="mb-3" controlId="catName">
              <Form.Label className="small fw-medium">Category Name *</Form.Label>
              <Form.Control
                required
                value={catForm.name}
                onChange={(e) => {
                  const val = e.target.value;
                  setCatForm({
                    ...catForm,
                    name: val,
                    slug: catForm.slug || val.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                  });
                }}
                placeholder="e.g. Leather Goods"
                className="border-warm"
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="catSlug">
              <Form.Label className="small fw-medium">URL Slug *</Form.Label>
              <Form.Control
                required
                value={catForm.slug}
                onChange={(e) => setCatForm({ ...catForm, slug: e.target.value })}
                placeholder="e.g. leather-goods"
                className="border-warm"
              />
              <Form.Text className="text-muted small">
                Lowercase letters, numbers, and dashes only.
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3" controlId="catDesc">
              <Form.Label className="small fw-medium">Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={catForm.description}
                onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                placeholder="Brief summary of this product collection..."
                className="border-warm"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="border-top border-warm">
            <Button
              variant="outline-secondary"
              onClick={() => {
                setShowAddCatModal(false);
                setShowEditCatModal(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" className="btn-terracotta">
              {showAddCatModal ? 'Create Category' : 'Save Changes'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* ================= MODAL: VIEW ORDER ITEMS ================= */}
      <Modal show={Boolean(viewingOrder)} onHide={() => setViewingOrder(null)} centered size="lg">
        <Modal.Header closeButton className="border-bottom border-warm">
          <Modal.Title className="serif-display text-dark h5 mb-0">
            Order #{viewingOrder?.id} — Items Breakdown
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {viewingOrder && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-3 p-3 bg-cream rounded-3 border border-warm">
                <div>
                  <small className="text-muted d-block">Customer</small>
                  <strong>{viewingOrder.user?.email}</strong>
                </div>
                <div className="text-end">
                  <small className="text-muted d-block">Status</small>
                  <Badge bg="warning" text="dark" className="text-capitalize">
                    {viewingOrder.status}
                  </Badge>
                </div>
              </div>

              <div className="d-flex flex-column gap-2 mb-3">
                {viewingOrder.items?.map((item) => (
                  <div
                    key={item.id}
                    className="d-flex align-items-center gap-3 p-2 bg-light rounded border border-warm"
                  >
                    <div
                      className="rounded overflow-hidden border border-warm flex-shrink-0"
                      style={{ width: '48px', height: '48px', backgroundColor: '#f5f0ea' }}
                    >
                      <img
                        src={
                          item.product?.imageUrl ||
                          'https://images.unsplash.com/photo-1544816155-12df9643f363?w=100&q=80'
                        }
                        alt={item.product?.title || 'Product'}
                        className="w-100 h-100 object-fit-cover"
                      />
                    </div>
                    <div className="flex-grow-1 min-w-0">
                      <div className="fw-medium text-dark small text-truncate">
                        {item.product?.title || `Product #${item.productId}`}
                      </div>
                      <small className="text-muted">
                        ${Number(item.unitPrice).toFixed(2)} &times; {item.quantity}
                      </small>
                    </div>
                    <div className="text-terracotta fw-semibold small text-end">
                      ${(Number(item.unitPrice) * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-cream rounded-3 border border-warm">
                <div className="d-flex justify-content-between small text-muted mb-1">
                  <span>Subtotal</span>
                  <span>${Number(viewingOrder.subtotal).toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between small text-muted mb-1">
                  <span>Tax (8%)</span>
                  <span>${Number(viewingOrder.tax).toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between fs-6 fw-bold text-dark pt-2 border-top border-warm">
                  <span>Total Paid</span>
                  <span className="text-terracotta">${Number(viewingOrder.total).toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-top border-warm">
          <Button variant="outline-secondary" onClick={() => setViewingOrder(null)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminDashboardPage;

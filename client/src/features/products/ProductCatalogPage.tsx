import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Form,
  InputGroup,
  Button,
  Pagination,
  Spinner,
  Alert,
} from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchProducts, setFilters, setPage } from './productSlice';
import { fetchCategories } from '../categories/categorySlice';
import ProductCard from './ProductCard';
import type { ProductQueryParams } from '@ecomm/shared/src/product';

const SORT_OPTIONS: { label: string; value: ProductQueryParams['sortBy'] }[] = [
  { label: 'Newest First', value: 'created_desc' },
  { label: 'Price: Low → High', value: 'price_asc' },
  { label: 'Price: High → Low', value: 'price_desc' },
  { label: 'Name A–Z', value: 'title_asc' },
];

const VALID_SORT_VALUES = new Set(SORT_OPTIONS.map((o) => o.value));

const ProductCatalogPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { items, filters, pagination, listStatus, error } = useAppSelector((s) => s.products);
  const { items: categories } = useAppSelector((s) => s.categories);

  const [searchInput, setSearchInput] = useState(() => searchParams.get('search') ?? '');

  // Debounce ref for search
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initial categories load
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Sync URL query params -> Redux state -> fetch products
  useEffect(() => {
    const rawCat = searchParams.get('categoryId');
    const parsedCat = rawCat ? parseInt(rawCat, 10) : NaN;
    const categoryId = !isNaN(parsedCat) && parsedCat > 0 ? parsedCat : null;

    const search = searchParams.get('search') ?? '';

    const rawSort = searchParams.get('sortBy') as ProductQueryParams['sortBy'] | null;
    const sortBy: ProductQueryParams['sortBy'] =
      rawSort && VALID_SORT_VALUES.has(rawSort) ? rawSort : 'created_desc';

    const rawPage = searchParams.get('page');
    const parsedPage = rawPage ? parseInt(rawPage, 10) : NaN;
    const page = !isNaN(parsedPage) && parsedPage > 0 ? parsedPage : 1;

    dispatch(setFilters({ search, categoryId, sortBy }));
    dispatch(setPage(page));
    dispatch(
      fetchProducts({
        search: search || undefined,
        categoryId: categoryId ?? undefined,
        sortBy,
        page,
        limit: pagination.limit,
      })
    );
  }, [searchParams, dispatch, pagination.limit]);

  const updateParams = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);
    for (const [key, val] of Object.entries(updates)) {
      if (val === null || val === '') {
        next.delete(key);
      } else {
        next.set(key, val);
      }
    }
    setSearchParams(next);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchInput(val);
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => {
      updateParams({ search: val.trim() || null, page: null });
    }, 400);
  };

  const handleClearSearch = () => {
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    setSearchInput('');
    updateParams({ search: null, page: null });
  };

  const handleCategoryChange = (categoryId: number | null) => {
    updateParams({ categoryId: categoryId !== null ? String(categoryId) : null, page: null });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as ProductQueryParams['sortBy'];
    updateParams({ sortBy: val === 'created_desc' ? null : (val ?? null), page: null });
  };

  const handlePageChange = (p: number) => {
    updateParams({ page: p > 1 ? String(p) : null });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isLoading = listStatus === 'loading';

  return (
    <div className="min-vh-100 py-5" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
      <Container>
        {/* Page Header */}
        <div className="mb-5">
          <h1 className="serif-display fw-semibold mb-1">Our Collection</h1>
          <p className="text-muted mb-0">
            {pagination.total > 0
              ? `${pagination.total} artisan pieces`
              : 'Discover handcrafted artisan goods'}
          </p>
        </div>

        {/* Search + Sort bar */}
        <Row className="g-3 mb-4 align-items-center">
          <Col md={6} lg={7}>
            <InputGroup>
              <InputGroup.Text className="bg-transparent border-warm">
                <i className="bi bi-search text-muted" />
              </InputGroup.Text>
              <Form.Control
                type="search"
                placeholder="Search products…"
                value={searchInput}
                onChange={handleSearchChange}
                className="border-warm border-start-0 ps-0"
                aria-label="Search products"
              />
              {searchInput && (
                <Button
                  variant="outline-secondary"
                  className="border-warm"
                  onClick={handleClearSearch}
                  aria-label="Clear search"
                >
                  <i className="bi bi-x" />
                </Button>
              )}
            </InputGroup>
          </Col>

          <Col md={3} lg={3}>
            <Form.Select
              value={filters.sortBy ?? 'created_desc'}
              onChange={handleSortChange}
              className="border-warm"
              aria-label="Sort products"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Form.Select>
          </Col>

          <Col md={3} lg={2} className="text-md-end">
            {isLoading && (
              <Spinner
                animation="border"
                size="sm"
                role="status"
                className="text-terracotta"
                aria-label="Loading"
              />
            )}
          </Col>
        </Row>

        {/* Category Filter Pills */}
        <div className="d-flex flex-wrap gap-2 mb-4">
          <button
            type="button"
            onClick={() => handleCategoryChange(null)}
            className={`btn btn-sm rounded-pill px-3 ${
              filters.categoryId === null ? 'btn-terracotta' : 'btn-outline-secondary border-warm'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleCategoryChange(filters.categoryId === cat.id ? null : cat.id)}
              className={`btn btn-sm rounded-pill px-3 ${
                filters.categoryId === cat.id
                  ? 'btn-terracotta'
                  : 'btn-outline-secondary border-warm'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Error State */}
        {listStatus === 'failed' && error && (
          <Alert variant="danger" className="rounded-3">
            <i className="bi bi-exclamation-triangle me-2" />
            {error}
          </Alert>
        )}

        {/* Empty State */}
        {listStatus === 'succeeded' && items.length === 0 && (
          <div className="text-center py-5">
            <i className="bi bi-search display-3 text-muted d-block mb-3" />
            <h4 className="text-muted">No products found</h4>
            <p className="text-muted small">Try adjusting your search or filters</p>
            <Button
              variant="outline-secondary"
              className="border-warm mt-2"
              onClick={() => dispatch(setFilters({ search: '', categoryId: null }))}
            >
              Clear filters
            </Button>
          </div>
        )}

        {/* Product Grid */}
        {(listStatus === 'succeeded' || listStatus === 'loading') && items.length > 0 && (
          <Row className="g-4">
            {items.map((product) => (
              <Col key={product.id} xs={12} sm={6} lg={4} xl={3}>
                <ProductCard product={product} />
              </Col>
            ))}
          </Row>
        )}

        {/* Skeleton placeholders while loading first time */}
        {listStatus === 'loading' && items.length === 0 && (
          <Row className="g-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Col key={i} xs={12} sm={6} lg={4} xl={3}>
                <div
                  className="card border-warm warm-shadow placeholder-glow h-100"
                  style={{ minHeight: '340px' }}
                >
                  <div
                    className="placeholder w-100"
                    style={{ height: '220px', borderRadius: '0.375rem 0.375rem 0 0' }}
                  />
                  <div className="card-body d-flex flex-column gap-2 p-3">
                    <span className="placeholder col-5 rounded" />
                    <span className="placeholder col-9 rounded" />
                    <span className="placeholder col-7 rounded" />
                    <div className="mt-auto d-flex justify-content-between pt-2">
                      <span className="placeholder col-3 rounded" />
                      <span className="placeholder col-3 rounded" />
                    </div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="d-flex justify-content-center mt-5">
            <Pagination className="mb-0">
              <Pagination.Prev
                disabled={pagination.page === 1}
                onClick={() => handlePageChange(pagination.page - 1)}
              />
              {Array.from({ length: pagination.totalPages }).map((_, idx) => {
                const p = idx + 1;
                // Show first, last, current, and ±1 of current; collapse others
                const show =
                  p === 1 || p === pagination.totalPages || Math.abs(p - pagination.page) <= 1;
                const isEllipsis =
                  (p === 2 && pagination.page > 4) ||
                  (p === pagination.totalPages - 1 && pagination.page < pagination.totalPages - 3);
                if (!show) return null;
                if (isEllipsis) return <Pagination.Ellipsis key={p} disabled />;
                return (
                  <Pagination.Item
                    key={p}
                    active={p === pagination.page}
                    onClick={() => handlePageChange(p)}
                  >
                    {p}
                  </Pagination.Item>
                );
              })}
              <Pagination.Next
                disabled={pagination.page === pagination.totalPages}
                onClick={() => handlePageChange(pagination.page + 1)}
              />
            </Pagination>
          </div>
        )}
      </Container>
    </div>
  );
};

export default ProductCatalogPage;

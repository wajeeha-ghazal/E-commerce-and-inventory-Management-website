import React, { useState, useEffect, useMemo } from 'react';
import { Card, Table, Button, Badge, Form, Spinner } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../../../../app/hooks';
import {
  fetchAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory,
  restoreAdminCategory,
} from '../../adminSlice';
import CategoryModal from '../modals/CategoryModal';
import AdminPagination from '../AdminPagination';
import type { CategoryDTO, CreateCategoryInput } from '@ecomm/shared';

export const CategoriesTab: React.FC = () => {
  const dispatch = useAppDispatch();
  const { categories, categoriesLoading } = useAppSelector((state) => state.admin);

  const [includeDeleted, setIncludeDeleted] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryDTO | null>(null);

  useEffect(() => {
    dispatch(fetchAdminCategories(includeDeleted));
  }, [dispatch, includeDeleted]);

  // Pagination calculations
  const totalItems = categories.length;
  const totalPages = Math.ceil(totalItems / limit) || 1;
  const paginatedCategories = useMemo(() => {
    const start = (page - 1) * limit;
    return categories.slice(start, start + limit);
  }, [categories, page, limit]);

  useEffect(() => {
    setPage(1);
  }, [includeDeleted]);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (c: CategoryDTO) => {
    setEditingCategory(c);
    setModalOpen(true);
  };

  const handleSubmitModal = async (values: CreateCategoryInput) => {
    if (editingCategory) {
      const res = await dispatch(updateAdminCategory({ id: editingCategory.id, data: values }));
      if (updateAdminCategory.fulfilled.match(res)) {
        return true;
      }
      return false;
    } else {
      const res = await dispatch(createAdminCategory(values));
      if (createAdminCategory.fulfilled.match(res)) {
        return true;
      }
      return false;
    }
  };

  const handleDelete = async (c: CategoryDTO) => {
    if (window.confirm(`Are you sure you want to delete category "${c.name}"?`)) {
      await dispatch(deleteAdminCategory(c.id));
    }
  };

  const handleRestore = async (c: CategoryDTO) => {
    await dispatch(restoreAdminCategory(c.id));
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
              <i className="bi bi-plus-lg me-1" /> Add Category
            </Button>
            <Form.Check
              type="switch"
              id="toggle-deleted-categories"
              label="Show Soft-Deleted"
              checked={includeDeleted}
              onChange={(e) => setIncludeDeleted(e.target.checked)}
              className="small text-muted"
            />
          </div>
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
                  <th>Status</th>
                  <th className="text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categoriesLoading && categories.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-4 text-muted">
                      <Spinner animation="border" size="sm" className="me-2" />
                      Loading categories...
                    </td>
                  </tr>
                ) : paginatedCategories.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-4 text-muted">
                      No categories found.
                    </td>
                  </tr>
                ) : (
                  paginatedCategories.map((c) => {
                    const isDeleted = Boolean(c.deletedAt);
                    return (
                      <tr key={c.id} className={isDeleted ? 'opacity-75 bg-light' : ''}>
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
                        <td>
                          {isDeleted ? (
                            <Badge bg="secondary">Soft-Deleted</Badge>
                          ) : (
                            <Badge bg="success" bg-opacity="25" text="dark">
                              Active
                            </Badge>
                          )}
                        </td>
                        <td className={`${isDeleted ? 'text-center' : 'text-end pe-4'} text-nowrap`}>
                          {isDeleted ? (
                            <Button
                              variant="outline-success"
                              size="sm"
                              className="py-0 px-2"
                              onClick={() => handleRestore(c)}
                              title="Restore category"
                            >
                              <i className="bi bi-arrow-counterclockwise me-1" /> Restore
                            </Button>
                          ) : (
                            <>
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                className="me-2 py-1 px-2 border-warm"
                                onClick={() => handleOpenEdit(c)}
                                title="Edit details"
                              >
                                <i className="bi bi-pencil" />
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                className="py-1 px-2"
                                onClick={() => handleDelete(c)}
                                title="Soft-delete category"
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

      <CategoryModal
        show={modalOpen}
        onHide={() => setModalOpen(false)}
        category={editingCategory}
        onSubmit={handleSubmitModal}
      />
    </>
  );
};

export default CategoriesTab;

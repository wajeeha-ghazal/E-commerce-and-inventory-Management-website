import React, { useMemo } from 'react';
import { Modal, Form, Button, Spinner } from 'react-bootstrap';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import type { CategoryDTO, CreateCategoryInput } from '@ecomm/shared';

export interface CategoryModalProps {
  show: boolean;
  onHide: () => void;
  category: CategoryDTO | null;
  onSubmit: (values: CreateCategoryInput) => Promise<boolean | void>;
}

const CategoryValidationSchema = Yup.object().shape({
  name: Yup.string().trim().required('Category name is required').max(100, 'Max 100 characters'),
  slug: Yup.string()
    .trim()
    .required('Category slug is required')
    .matches(/^[a-z0-9-]+$/, 'Slug must only contain lowercase letters, numbers, and hyphens')
    .max(100, 'Max 100 characters'),
  description: Yup.string().trim(),
});

export const CategoryModal: React.FC<CategoryModalProps> = ({
  show,
  onHide,
  category,
  onSubmit,
}) => {
  const isEditing = Boolean(category);

  const initialValues = useMemo<CreateCategoryInput>(
    () => ({
      name: category?.name || '',
      slug: category?.slug || '',
      description: category?.description || '',
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [category, show]
  );

  const formik = useFormik<CreateCategoryInput>({
    enableReinitialize: true,
    initialValues,
    validationSchema: CategoryValidationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const success = await onSubmit({
          name: values.name.trim(),
          slug: values.slug.trim(),
          description: values.description?.trim() || '',
        });
        if (success !== false) {
          onHide();
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Automatically suggest slug from name when adding a new category
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    formik.handleChange(e);
    if (!isEditing && !formik.touched.slug) {
      const generatedSlug = e.target.value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      formik.setFieldValue('slug', generatedSlug);
    }
  };

  return (
    <Modal show={show} onHide={onHide} backdrop="static" centered>
      <Modal.Header closeButton className="border-warm">
        <Modal.Title className="serif-display h5 mb-0">
          {isEditing ? `Edit Category #${category?.id}` : 'Create New Category'}
        </Modal.Title>
      </Modal.Header>
      <Form noValidate onSubmit={formik.handleSubmit}>
        <Modal.Body className="p-4">
          <Form.Group className="mb-3" controlId="category-name">
            <Form.Label className="small fw-semibold text-dark">Category Name *</Form.Label>
            <Form.Control
              name="name"
              placeholder="e.g. Handmade Ceramics"
              value={formik.values.name}
              onChange={handleNameChange}
              onBlur={formik.handleBlur}
              isInvalid={formik.touched.name && !!formik.errors.name}
              className="border-warm"
            />
            <Form.Control.Feedback type="invalid">{formik.errors.name}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="category-slug">
            <Form.Label className="small fw-semibold text-dark">URL Slug *</Form.Label>
            <Form.Control
              name="slug"
              placeholder="e.g. handmade-ceramics"
              value={formik.values.slug}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              isInvalid={formik.touched.slug && !!formik.errors.slug}
              className="border-warm"
            />
            <Form.Text className="text-muted small">
              Unique lowercase URL-safe identifier (a-z, 0-9, hyphens).
            </Form.Text>
            <Form.Control.Feedback type="invalid">{formik.errors.slug}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group controlId="category-description">
            <Form.Label className="small fw-semibold text-dark">Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              placeholder="Brief description of this collection..."
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="border-warm"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="border-warm bg-light">
          <Button variant="outline-secondary" onClick={onHide} disabled={formik.isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            className="btn-terracotta px-4"
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Saving...
              </>
            ) : isEditing ? (
              'Save Changes'
            ) : (
              'Create Category'
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default CategoryModal;

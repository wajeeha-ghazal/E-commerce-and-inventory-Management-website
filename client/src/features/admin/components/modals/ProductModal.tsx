import React, { useMemo } from 'react';
import { Modal, Form, Button, Row, Col, Spinner } from 'react-bootstrap';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import type { ProductDTO, CategoryDTO, CreateProductInput } from '@ecomm/shared';

export interface ProductModalProps {
  show: boolean;
  onHide: () => void;
  product: ProductDTO | null;
  categories: CategoryDTO[];
  onSubmit: (values: CreateProductInput) => Promise<boolean | void>;
}

const ProductValidationSchema = Yup.object().shape({
  title: Yup.string().trim().required('Product title is required').max(255, 'Max 255 characters'),
  categoryId: Yup.number().min(1, 'Please select a valid category').required('Category is required'),
  sku: Yup.string().trim().required('SKU is required').max(100, 'Max 100 characters'),
  price: Yup.number()
    .typeError('Price must be a number')
    .positive('Price must be greater than zero')
    .required('Price is required'),
  stock: Yup.number()
    .typeError('Stock must be an integer')
    .min(0, 'Stock cannot be negative')
    .integer('Stock must be a whole number')
    .required('Stock is required'),
  description: Yup.string().trim(),
  imageUrl: Yup.string().trim().url('Must be a valid URL (e.g. https://...)'),
});

export const ProductModal: React.FC<ProductModalProps> = ({
  show,
  onHide,
  product,
  categories,
  onSubmit,
}) => {
  const isEditing = Boolean(product);

  const initialValues = useMemo<CreateProductInput>(
    () => ({
      categoryId: product?.categoryId || categories[0]?.id || 1,
      title: product?.title || '',
      description: product?.description || '',
      sku: product?.sku || '',
      price: product ? Number(product.price) : 19.99,
      stock: product ? Number(product.stock) : 10,
      imageUrl: product?.imageUrl || '',
    }),
    // Only recompute when the edited product changes or modal is toggled
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [product, show]
  );

  const formik = useFormik<CreateProductInput>({
    enableReinitialize: true,
    initialValues,
    validationSchema: ProductValidationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const success = await onSubmit({
          ...values,
          price: Number(values.price),
          stock: Number(values.stock),
          categoryId: Number(values.categoryId),
        });
        if (success !== false) {
          onHide();
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <Modal show={show} onHide={onHide} backdrop="static" centered size="lg">
      <Modal.Header closeButton className="border-warm">
        <Modal.Title className="serif-display h5 mb-0">
          {isEditing ? `Edit Product #${product?.id}` : 'Create New Product'}
        </Modal.Title>
      </Modal.Header>
      <Form noValidate onSubmit={formik.handleSubmit}>
        <Modal.Body className="p-4">
          <Row className="g-3">
            <Col md={8}>
              <Form.Group controlId="product-title">
                <Form.Label className="small fw-semibold text-dark">Product Title *</Form.Label>
                <Form.Control
                  name="title"
                  placeholder="e.g. Handcrafted Ceramic Mug"
                  value={formik.values.title}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  isInvalid={formik.touched.title && !!formik.errors.title}
                  className="border-warm"
                />
                <Form.Control.Feedback type="invalid">{formik.errors.title}</Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group controlId="product-category">
                <Form.Label className="small fw-semibold text-dark">Category *</Form.Label>
                <Form.Select
                  name="categoryId"
                  value={formik.values.categoryId}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  isInvalid={formik.touched.categoryId && !!formik.errors.categoryId}
                  className="border-warm"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {formik.errors.categoryId}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group controlId="product-sku">
                <Form.Label className="small fw-semibold text-dark">SKU Code *</Form.Label>
                <Form.Control
                  name="sku"
                  placeholder="e.g. SKU-12345"
                  value={formik.values.sku}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  isInvalid={formik.touched.sku && !!formik.errors.sku}
                  className="border-warm"
                />
                <Form.Control.Feedback type="invalid">{formik.errors.sku}</Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group controlId="product-price">
                <Form.Label className="small fw-semibold text-dark">Price ($) *</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  min="0"
                  name="price"
                  value={formik.values.price}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  isInvalid={formik.touched.price && !!formik.errors.price}
                  className="border-warm"
                />
                <Form.Control.Feedback type="invalid">{formik.errors.price}</Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group controlId="product-stock">
                <Form.Label className="small fw-semibold text-dark">Stock Inventory *</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  name="stock"
                  value={formik.values.stock}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  isInvalid={formik.touched.stock && !!formik.errors.stock}
                  className="border-warm"
                />
                <Form.Control.Feedback type="invalid">{formik.errors.stock}</Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col xs={12}>
              <Form.Group controlId="product-imageUrl">
                <Form.Label className="small fw-semibold text-dark">Image URL</Form.Label>
                <Form.Control
                  name="imageUrl"
                  placeholder="https://images.unsplash.com/..."
                  value={formik.values.imageUrl}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  isInvalid={formik.touched.imageUrl && !!formik.errors.imageUrl}
                  className="border-warm"
                />
                <Form.Control.Feedback type="invalid">{formik.errors.imageUrl}</Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col xs={12}>
              <Form.Group controlId="product-description">
                <Form.Label className="small fw-semibold text-dark">Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  placeholder="Provide craft materials, story, dimensions..."
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="border-warm"
                />
              </Form.Group>
            </Col>
          </Row>
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
              'Create Product'
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ProductModal;

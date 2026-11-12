import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Button, Row, Col, Alert, Badge } from 'react-bootstrap';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { updateProfile } from './authSlice';
import ErrorAlert from '../../components/ui/ErrorAlert';

const ProfileSchema = Yup.object().shape({
  fullName: Yup.string().max(100, 'Full name cannot exceed 100 characters'),
  phone: Yup.string().max(30, 'Phone cannot exceed 30 characters'),
  shippingAddress: Yup.string().max(500, 'Shipping address cannot exceed 500 characters'),
  avatarUrl: Yup.string().url('Must be a valid URL (e.g. https://...)').nullable(),
});

export const ProfilePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, status, error, fieldErrors } = useAppSelector((state) => state.auth);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const profile = user?.profile;

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      fullName: profile?.fullName || '',
      phone: profile?.phone || '',
      shippingAddress: profile?.shippingAddress || '',
      avatarUrl: profile?.avatarUrl || '',
    },
    validationSchema: ProfileSchema,
    onSubmit: async (values) => {
      setSaveSuccess(false);
      const res = await dispatch(updateProfile(values));
      if (updateProfile.fulfilled.match(res)) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 5000);
      }
    },
  });

  const isSubmitting = status === 'loading';
  const previewAvatar = formik.values.avatarUrl || profile?.avatarUrl;

  return (
    <Row className="justify-content-center py-2">
      <Col xs={12} lg={10}>
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div className="d-flex align-items-center gap-3">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => navigate(-1)}
              className="rounded-circle d-flex align-items-center justify-content-center border-warm text-dark bg-white shadow-sm"
              style={{ width: '40px', height: '40px', minWidth: '40px' }}
              title="Go Back"
              aria-label="Go Back"
            >
              <i className="bi bi-arrow-left fs-5" />
            </Button>
            <div>
              <h1 className="serif-display text-dark mb-1">My Account &amp; Profile</h1>
              <p className="text-secondary small mb-0">
                Manage your personal information, contact numbers, and delivery addresses.
              </p>
            </div>
          </div>
          <Badge
            bg={user?.role === 'admin' ? 'dark' : 'cream-alt'}
            className={
              user?.role === 'admin' ? 'p-2 text-white' : 'p-2 text-dark border border-warm'
            }
          >
            {user?.role === 'admin' ? 'Administrator Account' : 'Customer Account'}
          </Badge>
        </div>

        {saveSuccess && (
          <Alert
            variant="success"
            className="border-0 shadow-sm d-flex align-items-center gap-2"
            style={{ backgroundColor: '#edf7ed', color: '#2e7d32' }}
          >
            <i className="bi bi-check-circle-fill fs-5"></i>
            <span>Your profile details have been saved successfully!</span>
          </Alert>
        )}

        {error && <ErrorAlert message={error} />}

        <Row className="g-4">
          {/* Left Column: Avatar & Summary */}
          <Col md={4}>
            <Card className="border-warm warm-shadow p-4 bg-white text-center">
              <div className="position-relative d-inline-block mx-auto mb-3">
                {previewAvatar ? (
                  <img
                    src={previewAvatar}
                    alt={profile?.fullName || user?.email}
                    className="rounded-circle border border-warm object-fit-cover shadow-sm"
                    style={{ width: '120px', height: '120px' }}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200';
                    }}
                  />
                ) : (
                  <div
                    className="rounded-circle bg-cream border border-warm d-inline-flex align-items-center justify-content-center text-terracotta display-5 fw-bold shadow-sm"
                    style={{ width: '120px', height: '120px' }}
                  >
                    {(profile?.fullName || user?.email || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <h5 className="serif-display mb-1 text-dark">
                {profile?.fullName || 'Artisan Customer'}
              </h5>
              <p className="text-secondary small mb-3">{user?.email}</p>

              <hr className="border-warm my-3" />

              <div className="text-start small text-muted">
                <div className="mb-2">
                  <strong className="text-dark">Role:</strong>{' '}
                  <span className="text-capitalize">{user?.role}</span>
                </div>
                <div>
                  <strong className="text-dark">Member Since:</strong>{' '}
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            </Card>
          </Col>

          {/* Right Column: Edit Form */}
          <Col md={8}>
            <Card className="border-warm warm-shadow p-4 bg-white">
              <Card.Body>
                <h5 className="serif-display mb-3 text-dark border-bottom border-warm pb-2">
                  Edit Profile Information
                </h5>

                <Form noValidate onSubmit={formik.handleSubmit}>
                  <Form.Group className="mb-3" controlId="profileEmail">
                    <Form.Label className="small fw-medium">Email Address</Form.Label>
                    <Form.Control
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="bg-light"
                    />
                    <Form.Text className="text-muted">
                      Account email cannot be modified directly.
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="profileFullName">
                    <Form.Label className="small fw-medium">Full Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="fullName"
                      placeholder="e.g. Jane Elizabeth Doe"
                      value={formik.values.fullName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      isInvalid={
                        (formik.touched.fullName && !!formik.errors.fullName) ||
                        !!fieldErrors?.fullName
                      }
                      disabled={isSubmitting}
                    />
                    <Form.Control.Feedback type="invalid">
                      {formik.errors.fullName || fieldErrors?.fullName}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="profilePhone">
                    <Form.Label className="small fw-medium">Contact Phone</Form.Label>
                    <Form.Control
                      type="text"
                      name="phone"
                      placeholder="e.g. +1 (555) 019-2834"
                      value={formik.values.phone}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      isInvalid={
                        (formik.touched.phone && !!formik.errors.phone) || !!fieldErrors?.phone
                      }
                      disabled={isSubmitting}
                    />
                    <Form.Control.Feedback type="invalid">
                      {formik.errors.phone || fieldErrors?.phone}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="profileAvatarUrl">
                    <Form.Label className="small fw-medium">Avatar Image URL</Form.Label>
                    <Form.Control
                      type="url"
                      name="avatarUrl"
                      placeholder="https://images.unsplash.com/..."
                      value={formik.values.avatarUrl}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      isInvalid={
                        (formik.touched.avatarUrl && !!formik.errors.avatarUrl) ||
                        !!fieldErrors?.avatarUrl
                      }
                      disabled={isSubmitting}
                    />
                    <Form.Control.Feedback type="invalid">
                      {formik.errors.avatarUrl || fieldErrors?.avatarUrl}
                    </Form.Control.Feedback>
                    <Form.Text className="text-muted">
                      Direct image link for your profile picture.
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-4" controlId="profileShippingAddress">
                    <Form.Label className="small fw-medium">Default Shipping Address</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="shippingAddress"
                      placeholder="Street address, apartment/suite, city, state, postal code"
                      value={formik.values.shippingAddress}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      isInvalid={
                        (formik.touched.shippingAddress && !!formik.errors.shippingAddress) ||
                        !!fieldErrors?.shippingAddress
                      }
                      disabled={isSubmitting}
                    />
                    <Form.Control.Feedback type="invalid">
                      {formik.errors.shippingAddress || fieldErrors?.shippingAddress}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <div className="d-flex justify-content-end gap-2">
                    <Button
                      type="button"
                      variant="outline-secondary"
                      onClick={() => formik.resetForm()}
                      disabled={isSubmitting || !formik.dirty}
                    >
                      Cancel Changes
                    </Button>
                    <Button
                      type="submit"
                      className="btn-terracotta px-4"
                      disabled={isSubmitting || !formik.dirty}
                    >
                      {isSubmitting ? 'Saving...' : 'Save Profile Details'}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

export default ProfilePage;

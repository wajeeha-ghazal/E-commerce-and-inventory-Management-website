import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, InputGroup } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { registerUser, clearAuthError } from './authSlice';
import ErrorAlert from '../../components/ui/ErrorAlert';

const RegisterSchema = Yup.object().shape({
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email address is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[a-zA-Z]/, 'Password must contain at least one letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
  fullName: Yup.string().max(100, 'Full name cannot exceed 100 characters'),
  phone: Yup.string().max(30, 'Phone cannot exceed 30 characters'),
  shippingAddress: Yup.string().max(500, 'Address cannot exceed 500 characters'),
});

export const RegisterPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { isAuthenticated, status, error, fieldErrors } = useAppSelector((state) => state.auth);
  const from =
    typeof location.state?.from === 'string'
      ? location.state.from
      : location.state?.from?.pathname || '/';

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      phone: '',
      shippingAddress: '',
    },
    validationSchema: RegisterSchema,
    onSubmit: async (values) => {
      const { confirmPassword, ...registerPayload } = values;
      await dispatch(registerUser(registerPayload));
    },
  });

  const isSubmitting = status === 'loading';

  return (
    <Row className="justify-content-center py-4">
      <Col xs={12} sm={11} md={9} lg={6}>
        <Card className="border-warm warm-shadow p-4 bg-white">
          <Card.Body>
            <div className="text-center mb-4">
              <span className="fs-1">🏺</span>
              <h2 className="serif-display text-dark mt-2 mb-1">Create an Account</h2>
              <p className="text-secondary small">
                Join Atelier &amp; Co. to experience curated artisan collections and personalized
                delivery.
              </p>
            </div>

            {error && <ErrorAlert message={error} onDismiss={() => dispatch(clearAuthError())} />}

            <Form noValidate onSubmit={formik.handleSubmit}>
              <h6 className="fw-semibold text-dark border-bottom border-warm pb-2 mb-3">
                Account Credentials
              </h6>

              <Form.Group className="mb-3" controlId="registerEmail">
                <Form.Label className="small fw-medium">Email Address *</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  isInvalid={
                    (formik.touched.email && !!formik.errors.email) || !!fieldErrors?.email
                  }
                  disabled={isSubmitting}
                />
                <Form.Control.Feedback type="invalid">
                  {formik.errors.email || fieldErrors?.email}
                </Form.Control.Feedback>
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="registerPassword">
                    <Form.Label className="small fw-medium">Password *</Form.Label>
                    <InputGroup hasValidation>
                      <Form.Control
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        placeholder="Min. 8 characters"
                        value={formik.values.password}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        isInvalid={
                          (formik.touched.password && !!formik.errors.password) ||
                          !!fieldErrors?.password
                        }
                        disabled={isSubmitting}
                      />
                      <Button
                        variant="outline-secondary"
                        className="border-start-0"
                        onClick={() => setShowPassword((prev) => !prev)}
                        type="button"
                        tabIndex={-1}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                      </Button>
                      <Form.Control.Feedback type="invalid">
                        {formik.errors.password || fieldErrors?.password}
                      </Form.Control.Feedback>
                    </InputGroup>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3" controlId="registerConfirmPassword">
                    <Form.Label className="small fw-medium">Confirm Password *</Form.Label>
                    <InputGroup hasValidation>
                      <Form.Control
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        placeholder="Re-type password"
                        value={formik.values.confirmPassword}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        isInvalid={
                          formik.touched.confirmPassword && !!formik.errors.confirmPassword
                        }
                        disabled={isSubmitting}
                      />
                      <Button
                        variant="outline-secondary"
                        className="border-start-0"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        type="button"
                        tabIndex={-1}
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                      </Button>
                      <Form.Control.Feedback type="invalid">
                        {formik.errors.confirmPassword}
                      </Form.Control.Feedback>
                    </InputGroup>
                  </Form.Group>
                </Col>
              </Row>

              <h6 className="fw-semibold text-dark border-bottom border-warm pb-2 mt-4 mb-3">
                Shipping &amp; Profile Details
              </h6>

              <Form.Group className="mb-3" controlId="registerFullName">
                <Form.Label className="small fw-medium">Full Name</Form.Label>
                <Form.Control
                  type="text"
                  name="fullName"
                  placeholder="Jane Doe"
                  value={formik.values.fullName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  isInvalid={formik.touched.fullName && !!formik.errors.fullName}
                  disabled={isSubmitting}
                />
                <Form.Control.Feedback type="invalid">
                  {formik.errors.fullName}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3" controlId="registerPhone">
                <Form.Label className="small fw-medium">Phone Number</Form.Label>
                <Form.Control
                  type="text"
                  name="phone"
                  placeholder="+1 (555) 000-0000"
                  value={formik.values.phone}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  isInvalid={formik.touched.phone && !!formik.errors.phone}
                  disabled={isSubmitting}
                />
                <Form.Control.Feedback type="invalid">{formik.errors.phone}</Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-4" controlId="registerShippingAddress">
                <Form.Label className="small fw-medium">Default Shipping Address</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="shippingAddress"
                  placeholder="Street address, city, state, postal code"
                  value={formik.values.shippingAddress}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  isInvalid={formik.touched.shippingAddress && !!formik.errors.shippingAddress}
                  disabled={isSubmitting}
                />
                <Form.Control.Feedback type="invalid">
                  {formik.errors.shippingAddress}
                </Form.Control.Feedback>
              </Form.Group>

              <Button
                type="submit"
                className="w-100 btn-terracotta py-2 fw-medium mb-3"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating Account...' : 'Complete Registration'}
              </Button>
            </Form>

            <div className="text-center mt-3">
              <span className="text-secondary small">
                Already have an account?{' '}
                <Link to="/login" state={location.state} className="text-terracotta fw-semibold text-decoration-none">
                  Sign in instead
                </Link>
              </span>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default RegisterPage;

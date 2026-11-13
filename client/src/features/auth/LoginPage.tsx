import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, InputGroup } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { loginUser, clearAuthError } from './authSlice';
import ErrorAlert from '../../components/ui/ErrorAlert';

const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email address is required'),
  password: Yup.string().required('Password is required'),
});

export const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
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
    },
    validationSchema: LoginSchema,
    onSubmit: async (values) => {
      await dispatch(loginUser(values));
    },
  });

  const isSubmitting = status === 'loading';

  return (
    <Row className="justify-content-center py-4">
      <Col xs={12} sm={10} md={8} lg={5}>
        <Card className="border-warm warm-shadow p-4 bg-white">
          <Card.Body>
            <div className="text-center mb-4">
              <span className="fs-1">🏺</span>
              <h2 className="serif-display text-dark mt-2 mb-1">Welcome Back</h2>
              <p className="text-secondary small">
                Sign in to manage your orders, wishlist, and account details.
              </p>
            </div>

            {error && <ErrorAlert message={error} onDismiss={() => dispatch(clearAuthError())} />}

            <Form noValidate onSubmit={formik.handleSubmit}>
              <Form.Group className="mb-3" controlId="loginEmail">
                <Form.Label className="small fw-medium">Email Address</Form.Label>
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

              <Form.Group className="mb-4" controlId="loginPassword">
                <Form.Label className="small fw-medium">Password</Form.Label>
                <InputGroup hasValidation>
                  <Form.Control
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="••••••••"
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

              <Button
                type="submit"
                className="w-100 btn-terracotta py-2 fw-medium mb-3"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </Button>
            </Form>

            <div className="text-center mt-3">
              <span className="text-secondary small">
                Don't have an account yet?{' '}
                <Link to="/register" state={location.state} className="text-terracotta fw-semibold text-decoration-none">
                  Create an account
                </Link>
              </span>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default LoginPage;

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import InputField from '../components/ui/InputField';

interface ValidationErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [generalError, setGeneralError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[name as keyof ValidationErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    // First Name validation
    if (!formData.firstName) {
      newErrors.firstName = 'First name is required';
      isValid = false;
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters long';
      isValid = false;
    } else if (!/^[a-zA-Z\s-]+$/.test(formData.firstName)) {
      newErrors.firstName = 'First name can only contain letters, spaces, and hyphens';
      isValid = false;
    }

    // Last Name validation
    if (!formData.lastName) {
      newErrors.lastName = 'Last name is required';
      isValid = false;
    } else if (formData.lastName.length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters long';
      isValid = false;
    } else if (!/^[a-zA-Z\s-]+$/.test(formData.lastName)) {
      newErrors.lastName = 'Last name can only contain letters, spaces, and hyphens';
      isValid = false;
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
      isValid = false;
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
      isValid = false;
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');
    setErrors({});

    if (!validateForm()) {
      return;
    }

    try {
      // Generate a username from firstName and lastName
      const username = `${formData.firstName.toLowerCase()}_${formData.lastName.toLowerCase()}`.replace(/\s+/g, '');
      await register(username, formData.lastName, formData.email, formData.password);
      navigate('/');
    } catch (err: any) {
      if (err.errors) {
        setErrors(err.errors);
      } else if (err.message) {
        setGeneralError(err.message);
      } else {
        setGeneralError('Registration failed. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-center text-3xl font-extrabold text-primary-500">
            PlayRank
          </h1>
          <h2 className="mt-6 text-center text-3xl font-bold text-white">
            Create your account
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
          {generalError && (
            <div className="bg-red-500 text-white p-3 rounded-md text-sm" role="alert">
              {generalError}
            </div>
          )}

          <div className="rounded-md shadow-sm space-y-4">
            <InputField
              id="firstName"
              name="firstName"
              label="First Name"
              type="text"
              value={formData.firstName}
              onChange={handleInputChange}
              error={errors.firstName}
              placeholder="Enter your first name"
              autoComplete="given-name"
            />

            <InputField
              id="lastName"
              name="lastName"
              label="Last Name"
              type="text"
              value={formData.lastName}
              onChange={handleInputChange}
              error={errors.lastName}
              placeholder="Enter your last name"
              autoComplete="family-name"
            />

            <InputField
              id="email"
              name="email"
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              error={errors.email}
              placeholder="Enter your email"
              autoComplete="email"
            />

            <InputField
              id="password"
              name="password"
              label="Password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              error={errors.password}
              placeholder="Create a password"
              autoComplete="new-password"
            />

            <InputField
              id="confirmPassword"
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              error={errors.confirmPassword}
              placeholder="Confirm your password"
              autoComplete="new-password"
            />
          </div>

          <div>
            <button type="submit" className="btn-primary w-full">
              Sign up
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-secondary-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-primary-500 hover:text-primary-400"
              >
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register; 
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import InputField from '../components/ui/InputField';

interface ValidationErrors {
  email?: string;
  password?: string;
}

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [generalError, setGeneralError] = useState('');
  const { login } = useAuth();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGeneralError('');

    try {
      await login(formData.email, formData.password);
      navigate('/', { replace: true });
    } catch (err: any) {
      if (err.errors) {
        setErrors(err.errors);
      } else if (err.message) {
        setGeneralError(err.message);
      } else {
        setGeneralError('An unexpected error occurred. Please try again.');
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
            Sign in to your account
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
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </div>

          <div>
            <button type="submit" className="btn-primary w-full">
              Sign in
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-secondary-400">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-medium text-primary-500 hover:text-primary-400"
              >
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login; 
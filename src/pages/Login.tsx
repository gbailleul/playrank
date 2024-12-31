import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ValidationErrors {
  email?: string;
  password?: string;
}

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [generalError, setGeneralError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGeneralError('');

    try {
      await login(email, password);
      navigate('/');
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

  const InputField: React.FC<{
    id: string;
    label: string;
    type: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string;
    placeholder: string;
    autoComplete?: string;
  }> = ({ id, label, type, value, onChange, error, placeholder, autoComplete }) => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-secondary-400 mb-1">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        required
        value={value}
        onChange={onChange}
        className={`input-field ${error ? 'border-red-500' : ''}`}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-label={label}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );

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

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {generalError && (
            <div className="bg-red-500 text-white p-3 rounded-md text-sm" role="alert">
              {generalError}
            </div>
          )}

          <div className="rounded-md shadow-sm space-y-4">
            <InputField
              id="email"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              placeholder="Enter your email"
              autoComplete="email"
            />

            <InputField
              id="password"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
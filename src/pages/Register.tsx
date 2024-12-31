import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ValidationErrors {
  username?: string;
  surname?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [generalError, setGeneralError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    // Confirm password validation only (other validations are handled by the backend)
    if (password !== confirmPassword) {
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
      await register(username, surname, email, password);
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
            Create your account
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
              id="username"
              label="Username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              error={errors.username}
              placeholder="Choose a username"
              autoComplete="username"
            />

            <InputField
              id="surname"
              label="Surname"
              type="text"
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              error={errors.surname}
              placeholder="Enter your surname"
              autoComplete="family-name"
            />

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
              placeholder="Create a password"
              autoComplete="new-password"
            />

            <InputField
              id="confirmPassword"
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
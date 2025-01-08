import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import InputField from '../components/ui/InputField';

interface ValidationErrors {
  username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
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
  const [isLoading, setIsLoading] = useState(false);

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

    // Username validation
    if (!formData.username) {
      newErrors.username = 'Le pseudo est requis';
      isValid = false;
    } else if (formData.username.length < 3) {
      newErrors.username = 'Le pseudo doit contenir au moins 3 caractères';
      isValid = false;
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
      newErrors.username = 'Le pseudo ne peut contenir que des lettres, chiffres, tirets et underscores';
      isValid = false;
    }

    // First Name validation
    if (!formData.firstName) {
      newErrors.firstName = 'Le prénom est requis';
      isValid = false;
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = 'Le prénom doit contenir au moins 2 caractères';
      isValid = false;
    } else if (!/^[a-zA-Z\s-]+$/.test(formData.firstName)) {
      newErrors.firstName = 'Le prénom ne peut contenir que des lettres, espaces et tirets';
      isValid = false;
    }

    // Last Name validation
    if (!formData.lastName) {
      newErrors.lastName = 'Le nom est requis';
      isValid = false;
    } else if (formData.lastName.length < 2) {
      newErrors.lastName = 'Le nom doit contenir au moins 2 caractères';
      isValid = false;
    } else if (!/^[a-zA-Z\s-]+$/.test(formData.lastName)) {
      newErrors.lastName = 'Le nom ne peut contenir que des lettres, espaces et tirets';
      isValid = false;
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'L\'email est requis';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Veuillez entrer une adresse email valide';
      isValid = false;
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
      isValid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';
      isValid = false;
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre';
      isValid = false;
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Veuillez confirmer votre mot de passe';
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');
    setErrors({});
    setIsLoading(true);

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      await register(formData.username, formData.firstName, formData.lastName, formData.email, formData.password);
      navigate('/');
    } catch (err: any) {
      if (err.response?.data?.errors) {
        // Erreurs de validation du backend
        setErrors(err.response.data.errors);
      } else if (err.response?.data?.message) {
        // Message d'erreur général du backend
        setGeneralError(err.response.data.message);
      } else if (err.message) {
        // Message d'erreur de l'API
        setGeneralError(err.message);
      } else {
        setGeneralError('Une erreur est survenue lors de l\'inscription. Veuillez réessayer.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
      <div className="max-w-md w-full space-y-8 p-8 game-card">
        <div>
          <h2 className="mt-6 text-center text-3xl game-title">
            Créer un compte
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {generalError && (
            <div className="bg-red-500/10 text-red-500 p-3 rounded-lg text-sm backdrop-blur-sm border border-red-500/20">
              {generalError}
            </div>
          )}

          <div className="rounded-md shadow-sm space-y-4">
            <InputField
              id="username"
              name="username"
              label="Pseudo"
              type="text"
              value={formData.username}
              onChange={handleInputChange}
              error={errors.username}
              placeholder="Choisissez votre pseudo"
              autoComplete="username"
            />

            <InputField
              id="firstName"
              name="firstName"
              label="Prénom"
              type="text"
              value={formData.firstName}
              onChange={handleInputChange}
              error={errors.firstName}
              placeholder="Entrez votre prénom"
              autoComplete="given-name"
            />

            <InputField
              id="lastName"
              name="lastName"
              label="Nom"
              type="text"
              value={formData.lastName}
              onChange={handleInputChange}
              error={errors.lastName}
              placeholder="Entrez votre nom"
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
              placeholder="Entrez votre email"
              autoComplete="email"
            />

            <InputField
              id="password"
              name="password"
              label="Mot de passe"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              error={errors.password}
              placeholder="Créez un mot de passe"
              autoComplete="new-password"
            />

            <InputField
              id="confirmPassword"
              name="confirmPassword"
              label="Confirmer le mot de passe"
              type="password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              error={errors.confirmPassword}
              placeholder="Confirmez votre mot de passe"
              autoComplete="new-password"
            />
          </div>

          <div>
            <button
              type="submit"
              className="game-button w-full"
              disabled={isLoading}
            >
              {isLoading ? "Création du compte..." : "S'inscrire"}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-[var(--text-secondary)]">
              Vous avez déjà un compte ?{' '}
              <Link
                to="/login"
                className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register; 
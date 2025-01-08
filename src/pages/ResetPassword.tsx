import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { auth } from '../api/auth';
import InputField from '../components/ui/InputField';

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="max-w-md w-full space-y-8 p-8 game-card">
          <div>
            <h2 className="mt-6 text-center text-3xl game-title">
              Lien invalide
            </h2>
            <p className="mt-2 text-center text-sm text-[var(--text-secondary)]">
              Le lien de réinitialisation est invalide ou a expiré.
            </p>
          </div>
          <div className="text-center">
            <Link
              to="/forgot-password"
              className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Demander un nouveau lien
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setIsLoading(true);

    try {
      await auth.resetPassword(token, formData.password);
      navigate('/login', { 
        state: { 
          message: 'Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter.' 
        }
      });
    } catch (err: any) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Une erreur est survenue. Veuillez réessayer plus tard.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
      <div className="max-w-md w-full space-y-8 p-8 game-card">
        <div>
          <h2 className="mt-6 text-center text-3xl game-title">
            Réinitialiser le mot de passe
          </h2>
          <p className="mt-2 text-center text-sm text-[var(--text-secondary)]">
            Choisissez votre nouveau mot de passe
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-500/10 text-red-500 p-3 rounded-lg text-sm backdrop-blur-sm border border-red-500/20">
              {error}
            </div>
          )}

          <div className="rounded-md shadow-sm space-y-4">
            <InputField
              id="password"
              name="password"
              label="Nouveau mot de passe"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Entrez votre nouveau mot de passe"
              autoComplete="new-password"
            />

            <InputField
              id="confirmPassword"
              name="confirmPassword"
              label="Confirmer le mot de passe"
              type="password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirmez votre nouveau mot de passe"
              autoComplete="new-password"
            />
          </div>

          <div>
            <button
              type="submit"
              className="game-button w-full"
              disabled={isLoading}
            >
              {isLoading ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
            </button>
          </div>

          <div className="text-center">
            <Link
              to="/login"
              className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Retour à la connexion
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword; 
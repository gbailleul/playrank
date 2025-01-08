import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../api/auth';
import InputField from '../components/ui/InputField';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await auth.forgotPassword(email);
      setSuccess(true);
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

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="max-w-md w-full space-y-8 p-8 game-card">
          <div>
            <h2 className="mt-6 text-center text-3xl game-title">
              Email envoyé !
            </h2>
            <p className="mt-2 text-center text-sm text-[var(--text-secondary)]">
              Si un compte existe avec cette adresse email, vous recevrez un lien pour réinitialiser votre mot de passe.
            </p>
          </div>
          <div className="text-center">
            <Link
              to="/login"
              className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
      <div className="max-w-md w-full space-y-8 p-8 game-card">
        <div>
          <h2 className="mt-6 text-center text-3xl game-title">
            Mot de passe oublié
          </h2>
          <p className="mt-2 text-center text-sm text-[var(--text-secondary)]">
            Entrez votre adresse email pour recevoir un lien de réinitialisation
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
              id="email"
              name="email"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Entrez votre email"
              autoComplete="email"
              required
            />
          </div>

          <div>
            <button
              type="submit"
              className="game-button w-full"
              disabled={isLoading}
            >
              {isLoading ? "Envoi en cours..." : "Envoyer le lien"}
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

export default ForgotPassword; 
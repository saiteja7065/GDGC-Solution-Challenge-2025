import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AuthForm } from '../components/AuthForm';

export function SignIn() {
  const [error, setError] = React.useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (email, password) => {
    try {
      setError('');
      await login(email, password);
      navigate('/');
    } catch (err) {
      console.error('Login error:', err); // Log the error object for more details
      setError('Failed to sign in. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <AuthForm
          isSignUp={false}
          onSubmit={handleSubmit}
          error={error}
        />
      </div>
    </div>
  );
}

export default SignIn;
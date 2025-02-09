import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AuthForm } from '../components/AuthForm';

export function SignUp() {
  const [error, setError] = React.useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (email, password) => {
    try {
      setError('');
      await signup(email, password);
      navigate('/');
    } catch (err) {
      console.error('Signup error:', err); // Log the error object for more details
      if (err.code === 'auth/email-already-in-use') {
        setError('Email already in use. Please use a different email.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak. Please use a stronger password.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address. Please check your email.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Operation not allowed. Please contact support.');
      } else {
        setError('Failed to create an account. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <AuthForm
          isSignUp={true}
          onSubmit={handleSubmit}
          error={error}
        />
      </div>
    </div>
  );
}

export default SignUp;
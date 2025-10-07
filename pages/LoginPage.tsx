import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('alice@example.com');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const result = await login(email, password);
    if (!result.success) {
      setError(result.message || 'Login failed.');
    } else {
      navigate('/dashboard');
    }
  };

  const inputStyle = "w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors";

  return (
    <div className="max-w-md mx-auto mt-12 md:mt-16 px-4 animate-fadeIn">
      <Card className="!p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-dark-text dark:text-gray-100">Sign In</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Welcome back! Please enter your details.
          </p>
        </div>
        
        {error && <p className="mb-4 text-center text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400 p-3 rounded-lg">{error}</p>}

        <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input id="email-address" name="email" type="email" autoComplete="email" required className={inputStyle} placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input id="password" name="password" type="password" autoComplete="current-password" required className={inputStyle} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
          
          <div>
            <Button type="submit" className="w-full !py-3 !text-base">
              Sign In
            </Button>
          </div>
        </form>
         <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link to="/signup" className="font-semibold text-indigo-600 hover:underline">
                Sign up
            </Link>
        </p>
      </Card>
    </div>
  );
};
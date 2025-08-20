import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      // Store the token and navigate to the homepage
      localStorage.setItem('token', token);
      toast.success('Successfully logged in!');
      navigate('/home');
    } else {
      // Handle login failure
      toast.error('Authentication failed. Please try again.');
      navigate('/login');
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <p className="text-white">Processing authentication...</p>
    </div>
  );
};

export default AuthCallback;

import React from 'react';
import { useRouteError, Link, useNavigate } from 'react-router-dom';

const ErrorPage = () => {
  const error = useRouteError();
  const navigate = useNavigate();

  const status = error?.status || (error?.response?.status) || 500;
  const message = error?.statusText || error?.message || (error?.response?.data?.message) || 'Something went wrong.';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 via-gray-800 to-black text-gray-100 p-6">
      <div className="max-w-2xl w-full text-center bg-gradient-to-br from-gray-800/60 to-black/40 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-gray-700">
        <div className="flex justify-center mb-6">
          <svg className="w-40 h-40 animate-bounce" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="#7c3aed" strokeWidth="1.5" opacity="0.2" />
            <path d="M8 12h8M12 8v8" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <h1 className="text-4xl font-extrabold mb-2">{status === 404 ? 'Page not found' : 'Something went wrong'}</h1>
        <p className="text-gray-400 mb-6">{status === 404 ? 'We could not find the page you were looking for.' : 'An unexpected error occurred. Try refreshing or return home.'}</p>

        <div className="flex justify-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2 bg-purple-600 hover:bg-purple-500 rounded-full text-white shadow"
          >
            Go Back
          </button>
          <Link to="/" className="px-5 py-2 bg-gray-700 hover:bg-gray-600 rounded-full text-white shadow">
            Take me home
          </Link>
        </div>

        <details className="mt-6 text-xs text-gray-500 text-left mx-6 p-3 bg-gray-900/50 rounded">
          <summary className="cursor-pointer">Developer details (click to expand)</summary>
          <pre className="whitespace-pre-wrap mt-2">{JSON.stringify(error, null, 2)}</pre>
        </details>
      </div>
    </div>
  );
};

export default ErrorPage;

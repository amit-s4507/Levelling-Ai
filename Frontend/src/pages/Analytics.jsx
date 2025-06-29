import React from 'react';
import { useAuth } from '../context/AuthContext';

const Analytics = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="mt-2 text-gray-600">
          Track your learning progress and insights
        </p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <p className="text-center text-gray-500">Analytics feature coming soon!</p>
        </div>
      </div>
    </div>
  );
};

export default Analytics; 
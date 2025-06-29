import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground sm:text-5xl md:text-6xl">
          Welcome to Levelling AI
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-muted-foreground sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          Your personalized AI-powered learning platform
        </p>
        <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
          {!user && (
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link to="/register">
                Get Started
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export { Home as default };

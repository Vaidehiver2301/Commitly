import React from 'react';
import { Link } from 'react-router-dom';
import { DashboardPreview } from '../components/illustrations/DashboardPreview';
import { Button } from '../components/common/Button';

export const LandingPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="min-h-[calc(100vh-160px)] grid md:grid-cols-2 gap-8 md:gap-16 items-center">
        <div className="animate-fadeIn space-y-6 text-center md:text-left">
          <h2 className="text-5xl md:text-6xl font-extrabold text-dark-text dark:text-gray-100 leading-tight">
            Stay consistent in learning Java or Python.
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Track your progress, stay motivated, and get gentle support from the community.
          </p>
          <Link to="/signup">
            <Button variant="primary" className="!px-10 !py-4 !text-lg !rounded-xl">
              Get Started
            </Button>
          </Link>
        </div>
        <div className="hidden md:block animate-slideInUp">
          <DashboardPreview />
        </div>
      </div>
    </div>
  );
};

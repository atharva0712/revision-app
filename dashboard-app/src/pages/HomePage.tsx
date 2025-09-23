import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold">Home Page</h1>
      <p>This is the home page.</p>
      <div className="flex space-x-4">
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
        <Link to="/dashboard">Dashboard</Link>
      </div>
    </div>
  );
};

export default HomePage;

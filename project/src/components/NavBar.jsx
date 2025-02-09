import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Updated import statement

function NavBar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-gray-200 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-gray-800 text-lg font-bold">
          Recipe Maker
        </Link>
        <div className="flex space-x-8 justify-center flex-grow">
          <Link to="/" className="text-gray-800 hover:text-gray-600">
            Home
          </Link>
          <Link to="/converter" className="text-gray-800 hover:text-gray-600">
            Converter
          </Link>
          <Link to="/recipe-generator" className="text-gray-800 hover:text-gray-600">
            Recipe Making
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <span className="text-gray-800">Welcome, {user.displayName}</span>
              <a
                href="#"
                onClick={logout}
                className="text-red-500 hover:text-red-600 transition-colors"
              >
                Logout
              </a>
            </>
          ) : (
            <Link to="/signin" className="text-gray-800 hover:text-gray-600">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
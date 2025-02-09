import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export function HomePage({ isLoggedIn }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/signin');
    }
  }, [isLoggedIn, navigate]);

  return (
    <div>
      <nav className="bg-gray-800 p-4">
        <ul className="flex justify-around">
          <li><Link to="/" className="text-white">Home Page</Link></li>
          <li><Link to="/recipe-generator" className="text-white">Recipe Generator</Link></li>
          <li><Link to="/conversion" className="text-white">Conversion</Link></li>
          <li><Link to="/saved-recipes" className="text-white">Saved Recipes</Link></li>
          <li>
            {isLoggedIn ? (
              <Link to="/signout" className="text-white">Sign Out</Link>
            ) : (
              <Link to="/signin" className="text-white">Sign In</Link>
            )}
          </li>
          <li>
            <button className="text-white" onClick={() => document.documentElement.classList.toggle('dark')}>
              Toggle Dark Mode
            </button>
          </li>
        </ul>
      </nav>
      <main className="p-8">
        <section id="about" className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">About Recipe Maker</h1>
          <p className="text-gray-700 dark:text-gray-300">
            Welcome to Recipe Maker, your go-to app for generating recipes, converting measurements, and saving your favorite recipes. Whether you're a seasoned chef or just starting out, our app is designed to make your cooking experience easier and more enjoyable.
          </p>
        </section>
      </main>
    </div>
  );
}

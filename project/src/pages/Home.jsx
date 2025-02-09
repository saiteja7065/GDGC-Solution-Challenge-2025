import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChefHat, Book, Utensils, Heart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [savedRecipesCount, setSavedRecipesCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchSavedRecipesCount(user.uid)
        .then(count => setSavedRecipesCount(count))
        .catch(error => {
          console.error("Error fetching saved recipes count:", error);
          setSavedRecipesCount(0); // Set to 0 or handle error state as needed
        });
    }
  }, [user]);

  const features = [
    {
      icon: <Utensils className="h-8 w-8 text-blue-600" />,
      title: "Recipe Generator",
      description: "Generate custom recipes based on your available ingredients",
      action: () => navigate('/recipe-generator')
    },
    {
      icon: <Book className="h-8 w-8 text-green-600" />,
      title: "Measurement Converter",
      description: "Convert between different measurement units easily",
      action: () => navigate('/converter')
    },
    {
      icon: <Heart className="h-8 w-8 text-red-600" />,
      title: "Save Favorites",
      description: user ? `View and manage your saved recipes (${savedRecipesCount})` : "Save and manage your favorite recipes",
      action: () => navigate(user ? '/saved-recipes' : '/signin')
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-16 pt-24">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-4">
            <ChefHat className="h-16 w-16 text-blue-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to Recipe Assistant
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Your personal AI-powered kitchen companion. Generate recipes, convert measurements, and organize your culinary creations.
          </p>
          {!user && (
            <div className="mt-8 space-x-4">
              <button
                onClick={() => navigate('/signup')}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Get Started
              </button>
              <button
                onClick={() => navigate('/signin')}
                className="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-gray-700 text-base font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Sign In
              </button>
            </div>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              onClick={feature.action}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 cursor-pointer transform transition-all hover:scale-105"
            >
              <div className="flex justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white text-center mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-center">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* How It Works Section */}
        <div className="mt-24">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 dark:text-blue-400 font-bold">1</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Input Ingredients
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Enter the ingredients you have available
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 dark:text-blue-400 font-bold">2</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Generate Recipes
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Get AI-powered recipe suggestions
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 dark:text-blue-400 font-bold">3</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Start Cooking
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Follow the step-by-step instructions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;

async function fetchSavedRecipesCount(userId) {
  try {
    const db = getFirestore();
    const q = query(collection(db, 'savedRecipes'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error("Error fetching saved recipes count:", error);
    throw error;
  }
}
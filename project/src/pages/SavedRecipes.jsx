import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig'; // Firestore config
import { collection, getDocs } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext'; // Updated import statement

function SavedRecipes() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSavedRecipes(user.uid);
    }
  }, [user]);

  const fetchSavedRecipes = async (userId) => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'users', userId, 'savedRecipes'));
      const recipes = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSavedRecipes(recipes);
    } catch (error) {
      console.error('Error fetching saved recipes:', error);
      if (error.code === 'permission-denied') {
        alert('You do not have permission to access saved recipes.');
      }
      setSavedRecipes([]);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-16 pt-24">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
          Your Saved Recipes
        </h2>
        {loading ? (
          <p className="text-center text-gray-600 dark:text-gray-400">Loading recipes...</p>
        ) : savedRecipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {savedRecipes.map((recipe) => (
              <div
                key={recipe.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-all hover:scale-105 cursor-pointer"
                onClick={() => navigate(`/recipe/${recipe.id}`)}
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {recipe.recipeName || "Unnamed Recipe"}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {recipe.shortDescription || "Click to view full recipe"}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-600 dark:text-gray-400">
            No saved recipes yet. Start creating one!
          </p>
        )}
      </div>
    </div>
  );
}

export default SavedRecipes;

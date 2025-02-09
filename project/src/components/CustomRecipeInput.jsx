import React from 'react';
import { Save, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext'; // Updated import statement
import { db } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

function CustomRecipeInput() {
  const [recipe, setRecipe] = React.useState({
    title: '',
    ingredients: '',
    instructions: '',
    servings: '',
    prepTime: '',
    cookTime: ''
  });
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState(null);
  const { user } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRecipe(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to save a recipe.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await addDoc(collection(db, 'custom_recipes'), {
        ...recipe,
        userId: user.uid,
        createdAt: serverTimestamp()
      });
      // Show success message
      setRecipe({
        title: '',
        ingredients: '',
        instructions: '',
        servings: '',
        prepTime: '',
        cookTime: ''
      });
    } catch (error) {
      console.error('Error saving recipe:', error);
      setError('Error saving recipe. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Add Custom Recipe</h2>
      
      {error && (
        <div className="mb-4 text-red-600 dark:text-red-400">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Recipe Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={recipe.title}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="servings" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Servings
            </label>
            <input
              type="number"
              id="servings"
              name="servings"
              value={recipe.servings}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div>
            <label htmlFor="prepTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Prep Time (minutes)
            </label>
            <input
              type="number"
              id="prepTime"
              name="prepTime"
              value={recipe.prepTime}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div>
            <label htmlFor="cookTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Cook Time (minutes)
            </label>
            <input
              type="number"
              id="cookTime"
              name="cookTime"
              value={recipe.cookTime}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
        </div>

        <div>
          <label htmlFor="ingredients" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Ingredients (one per line)
          </label>
          <textarea
            id="ingredients"
            name="ingredients"
            value={recipe.ingredients}
            onChange={handleChange}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            required
          />
        </div>

        <div>
          <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Instructions
          </label>
          <textarea
            id="instructions"
            name="instructions"
            value={recipe.instructions}
            onChange={handleChange}
            rows={6}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            required
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
        >
          {saving ? (
            <>
              <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
              Saving Recipe...
            </>
          ) : (
            <>
              <Save className="w-5 h-5 mr-2" />
              Save Recipe
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default CustomRecipeInput;
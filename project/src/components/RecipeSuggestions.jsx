import React from 'react';
import { Loader2, ThumbsUp, ThumbsDown, BookmarkPlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext'; // Updated import statement
import { db } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

function RecipeSuggestions({ ingredients }) {
  const [suggestions, setSuggestions] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const { user } = useAuth();

  const fetchSuggestions = async () => {
    if (!ingredients.trim()) return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.VITE_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{
            role: "system",
            content: "You are a helpful cooking assistant that suggests recipes based on available ingredients."
          }, {
            role: "user",
            content: `Suggest 3 recipes I can make with these ingredients: ${ingredients}. Format as JSON array with name, description, and difficulty properties.`
          }]
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recipe suggestions');
      }

      const data = await response.json();
      const parsedSuggestions = JSON.parse(data.choices[0].message.content);
      setSuggestions(parsedSuggestions);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setError('Failed to load recipe suggestions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const saveRecipe = async (recipe) => {
    if (!user) return;

    try {
      await addDoc(collection(db, 'saved_recipes'), {
        userId: user.uid,
        recipe,
        savedAt: serverTimestamp()
      });
      // Show success toast
    } catch (error) {
      console.error('Error saving recipe:', error);
      // Show error toast
    }
  };

  React.useEffect(() => {
    if (ingredients) {
      fetchSuggestions();
    }
  }, [ingredients]);

  if (loading) {
    return (
      <div className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600 dark:text-gray-400">Generating recipe suggestions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <div className="text-center text-red-600 dark:text-red-400">
          <p>{error}</p>
          <button
            onClick={fetchSuggestions}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Recipe Suggestions</h2>
      {suggestions.length > 0 ? (
        <div className="space-y-6">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-2"
            >
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {suggestion.name}
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => saveRecipe(suggestion)}
                    className="p-1 hover:text-blue-600 dark:hover:text-blue-400"
                    title="Save recipe"
                  >
                    <BookmarkPlus className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300">{suggestion.description}</p>
              <div className="flex justify-between items-center mt-4">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Difficulty: {suggestion.difficulty}
                </span>
                <div className="flex space-x-2">
                  <button className="p-1 hover:text-green-600 dark:hover:text-green-400">
                    <ThumbsUp className="w-5 h-5" />
                  </button>
                  <button className="p-1 hover:text-red-600 dark:hover:text-red-400">
                    <ThumbsDown className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-600 dark:text-gray-400">
          No suggestions available. Try adding some ingredients!
        </p>
      )}
    </div>
  );
}

export default RecipeSuggestions;
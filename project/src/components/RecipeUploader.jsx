import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, Plus, ChevronRight, Loader2, Camera } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Webcam from 'react-webcam';
import { getStorage, ref, uploadString } from "firebase/storage"; // Import Firebase storage
import { db } from '../firebaseConfig'; // Import Firestore DB
import { collection, addDoc, doc, setDoc } from "firebase/firestore";


const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export function RecipeUploader() {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState(null);
  const [manualIngredients, setManualIngredients] = useState('');
  const [analyzedIngredients, setAnalyzedIngredients] = useState(null);
  const [editableIngredients, setEditableIngredients] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [servings, setServings] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [step, setStep] = useState('input'); // input, servings, recipe
  const [showWebcam, setShowWebcam] = useState(false);
  const webcamRef = useRef(null);
  const storage = getStorage(); // Initialize Firebase storage

  useEffect(() => {
    if (showWebcam) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(() => {
          console.log('Camera permission granted');
        })
        .catch((error) => {
          console.error('Error accessing the webcam:', error);
          alert('Error accessing the webcam. Please ensure you have granted permission and try again.');
          setShowWebcam(false);
        });
    }
  }, [showWebcam]);

  const captureImage = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setPreview(imageSrc);
      setShowWebcam(false);
    }
  };

  const handleWebcamError = useCallback((error) => {
    console.error('Webcam error:', error);
    alert('Error accessing the webcam. Please ensure you have granted permission and try again.');
    setShowWebcam(false);
  }, []);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    try {
      setIsAnalyzing(true);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      // Get the base64 data without the data URL prefix
      const base64Data = preview.split(',')[1];
      
      // Create a parts array for the model
      const prompt = 'Analyze this image and list all the ingredients you can identify. Format them as a bullet point list.';
      const imagePart = {
        inlineData: {
          data: base64Data,
          mimeType: 'image/jpeg' // We'll assume JPEG
        }
      };
      
      const result = await model.generateContent([prompt, imagePart]);
      const response = await result.response;
      
      if (!response.text) {
        throw new Error('No response text received from the model');
      }
      
      const ingredients = response.text();
      setAnalyzedIngredients(ingredients);
      setEditableIngredients(ingredients);
      setStep('servings');
    } catch (error) {
      console.error('Error analyzing image:', error);
      alert(`Error analyzing image: ${error.message}. Please try again. Make sure the image is clear and contains visible ingredients.`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateRecipe = async () => {
    try {
      setIsAnalyzing(true);
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  
      const ingredients = editableIngredients || manualIngredients;
      const metricIngredients = convertToMetric(ingredients);
  
      const prompt = `Generate a detailed recipe for ${servings} servings using these ingredients:\n${metricIngredients}\n\nInclude:\n1. Preparation Time\n2. Cooking Time\n3. Ingredients\n4. Step by step instructions\n5. Cooking Tips: Suggest best practices for better results.`;
  
      const result = await model.generateContent(prompt);
      const response = await result.response;
  
      if (!response.text) {
        throw new Error('No response text received from the model');
      }
  
      setRecipes([response.text()]);
      setStep('recipe');
    } catch (error) {
      console.error('Error generating recipe:', error);
      alert(`Error generating recipe: ${error.message}. Please try again with different ingredients or quantities.`);
    } finally {
      setIsAnalyzing(false);
    }
  };
  

  const generateAdditionalRecipes = async () => {
    try {
      setIsAnalyzing(true);
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  
      const ingredients = editableIngredients || manualIngredients;
      const metricIngredients = convertToMetric(ingredients);
      const prompt = `Generate a detailed recipe for ${servings} servings using these ingredients:\n${metricIngredients}\n\nInclude:\n2. Recipe Name\n2. Preparation Time\n3. Cooking Time\n4. Ingredients\n5. Step by step instructions\n6. Cooking Tips: Suggest best practices for better results.`;
  
      const result = await model.generateContent(prompt);
      const response = await result.response;
  
      if (!response.text) {
        throw new Error('No response text received from the model');
      }
  
      setRecipes([...recipes, response.text()]);
      setStep('recipe');
    } catch (error) {
      console.error('Error generating additional recipes:', error);
      alert(`Error generating additional recipes: ${error.message}. Please try again with different ingredients or quantities.`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveRecipe = () => {
    const element = document.createElement('a');
    const file = new Blob([recipes.join('\n\n')], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'recipes.txt';
    document.body.appendChild(element);
    element.click();
  };

  const saveRecipeToCloud = async () => {
    try {
      const recipeText = recipes.join('\n\n');
      const storageRef = ref(storage, 'recipes/recipes.txt');
      await uploadString(storageRef, recipeText);
      alert('Recipes saved to cloud storage successfully!');
    } catch (error) {
      console.error('Error saving recipes to cloud storage:', error);
      alert('Error saving recipes to cloud storage. Please try again.');
    }
  };

  const saveRecipeToFirestore = async (userId, recipe) => {
    if (!userId) {
      console.error("User ID is missing. Cannot save recipe.");
      return;
    }
  
    try {
      const recipeRef = doc(collection(db, "users", userId, "savedRecipes")); // Auto-generate ID
      await setDoc(recipeRef, recipe); // Save recipe
      alert("Recipe saved successfully!");
    } catch (error) {
      console.error("Error saving recipe:", error);
      if (error.code === 'permission-denied') {
        alert("Error saving recipe: Missing or insufficient permissions.");
      } else {
        alert("Error saving recipe. Please try again.");
      }
    }
  };
  
  const saveRecipeToFirestoreWrapper = async () => {
    try {
      const userId = "user-id"; // Replace with actual user ID
      const recipe = {
        recipe: recipes.join('\n\n'), // Store recipe as a single string
        timestamp: new Date(),
      };
      await saveRecipeToFirestore(userId, recipe);
    } catch (error) {
      console.error("Error saving recipe:", error);
      alert("Error saving recipe. Please try again.");
    }
  };
  

  const handleEditIngredients = (e) => {
    setEditableIngredients(e.target.value);
  };

  const handleFeedback = (feedback) => {
    // Implement feedback mechanism to improve conversions and suggestions
    console.log('User feedback:', feedback);
  };

  // Render Webcam when showWebcam is true
  const renderWebcam = () => (
    <div className="mt-8">
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        className="w-full h-full object-cover rounded-lg"
        onUserMediaError={handleWebcamError}
      />
      <button
        onClick={captureImage}
        className="mt-4 w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        Capture Image
      </button>
      <button
        onClick={() => setShowWebcam(false)}
        className="mt-4 w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        Close Camera
      </button>
    </div>
  );

  if (step === 'recipe' && recipes.length > 0) {
    return (
      <div className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Your Recipes</h2>
        <div className="flex space-x-4 overflow-x-auto">
          {recipes.map((recipe, index) => (
            <div key={index} className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow-md min-w-[300px]">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recipe {index + 1}</h3>
              <div className="prose dark:prose-invert max-w-none">
                <ul className="list-disc list-inside">
                  {recipe.split('\n').filter(line => line.trim() !== '').map((line, lineIndex) => (
                    <li key={lineIndex} className="mb-4 text-gray-700 dark:text-gray-300">
                      {line.replace(/[#*]/g, '')}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={() => {
            setStep('input');
            setRecipes([]);
            setAnalyzedIngredients(null);
            setManualIngredients('');
            setServings('');
            setPreview(null);
          }}
          className="mt-8 w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          Start New Recipe
        </button>
        <button
          onClick={saveRecipe}
          className="mt-4 w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
        >
          Save Recipes
        </button>
        <button
        onClick={saveRecipeToFirestoreWrapper}
        className="mt-4 w-full py-3 px-4 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg transition-colors"
        >
        Save Recipe to Firestore
        </button>

        <button
          onClick={generateAdditionalRecipes}
          className="mt-4 w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
        >
          Generate More Recipes
        </button>
        <form className="mt-4">
          <label className="block text-gray-700 dark:text-gray-300 mb-2">Feedback:</label>
          <textarea
            className="w-full p-4 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none mb-4"
            placeholder="Provide your feedback here"
          />
          <button
            type="submit"
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Submit Feedback
          </button>
        </form>
      </div>
    );
  }

  if (step === 'servings') {
    return (
      <div className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">How many servings?</h2>
        <textarea
          value={editableIngredients}
          onChange={handleEditIngredients}
          placeholder="Edit the ingredients here"
          className="w-full h-40 p-4 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none mb-6"
        />
        <input
          type="number"
          value={servings}
          onChange={(e) => setServings(e.target.value)}
          placeholder="Enter number of servings"
          className="w-full p-4 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 mb-6"
        />
        <button
          onClick={generateRecipe}
          disabled={!servings || isAnalyzing}
          className="mt-8 w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating Recipe...
            </>
          ) : (
            <>
              Generate Recipe
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* File Upload Section */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-700'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {preview ? (
          <div className="space-y-4">
            <div className="relative aspect-video">
              <img
                src={preview}
                alt="Recipe preview"
                className="w-full h-full object-cover rounded-lg"
              />
              <button
                onClick={() => setPreview(null)}
                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <Plus className="w-4 h-4 rotate-45" />
              </button>
            </div>
            <button
              onClick={analyzeImage}
              disabled={isAnalyzing}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing Image...
                </>
              ) : (
                <>
                  Analyze Image
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                Drop your recipe image here
              </p>
              <p className="mt-1 text-gray-500 dark:text-gray-400">
                or click to upload
              </p>
            </div>
            <input
              type="file"
              accept="image/jpeg, image/png, image/jpg"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setPreview(reader.result);
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
          </div>
        )}
      </div>

      {/* Webcam Button - Placed Separately */}
      <button
        onClick={() => setShowWebcam(true)}
        className="mt-4 w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <Camera className="w-5 h-5" />
        Use Camera
      </button>

      {/* Webcam Section */}
      {showWebcam && (
        <div className="mt-8">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="w-full h-full object-cover rounded-lg"
            onUserMediaError={handleWebcamError}
          />
          <button
            onClick={captureImage}
            className="mt-4 w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            Capture Image
          </button>
          <button
            onClick={() => setShowWebcam(false)}
            className="mt-4 w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            Close Camera
          </button>
        </div>
      )}

      <div className="mt-8">
        <div className="flex items-center">
          <div className="h-px flex-1 bg-gray-300 dark:bg-gray-700"></div>
          <span className="px-4 text-sm text-gray-500">or</span>
          <div className="h-px flex-1 bg-gray-300 dark:bg-gray-700"></div>
        </div>

        <div className="mt-6 space-y-4">
          <textarea
            value={manualIngredients}
            onChange={(e) => setManualIngredients(e.target.value)}
            placeholder="Enter your ingredients here (one per line)"
            className="w-full h-40 p-4 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
          />
          <input
            type="number"
            value={servings}
            onChange={(e) => setServings(e.target.value)}
            placeholder="Enter number of servings"
            className="w-full p-4 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 mb-6"
          />
          <button
            onClick={() => setStep('servings')}
            disabled={!manualIngredients.trim()}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            Continue
            <ChevronRight className="w-5 h-5" />
          </button>
          <button
            onClick={generateRecipe}
            disabled={!manualIngredients.trim()}
            className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            Make Recipe
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export const convertToMetric = (ingredients) => {
  const conversions = {
    'flour': { 'cup': 120, 'tablespoon': 7.5, 'teaspoon': 2.5 }, // grams per unit
    'sugar': { 'cup': 200, 'tablespoon': 12.5, 'teaspoon': 4.2 },
    'butter': { 'cup': 227, 'tablespoon': 14.2, 'teaspoon': 4.7 },
    'milk': { 'cup': 240, 'tablespoon': 15, 'teaspoon': 5 }, // milliliters per unit
    'water': { 'cup': 240, 'tablespoon': 15, 'teaspoon': 5 },
    'cashews': { 'cup': 150, 'tablespoon': 9.4, 'teaspoon': 3.1 },
    'raisins': { 'cup': 145, 'tablespoon': 9.1, 'teaspoon': 3.0 },
    'ghee': { 'cup': 240, 'tablespoon': 15, 'teaspoon': 5 },
    // Add more conversions as needed
  };
  const saveRecipeToFirestore = async () => {
    try {
      await addDoc(collection(db, "recipes"), {
        recipe: recipes.join('\n\n'), // Store recipe as a single string
        timestamp: new Date(),
      });
      alert("Recipe saved to Firestore successfully!");
    } catch (error) {
      console.error("Error saving recipe:", error);
      alert("Error saving recipe. Please try again.");
    }
  };
  

  return ingredients.split('\n').map(line => {
    const [quantity, unit, ...ingredientArr] = line.split(' ');
    if (!quantity || !unit || ingredientArr.length === 0) {
      return line; // Return the line as is if any part is missing
    }
    let ingredient = ingredientArr.join(' ').toLowerCase();
    const amount = parseFloat(quantity);

    // Normalize unit by removing trailing 's'
    const normalizedUnit = unit.toLowerCase().replace(/s$/, '');
    if (conversions[ingredient] && conversions[ingredient][normalizedUnit]) {
      const conversionFactor = conversions[ingredient][normalizedUnit];
      let newAmount = amount * conversionFactor;

      // For liquids, convert from milliliters to liters.
      if (ingredient === 'milk' || ingredient === 'water') {
        newAmount = newAmount / 1000;
        return `${newAmount.toFixed(2)} liters ${ingredient}`;
      } else {
        return `${newAmount.toFixed(2)} grams ${ingredient}`;
      }
    }
    return line;
  }).join('\n');
};

async function saveRecipeToFirestore(recipe) {
  try {
    const db = getFirestore();
    const docRef = await addDoc(collection(db, 'recipes'), recipe);
    console.log("Recipe saved with ID: ", docRef.id);
  } catch (error) {
    console.error("Error saving recipe:", error);
    alert("Error saving recipe: " + error.message);
  }
}

export default RecipeUploader;

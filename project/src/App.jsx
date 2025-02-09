import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import NavBar from './components/NavBar';
import Home from './pages/Home';
import CustomRecipeInput from './components/CustomRecipeInput';
import RecipeSuggestions from './components/RecipeSuggestions';
import RecipeGenerator from './components/RecipeUploader';
import Signup from './pages/SignUp';
import Signin from './pages/SignIn';
import Converter from './pages/Converter'; // Add this import
import SavedRecipes from './pages/SavedRecipes'; // Import the SavedRecipes component

function App() {
  return (
    <AuthProvider>
      <Router>
        <NavBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/custom-recipe" element={<CustomRecipeInput />} />
          <Route path="/recipe-suggestions" element={<RecipeSuggestions />} />
          <Route path="/recipe-generator" element={<RecipeGenerator />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/converter" element={<Converter />} /> {/* Add this route */}
          <Route path="/saved-recipes" element={<SavedRecipes />} /> {/* Add this route */}
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
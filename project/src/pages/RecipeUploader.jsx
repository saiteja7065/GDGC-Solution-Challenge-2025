import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig'; // Updated import statement
// ...existing code...

async function saveRecipeToFirestore(recipe) {
  const db = getFirestore();
  try {
    await addDoc(collection(db, 'savedRecipes'), recipe);
    console.log('Recipe saved successfully');
  } catch (error) {
    console.error('Error saving recipe:', error);
    alert('Error saving recipe: ' + error.message);
  }
}

// ...existing code...

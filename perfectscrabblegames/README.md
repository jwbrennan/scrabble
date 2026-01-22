I am building a TypeScript React App which allows users to find perfect scrabble games (where every turn is a bingo, meaning all 7 tiles are used). The first turn is a seven letter bingo and the 2nd (and all subsequent turns) is an eight letter bingo that must have exactly one overlap with another bingo. The txt file of eight letter words is culled depending on the tiles remaining, and this list is shuffled and iterated through incrementally. On turns 13 and 14 I allow the use of 1 blank. This project is getting close to completion! However, I want the entire 'perfect game' to be logged in some database upon a user getting to that stage. I have started to set up Firebase to handle the back-end database. 

// Formats: gcg https://www.poslfit.com/scrabble/gcg/


// To do: Handle opening bingos like BEZZAZZ!

Turns 1-12: Culling is cumulative (from the current narrowed list), as before.
Turn 13 (after accepting turn 12, newTurnsCount = 13): Culls from the full original eightLetterWords list, allowing blanks and potentially reintroducing words that were culled out earlier.
Turn 14 (after accepting turn 13, newTurnsCount = 14): Same as above, culls from the original list.

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAtYIYAGPtPGxmcQSvvIkdYHdYNOdB6VW8",
  authDomain: "perfect-scrabble-games.firebaseapp.com",
  projectId: "perfect-scrabble-games",
  storageBucket: "perfect-scrabble-games.firebasestorage.app",
  messagingSenderId: "993938539832",
  appId: "1:993938539832:web:3c0a96929280948a36edcd",
  measurementId: "G-T63042C8X8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
// src/App.js

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './AuthContext'; // Import the provider and hook
import { SignInForm, SignUpForm } from './AuthForms'; // Import the forms
import AuthStatus from './AuthStatus'; // Import AuthStatus
// Import Firestore functions if you plan to use them after login
// import { collection, addDoc } from 'firebase/firestore';
// import { db } from './firebaseConfig';
import HomePage from './pages/HomePage';


// Component that only renders if user is authenticated
const AuthenticatedAppContent = () => {
  // You can use the 'user' object from useAuth here if needed
  // const { user } = useAuth();

  // Example of using Firestore (after authentication)
  // async function addPostForUser() {
  //   if (user) {
  //     try {
  //       await addDoc(collection(db, "userPosts"), {
  //         userId: user.uid, // Use the user's unique ID
  //         content: "My first post!",
  //         createdAt: new Date()
  //       });
  //       console.log("Post added!");
  //     } catch (e) {
  //       console.error("Error adding post: ", e);
  //     }
  //   }
  // }

 

  return (
    <div>
      <h1>Welcome to the Chickencoop App!</h1>
      <p>This is content only authenticated users can see.</p>
      <AuthStatus /> {/* Show sign out button */}
      <HomePage user={user} onLogout={handleLogout} /> {/*from non-firebase content*/}
      {/* Add other authenticated content here */}
      {/* <button onClick={addPostForUser}>Add Example Post (requires Firestore)</button> */}
    </div>
  );
};

// Component that only renders if user is NOT authenticated
const UnauthenticatedAppContent = () => {
  const [showSignUp, setShowSignUp] = useState(false); // State to toggle between sign-in and sign-up

  return (
    <div>
      <h1>Chickencoop - Please Sign In or Sign Up</h1>
      {!showSignUp ? (
        <>
          <SignInForm />
          <p>Don't have an account? <button onClick={() => setShowSignUp(true)}>Sign Up</button></p>
        </>
      ) : (
        <>
          <SignUpForm />
          <p>Already have an account? <button onClick={() => setShowSignUp(false)}>Sign In</button></p>
        </>
      )}
    </div>
  );
};

// Main App component
function App() {
  const { user, loading } = useAuth(); // Get the user and loading state from context

  // If still loading the initial auth state, show a loading message
  if (loading) {
    return <div>Checking authentication status...</div>;
  }

  // Render authenticated or unauthenticated content based on user state
  return (
    <div className="App">
      {user ? <AuthenticatedAppContent /> : <UnauthenticatedAppContent />}
    </div>
  );
}


//////
// import React, {useState, useEffect} from 'react';
// import Home from './page/Home';
// import Signup from './page/Signup';
// import Login from './page/Login';
// import { BrowserRouter as Router} from 'react-router-dom';
// import {Routes, Route} from 'react-router-dom';

// function App() {

//   return (
//     <Router>
//       <div>
//         <section>                              
//             <Routes>                                                                        <Route path="/" element={<Home/>}/>
//                <Route path="/signup" element={<Signup/>}/>
//                <Route path="/login" element={<Login/>}/>
//             </Routes>                    
//         </section>
//       </div>
//     </Router>
//   );
// }

// export default App;

///////

// The component you render inside index.js or your main entry point
const RootApp = () => (
    <AuthProvider> {/* Wrap your entire application with the AuthProvider */}
        <App />
    </AuthProvider>
);

export default RootApp; // Export the RootApp that includes the provider

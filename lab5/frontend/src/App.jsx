import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, Link } from 'react-router-dom';

// Import required components
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Groups from './components/Groups';
import GroupDetails from './components/GroupDetails';
import Friends from './components/Friends';
import CreateGroup from './components/CreateGroup';

function App() {
  const navigate = useNavigate();

  // TODO: Maintain user authentication state
  // user should store logged-in user details
  // loading should indicate whether auth status is being checked
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // TODO: Implement authentication status check
  // On component mount:
  // 1. Make an API call to check if the user is logged in
  // 2. If logged in, store user data in state
  // 3. Stop the loading state
  useEffect(() => {
  const checkLoginStatus = async () => {
    console.log("Checking login status...");
    try {
      const response = await fetch(
        `http://localhost:4000/isLoggedIn`,
        {
          method: 'GET',
          credentials: 'include',   // IMPORTANT for sessions
        }
      );

      const data = await response.json();
      console.log(data);
      console.log("user logged in:", user);

      if (data.loggedIn) {
        setUser(data.user);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  checkLoginStatus();
}, []);

  // TODO: Handle successful login
  // This function should:
  // 1. Update user state
  // 2. Redirect to dashboard
  const handleLogin = (userData) => {
    // Implement login logic here
    console.log("Login successful:", userData);
    setUser(userData);
    navigate('/');
  };

  // TODO: Handle logout functionality
  // This function should:
  // 1. Call logout API
  // 2. Clear user state
  // 3. Redirect to login page
  const handleLogout = async () => {
    // Implement logout logic here
    try {
      await fetch('http://localhost:4000/logout', {
        method: 'POST',
        credentials: 'include'
      });

      setUser(null);
      navigate('/login');
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // TODO: Show a loading indicator while authentication is being checked
  if (loading) {
    return <div>Checking Authentication...</div>;
  }

  return (
    <div className="app">
      {/* TODO: Show navigation bar only when user is logged in */}
      {user && (
        <nav className="container">
          <div className="logo">
            {/* Display application name and username */}
            Expense Splitter | {user.username}
          </div>

          <div className="nav-links">
            {/* TODO: Add navigation links */}
            {/* Dashboard, Groups, Friends */}
            {/* Add logout button */}
            <Link to="/">Dashboard</Link>
            <Link to="/groups">Groups</Link>
            <Link to="/friends">Friends</Link>
            <button onClick={handleLogout}>Logout</button>
          </div>
        </nav>
      )}

      <div className="container">
        {/* TODO: Configure application routes */}
        <Routes>
          {/* Login route (only accessible when logged out) */}
          <Route path="/login" element={
              user ? (
                <Navigate to="/" />
              ) : (
                <Login onLogin={handleLogin} />
              )
            } />

          {/* Protected routes (only accessible when logged in) */}
          <Route path="/" element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} />
          <Route path="/groups" element={user ? <Groups user={user} /> : <Navigate to="/login" />} />
          <Route path="/groups/create" element={user ? <CreateGroup user={user} /> : <Navigate to="/login" />} />
          <Route path="/group/:id" element={user ? <GroupDetails user={user} /> : <Navigate to="/login" />} />
          <Route path="/friends" element={user ? <Friends user={user} /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;

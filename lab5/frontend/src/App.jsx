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
    <div className="app" style={styles.card}>
      {/* TODO: Show navigation bar only when user is logged in */}
      {user && (
        <nav style={styles.navbar}>
        <div style={styles.logo}>
          Expense Splitter | Hello, {user.username}
        </div>

        <div style={styles.navLinks}>
          <Link
            to="/"
            style={styles.navLink}
            onMouseOver={(e) => e.target.style.backgroundColor = "#eef2ff"}
            onMouseOut={(e) => e.target.style.backgroundColor = "transparent"}
          >
            Dashboard
          </Link>

          <Link
            to="/groups"
            style={styles.navLink}
            onMouseOver={(e) => e.target.style.backgroundColor = "#eef2ff"}
            onMouseOut={(e) => e.target.style.backgroundColor = "transparent"}
          >
            Groups
          </Link>

          <Link
            to="/friends"
            style={styles.navLink}
            onMouseOver={(e) => e.target.style.backgroundColor = "#eef2ff"}
            onMouseOut={(e) => e.target.style.backgroundColor = "transparent"}
          >
            Friends
          </Link>

          <button
            onClick={handleLogout}
            style={styles.logoutButton}
            onMouseOver={(e) => e.target.style.backgroundColor = "#dc2626"}
            onMouseOut={(e) => e.target.style.backgroundColor = "#ef4444"}
          >
            Logout
          </button>
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
          <Route path="/groups/:id" element={user ? <GroupDetails user={user} /> : <Navigate to="/login" />} />
          <Route path="/friends" element={user ? <Friends user={user} /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </div>
  );
}
const styles = {
  /* ================= NAVBAR ================= */

navbar: {
  backgroundColor: "#ffffff",
  padding: "16px 30px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  borderRadius: "12px",
  marginBottom: "30px",
},

logo: {
  fontSize: "18px",
  fontWeight: "600",
  color: "#1f2937",
},

navLinks: {
  display: "flex",
  alignItems: "center",
  gap: "20px",
},

navLink: {
  textDecoration: "none",
  color: "#374151",
  fontWeight: "500",
  fontSize: "14px",
  transition: "all 0.2s ease",
  padding: "6px 10px",
  borderRadius: "6px",
},

logoutButton: {
  backgroundColor: "#ef4444",
  color: "#ffffff",
  padding: "8px 14px",
  borderRadius: "8px",
  border: "none",
  cursor: "pointer",
  fontWeight: "500",
  fontSize: "14px",
  transition: "all 0.2s ease",
},
  /* Page Background */
  page: {
    minHeight: "100vh",
    backgroundColor: "#f4f6f9",
    padding: "30px",
    fontFamily: "Inter, sans-serif",
  },

  /* Card Container (for all sections) */
  card: {
    backgroundColor: "#ffffff",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
    marginBottom: "24px",
  },

  /* Section Titles */
  heading: {
    marginBottom: "16px",
    fontWeight: "600",
    color: "#1f2937",
  },

  /* Inputs & Selects */
  input: {
    width: "100%",
    padding: "10px 12px",
    marginBottom: "14px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    outline: "none",
    transition: "all 0.2s ease",
  },

  /* Primary Button */
  button: {
    backgroundColor: "#4f46e5",
    color: "#ffffff",
    padding: "10px 16px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontWeight: "500",
    fontSize: "14px",
    transition: "all 0.2s ease",
  },

  /* Success Text */
  successText: {
    color: "#16a34a",
    fontWeight: "500",
  },

  /* Danger Text */
  dangerText: {
    color: "#dc2626",
    fontWeight: "500",
  },

  /* Links */
  link: {
    color: "#4f46e5",
    textDecoration: "none",
    fontWeight: "500",
  },

  /* List styling */
  list: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },

  listItem: {
    padding: "10px 0",
    borderBottom: "1px solid #f1f5f9",
    display: "flex",
    justifyContent: "space-between",
  }
};
export default App;

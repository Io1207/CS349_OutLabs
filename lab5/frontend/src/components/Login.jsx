import React, { useState } from 'react';

function Login({ onLogin }) {

    // TODO: Use useState to manage:
    // 1. Signup/Login toggle
    // 2. Form data (username, password, email)
    // 3. Error messages
    const [isSignup, setIsSignup] = useState(false);
    const [formData, setFormData] = useState({ username: '', password: '', email: '' });
    const [error, setError] = useState('');

    // TODO: Implement handleSubmit function
    // - Prevent default form submission
    // - Choose endpoint based on login/signup
    // - Call POST /login or POST /signup API
    // - Handle success:
    //   - Call onLogin with user data
    // - Handle error responses
    const handleSubmit = async (e) => {
        e.preventDefault();
        const endpoint = isSignup ? '/signup' : '/login';
        try {
            const response = await fetch(`http://localhost:4000${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            if (response.ok) {
                onLogin(data.user);
            } else {
                setError(data.error || 'An error occurred');
            }
        } catch (err) {
            setError('Network error');
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }


    return (
        <div style={styles.card}>
            <h2>{isSignup ? 'Sign Up' : 'Login'}</h2>

            <form onSubmit={handleSubmit}>

                {/* Username */}
                <div>
                    <input
                        type="text"
                        name="username"
                        placeholder="Username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* Email (Signup only) */}
                {isSignup && (
                    <div>
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                )}

                {/* Password */}
                <div>
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* Error Message */}
                {error && (
                    <p style={{ color: 'red' }}>{error}</p>
                )}

                {/* Submit Button */}
                <button type="submit">
                    {isSignup ? 'Sign Up' : 'Login'}
                </button>
            </form>

            {/* Toggle */}
            <p style={{ marginTop: '10px' }}>
                {isSignup ? 'Already have an account?' : "Don't have an account?"}
                <button
                    type="button"
                    onClick={() => {
                        setIsSignup(!isSignup);
                        setError('');
                    }}
                    style={{ marginLeft: '5px' }}
                >
                    {isSignup ? 'Login' : 'Sign Up'}
                </button>
            </p>
        </div>
    );
}

const styles = {
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
export default Login;

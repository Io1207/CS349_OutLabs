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
        const endpoint = isSignup ? '/signup' : '/login';
        try {
            const response = await fetch(`http://localhost:4000${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            if (response.ok) {
                onLogin(data);
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
        <div style={{ maxWidth: '400px', margin: '50px auto' }}>
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

export default Login;

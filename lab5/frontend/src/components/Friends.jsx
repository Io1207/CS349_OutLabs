import React, { useEffect, useState } from 'react';

function Friends() {

    // TODO: Use useState to manage:
    // 1. Friend list
    // 2. Search query
    // 3. Search results
    const [friends, setFriends] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    // TODO: Implement fetchFriends function
    // - Call GET /friends API
    // - Include credentials
    // - Update friends state
    const fetchFriends = async () => {
        try {
            const response = await fetch('http://localhost:4000/friends', {
                method: 'GET',
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setFriends(data);
            } else {
                console.error('Failed to fetch friends');
            }
        } catch (error) {
            console.error('345 Error fetching friends:', error);
        }
    };

    // TODO: Fetch friend list on component mount
    useEffect(() => {
        // Call fetchFriends here
        fetchFriends();
    }, []);

    // TODO: Implement handleSearch function
    // - Prevent default form submission
    // - Call GET /users/search?q=<query>
    // - Update searchResults state
    const handleSearch = async (query) => {
        // Implement logic here
        if (!query) {
            setSearchResults([]);
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:4000/users/search?q=${query}`,
                {
                    method: 'GET',
                    credentials: 'include'
                }
            );

            if (response.ok) {
                const data = await response.json();
                setSearchResults(data);
            }
        } catch (error) {
            console.error('Error searching users:', error);
        }
    };

    // TODO: Implement addFriend function
    // - Call POST /friends/add API with friend_id
    // - Clear search input and results on success
    // - Refresh friend list
    const addFriend = async (friendId) => {
        // Implement logic here
        try {
            const response = await fetch('http://localhost:4000/friends/add', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ friendId })
            });
            if (response.ok) {
                setSearchQuery('');
                setSearchResults([]);
                fetchFriends();
            } else {
                console.error('Failed to add friend');
            }
        } catch (error) {
            console.error('Error adding friend:', error);
        }
    };

    // TODO: (Optional) Implement settle-up logic per friend
    // - This can redirect to dashboard or open a modal
    const handleSettle = async (friendId, amount, currency) => {
        // Optional implementation

    };

    return (
        <>
            {/*
              TODO: Implement JSX for Friends page
              - Section to display current friends
              - Section to search users by username
              - Add Friend button for search results
              - Show empty-state message when no friends exist
            */}
            <div style={styles.card}>
            <h2>My Friends</h2>

            {friends.length === 0 ? (
                <p>No friends yet.</p>
            ) : (
                <ul>
                {friends.map((friend) => (
                    <li key={friend.user_id}>{friend.username}</li>
                ))}
                </ul>
            )}

            <hr />

            <h3>Add Friend</h3>

            <input
                type="text"
                placeholder="Search username..."
                value={searchQuery}
                onChange={(e) => {
                    const value = e.target.value;
                    setSearchQuery(value);
                    handleSearch(value);
                }}
                style={{ width: "100%", padding: "8px" }}
            />

            {searchResults.length > 0 && (
                <ul style={{ marginTop: "10px" }}>
                {searchResults.map((user) => (
                    <li key={user.user_id}>
                    {user.username}
                    <button
                        style={{ marginLeft: "10px" }}
                        onClick={() => addFriend(user.user_id)}
                    >
                        Add
                    </button>
                    </li>
                ))}
                </ul>
            )}
            </div>
        </>
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

export default Friends;

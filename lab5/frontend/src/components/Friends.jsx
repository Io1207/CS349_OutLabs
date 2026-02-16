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
            <div style={{ maxWidth: "600px", margin: "40px auto" }}>
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

export default Friends;

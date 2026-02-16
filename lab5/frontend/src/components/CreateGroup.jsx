import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function CreateGroup() {

    // TODO: Use useState to manage:
    // 1. Group name
    // 2. Friend list
    // 3. Selected friends
    const [name, setName] = useState('');
    const [friends, setFriends] = useState([]);
    const [selectedFriends, setSelectedFriends] = useState([]);

    const navigate = useNavigate();

    // TODO: Fetch the friend list of the logged-in user
    // - Call GET /friends API
    // - Include credentials
    // - Store the response in friends state
    // - Handle error cases
    useEffect(() => {
        // Implement logic here
        fetch('http://localhost:4000/friends', {
            method: 'GET',
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => setFriends(data))
        .catch(error => console.error('Error fetching friends:', error));
    }, []);

    // TODO: Implement handleCreateGroup function
    // - Prevent default form submission
    // - Validate group name
    // - Call POST /groups API with:
    //   { name, member_ids }
    // - Navigate to /groups on success
    const handleCreateGroup = async (e) => {
        // Implement logic here
        e.preventDefault();
        if (!name.trim()) {
            alert('Group name cannot be empty');
            return;
        }
        try {
            const response = await fetch('http://localhost:4000/groups', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ name, member_ids: selectedFriends })
            });
            if (response.ok) {
                navigate('/groups');
            } else {
                console.error('Failed to create group');
            }
        } catch (error) {
            console.error('Error creating group:', error);
        }
    };

    // TODO: Implement toggleFriend function
    // - Add/remove friend ID from selectedFriends array
    const toggleFriend = (id) => {
        // Implement logic here
        setSelectedFriends(prev => 
            prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
        );
    };

    return (
        <>
            {/* 
              TODO: Implement JSX for Create Group page
              - Input field for group name
              - Checkbox list of friends
              - "Create Group" and "Cancel" buttons
              - Link to add friends if friend list is empty
            */}
            <div className="container mt-4">
                <h2>Create New Group</h2>
                <form onSubmit={handleCreateGroup}>
                    <div className="mb-3">
                        <label htmlFor="groupName" className="form-label">Group Name</label>
                        <input
                            type="text"
                            className="form-control"
                            id="groupName"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Select Friends</label>
                        {friends.length === 0 ? (
                            <p>No friends found. <Link to="/friends">Add friends</Link> to create a group.</p>
                        ) : (
                            friends.map(friend => (
                                <div key={friend.user_id} className="form-check">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id={`friend-${friend.user_id}`}
                                        checked={selectedFriends.includes(friend.user_id)}
                                        onChange={() => toggleFriend(friend.user_id)}
                                    />
                                    <label className="form-check-label" htmlFor={`friend-${friend.user_id}`}>
                                        {friend.username}
                                    </label>
                                </div>
                            ))
                        )}
                    </div>
                    <button type="submit" className="btn btn-primary me-2">Create Group</button>
                    <button type="button" className="btn btn-secondary" onClick={() => navigate('/groups')}>Cancel</button>
                </form>
            </div>
        </>
    );
}

export default CreateGroup;

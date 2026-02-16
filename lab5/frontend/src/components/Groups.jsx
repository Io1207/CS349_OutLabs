import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Groups() {

    // TODO: Use useState to manage group list
    const [groups, setGroups] = useState([]);

    const navigate = useNavigate();

    // TODO: Implement fetchData function
    // - Call GET /groups API
    // - Include credentials
    // - Update groups state
    // - Handle error cases
    const fetchData = async () => {
        try {
            const response = await fetch('http://localhost:4000/groups', {
                method: 'GET',
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setGroups(data);
            } else {
                console.error('Failed to fetch groups');
            }
        } catch (error) {
            console.error('Error fetching groups:', error);
        }
    };

    // TODO: Fetch group list on component mount
    useEffect(() => {
        fetchData();
    }, []);

    return (
        <>
            {/*
              TODO: Implement JSX for Groups page
              - Display list of groups
              - Show "Create New Group" button
              - Navigate to /groups/create on button click
              - Show empty-state message when no groups exist
            */}
            <div className="container mt-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h2>Groups</h2>
                    <button className="btn btn-primary" onClick={() => navigate('/groups/create')}>
                        Create New Group
                    </button>
                </div>
                {groups.length === 0 ? (
                    <p>No groups found. Create a new group to get started!</p>
                ) : (
                    <ul className="list-group">
                        {groups.map(group => (
                            <li key={group.group_id} className="list-group-item d-flex justify-content-between align-items-center">
                                <Link to={`/groups/${group.group_id}`} className="btn btn-sm btn-outline-secondary">
                                    {group.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </>
    );
}

export default Groups;

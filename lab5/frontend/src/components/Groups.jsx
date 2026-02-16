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
export default Groups;

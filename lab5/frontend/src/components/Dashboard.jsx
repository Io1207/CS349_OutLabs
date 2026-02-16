import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function Dashboard() {

    // TODO: Use useState to manage:
    // 1. User balances
    // 2. Friend list
    const [balances, setBalances] = useState([]);
    const [friends, setFriends] = useState([]);

    // TODO: Use useState to manage settle-up form inputs
    // 1. User to settle with
    // 2. Settlement amount
    const [settleTo, setSettleTo] = useState('');
    const [settleAmount, setSettleAmount] = useState('');
    const [message, setMessage] = useState('');

    // TODO: Implement fetchData function
    // - Fetch balances using GET /balances
    // - Fetch friends using GET /friends
    // - Include credentials in API calls
    // - Update respective state variables
    // - Handle failure cases
    const fetchData = async () => {
        // Implement logic here
        try {
            const balancesRes = await fetch('http://localhost:4000/balances', {
                method: 'GET',
                credentials: 'include'
            });

            const friendsRes = await fetch('http://localhost:4000/friends', {
                method: 'GET',
                credentials: 'include'
            });

            // if (!balancesRes.ok || !friendsRes.ok) {
            //     throw new Error("Failed to fetch dashboard data");
            // }

            if(!balancesRes.ok) {
                throw new Error("Failed to fetch balances");
            }

            if(!friendsRes.ok) {
                throw new Error("Failed to fetch friends");
            }

            const balancesData = await balancesRes.json();
            const friendsData = await friendsRes.json();

            setBalances(balancesData);
            setFriends(friendsData);
        } catch (err) {
            console.error(err);
            console.error(sessionStorage.user);
            setMessage("Error loading dashboard data");
        }
    };

    // TODO: Fetch dashboard data on component mount
    useEffect(() => {
        // Call fetchData here
        fetchData();
    }, []);

    // TODO: Implement handleSettleUp function
    // - Prevent default form submission
    // - Validate settleTo and settleAmount
    // - Call POST /settle API with:
    //   { to_user, amount }
    // - Refresh balances on success
    // - Show appropriate success/error messages
    const handleSettleUp = async (e) => {
        // Implement logic here
        e.preventDefault();

        if (!settleTo || !settleAmount) {
            setMessage("Please select a friend and enter amount");
            return;
        }

        if (parseFloat(settleAmount) <= 0) {
            setMessage("Amount must be greater than 0");
            return;
        }

        try {
            const res = await fetch('http://localhost:4000/settle', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    to_user: settleTo,
                    amount: parseFloat(settleAmount)
                })
            });

            if (!res.ok) {
                throw new Error("Settlement failed");
            }

            setMessage("Settlement successful 🎉");
            setSettleTo('');
            setSettleAmount('');
            fetchData(); // Refresh balances

        } catch (err) {
            console.error(err);
            setMessage("Error settling up");
        }
    };

    return (
        <>
            {/*
              TODO: Implement JSX for Dashboard page
              - Section to display net balances
              - Section with settle-up form
              - Dropdown to select friend
              - Input for settlement amount
              - Quick links to Groups and Friends pages
            */}
            <div style={styles.container}>
            <h1>Dashboard</h1>

            {message && <p style={styles.message}>{message}</p>}

            {/* Balances Section */}
            <div style={styles.card}>
                <h2>Your Balances</h2>
                {balances.length === 0 ? (
                    <p>No balances yet.</p>
                ) : (
                    <ul>
                        {balances.map((balance, index) => (
                            <li key={index}>
                                {balance.friend_name} :
                                {balance.amount > 0 ? (
                                    <span style={{ color: 'green' }}>
                                        {" "}You are owed ₹{balance.amount}
                                    </span>
                                ) : (
                                    <span style={{ color: 'red' }}>
                                        {" "}You owe ₹{Math.abs(balance.amount)}
                                    </span>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Settle Up Section */}
            <div style={styles.card}>
                <h2>Settle Up</h2>
                <form onSubmit={handleSettleUp}>
                    <select
                        value={settleTo}
                        onChange={(e) => setSettleTo(e.target.value)}
                        style={styles.input}
                    >
                        <option value="">Select Friend</option>
                        {friends.map((friend) => (
                            <option key={friend.user_id} value={friend.username}>
                                {friend.username}
                            </option>
                        ))}
                    </select>

                    <input
                        type="number"
                        placeholder="Enter amount"
                        value={settleAmount}
                        onChange={(e) => setSettleAmount(e.target.value)}
                        style={styles.input}
                    />

                    <button type="submit" style={styles.button}>
                        Settle
                    </button>
                </form>
            </div>

            {/* Navigation */}
            <div style={styles.links}>
                <Link to="/groups">Go to Groups</Link>
                <Link to="/friends">Go to Friends</Link>
            </div>
        </div>
        </>
    );
}

const styles = {
    container: {
        maxWidth: '700px',
        margin: '40px auto',
        padding: '20px',
        fontFamily: 'Arial'
    },
    card: {
        background: '#f5f5f5',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px'
    },
    input: {
        display: 'block',
        width: '100%',
        padding: '10px',
        marginBottom: '10px'
    },
    button: {
        padding: '10px 20px',
        background: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer'
    },
    links: {
        display: 'flex',
        justifyContent: 'space-between'
    },
    message: {
        marginBottom: '15px',
        color: 'purple'
    }
};


export default Dashboard;

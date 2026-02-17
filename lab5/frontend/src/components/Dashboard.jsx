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
            console.log(settleTo);
            const res = await fetch('http://localhost:4000/settle', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    to_user: Number(settleTo),
                    amount: parseFloat(settleAmount)
                })
            });

            if (!res.ok) {
                throw new Error("Settlement failed");
            }

            setMessage("Settlement successful!");
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
                                {balances
                                    .filter(
                                    (balance) =>
                                        balance.username !== sessionStorage.getItem('user') &&
                                        balance.amount !== 0
                                    )
                                    .map((balance) => (
                                    <li key={balance.username}>
                                        {balance.username} :
                                        {balance.amount > 0 ? (
                                        <span style={{ color: 'green' }}>
                                            {" "} owes you ₹{Math.abs(balance.amount)}
                                        </span>
                                        ) : (
                                        <span style={{ color: 'red' }}>
                                            {" "} You owe ₹{Math.abs(balance.amount)}
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
                            <option key={friend.user_id} value={friend.user_id}>
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
        </div>
        </>
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

export default Dashboard;

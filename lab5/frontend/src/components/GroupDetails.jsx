import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function GroupDetails({ user }) {

    // TODO: Extract group ID from route params
    const { id } = useParams();

    // TODO: Use useState to manage:
    // 1. Group details
    // 2. Group members
    // 3. Expense list
    const [group, setGroup] = useState(null);
    const [members, setMembers] = useState([]);
    const [expenses, setExpenses] = useState([]);

    // TODO: Add Expense form state
    // - Description
    // - Amount
    // - Paid-by user ID
    // - Users to split with
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [paidBy, setPaidBy] = useState('');
    const [splitWith, setSplitWith] = useState([]);

    // TODO: Settle Up form state
    // - User to settle with
    // - Settlement amount
    const [settleTo, setSettleTo] = useState('');
    const [settleAmount, setSettleAmount] = useState('');

    // TODO: Implement fetchData function
    // - Fetch group details using GET /groups/:id
    // - Fetch expenses using GET /groups/:id/expenses
    // - Update group, members, and expenses state
    // - Set default paidBy to current user if applicable
    const fetchData = async () => {
    try {
        // Fetch group details
        const groupResponse = await fetch(
            `http://localhost:4000/groups/${id}`,
            {
                method: 'GET',
                credentials: 'include'
            }
        );

        if (!groupResponse.ok) {
            throw new Error('Failed to fetch group details');
        }

        const groupData = await groupResponse.json();

        setGroup(groupData);
        setMembers(groupData.members || []);

        // Set default paidBy to current user (if user exists in group)
        if (groupData.members?.length > 0) {
            const currentUserMember = groupData.members.find(
                m => m.user_id === user.user_id
            );

            if (currentUserMember) {
                setPaidBy(currentUserMember.user_id);
            }
        }

        // Fetch expenses
        const expensesResponse = await fetch(
            `http://localhost:4000/groups/${id}/expenses`,
            {
                method: 'GET',
                credentials: 'include'
            }
        );

        if (!expensesResponse.ok) {
            throw new Error('Failed to fetch expenses');
        }

        const expensesData = await expensesResponse.json();
        setExpenses(expensesData);

    } catch (error) {
        console.error('Error fetching group details:', error);
    }
};

    // TODO: Fetch group data on component mount or when id changes
    useEffect(() => {
        // Call fetchData here
        fetchData();
    }, [id]);

    // TODO: Set default paidBy when user info is available
    useEffect(() => {
        // Set paidBy to user.user_id if not already set
        if (user && !paidBy) {
            setPaidBy(user.user_id);
        }
    }, [user]);

    // TODO: Implement handleAddExpense function
    // - Validate form inputs
    // - Calculate split amounts
    // - Call POST /expenses API
    // - Reset form and refresh data on success
    const handleAddExpense = async (e) => {
        e.preventDefault();

        if (!description || !amount || !paidBy || splitWith.length === 0) {
            alert("Please fill all fields");
            return;
        }

        const totalAmount = parseFloat(amount);
        const splitAmount = totalAmount / splitWith.length;

        const splits = splitWith.map(userId => ({
            userId,
            amount: splitAmount
        }));

        try {
            const response = await fetch(`http://localhost:4000/expenses`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    groupId: id,
                    description,
                    amount: totalAmount,
                    paid_by: paidBy,
                    splits
                })
            });

            if (response.ok) {
                setDescription('');
                setAmount('');
                setSplitWith([]);
                fetchData();
            } else {
                alert("Failed to add expense");
            }
        } catch (error) {
            console.error('Error adding expense:', error);
        }
    };

    // TODO: Implement handleSettleUp function
    // - Validate settlement inputs
    // - Call POST /settle API
    // - Show success or error messages
    const handleSettleUp = async (e) => {
        e.preventDefault();
        if (!settleTo || !settleAmount) {
            alert("Please fill all fields");
            return;
        }
        try {
            const response = await fetch(`http://localhost:4000/settle`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    group_id: id,
                    to_user: Number(settleTo),
                    amount: settleAmount
                })
            });
            if (response.ok) {
                setSettleTo('');
                setSettleAmount('');
                fetchData(); // Refresh data
            } else {
                alert("Failed to settle up");
            }
        } catch (error) {
            console.error('Error settling up:', error);
        }
    };

    // TODO: Implement toggleSplitMember function
    // - Add/remove user ID from splitWith list
    const toggleSplitMember = (uid) => {
        // Implement logic here
        if (splitWith.includes(uid)) {
            setSplitWith(splitWith.filter(id => id !== uid));
        } else {
            setSplitWith([...splitWith, uid]);
        }
    };

    return (
        <>
            {/*
              TODO: Implement JSX for Group Details page
              - Add Expense form
              - Paid-by dropdown
              - Split-with checkboxes
              - Group name and expense history
              - Loading state when group data is not available
            */}
                <h2>Group Details (ID: {id})</h2>
                {!group ? (
                    <p>Loading group details...</p>
                ) : (
                    <div>
                        <h3>{group.name}</h3>
                        <h4>Members:</h4>
                        <ul>
                            {members.map(member => (
                                <li key={member.user_id}>{member.username}</li>
                            ))}
                        </ul>
                        <h4>Expenses:</h4>
                        <ul>
                            {expenses.map(expense => (
                                <li key={expense.expense_id}>
                                    {expense.description} - ₹{expense.amount} (Paid by: {expense.paid_by})
                                </li>
                            ))}
                        </ul>

                        <h4>Add Expense</h4>
                        <form onSubmit={handleAddExpense}>
                            <input
                                type="text"
                                placeholder="Description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                            <input
                                type="number"
                                placeholder="Amount"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                            <select value={paidBy} onChange={(e) => setPaidBy(e.target.value)}>
                                <option value="">Select who paid</option>
                                {members.map(member => (
                                    <option key={member.user_id} value={member.user_id}>
                                        {member.username}
                                    </option>
                                ))}
                            </select>
                            <div>
                                <p>Split with:</p>
                                {members.map(member => (
                                    <label key={member.user_id}>
                                        <input
                                            type="checkbox"
                                            checked={splitWith.includes(member.user_id)}
                                            onChange={() => toggleSplitMember(member.user_id)}
                                        />
                                        {member.username}
                                    </label>
                                ))}
                            </div>
                            <button type="submit">Add Expense</button>
                        </form>

                        {/* <h4>Settle Up</h4>
                        <form onSubmit={handleSettleUp}>
                            <select value={settleTo} onChange={(e) => setSettleTo(e.target.value)}>
                                <option value="">Select who to settle with</option>
                                {members.map(member => (
                                    <option key={member.user_id} value={member.user_id}>
                                        {member.username}
                                    </option>
                                ))}
                            </select>
                            <input
                                type="number"
                                placeholder="Amount"
                                value={settleAmount}
                                onChange={(e) => setSettleAmount(e.target.value)}
                            />
                            <button type="submit">Settle Up</button>
                        </form> */}
                        {/* Settle Up Section */}
                        <div style={styles.card}>
                            <h2>Settle Up</h2>
                            <form onSubmit={handleSettleUp}>
                                <select
                                    value={settleTo}
                                    onChange={(e) => setSettleTo(e.target.value)}
                                    style={styles.input}
                                >
                                    <option value="">Select who to settle with</option>
                                    {members.map((member) => (
                                        <option key={member.user_id} value={member.user_id}>
                                            {member.username}
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
                )}
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

export default GroupDetails;




const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');
const bcrypt = require('bcrypt');
const pool = require('./db');

const app = express();
const port = 4000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// do the db connection as done in the previous lab
if (process.env.DB_HOST && process.env.DB_PORT && process.env.DB_NAME && process.env.DB_USER && process.env.DB_PASSWORD) {
    dbConfig = {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT),
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD
    };
    pool = new Pool(dbConfig);
    console.log("Database configured via environment variables.");
}

// CORS
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

// Session
app.use(session({
  secret: "expense_splitter_secret",
  resave: false,
  saveUninitialized: true,
  user: null,
  cookie: { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 }, // 1 day
}));

// TODO: Implement authentication middleware
// Redirect unauthenticated users to the login page with respective status code
function checkAuth(req, res, next) {
  // console.log("Checking authentication for request:", req.method, req.path, req.session);
  if (req.session.user) {
    return next();
  } else {
    // console.log("User not authenticated. Redirecting to login: ", req.method, req.path);
    // return res.status(401).json({ error: "Not authenticated" });
    return res.status(401).redirect('/login');
  }
}

// TODO: Implement balance update logic
// This function will be used to update balances 
// while adding expenses and settlements
async function updateBalance(client, payerId, debtorId, amount) {
  // TODO
  try {
    await client.query(
      `INSERT INTO Balance (user_id, other_user_id, amount) VALUES ($1, $2, $3)
       ON CONFLICT (user_id, other_user_id) DO UPDATE SET amount = Balance.amount + EXCLUDED.amount`,
      [payerId, debtorId, amount]
    );
    await client.query(
      `INSERT INTO Balance (user_id, other_user_id, amount) VALUES ($1, $2, $3)
       ON CONFLICT (user_id, other_user_id) DO UPDATE SET amount = Balance.amount - EXCLUDED.amount`,
      [debtorId, payerId, amount]
    );
  }
  catch (err) {
    console.error('Error updating balance:', err);
    throw err;
  }
}

// ---------------- AUTH ROUTES ----------------

// TODO: Implement user signup logic
// return JSON object with the following fields: {username, password, email}
// use correct status codes and messages mentioned in the lab document
app.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "All fields required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO Users (username, password_hash, email) VALUES ($1, $2, $3) RETURNING user_id, username',
      [username, hashedPassword, email]
    );

    const newUser = result.rows[0];

    req.session.user = {
      user_id: newUser.user_id,
      username: newUser.username
    };

    res.status(201).json({
      user_id: newUser.user_id,
      username: newUser.username
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// TODO: Implement user login logic
app.post('/login', async (req, res) => {
  // TODO
  const { username, password } = req.body;  
  try {
    const result = await pool.query(
      'SELECT user_id, password_hash FROM Users WHERE username = $1',
      [username]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not Found' });
    }
    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid Credentials' });
    }
    req.session.user = { user_id: user.user_id, username: username };
    res.status(200).json({ "message": "Login successful", "user": { "user_id": user.user_id, "username": username } });
  }
  catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// TODO: Check if user is logged in
app.get('/isLoggedIn', (req, res) => {
  // TODO
  if (req.session.user) {
    res.status(200).json({ loggedIn: true, user: req.session.user });
  } else {
    res.status(200).json({ loggedIn: false });
  }
});

// TODO: Implement logout functionality
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Could not log out' });
    }

    res.clearCookie('connect.sid', {
      httpOnly: true
    });

    return res.status(200).json({ message: 'Logged out' });
  });
});

// ---------------- FRIENDS ROUTES ----------------

// TODO: Search users by username (excluding current user)
app.get('/users/search', checkAuth, async (req, res) => {
  // TODO
  const searchQuery = req.query.q;
  const currentUserId = req.session.user.user_id;
  try {
    const result = await pool.query(
      'SELECT user_id, username FROM Users WHERE username ILIKE $1 AND user_id != $2',
      [`%${searchQuery}%`, currentUserId]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// TODO: Add a friend (bidirectional)
app.post('/friends/add', checkAuth, async (req, res) => {
  // TODO
  const { friendId } = req.body;
  const userId = req.session.user.user_id;
  try {
    await pool.query(
      'INSERT INTO Friend (user_id, friend_id) VALUES ($1, $2), ($2, $1) ON CONFLICT DO NOTHING',
      [userId, friendId]
    );
    res.status(200).json({ message: 'Friend added' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// TODO: Fetch friend list of logged-in user
app.get('/friends', checkAuth, async (req, res) => {
  // TODO
  const userId = req.session.user.user_id;
  try {
    const result = await pool.query(
      'SELECT u.user_id, u.username FROM Users u JOIN Friend f ON u.user_id = f.friend_id WHERE f.user_id = $1',
      [userId]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ---------------- GROUP ROUTES ----------------

// TODO: Create a new group and add members
app.post('/groups', checkAuth, async (req, res) => {
  // TODO
  const { name, member_ids } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO Groups (name, created_by) VALUES ($1, $2) RETURNING group_id',
      [name, req.session.user.user_id]
    );
    const groupId = result.rows[0].group_id;
    // Add members to the group
    for (const memberId of member_ids) {
      await pool.query(
        'INSERT INTO GroupMember (group_id, user_id) VALUES ($1, $2)',
        [groupId, memberId]
      );
    }
    const addMe = await pool.query(
      'INSERT INTO GroupMember (group_id, user_id) VALUES ($1, $2)',
      [groupId, req.session.user.user_id]
    );
    res.status(200).json({ message: 'Group created', group_id: groupId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Group Creation Server error' });
  }
});

// TODO: Fetch all groups of logged-in user
app.get('/groups', checkAuth, async (req, res) => {
  // TODO
  const userId = req.session.user.user_id;
  try {
    const result = await pool.query(
      'SELECT g.group_id, g.name FROM Groups g JOIN GroupMember gm ON g.group_id = gm.group_id WHERE gm.user_id = $1',
      [userId]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// TODO: Fetch group details and members
app.get('/groups/:id', checkAuth, async (req, res) => {
  // TODO
  const groupId = req.params.id;
  try {
    const groupResult = await pool.query(
      'SELECT group_id, name FROM Groups WHERE group_id = $1',
      [groupId]
    );
    if (groupResult.rows.length === 0) {
      return res.status(404).json({ error: 'Group not found' });
    }
    const group = groupResult.rows[0];
    const membersResult = await pool.query(
      'SELECT u.user_id, u.username FROM Users u JOIN GroupMember gm ON u.user_id = gm.user_id WHERE gm.group_id = $1',
      [groupId]
    );
    group.members = membersResult.rows;
    res.status(200).json(group);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ---------------- EXPENSE ROUTES ----------------

// TODO: Add an expense, splits, and update balances
app.post('/expenses', checkAuth, async (req, res) => {
  // TODO
  const { groupId, description, amount, splits } = req.body;
  try{
    const result = await pool.query(
      'INSERT INTO Expenses (group_id, paid_by, amount, description) VALUES ($1, $2, $3, $4) RETURNING expense_id',
      [groupId, req.session.user.user_id, amount, description]
    );
    const expenseId = result.rows[0].expense_id;
    for (const split of splits) {
      await pool.query(
        'INSERT INTO ExpenseSplits (expense_id, user_id, share_amount) VALUES ($1, $2, $3)',
        [expenseId, split.userId, split.amount]
      );
      await updateBalance(pool, req.session.user.user_id, split.userId, split.amount);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// TODO: Fetch expenses of a group
app.get('/groups/:id/expenses', checkAuth, async (req, res) => {
  // TODO
  const groupId = req.params.id;
  try {
    const result = await pool.query(
      'SELECT e.expense_id, e.amount, e.description, u.username, e.created_at FROM Expenses e JOIN Users u ON e.paid_by = u.user_id WHERE e.group_id = $1',
      [groupId]
    );
    const expenses = result.rows;

    res.status(200).json(result.rows);
  }
  catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ---------------- SETTLEMENT ROUTES ----------------

// TODO: Settle balance between two users
app.post('/settle', checkAuth, async (req, res) => {
  // TODO
  // 1. Record settlement
  // 2. Update Balance
    // from_user (Debtor) PAYS to_user (Creditor).
    // to_user's claim on from_user REDUCES. ('amount' in updateBalance is logic for INCREASE).
    // So we pass NEGATIVE amount to updateBalance(Creditor, Debtor, -amount).
  const { toUserId, amount } = req.body;
  const fromUserId = req.session.user.user_id;
  try {
    await pool.query(
      'INSERT INTO Settlements (from_user, to_user, amount) VALUES ($1, $2, $3)',
      [fromUserId, toUserId, amount]
    );
    await updateBalance(pool, toUserId, fromUserId, -amount);
    res.status(200).json({ message: 'Settlement successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// TODO: Fetch balances of logged-in user
app.get('/balances', checkAuth, async (req, res) => {
  // TODO
  const userId = req.session.user.user_id;
  try {
    const result = await pool.query(
      'SELECT u.user_id, u.username, b.amount FROM Balance b JOIN Users u ON b.other_user_id = u.user_id WHERE b.user_id = $1',
      [userId]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});





 
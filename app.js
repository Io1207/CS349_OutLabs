const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const { Pool } = require('pg');
require('dotenv').config();

// Global variable to store database credentials
let dbConfig = null;
let pool = null;

const app = express();
const port = 3000;

// Check for environment variables
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

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // For CSS/Images if needed
app.set('view engine', 'ejs');

app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
}));

function isAuthenticated(req, res, next) {
    // TODO: Implement authentication check
    if (!req.session.user) {
        return res.redirect('/login');
    }
    next();
}

function isInstructor(req, res, next) {
    // TODO: Implement check for instructor role
    if (req.session.user.role !== 'instructor') {
        return res.redirect('/login');
    }
    next();
}

// Function to get or initialize the pool
function getPool() {
    if (!pool && dbConfig) {
        pool = new Pool(dbConfig);
    }
    return pool;
}


app.get('/', (req, res) => {
    res.redirect('/login');
});


app.get('/login', (req, res) => {
    res.render('login');
});

// TODO: Implement user login logic
// 1. Check credentials in Users table
// 2. Set session user
// 3. Redirect to appropriate dashboard based on role
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await getPool().query("select * from users where username = $1", [username]);
        if (result.rows.length === 0) {
            return res.render('login', { error: 'Invalid username or password' });
        }
        const user = result.rows[0];
        if (user.password !== password) {
            return res.render('login', { error: 'Invalid username or password' });
        }
        req.session.user = {
            user_id: user.user_id,
            role: user.role,
            full_name: user.full_name
        };
        if (user.role === 'student') {
            res.redirect('/student/dashboard');
        } else if (user.role === 'instructor') {
            res.redirect('/instructor/dashboard');
        } else {
            res.redirect('/login');
        }
    }
    catch (err){
        console.error("Error during login:", err);
        res.render('login', { error: 'An error occurred. Please try again:)' });
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});


// TODO: Render student dashboard
// 1. Fetch registered courses for the student
// 2. Fetch all available courses (exclude registered ones)
// 3. Calculate total credits
app.get('/student/dashboard', isAuthenticated, async (req, res) => {

    const sID = req.session.user.user_id;

    clashCheck = await getPool().query(`
        SELECT c.slot, COUNT(*) as slot_count
        FROM Registrations r
        JOIN Courses c ON r.course_id = c.course_id
        WHERE r.student_id = $1
        GROUP BY c.slot
        HAVING COUNT(*) > 1
    `, [sID]);
    
    if (clashCheck.rows.length > 0) {
        req.session.error = "Slot clash detected in your registered courses.";
    }

    creditLimitCheck = await getPool().query(`
        SELECT COALESCE(SUM(c.credits), 0) AS total_credits
        FROM Registrations r
        JOIN Courses c ON r.course_id = c.course_id
        WHERE r.student_id = $1
    `, [sID]);
    
    if (creditLimitCheck.rows[0].total_credits > 24) {
        req.session.error = "Credit limit exceeded in your registered courses.";
    }

    const success = req.session.success || null;
    req.session.success = null; // Clear success message after displaying
    const error = req.session.error || null;
    req.session.error = null; // Clear error message after displaying

    try {
        const registered = await getPool().query(`
            SELECT c.*
            FROM Registrations r
            JOIN Courses c ON r.course_id = c.course_id
            WHERE r.student_id = $1
        `, [sID]);

        const available = await getPool().query(`
            SELECT *
            FROM Courses
            WHERE course_id NOT IN (
                SELECT course_id FROM Registrations WHERE student_id = $1
            )
        `, [sID]);

        const creditsResult = await getPool().query(`
            SELECT COALESCE(SUM(c.credits), 0) AS total
            FROM Registrations r
            JOIN Courses c ON r.course_id = c.course_id
            WHERE r.student_id = $1
        `, [sID]);

        res.render('student_dashboard', {
            registeredCourses: registered.rows,
            user_full_name: req.session.user.full_name,
            availableCourses: available.rows,
            totalCredits: creditsResult.rows[0].total,
            succ_message: success,
            err_message: error
        });
    } catch (err) {
        console.error(err);
        res.send("Error loading dashboard");
    }
});

// TODO: Implement registration logic
// 1. Check if course exists
// 2. Check for Slot Clash (Cannot register for same slot twice)
// 3. Check Credit Limit (Max 24 credits)
// 4. Check Course Capacity (Optional)
// 5. Insert into Registrations table
app.post('/student/register', isAuthenticated, async (req, res) => {
    const sID = req.session.user.user_id;
    const { course_id } = req.body;

    try {
        // Duplicate
        const dup = await getPool().query(
            'SELECT 1 FROM Registrations WHERE student_id=$1 AND course_id=$2',
            [sID, course_id]
        );
        if (dup.rows.length) {
            return res.redirect('/student/dashboard');
        }

        // Slot clash
        const clash = await getPool().query(`
            SELECT 1
            FROM Registrations r
            JOIN Courses c1 ON r.course_id = c1.course_id
            JOIN Courses c2 ON c2.course_id = $2
            WHERE r.student_id = $1 AND c1.slot = c2.slot
        `, [sID, course_id]);

        if (clash.rows.length) {
            req.session.error = "Slot clash detected! Cannot register for this course.";
            return res.redirect('/student/dashboard');
        }

        // Credit limit
        const credits = await getPool().query(`
            SELECT COALESCE(SUM(c.credits),0) AS total
            FROM Registrations r
            JOIN Courses c ON r.course_id = c.course_id
            WHERE r.student_id = $1
        `, [sID]);
        // console.log("Credit rows coalesced sum: ",credits.rows[0].total);

        const courseCredits = await getPool().query(
            'SELECT credits FROM Courses WHERE course_id=$1',
            [course_id]
        );


        if (credits.rows[0].total > 24) {
            // console.log("Credit limit being exceeded: rows sum, rows total: ", credits.rows[0].total, courseCredits.rows[0].credits);
            // console.log(credits.rows[0].total+ courseCredits.rows[0].credits);
            req.session.error = "Credit limit exceeded! Cannot register for this course.";
            return res.redirect('/student/dashboard');
        }

        await getPool().query(
            'INSERT INTO Registrations(student_id, course_id) VALUES ($1,$2)',
            [sID, course_id]
        );

        req.session.success = "Course registered successfully!";

        res.redirect('/student/dashboard');
    } catch (err) {
        console.error(err);
        res.send("Registration failed");
    }
});

// TODO: Implement drop logic
// 1. Delete from Registrations table
app.post('/student/drop', isAuthenticated, async (req, res) => {
    const studentId = req.session.user.user_id;
    const { course_id } = req.body;

    await getPool().query(
        'DELETE FROM Registrations WHERE student_id=$1 AND course_id=$2',
        [studentId, course_id]
    );
    res.redirect('/student/dashboard');
});


// TODO: Render instructor dashboard
// 1. Fetch courses taught by this instructor
app.get('/instructor/dashboard', isAuthenticated, isInstructor, async (req, res) => {
    const instructorId = req.session.user.user_id;

    const courses = await getPool().query(
        'SELECT * FROM Courses WHERE instructor_id = $1',
        [instructorId]
    );

    res.render('instructor_dashboard', { courses: courses.rows, user_full_name: req.session.user.full_name });
});

// TODO: Show students enrolled in a specific course
// 1. Verify instructor owns the course
// 2. Fetch enrolled students
app.get('/instructor/course/:id', isAuthenticated, isInstructor, async (req, res) => {
    const courseId = req.params.id;
    const error = req.session.error || null;
    req.session.error = null; // Clear error message after displaying
    const students = await getPool().query(`
        SELECT *
        FROM Registrations r
        JOIN Users u ON r.student_id = u.user_id
        WHERE r.course_id = $1
    `, [courseId]);

    res.render('instructor_course', {
        courseId,
        course: (await getPool().query('SELECT * FROM Courses WHERE course_id=$1', [courseId])).rows[0],
        user_full_name: req.session.user.full_name,
        students: students.rows,
        err_message: error
    });
});


// TODO: Implement manual student addition
// 1. Check if student exists
// 2. Check if already enrolled
// 3. Check Credit Limit (If exceeded, allow but show WARNING)
// 4. Insert into Registrations
app.post('/instructor/add-student', isAuthenticated, isInstructor, async (req, res) => {
    const { username, course_id } = req.body;

    const student = await getPool().query(
        'SELECT * FROM Users WHERE username=$1 AND role=\'student\'',
        [username]
    );

    if (!student.rows.length) {
        req.session.error = "Student not found";
        return res.redirect(`/instructor/course/${course_id}`);
    }

    await getPool().query(
        'INSERT INTO Registrations(student_id, course_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',
        [student.rows[0].user_id, course_id]
    );

    res.redirect(`/instructor/course/${course_id}`);
});


// TODO: Implement student removal
// 1. Delete from Registrations
app.post('/instructor/remove-student', isAuthenticated, isInstructor, async (req, res) => {
    const { student_id, course_id } = req.body;

    await getPool().query(
        'DELETE FROM Registrations WHERE student_id=$1 AND course_id=$2',
        [student_id, course_id]
    );

    res.redirect(`/instructor/course/${course_id}`);
});


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

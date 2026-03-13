const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise')
const app = express();
const cors = require('cors');

app.use(cors());

app.use(bodyParser.json());

const port = 8000;

let conn = null;
const initMySQL = async () => {
    conn = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'BookDB',
        port: 8700
    });
    console.log('Connected to MySQL database');
}

// path: = GET /users สำหรับดึงข้อมูล users ทั้งหมด
app.get('/user', async (req, res) => {
    const results = await conn.query('SELECT * FROM user');
    res.json(results[0]);
})

const validateData = (userData) => {
    let errors = [];
    if (!userData.username) {
        errors.push('กรุณากรอกชื่อ');
    }
    if (!userData.password) {
        errors.push('กรุณากรอกรหัสผ่าน');
    }
    if (!userData.phone) {
        errors.push('กรุณากรอกเบอร์โทรศัพท์');
    }
    if (!userData.email) {
        errors.push('กรุณากรอกอีเมล');
    }
    return errors;
}


//path: = POST /users สำหรับเพิ่ม user ใหม่
app.post('/user', async (req, res) => {
    try {

        let user = req.body;

        const errors = validateData(user);
        if (errors.length > 0) {
            throw {
                message: 'กรุณากรอกข้อมูลให้ครบถ้วน',
                errors: errors
            }
        }

        const sql = `
        INSERT INTO user (username,password,phone,email)
        VALUES (?,?,?,?)
        `;

        const results = await conn.query(sql,[
            user.username,
            user.password,
            user.phone,
            user.email
        ]);

        res.json({
            message: 'User added successfully',
            data: results[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Insert error',
            error: error
        });
    }
});

//path: = GET /user/:id สำหรับดึงข้อมูล user ตาม id
app.get('/user/:id', async (req, res) => {
    try {
        let id = req.params.id;
        const results = await conn.query('SELECT * FROM user WHERE id = ?', id);
        if (results[0].length === 0) {
            throw { statusCode: 404, message: 'User not found' };
        }
        res.json(results[0][0]);
    } catch (error) {
        console.error('Error fetching user:', error);
        let statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            message: error.message || 'Error fetching user'
        });
    }
})

//path: = PUT /users/:id สำหรับอัพเดทข้อมูล user ตาม id
app.put('/user/:id', async (req, res) => {
    try {
        let id = req.params.id;
        let updateUser = req.body;
        const results = await conn.query('UPDATE user SET ? WHERE id = ?', [updateUser, id]);
        res.json({
            message: 'User updated successfully',
            data: results[0]
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Error updating user' });
    }
})

//path: = DELETE /users/:id สำหรับลบ user ตาม id
app.delete('/user/:id', async (req, res) => {
    try {
        let id = req.params.id;
        const results = await conn.query('DELETE FROM user WHERE id = ?', id);
        res.json({  
            message: 'User deleted successfully',
            data: results[0]
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Error deleting user' });
    }
})

// ================= BOOK API =================

// GET /book
// ค้นหาหนังสือตาม book_name หรือ book_type ได้
app.get('/book', async (req, res) => {
    try {

        let book_name = req.query.book_name;
        let book_type = req.query.book_type;

        let sql = `
        SELECT 
            book.b_id,
            book.book_name,
            book.book_type,
            book.book_detail,

            CASE
                WHEN borrow.status = 'ยังไม่คืน' THEN 'ยืมไม่ได้'
                ELSE 'ยืมได้'
            END AS status,

            user.username,
            user.phone

        FROM book

        LEFT JOIN borrow 
            ON book.b_id = borrow.book_id 
            AND borrow.status = 'ยังไม่คืน'

        LEFT JOIN user
            ON borrow.user_id = user.id

        WHERE 1=1
        `;

        let params = [];

        if (book_name) {
            sql += ` AND book.book_name LIKE ?`;
            params.push(`%${book_name}%`);
        }

        if (book_type) {
            sql += ` AND book.book_type LIKE ?`;
            params.push(`%${book_type}%`);
        }

        const results = await conn.query(sql, params);

        res.json(results[0]);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: 'Error fetching books',
            error: error
        });

    }
});

// PUT /borrow/:book_id  สำหรับยืมหนังสือ
app.put('/borrow/:book_id', async (req, res) => {
    try {

        let book_id = req.params.book_id;
        let { username, phone } = req.body;

        if (!username || !phone) {
            return res.status(400).json({
                message: "กรุณากรอก username และ phone"
            });
        }

        // หา user จาก username + phone
        const userResult = await conn.query(
            'SELECT * FROM user WHERE username = ? AND phone = ?',
            [username, phone]
        );

        if (userResult[0].length === 0) {
            return res.status(404).json({
                message: "ไม่พบผู้ใช้"
            });
        }

        let user_id = userResult[0][0].id;

        // เช็คว่าหนังสือถูกยืมอยู่หรือไม่
        const checkBorrow = await conn.query(
            'SELECT * FROM borrow WHERE book_id = ? AND status = "ยังไม่คืน"',
            [book_id]
        );

        if (checkBorrow[0].length > 0) {
            return res.json({
                message: "หนังสือเล่มนี้ถูกยืมอยู่"
            });
        }

        // วันที่ยืม
        let borrow_date = new Date();

        // วันที่คืน (7 วัน)
        let return_date = new Date();
        return_date.setDate(return_date.getDate() + 7);

        // เพิ่มข้อมูลการยืม
        const sql = `
        INSERT INTO borrow (book_id,user_id,borrow_date,return_date,status)
        VALUES (?,?,?,?,?)
        `;

        const results = await conn.query(sql, [
            book_id,
            user_id,
            borrow_date,
            return_date,
            "ยังไม่คืน"
        ]);

        res.json({
            message: "ยืมหนังสือสำเร็จ",
            data: results[0]
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Borrow error"
        });

    }
});

app.listen(port, async () => {
    await initMySQL();
    console.log(`Server is running on http://localhost:${port}`);
});
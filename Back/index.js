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

app.listen(port, async () => {
    await initMySQL();
    console.log(`Server is running on http://localhost:${port}`);
});
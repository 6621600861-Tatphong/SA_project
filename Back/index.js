const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

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
    console.log('Connected to MySQL');
};


//--------------- USER -------------------------------------------------------------------------------------------

// ================= USER API =================


// GET all users
app.get('/user', async (req, res) => {

    const results = await conn.query('SELECT * FROM `user`');

    res.json(results[0]);

});


// POST create user
app.post('/user', async (req, res) => {

    let user = req.body;

    const sql = `
    INSERT INTO \`user\` (username,password,phone,email,role)
    VALUES (?,?,?,?,?)
    `;

    const results = await conn.query(sql, [
        user.username,
        user.password,
        user.phone,
        user.email,
        user.role || "ผู้ใช้"
    ]);

    res.json({
        message: "สร้างผู้ใช้สำเร็จ",
        data: results[0]
    });

});


// GET user by id
app.get('/user/:id', async (req, res) => {

    let id = req.params.id;

    const results = await conn.query(
        'SELECT * FROM `user` WHERE id = ?',
        [id]
    );

    res.json(results[0][0]);

});


// UPDATE user
app.put('/user/:id', async (req, res) => {

    let id = req.params.id;
    let updateUser = req.body;

    const results = await conn.query(
        'UPDATE `user` SET ? WHERE id = ?',
        [updateUser, id]
    );

    res.json({
        message: "แก้ไขข้อมูลผู้ใช้สำเร็จ",
        data: results[0]
    });

});


// DELETE user
app.delete('/user/:id', async (req, res) => {

    let id = req.params.id;

    const results = await conn.query(
        'DELETE FROM `user` WHERE id = ?',
        [id]
    );

    res.json({
        message: "ลบผู้ใช้สำเร็จ",
        data: results[0]
    });

});

//----------------------------------------------------------------------------------------------------------------


//--------------- BOOK -------------------------------------------------------------------------------------------

// GET books
app.get('/book', async (req, res) => {

    let sql = `
    SELECT 
        book.b_id,
        book.book_name,
        book.book_type,
        book.book_detail,

        CASE
            WHEN borrow.status = 'ยังไม่คืน'
            THEN 'ยืมไม่ได้'
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
    `;

    const results = await conn.query(sql);

    res.json(results[0]);

});

// GET book by id
app.get('/book/:id', async (req, res) => {

    let id = req.params.id;

    const results = await conn.query(
        'SELECT * FROM book WHERE b_id=?',
        [id]
    );

    res.json(results[0][0]);

});

// ADD book
app.post('/book', async (req, res) => {

    let book = req.body;

    const sql = `
    INSERT INTO book (book_id,book_name,book_type,book_detail)
    VALUES (?,?,?,?)
    `;

    const results = await conn.query(sql, [
        book.book_id,
        book.book_name,
        book.book_type,
        book.book_detail
    ]);

    res.json(results[0]);

});

// UPDATE book
app.put('/book/:id', async (req, res) => {

    let id = req.params.id;
    let updateBook = req.body;

    const results = await conn.query(
        'UPDATE book SET ? WHERE b_id=?',
        [updateBook, id]
    );

    res.json(results[0]);


});

// DELETE book
app.delete('/book/:id', async (req, res) => {

    let id = req.params.id;

    const results = await conn.query(
        'DELETE FROM book WHERE b_id=?',
        [id]
    );

    res.json(results[0]);

});

// SEARCH book
app.get('/apibook/search', async (req, res) => {

    try {

        const book_name = req.query.book_name;
        const book_type = req.query.book_type;

        let sql = `
        SELECT 
            book.b_id,
            book.book_name,
            book.book_type,
            book.book_detail,

            CASE
                WHEN borrow.status = 'ยังไม่คืน'
                THEN 'ยืมไม่ได้'
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

        const [rows] = await conn.query(sql, params);

        res.json(rows);

    } catch (err) {

        console.log(err);

        res.status(500).json({
            message: "Search error"
        });

    }

});

//----------------------------------------------------------------------------------------------------------------


//--------------- BORROW BOOK ------------------------------------------------------------------------------------


// ดูรายการยืม
app.get('/borrow', async (req, res) => {

    const results = await conn.query(`
        SELECT
        borrow.borrow_id,
        book.book_name,
        user.username,
        borrow.borrow_date,
        borrow.return_date,
        borrow.status
        FROM borrow
        LEFT JOIN book ON borrow.book_id = book.b_id
        LEFT JOIN user ON borrow.user_id = user.id
    `);

    res.json(results[0]);

});


// คืนหนังสือ
app.put('/borrow/return/:id', async (req, res) => {

    let id = req.params.id;

    const results = await conn.query(
        'UPDATE borrow SET status="คืนแล้ว" WHERE borrow_id=?',
        [id]
    );

    res.json({
        message: "คืนหนังสือสำเร็จ",
        data: results[0]
    });

});


// ลบรายการยืม
app.delete('/borrow/:id', async (req, res) => {

    let id = req.params.id;

    const results = await conn.query(
        'DELETE FROM borrow WHERE borrow_id=?',
        [id]
    );

    res.json({
        message: "ลบข้อมูลสำเร็จ",
        data: results[0]
    });

});

app.put('/borrow/:book_id', async (req, res) => {

    try {

        let book_id = req.params.book_id;
        let { username, phone } = req.body;

        // หา user
        const userResult = await conn.query(
            'SELECT * FROM user WHERE username=? AND phone=?',
            [username, phone]
        );

        if (userResult[0].length === 0) {
            return res.status(404).json({
                message: "ไม่พบผู้ใช้"
            });
        }

        let user_id = userResult[0][0].id;


        // เช็คหนังสือถูกยืมไหม
        const checkBorrow = await conn.query(
            'SELECT * FROM borrow WHERE book_id=? AND status="ยังไม่คืน"',
            [book_id]
        );

        if (checkBorrow[0].length > 0) {
            return res.json({
                message: "หนังสือถูกยืมอยู่"
            });
        }


        // วันที่ยืม
        let borrow_date = new Date();

        // วันคืน
        let return_date = new Date();
        return_date.setDate(return_date.getDate() + 7);


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
            message: "เกิดข้อผิดพลาด"
        });

    }

});

app.put('/borrowedit/:id', async (req, res) => {

    let id = req.params.id;
    let updateBorrow = req.body;

    const results = await conn.query(
        'UPDATE borrow SET ? WHERE borrow_id=?',
        [updateBorrow, id]
    );

    res.json({
        message: "แก้ไขข้อมูลยืมสำเร็จ",
        data: results[0]
    });

});

app.delete('/borrow/:id', async (req, res) => {

    let id = req.params.id;

    const results = await conn.query(
        'DELETE FROM borrow WHERE borrow_id=?',
        [id]
    );

    res.json({
        message: "ลบข้อมูลยืมสำเร็จ",
        data: results[0]
    });

});

//----------------------------------------------------------------------------------------------------------------


app.listen(port, async () => {
    await initMySQL();
    console.log(`Server running http://localhost:${port}`);
});
const api = "http://localhost:8000/book";
const searchApi = "http://localhost:8000/apibook/search";


// ======================
// ตรวจสอบ login
// ======================

const userData = localStorage.getItem("user");

if (!userData) {
    alert("กรุณาเข้าสู่ระบบก่อน");
    window.location.href = "login.html";
}

const user = JSON.parse(userData);


// ======================
// โหลดหนังสือทั้งหมด
// ======================

async function loadBooks() {

    try {

        const res = await fetch(api);
        const books = await res.json();

        renderBooks(books);

    } catch (error) {

        console.error(error);
        alert("โหลดข้อมูลหนังสือไม่สำเร็จ");

    }

}


// ======================
// แสดงข้อมูลหนังสือ
// ======================

function renderBooks(books) {

    const table = document.getElementById("bookTable");

    if (!table) return;

    table.innerHTML = "";

    if (books.length === 0) {

        table.innerHTML = `
        <tr>
            <td colspan="5">ไม่พบข้อมูลหนังสือ</td>
        </tr>
        `;

        return;
    }

    books.forEach(book => {

        table.innerHTML += `
        <tr>
            <td>${book.b_id}</td>
            <td>${book.book_name}</td>
            <td>${book.book_type}</td>
            <td>${book.status}</td>

            <td>
                <button onclick="editBook('${book.b_id}')">Edit</button>
                <button onclick="deleteBook('${book.b_id}')">Delete</button>
            </td>
        </tr>
        `;

    });

}


// ======================
// ลบหนังสือ
// ======================

async function deleteBook(id) {

    if (!confirm("ต้องการลบหนังสือหรือไม่")) return;

    try {

        await fetch(`${api}/${id}`, {
            method: "DELETE"
        });

        loadBooks();

    } catch (err) {

        console.error(err);
        alert("ลบข้อมูลไม่สำเร็จ");

    }

}


// ======================
// เปิด popup แก้ไข
// ======================

function editBook(id) {

    const row = event.target.closest("tr");

    const name = row.children[1].innerText;
    const type = row.children[2].innerText;
    const status = row.children[3].innerText;

    document.getElementById("editId").value = id;
    document.getElementById("editName").value = name;
    document.getElementById("editType").value = type;
    document.getElementById("editStatus").value = status;

    document.getElementById("editPopup").style.display = "block";

}


// ======================
// ปิด popup
// ======================

function closePopup() {

    document.getElementById("editPopup").style.display = "none";

}


// ======================
// update หนังสือ
// ======================

async function updateBook() {

    const id = document.getElementById("editId").value;

    const data = {

        book_name: document.getElementById("editName").value,
        book_type: document.getElementById("editType").value,

    };

    await fetch(`${api}/${id}`, {

        method: "PUT",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(data)

    });

    closePopup();
    loadBooks();

}


// ======================
// ค้นหาหนังสือ
// ======================

async function searchBooks() {

    const name = document.getElementById("searchName").value;
    const type = document.getElementById("searchType").value;

    if (!name && !type) {

        loadBooks();
        return;

    }

    let url = searchApi + "?";

    if (name) {

        url += `book_name=${name}&`;

    }

    if (type) {

        url += `book_type=${type}`;

    }

    try {

        const res = await fetch(url);
        const books = await res.json();

        renderBooks(books);

    } catch (err) {

        console.error(err);
        alert("ค้นหาหนังสือไม่สำเร็จ");

    }

}


// ======================
// รีเซ็ตการค้นหา
// ======================

function resetSearch() {

    document.getElementById("searchName").value = "";
    document.getElementById("searchType").value = "";

    loadBooks();

}


// ======================
// โหลดข้อมูลตอนเปิดหน้า
// ======================

loadBooks();
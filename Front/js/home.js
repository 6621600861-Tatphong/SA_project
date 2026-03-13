const api = "http://localhost:8000/book";

// ======================
// โหลด user จาก localStorage
// ======================

const userData = localStorage.getItem("user");

if (!userData) {
    alert("กรุณาเข้าสู่ระบบก่อน");
    window.location.href = "login.html";
}

const user = JSON.parse(userData);

console.log(user.username);
console.log(user.phone);


// ======================
// โหลดรายการหนังสือ
// ======================

async function loadBooks() {

    try {

        const res = await fetch(api);
        const books = await res.json();

        const table = document.getElementById("bookTable");

        table.innerHTML = ""; // เคลียร์ข้อมูลเก่า

        books.forEach(book => {

            let btn = "";

            if (book.status === "ยืมได้") {

                btn = `<button onclick="goBorrow('${book.b_id}')">ยืม</button>`;

            } else {

                btn = `ยืมไม่ได้ (${book.username})`;

            }

            table.innerHTML += `
            <tr>
                <td>${book.b_id}</td>
                <td>${book.book_name}</td>
                <td>${book.book_type}</td>
                <td>${book.status}</td>
                <td>${btn}</td>
            </tr>
            `;

        });

    } catch (error) {

        console.error("Error loading books:", error);
        alert("ไม่สามารถโหลดข้อมูลหนังสือได้");

    }

}


// ======================
// ไปหน้า borrow
// ======================

function goBorrow(id) {

    window.location.href = `borrow.html?book_id=${id}`;

}


// ======================
// เริ่มโหลดข้อมูล
// ======================

loadBooks();
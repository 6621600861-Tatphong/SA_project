const api = "http://localhost:8000/borrow";


// ======================
// ตรวจสอบ login
// ======================

const userData = localStorage.getItem("user");

if (!userData) {
    alert("กรุณาเข้าสู่ระบบ");
    window.location.href = "login.html";
}

const user = JSON.parse(userData);


// ======================
// โหลดรายการยืม
// ======================

async function loadBorrow() {

    try {

        const res = await fetch(api);
        const data = await res.json();

        const myBorrow = data.filter(b => b.username === user.username);

        renderBorrow(myBorrow);

    } catch (err) {

        console.error(err);
        alert("โหลดข้อมูลไม่สำเร็จ");

    }

}


// ======================
// แสดงข้อมูล
// ======================

function renderBorrow(data) {

    const table = document.getElementById("borrowTable");

    table.innerHTML = "";

    if (data.length === 0) {

        table.innerHTML = `
<tr>
<td colspan="6">ยังไม่มีรายการยืม</td>
</tr>
`;

        return;
    }

    data.forEach(item => {

        let btn = "";

        if (item.status === "ยังไม่คืน") {

            btn = `<button onclick="returnBook('${item.borrow_id}')">คืนหนังสือ</button>`;

        } else {

            btn = "คืนแล้ว";

        }

        table.innerHTML += `
<tr>
<td>${item.borrow_id}</td>
<td>${item.book_name}</td>
<td>${formatDate(item.borrow_date)}</td>
<td>${formatDate(item.return_date)}</td>
<td>${item.status}</td>
<td>${btn}</td>
</tr>
`;

    });

}


// ======================
// คืนหนังสือ
// ======================

async function returnBook(id) {

    if (!confirm("ต้องการคืนหนังสือใช่หรือไม่")) return;

    try {

        await fetch(`http://localhost:8000/borrow/return/${id}`, {
            method: "PUT"
        });

        alert("คืนหนังสือสำเร็จ");

        loadBorrow();

    } catch (err) {

        console.error(err);
        alert("คืนหนังสือไม่สำเร็จ");

    }

}


// ======================
// format วันที่
// ======================

function formatDate(date) {

    const d = new Date(date);

    return d.toLocaleDateString("th-TH") + " " + d.toLocaleTimeString("th-TH");

}


// ======================
// เริ่มโหลด
// ======================

loadBorrow();
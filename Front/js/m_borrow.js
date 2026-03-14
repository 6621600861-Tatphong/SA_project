const api = "http://localhost:8000/borrow";


// โหลดข้อมูล
async function loadBorrow() {

    const res = await fetch(api);
    const data = await res.json();

    renderBorrow(data);

}


// แสดงตาราง
function renderBorrow(list) {

    const table = document.getElementById("borrowTable");

    table.innerHTML = "";

    if (list.length === 0) {
        table.innerHTML = `<tr><td colspan="7">ไม่พบข้อมูล</td></tr>`;
        return;
    }

    list.forEach(b => {

        table.innerHTML += `
<tr>

<td>${b.borrow_id}</td>
<td>${b.book_name}</td>
<td>${b.username}</td>
<td>${formatDate(b.borrow_date)}</td>
<td>${formatDate(b.return_date)}</td>
<td>${b.status}</td>

<td>

<button onclick="openEdit('${b.borrow_id}','${b.status}')">Edit</button>

<button onclick="deleteBorrow('${b.borrow_id}')">Delete</button>

</td>

</tr>
`;

    });

}


// format วันที่
function formatDate(date) {

    if (!date) return "-";

    const d = new Date(date);

    return d.toLocaleDateString("th-TH");

}


// popup edit
function openEdit(id, status) {

    document.getElementById("editId").value = id;
    document.getElementById("editStatus").value = status;

    document.getElementById("editPopup").style.display = "block";

}

function closePopup() {

    document.getElementById("editPopup").style.display = "none";

}


// update status
async function updateBorrow() {

    const id = document.getElementById("editId").value;

    const status = document.getElementById("editStatus").value;

    await fetch(`http://localhost:8000/borrowedit/${id}`, {

        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            status: status
        })

    });

    closePopup();
    loadBorrow();

}


// คืนหนังสือ
async function returnBook(id) {

    if (!confirm("ต้องการคืนหนังสือหรือไม่")) return;

    await fetch(`http://localhost:8000/borrow/return/${id}`, {
        method: "PUT"
    });

    loadBorrow();

}


// ลบรายการ
async function deleteBorrow(id) {

    if (!confirm("ต้องการลบรายการยืมหรือไม่")) return;

    await fetch(`http://localhost:8000/borrow/${id}`, {
        method: "DELETE"
    });

    loadBorrow();

}


// ค้นหา
function searchBorrow() {

    const name = document.getElementById("searchName").value.toLowerCase();
    const user = document.getElementById("searchUser").value.toLowerCase();

    const rows = document.querySelectorAll("#borrowTable tr");

    rows.forEach(row => {

        const book = row.children[1].innerText.toLowerCase();
        const username = row.children[2].innerText.toLowerCase();

        if (book.includes(name) && username.includes(user)) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }

    });

}


// reset
function resetSearch() {

    document.getElementById("searchName").value = "";
    document.getElementById("searchUser").value = "";

    loadBorrow();

}


// โหลดตอนเปิดหน้า
loadBorrow();
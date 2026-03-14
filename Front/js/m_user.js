const api = "http://localhost:8000/user";


// โหลดผู้ใช้
async function loadUsers() {

    const res = await fetch(api);
    const users = await res.json();

    renderUsers(users);

}


// แสดงตาราง
function renderUsers(users) {

    const table = document.getElementById("userTable");

    table.innerHTML = "";

    users.forEach(u => {

        table.innerHTML += `
<tr>

<td>${u.id}</td>
<td>${u.username}</td>
<td>${u.phone}</td>
<td>${u.role}</td>

<td>

<button onclick="editUser('${u.id}')">
Edit
</button>

<button onclick="deleteUser('${u.id}')">
Delete
</button>

</td>

</tr>
`;

    });

}


// เปิด popup
function editUser(id) {

    const row = event.target.closest("tr");

    const username = row.children[1].innerText;
    const phone = row.children[2].innerText;
    const role = row.children[3].innerText;

    document.getElementById("editId").value = id;
    document.getElementById("editUsername").value = username;
    document.getElementById("editPhone").value = phone;
    document.getElementById("editRole").value = role;

    document.getElementById("editPopup").style.display = "block";

}


// ปิด popup
function closePopup() {

    document.getElementById("editPopup").style.display = "none";

}


// update user
async function updateUser() {

    const id = document.getElementById("editId").value;

    const data = {

        username: document.getElementById("editUsername").value,
        phone: document.getElementById("editPhone").value,
        role: document.getElementById("editRole").value

    };

    await fetch(`http://localhost:8000/user/${id}`, {

        method: "PUT",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(data)

    });

    closePopup();
    loadUsers();

}


// ลบผู้ใช้
async function deleteUser(id) {

    if (!confirm("ต้องการลบผู้ใช้หรือไม่")) return;

    await fetch(`http://localhost:8000/user/${id}`, {
        method: "DELETE"
    });

    loadUsers();

}


// โหลดตอนเปิดหน้า
loadUsers();
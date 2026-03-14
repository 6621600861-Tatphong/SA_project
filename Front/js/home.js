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

async function loadBooks(){

    try{

        const res = await fetch(api);
        const books = await res.json();

        renderBooks(books);

    }catch(error){

        console.error(error);
        alert("โหลดข้อมูลหนังสือไม่สำเร็จ");

    }

}


// ======================
// แสดงข้อมูลหนังสือ
// ======================

function renderBooks(books){

    const table = document.getElementById("bookTable");

    table.innerHTML = "";

    if(books.length === 0){
        table.innerHTML = `
        <tr>
        <td colspan="5">ไม่พบข้อมูลหนังสือ</td>
        </tr>
        `;
        return;
    }

    books.forEach(book => {

        let btn = "";

        if(book.status === "ยืมได้"){
            btn = `<button onclick="goBorrow('${book.b_id}')">ยืม</button>`;
        }
        else{
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

}


// ======================
// ค้นหาหนังสือ
// ======================

async function searchBooks(){

    const name = document.getElementById("searchName").value;
    const type = document.getElementById("searchType").value;

    if(!name && !type){
        loadBooks();
        return;
    }

    let url = searchApi + "?";

    if(name){
        url += `book_name=${name}&`;
    }

    if(type){
        url += `book_type=${type}`;
    }

    try{

        const res = await fetch(url);
        const books = await res.json();

        renderBooks(books);

    }catch(error){

        console.error(error);
        alert("ค้นหาหนังสือไม่สำเร็จ");

    }

}


// ======================
// รีเซ็ตการค้นหา
// ======================

function resetSearch(){

    document.getElementById("searchName").value = "";
    document.getElementById("searchType").value = "";

    loadBooks();

}


// ======================
// ไปหน้า borrow
// ======================

function goBorrow(id){

    window.location.href = `borrow.html?book_id=${id}`;

}


// ======================
// โหลดข้อมูลตอนเปิดหน้า
// ======================

loadBooks();
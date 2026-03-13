const urlParams = new URLSearchParams(window.location.search);
const book_id = urlParams.get("book_id");

const usernameInput = document.getElementById("username");
const phoneInput = document.getElementById("phone");
const borrowDateInput = document.getElementById("borrow_date");
const returnDateInput = document.getElementById("return_date");


// โหลด user
const userData = localStorage.getItem("user");

if (!userData) {
    alert("กรุณาเข้าสู่ระบบก่อน");
    window.location.href = "login.html";
}

const user = JSON.parse(userData);

usernameInput.value = user.username;
phoneInput.value = user.phone;


// วันที่ปัจจุบัน
const today = new Date();

const borrow_date = today.toISOString().split("T")[0];

today.setDate(today.getDate() + 7);

const return_date = today.toISOString().split("T")[0];

borrowDateInput.value = borrow_date;
returnDateInput.value = return_date;



// ยืมหนังสือ
document.getElementById("borrowForm").addEventListener("submit", async function(e){

    e.preventDefault();

    try{

        const res = await fetch(`http://localhost:8000/borrow/${book_id}`,{

            method:"PUT",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify({
                username:user.username,
                phone:user.phone
            })

        });

        const data = await res.json();

        if(res.ok){
            alert("ยืมหนังสือสำเร็จ");
            window.location.href = "home.html";
        }else{
            alert(data.message);
        }

    }catch(error){

        console.error(error);
        alert("เกิดข้อผิดพลาด");

    }

});
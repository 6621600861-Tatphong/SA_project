const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");


// LOGIN
if(loginForm){

loginForm.addEventListener("submit", async function(e){

e.preventDefault();

const username = document.getElementById("username").value;
const password = document.getElementById("password").value;

const res = await fetch("http://localhost:8000/user");
const users = await res.json();

const user = users.find(u => u.username === username && u.password === password);

if(user){

localStorage.setItem("username", user.username);
window.location.href = "home.html";

}else{

document.getElementById("result").innerText = "Username หรือ Password ไม่ถูกต้อง";

}

});

}


// REGISTER
if(registerForm){

registerForm.addEventListener("submit", async function(e){

e.preventDefault();

const data = {

username: document.getElementById("username").value,
password: document.getElementById("password").value,
phone: document.getElementById("phone").value,
email: document.getElementById("email").value

};

const res = await fetch("http://localhost:8000/user",{

method:"POST",
headers:{
"Content-Type":"application/json"
},
body: JSON.stringify(data)

});

await res.json();

document.getElementById("result").innerText = "สมัครสมาชิกสำเร็จ";

setTimeout(()=>{
window.location.href = "login.html";
},1500);

});

}
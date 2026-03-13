const username = localStorage.getItem("username");

if(!username){
window.location.href = "login.html";
}

document.getElementById("welcome").innerText = "Welcome : " + username;

function logout(){

localStorage.removeItem("username");
window.location.href = "login.html";

}
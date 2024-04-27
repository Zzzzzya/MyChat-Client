import { TryLogin, TryRegist } from "./LoginService.js";
const { ipcRenderer } = require("electron");

//---------------------------------登录注册切换 动画效果 模块---------------------------------
let GotoLogin = document.getElementById("gotologin");
let GotoRegister = document.getElementById("gotoregister");
let container = document.getElementsByClassName("container")[0];
let register_box = document.getElementById("register-box");
let login_box = document.getElementById("login-box");

function forceReflow(element) {
  void element.offsetHeight;
}
// 去注册按钮点击事件
GotoRegister.addEventListener("click", () => {
  console.log("gotore");
  container.style.transform = "translateX(80%)";
  login_box.classList.add("hidden");
  register_box.classList.remove("hidden");
  var currentWidth = container.offsetWidth;
  container.style.width = currentWidth + 1 + "px";
  //   box.style.width = currentWidth + "px";
});
// 去登录按钮点击事件
GotoLogin.addEventListener("click", () => {
  container.style.transform = "translateX(0%)";
  register_box.classList.add("hidden");
  login_box.classList.remove("hidden");
  var currentWidth = container.offsetWidth;
  container.style.width = currentWidth - 1 + "px";
});

//---------------------------------登录模块---------------------------------
document.getElementById("LoginSubmit").addEventListener("click", (event) => {
  event.preventDefault();
  let username = document.getElementById("LoginUsername").value;
  let password = document.getElementById("LoginPassword").value;

  console.log(username, password);

  TryLogin(username, password, 1, "2.0.0");
});

//---------------------------------注册模块---------------------------------
document.getElementById("RegistSubmit").addEventListener("click", (event) => {
  event.preventDefault();
  let username = document.getElementById("RegistUsername").value;
  let password = document.getElementById("RegistPassword").value;
  let nickname = document.getElementById("RegistNickname").value;
  let email = document.getElementById("RegistEmail").value;

  console.log(username, password, nickname, email);

  TryRegist(username, password, nickname, email);
});

//---------------------------------退出模块---------------------------------
//Exit按钮点击事件
for (let i = 0; i < document.getElementsByClassName("Exit").length; i++) {
  document
    .getElementsByClassName("Exit")
    [i].addEventListener("click", (event) => {
      ipcRenderer.send("Exit");
    });
}

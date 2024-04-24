import {TryLogin} from "./LoginService.js";
const { ipcRenderer } = require('electron');

//Login表单提交事件 尝试登录
document.querySelector('input[type="submit"]').addEventListener("click",(event)=>{
    event.preventDefault();
    let username = document.getElementById("Username").value
    let password = document.getElementById("Password").value

    console.log(username,password)

    TryLogin(username,password,1,"2.0.0")
})

document.getElementById("Exit").addEventListener("click",(event)=>{
    ipcRenderer.send('Exit');
})
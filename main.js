const { app, ipcMain, BrowserWindow } = require("electron");
const { db } = require("./js/sql.js");
const path = require("path");

let instanceCount = 0;

function CreateNewWindow(htmlFile) {
  let win = new BrowserWindow({
    frame: false,
    width: 1000,
    height: 800,
    resizable: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.loadFile(htmlFile);
  return win;
}

let LoginRegisterWindow = null;
let MainWindow = null;
let MSG_ip = null;

app.whenReady().then(() => {
  const userDataPath = app.getPath("userData");
  const cwd = process.cwd(); // 获取当前工作目录
  const uniquePath = path.join(
    userDataPath,
    Buffer.from(cwd).toString("base64")
  ); // 使用 base64 编码来避免路径中的特殊字符
  app.setPath("userData", uniquePath);
  LoginRegisterWindow = CreateNewWindow("./html/Login&Register.html");
});

app.addListener("window-all-closed", () => {
  if (process.platform !== "darwin") {
    //关闭数据库链接
    //关闭所有页面
    app.quit();
  }
});

//跳转主页面
ipcMain.on("LoginSuccess", (event, MSG_server_ip) => {
  MSG_ip = MSG_server_ip;
  setTimeout(function () {
    LoginRegisterWindow.close();
    MainWindow = CreateNewWindow("./html/Main.html");
  }, 2000);
});

ipcMain.on("RegistSuccess", (event, arg) => {
  setTimeout(function () {
    LoginRegisterWindow.close();
    LoginRegisterWindow = CreateNewWindow("./html/Login&Register.html");
    console.log(arg);
  }, 2000);
});

ipcMain.on("get-variable", (event, arg) => {
  // 假设你想获取的变量是 MSG_ip
  event.reply("variable-value", MSG_ip);
});

ipcMain.on("Exit", (event, arg) => {
  app.quit();
});

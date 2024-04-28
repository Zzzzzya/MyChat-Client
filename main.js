const { app, ipcMain, BrowserWindow } = require("electron");

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

app.whenReady().then(() => {
  LoginRegisterWindow = CreateNewWindow("./html/Login&Register.html");
});

app.addListener("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

ipcMain.on("LoginSuccess", (event, arg) => {
  setTimeout(function () {
    LoginRegisterWindow.close();
    console.log(arg);
  }, 2000);
});

ipcMain.on("RegistSuccess", (event, arg) => {
  setTimeout(function () {
    LoginRegisterWindow.close();
    LoginRegisterWindow = CreateNewWindow("./html/Login&Register.html");
    console.log(arg);
  }, 2000);
});

ipcMain.on("Exit", (event, arg) => {
  app.quit();
});

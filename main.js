const {app,ipcMain,BrowserWindow} = require('electron')

function CreateNewWindow(htmlFile){
    let win = new BrowserWindow({
        frame:false,
        width: 650,
        height: 650,
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    })

    win.loadFile(htmlFile);
    return win;
}

let LoginWindow = null;

app.whenReady().then(()=>{
    LoginWindow = CreateNewWindow('./html/Login.html');

    app.on('activate',()=>{
        if(BrowserWindow.getAllWindows().length === 0){
            CreateNewWindow('Loginn.html')
        }
    })
})

app.addListener('window-all-closed',()=>{
    if(process.platform !== 'darwin'){
        app.quit()
    }
})

ipcMain.on('LoginSuccess',(event,arg)=>{
    LoginWindow.close();
    console.log(arg);
})

ipcMain.on('Exit',(event,arg)=>{
    app.quit();
})
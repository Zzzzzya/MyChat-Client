import { NewPromptBox } from "./PromptBox.js";
const ipcRenderer = require("electron").ipcRenderer;
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

const sqlite3 = require("sqlite3").verbose();
const path = require("path");

//db文件夹绝对路径
const PATH_DB = "D:\\Files\\Code\\Web\\MyChat\\db";

//连接数据库
let db = new sqlite3.Database(path.join(PATH_DB, "MC.db"), (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log("Connected to the MC database.");
});

const packageDefinition = protoLoader.loadSync("./protos/MC.Login.proto", {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);

const LoginService = protoDescriptor.MC.Login.MCLogin;

export const LoginClient = new LoginService(
  "192.168.146.131:50051",
  grpc.credentials.createInsecure()
);

// Login服务调用
export function TryLogin(username, password, online_status, client_version) {
  LoginClient.Login(
    {
      username: username,
      password: password,
      online_status: online_status,
      client_version: client_version,
    },
    (err, response) => {
      if (err) {
        console.log("An error occurred while trying to login");
        console.error(err);
        return;
      }

      let status = response.code;
      if (status !== "OK") {
        let error_message = response.err_msg;
        NewPromptBox(error_message);
        return;
      }

      NewPromptBox("登录成功！请等候加载");

      // 插入新的一行为username
      db.run("DELETE FROM CurUser");
      db.run("INSERT INTO CurUser (username) VALUES (?)", username);

      //请求个人信息
      let nickname = response.nickname;
      let gender = response.gender;
      let signature = response.signature;
      let email = response.email;
      let phone = response.phone;
      let birthday = response.birthday;

      //已经拿取了正确的个人信息，现在存入数据库中
      let stmt =
        db.prepare(`INSERT OR REPLACE INTO User (Username, Password,Nickname, Gender, Signature, Email, Phone, Birthday) 
VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
      stmt.run(
        username,
        password,
        nickname,
        gender,
        signature,
        email,
        phone,
        birthday
      );

      //切换页面信号
      ipcRenderer.send("LoginSuccess", response);
    }
  );
}

// Regist服务调用
export function TryRegist(username, password, nickname, email) {
  LoginClient.Regist(
    {
      username: username,
      password: password,
      nickname: nickname,
      email: email,
    },
    (err, response) => {
      if (err) {
        NewPromptBox("Error occurred while trying to register");
        console.error(err);
        return;
      }

      let status = response.code;
      if (status !== "OK") {
        let error_message = response.error_message;
        NewPromptBox(error_message);
        return;
      }

      NewPromptBox("注册成功！请稍后");

      //切换页面信号
      ipcRenderer.send("RegistSuccess", response);
    }
  );
}

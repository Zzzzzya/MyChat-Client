import { NewPromptBox } from "./PromptBox.js";
const ipcRenderer = require("electron").ipcRenderer;
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

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

      NewPromptBox("登录成功！请稍后");

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

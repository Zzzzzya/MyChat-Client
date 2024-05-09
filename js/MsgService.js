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

const packageDefinition = protoLoader.loadSync("./protos/MC.Msg.proto", {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);

const MsgService = protoDescriptor.MC.Msg.MSG;

const msg_ip = "192.168.146.131:50088";

const MsgClient = new MsgService(msg_ip, grpc.credentials.createInsecure());

// GetFriends服务调用
export function GetFriends(userid) {
  MsgClient.GetFriends(
    {
      userid: userid,
    },
    (err, response) => {
      if (err) {
        console.log("An error occurred while trying to GetFriends");
        console.error(err);
        return;
      }

      let status = response.code;
      if (status !== "OK") {
        let error_message = response.errmsg;
        console.log("GetFriends Error: " + error_message);
        return;
      }

      //GetFriends Success
      //获取好友列表

      let friends = response.friends;
      let sql = `INSERT INTO Friends (friendId, friendName, friendSign, lastContactTime) VALUES (?, ?, ?, ?)`;
      friends.forEach((friend) => {
        db.run(
          sql,
          [
            friend.friendId,
            friend.friendName,
            friend.friendSign,
            friend.lastContactTime,
          ],
          (err) => {
            if (err) {
              console.error(err.message);
            }
          }
        );
      });
    }
  );
}

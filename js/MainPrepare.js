const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

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

let MsgClient = null;

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
      let tbody = document.querySelector("#page3 tbody");
      let index = 0;
      friends.forEach((friend) => {
        db.run(
          sql,
          [
            friend.friendid,
            friend.friendname,
            friend.friendsign,
            friend.lastcontacttime,
          ],
          (err) => {
            if (err) {
              console.error(err.message);
            }

            // 创建 tr 元素
            let tr = document.createElement("tr");

            // 创建 td 元素并设置它们的内容
            let td1 = document.createElement("td");
            td1.textContent = index + 1;
            index++;

            let td2 = document.createElement("td");
            let img = document.createElement("img");
            img.src = "../src/images/logo/me.jpg";
            img.alt = "";
            td2.appendChild(img);
            td2.appendChild(document.createTextNode(friend.friendname));

            let td3 = document.createElement("td");
            td3.textContent = friend.lastcontacttime;

            let td4 = document.createElement("td");
            let div = document.createElement("div");
            div.className = "btnbox";
            let p1 = document.createElement("p");
            p1.className = "btn";
            p1.textContent = "Chat";
            let p2 = document.createElement("p");
            p2.className = "btn";
            p2.textContent = "Delete";
            div.appendChild(p1);
            div.appendChild(p2);
            td4.appendChild(div);

            // 将 td 元素添加到 tr 元素中
            tr.appendChild(td1);
            tr.appendChild(td2);
            tr.appendChild(td3);
            tr.appendChild(td4);

            // 将 tr 元素添加到 tbody 元素中
            tbody.appendChild(tr);
          }
        );
      });
    }
  );
}

let nickname = document.querySelector(".Name .text");
let signature = document.querySelector(".signature");
let email = document.querySelector("#userEmail");
let phone = document.querySelector("#userPhone");
let birthday = document.querySelector("#userBirth");

let sql0 = `SELECT * FROM MsgIP LIMIT 1`;
let sql1 = `SELECT * FROM CurUser LIMIT 1`;
let userid = 0;
let msg_ip = null;

db.get(sql0, (err, row) => {
  if (err) {
    console.error(err.message);
    return;
  }
  msg_ip = row.msg_ip;
  console.log("获取到的msg_ip是：" + msg_ip);

  MsgClient = new MsgService(msg_ip, grpc.credentials.createInsecure());

  db.get(sql1, (err, row) => {
    if (err) {
      console.error(err.message);
      return;
    }
    // 处理查询结果
    userid = row.userid;
    console.log(userid);
    console.log("获取到的userid是：" + userid);
    console.log("here");

    let sql2 = `SELECT * FROM User WHERE Userid = '${userid}'`;
    console.log(sql2);
    db.get(sql2, (err, row) => {
      if (err) {
        console.error(err.message);
        return;
      }
      // 如果找到了对应的行，row 就是这个行的数据
      if (row) {
        console.log(row);
        nickname.textContent = row.Nickname;
        //gender.textContent = row.gender;
        signature.textContent = row.Signature;
        email.textContent = row.Email;
        phone.textContent = row.Phone;
        birthday.textContent = row.Birthday;
      } else {
        console.log(`No user found with the username ${userid}`);
      }
    });

    GetFriends(userid);

    let tbody = document.querySelector("#page3 tbody");
    let sql3 = `SELECT * FROM Friends`;
  });
});

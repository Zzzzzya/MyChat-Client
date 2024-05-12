import { NewPromptBox } from "./PromptBox.js";
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

let nickname = document.querySelector(".Name .text");
let signature = document.querySelector(".signature");
let email = document.querySelector("#userEmail");
let phone = document.querySelector("#userPhone");
let birthday = document.querySelector("#userBirth");

let ProfileFields = {
  nickname: nickname,
  signature: signature,
  email: email,
  phone: phone,
  birthday: birthday,
};

// Chat 服务调用
let chatStream = null;
let writechatStream = null;

//好友请求消息 - 发送
function AddFriendReq(userid, friendname) {
  chatStream.write({
    type: "Friend:Req",
    sender: userid,
    sendertype: "id",
    recievername: friendname,
    recievertype: "name",
  });
}

//上线消息 - 发送
function Online(userid) {
  writechatStream.write({
    type: "Online",
    sender: userid,
  });
  chatStream.write({
    type: "Online",
    sender: userid,
  });
}

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
      let sql = `INSERT INTO Friends (friendId, friendName, profile_image, lastContactTime) VALUES (?, ?,?, ?)`;
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
            img.src = friend.friendsign;
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

//UpdateUserInfo服务调用
function UpdateUserInfo(userid, field, value) {
  MsgClient.UpdateUserInfo(
    {
      userid: userid,
      field: field,
      value: value,
    },
    (err, response) => {
      if (err) {
        console.log("An error occurred while trying to UpdateUserInfo");
        console.error(err);
        return;
      }

      let status = response.code;
      if (status !== "OK") {
        let error_message = response.err_msg;
        console.log("UpdateUserInfo Error: " + error_message);
        NewPromptBox("更改失败：" + error_message);
        return;
      }

      if (field in ProfileFields) ProfileFields[field].textContent = value;
      else if (field == "gender") {
        if (value == "1") {
          femaleicon.style.display = "block";
          maleicon.style.display = "none";
        } else {
          femaleicon.style.display = "none";
          maleicon.style.display = "block";
        }
      }

      field = field[0].toUpperCase() + field.slice(1);
      // 更新数据库
      db.run(
        `UPDATE User SET ${field} = '${value}' WHERE Userid = '${userid}'`
      );

      //UpdateUserInfo Success
      console.log("UpdateUserInfo Success");
      NewPromptBox("更改成功");
    }
  );
}

//UpdateUserHead服务调用
function UpdateUserHead(userid, value) {
  MsgClient.UpdateUserHead(
    {
      userid: userid,
      image_data: value,
    },
    (err, response) => {
      if (err) {
        console.log("An error occurred while trying to UpdateUserHead");
        console.error(err);
        return;
      }

      let status = response.code;
      if (status !== "OK") {
        let error_message = response.err_msg;
        console.log("UpdateUserHead Error: " + error_message);
        NewPromptBox("网络问题 更改失败：" + error_message);
        return;
      }

      //UpdateUserHead Success
      console.log("UpdateUserHead Success");
      NewPromptBox("更改成功");
    }
  );
}

let sql0 = `SELECT * FROM MsgIP LIMIT 1`;
let sql1 = `SELECT * FROM CurUser LIMIT 1`;
let userid = 0;
let msg_ip = null;

// 准备阶段服务调用
db.get(sql0, (err, row) => {
  if (err) {
    console.error(err.message);
    return;
  }
  msg_ip = row.msg_ip;
  console.log("获取到的msg_ip是：" + msg_ip);

  MsgClient = new MsgService(msg_ip, grpc.credentials.createInsecure());

  writechatStream = MsgClient.WriteChat();
  chatStream = MsgClient.Chat();

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

        let maleicon = document.querySelector("#maleicon");
        let femaleicon = document.querySelector("#femaleicon");

        if (row.gender == "B") femaleicon.style.display = "none";
        else maleicon.style.display = "none";

        let imgElement = document.querySelector("#page1 img");
        imgElement.src = row.profile_image;
      } else {
        console.log(`No user found with the username ${userid}`);
      }
    });

    GetFriends(userid);
    Online(userid);
    let tbody = document.querySelector("#page3 tbody");
    let sql3 = `SELECT * FROM Friends`;
  });

  //chat流大汇总
  writechatStream.on("data", (data) => {
    let msg = data.msg;
    if (msg === "FriendADD:OK") {
      NewPromptBox("好友请求成功");
      let page3Refresh = document.querySelector("#FriendsRefresh");
      page3Refresh.click();
    } else if (msg === "Friend:New") {
      NewPromptBox("新好友!");
      let page3Refresh = document.querySelector("#FriendsRefresh");
      page3Refresh.click();
    } else {
      console.log("yse", msg);
    }
  });
});

// page1 功能
// 编辑按钮
let page1PageTextEditIcon = document.querySelector(
  "#page1 .EDIT #Page1TextEdit"
);
let page1PageImgEditIcon = document.querySelector("#page1 .EDIT #Page1ImgEdit");
let overlay = document.querySelector(".overlay");
let Page1PopTextEdit = document.querySelector("#Page1PopTextEdit");
let Page1PopImgEdit = document.querySelector("#Page1PopImgEdit");

page1PageTextEditIcon.addEventListener("click", () => {
  overlay.style.display = "block";
  Page1PopTextEdit.style.display = "block";
});

page1PageImgEditIcon.addEventListener("click", () => {
  overlay.style.display = "block";
  Page1PopImgEdit.style.display = "block";
});

// 关闭按钮
let Page1PopTextEditClose = document.querySelector(
  "#Page1PopTextEdit .Popclosebtn"
);
Page1PopTextEditClose.addEventListener("click", () => {
  overlay.style.display = "none";
  Page1PopTextEdit.style.display = "none";
});

let Page1PopImgEditClose = document.querySelector(
  "#Page1PopImgEdit .Popclosebtn"
);
Page1PopImgEditClose.addEventListener("click", () => {
  overlay.style.display = "none";
  Page1PopImgEdit.style.display = "none";
});

// 提交按钮
let fieldToEnglish = {
  昵称: "nickname",
  生日: "birthday",
  邮箱: "email",
  电话: "phone",
  签名: "signature",
  性别: "gender",
};
let Page1PopTextField = document.querySelector("#Page1PopTextField");
let Page1PopTextValue = document.querySelector("#Page1PopTextValue");
let Page1PopTextSubmit = document.querySelector("#Page1PopTextSubmit");
Page1PopTextSubmit.addEventListener("click", () => {
  let field = Page1PopTextField.value;
  let value = Page1PopTextValue.value;

  if (field in fieldToEnglish) {
    field = fieldToEnglish[field];
  } else {
    console.log("未知的字段名: " + field);
    return;
  }

  console.log(field);
  console.log(value);
  UpdateUserInfo(userid, field, value);
  overlay.style.display = "none";
  Page1PopTextEdit.style.display = "none";
});

let Page1ImgSubmit = document.querySelector("#Page1PopImgSubmit");
let Page1ImgValue = document.querySelector("#Page1PopImgValue");
Page1ImgSubmit.addEventListener("click", () => {
  let file = Page1ImgValue.files[0];
  let reader = new FileReader();
  reader.onload = function (event) {
    let img = new Image();
    img.onload = function () {
      let canvas = document.createElement("canvas");
      let ctx = canvas.getContext("2d");
      let SIZE = 1024;
      let width = img.width;
      let height = img.height;
      let startX = 0;
      let startY = 0;
      let cropWidth = width;
      let cropHeight = height;

      // 如果图片的宽度大于 SIZE，那么计算截取的起始位置和宽度
      if (width > SIZE) {
        startX = (width - SIZE) / 2;
        cropWidth = SIZE;
      }

      // 如果图片的高度大于 SIZE，那么计算截取的起始位置和高度
      if (height > SIZE) {
        startY = (height - SIZE) / 2;
        cropHeight = SIZE;
      }

      canvas.width = cropWidth;
      canvas.height = cropHeight;
      ctx.drawImage(
        img,
        startX,
        startY,
        cropWidth,
        cropHeight,
        0,
        0,
        cropWidth,
        cropHeight
      );

      let dataUrl = canvas.toDataURL("image/jpg");
      let imgElement = document.querySelector("#page1 img");
      imgElement.src = dataUrl;

      //更新数据库profile_image

      let sql = `UPDATE User SET profile_image = ? WHERE UserId = ?`;
      db.run(sql, [dataUrl, userid], function (err) {
        if (err) {
          return console.error(err.message);
        }
        console.log(`Row(s) updated: ${this.changes}`);
      });
      UpdateUserHead(userid, dataUrl);
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);

  overlay.style.display = "none";
  Page1PopImgEdit.style.display = "none";
});

// page2 功能

// page3 功能
// 添加好友按钮
let page3PopAddFriend = document.querySelector("#FriendsAddPop");
let page3AddFriend = document.querySelector("#FriendsAdd");
page3AddFriend.addEventListener("click", () => {
  overlay.style.display = "block";
  page3PopAddFriend.style.display = "block";
});

let Page3PopAddFriendClose = document.querySelector(
  "#FriendsAddPop .Popclosebtn"
);
Page3PopAddFriendClose.addEventListener("click", () => {
  overlay.style.display = "none";
  page3PopAddFriend.style.display = "none";
});

let Page3PopAddFriendSubmit = document.querySelector("#FriendsAddPopSubmit");
Page3PopAddFriendSubmit.addEventListener("click", () => {
  let friendName = document.querySelector("#FriendsAddPop input").value;
  AddFriendReq(userid, friendName);
  console.log(friendName);
  overlay.style.display = "none";
  page3PopAddFriend.style.display = "none";
});

// 刷新好友列表
let page3Refresh = document.querySelector("#FriendsRefresh");
page3Refresh.addEventListener("click", () => {
  let tbody = document.querySelector("#page3 tbody");
  tbody.innerHTML = "";
  GetFriends(userid);
});

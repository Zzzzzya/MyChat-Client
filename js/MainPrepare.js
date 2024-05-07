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

let nickname = document.querySelector(".Name .text");
let signature = document.querySelector(".signature");
let email = document.querySelector("#userEmail");
let phone = document.querySelector("#userPhone");
let birthday = document.querySelector("#userBirth");

//查询数据库--获取个人信息
let sql1 = `SELECT * FROM CurUser LIMIT 1`;
let username = "";
db.get(sql1, (err, row) => {
  if (err) {
    console.error(err.message);
    return;
  }
  // 处理查询结果
  username = row.username;
  console.log(username);
  console.log("获取到的username是：" + username);
  console.log("here");

  let sql2 = `SELECT * FROM User WHERE Username = '${username}'`;
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
      console.log(`No user found with the username ${username}`);
    }
  });
});

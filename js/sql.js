//管理一切数据库连接
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

//创建初始数据表
/* 1. 创建用户信息表 */
/* 表结构
 * 用户名 (主键) char(32)
 * 密码 char(32)
 * 昵称 char(32)
 * 性别 char(1)
 * 签名 char(128)
 * 邮箱 char(64)
 * 电话 char(11)
 * 生日 date
 */
db.run(
  `
    CREATE TABLE IF NOT EXISTS User (
        UserId INT PRIMARY KEY NOT NULL,
        Username CHAR(32),
        Password CHAR(32) NOT NULL,
        Nickname CHAR(32) NOT NULL,
        Gender CHAR(1),
        Signature CHAR(128),
        Email CHAR(64) NOT NULL,
        Phone CHAR(11),
        Birthday DATE,
        profile_image TEXT
    );
    `,
  (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log("User table created.");
  }
);

db.run(
  `
  CREATE TABLE IF NOT EXISTS CurUser (
    userid INT PRIMARY KEY NOT NULL
 );
  DELETE FROM CurUser;
  `,
  (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log("CurUser table created.");
  }
);

db.run(
  `
  CREATE TABLE IF NOT EXISTS MsgIP (
      msg_ip CHAR(32) PRIMARY KEY NOT NULL
 );
  `,
  (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log("MsgIP table created.");
  }
);

db.run(
  `
  CREATE TABLE IF NOT EXISTS Friends (
    relatedId INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      friendId INT NOT NULL,
      friendName CHAR(32) NOT NULL DEFAULT 'friend',
      profile_image TEXT,
      lastContactTime DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
 );
  `,
  (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log("Friends table created.");
    db.run(
      `
      DELETE FROM Friends;
      `,
      (err) => {
        if (err) {
          console.error(err.message);
        }
        console.log("Friends table CLEAR.");
      }
    );
  }
);

db.run(
  `CREATE TABLE IF NOT EXISTS Messages (
  messageId INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  sender CHAR(32) NOT NULL,
  receiver CHAR(32) NOT NULL,
  messageContent TEXT NOT NULL,
  messageTime DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);`,
  (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log("Messages table Droped.");
    db.run(
      `
    DELETE FROM Messages;
    `,
      (err) => {
        if (err) {
          console.error(err.message);
        }
        console.log("Messages table created.");
      }
    );
  }
);

//关闭数据库
db.close((err) => {
  if (err) {
    console.error(err.message);
  }
  console.log("Close the database connection.");
});

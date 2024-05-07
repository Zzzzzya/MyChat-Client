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
        Username CHAR(32) PRIMARY KEY NOT NULL,
        Password CHAR(32) NOT NULL,
        Nickname CHAR(32) NOT NULL,
        Gender CHAR(1),
        Signature CHAR(128),
        Email CHAR(64) NOT NULL,
        Phone CHAR(11),
        Birthday DATE
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
    username CHAR(32) PRIMARY KEY NOT NULL
 );
  `,
  (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log("User table created.");
  }
);

//关闭数据库
db.close((err) => {
  if (err) {
    console.error(err.message);
  }
  console.log("Close the database connection.");
});
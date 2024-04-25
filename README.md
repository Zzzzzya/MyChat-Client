# MyChat-Client
MyChat-Client by electron

仍在开发中~

对应的后端代码详见 [MyChat](https://github.com/Zzzzzya/MyChat)

# 前置环境配置

- Node.js + npm

## Electon环境创建
 ```
 npm install
 npm install electron --save-dev
 npm install grpc
 ```
 ```
 运行：
 npm start
 ```

 # 进展记录
 ## Day1 2024.4.24
 >配置好grpc，制作完成登录界面，成功与LoginServer交互

[Day1 - video](src/videos/Day1.mp4)

## Day2 2024.4.25
>修改了登录界面的样式，增加了注册页面。

![Day2 - image - 1](src/images/process/Day2-1-Login.png)
![Day2 - image - 2](src/images/process/Day2-2-Register.png)

- Bug && 解决记录
   
   点击“去注册” & “去登录” 按钮时，container进行左右的transform平移。
   而这会导致内容文本框的交互属性停留在原地

- 解决方案
  
  transformer时给container的宽度进行加减1，这样可以触发强制重绘


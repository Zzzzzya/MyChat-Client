let PromptBox = document.querySelector(".PromptBox");

export function NewPromptBox(message) {
  var div = document.createElement("div"); //创建一个div节点
  div.innerHTML = message; //加内容信息
  div.classList.add("prompt"); //加样式
  PromptBox.insertBefore(div, PromptBox.children[0]); //放进最上面的盒子里
  //放进里面1毫秒后 发生改变才会过度
  setTimeout(() => {
    div.classList.add("shown");
  }, 5);
  //过3秒后删除 发生改变
  setTimeout(() => {
    div.classList.remove("shown");
  }, 3000);
  //过3.5秒后删除弹窗
  setTimeout(() => {
    div.remove();
  }, 3500);
}

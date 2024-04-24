const ipcRenderer = require('electron').ipcRenderer;
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const packageDefinition = protoLoader.loadSync('./protos/MC.Login.proto',{
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);

const LoginService = protoDescriptor.MC.Login.MCLogin;

export const LoginClient = new LoginService('192.168.146.131:50051',grpc.credentials.createInsecure())

// Login服务调用
export function TryLogin(username,password,online_status,client_version){
    LoginClient.Login({username: username, 
        password: password,
        online_status:online_status,
        client_version:client_version},
        (err,response)=>{
            if(err){
                alert("An error occurred while trying to login")
                console.error(err)
                return
            }

            let status = response.code;
            if(status !== "OK"){
                alert(typeof response.error_message)
                return
            }
            
            alert("登录成功！");

            //切换页面信号
            ipcRenderer.send('LoginSuccess',response);
    })
}


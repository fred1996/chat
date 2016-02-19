var app=require("express")();
var client=require("mongodb").MongoClient;
var http=require("http").Server(app);
var io=require("socket.io")(http);
var path = require('path');
var serveStatic = require('serve-static')
app.use(serveStatic(__dirname + '/public'))
app.get("/", function (req,res) {
    res.sendfile(__dirname+"/chat/index.html");
});
//在线用户
var onlineUser={};
//在线人数
var onlineCount=0;
client.connect("mongodb://localhost:27017/chat",function(err,db){
    if(err)throw err;
    var col=db.collection("messages");
    io.on('connection',function(socket){
        console.log('a use connected');

        //监听新用户加入
        socket.on('login',function(obj){
            ///将新用户的唯一标识当作socket的名称，后面退出的时候会用到
            socket.name=obj.userid;
            //检查在线列表，如果不在里面就加入
            if(!onlineUser.hasOwnProperty(obj.userid)){
                onlineUser[obj.userid]=obj.username;
                onlineCount++;
            }
            //向所有客户端广播用户加入
            io.emit('login',{onlineUser:onlineUser,onlineCount:onlineCount,user:obj});
            console.log(obj.username+"加入了聊天室 ");
        });
        //监听用户退出
        socket.on("disconnect",function(){
            //将退出的用户从在线列表中删除
            if(onlineUser.hasOwnProperty(socket.name)){
                //退出用户的信息
                var obj={userid:socket.name,username:onlineUser[socket.name]};
                //删除
                delete onlineUser[socket.name];
                //在线人数-1
                onlineCount--;
                //向所有客户端广播发布的消息
                io.emit('logout',{onlineUser:onlineUser,onlineCount:onlineCount,user:obj});
            }
        });

        socket.on("message", function (obj) {
            //向所有客户端广播发布消息
            col.insertOne({"name":obj.username,"content":obj.content});
            io.emit("message",obj);
            console.log(obj.username+"说："+obj.content);
        });

    });
});

http.listen(3000,function(){
    console.log("服务启动成功！端口：3000");
});
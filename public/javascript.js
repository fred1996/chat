/**
 * Created by Administrator on 2016/2/16.
 */
(function(){
    var d=document,
        w=window,
        p=parseInt,
        dd= d.documentElement,
        db= d.body,
        dc= d.compatMode=="CSS1Compat",
        dx=dc?dd:db,
        ec=encodeURIComponent;
    w.chat={
        msgObj: d.getElementById("message"),
        screenheight: w.innerHeight? w.innerHeight:dx.clientHeight,
        username:null,
        userid:null,
        socket:null,
        scrollToBottom:function(){
            w.scrollTo(0,this.msgObj.clientHeight);
        },
        //退出，本例只是一个简单的刷新
        loginout:function(){
            location.reload();
        },
        //提交聊天消息内容
        submit:function(){
            var content= d.getElementById('content').value;
            if(content!=''){
                var obj={
                  userid:this.userid,
                  username:this.username,
                  content:content
                };
                this.socket.emit("message",obj);
                d.getElementById("content").value='';
            }
            return false;
        },
        genUID:function(){
            return new Date().getTime()+""+Math.floor(Math.random()*899+100);
        },
        //更新系统消息，本例中在用户加入，退出的时候调用
        updateSysmsg:function(o,action){
            //当前在线用户列表
            var onlineUser= o.onlineUser;
            //当前在线人数
            var onlineCount= o.onlineCount;
            //新加入用户的信息
            var user= o.user;
            //更新在线人数
            var userhtml='';
            var separator='';
            for(key in  onlineUser){
                if(onlineUser.hasOwnProperty(key)){
                    userhtml+=separator+onlineUser[key];
                    separator="、";
                }
            }
            d.getElementById("onlinecount").innerHTML="当前共有"+onlineCount+" 人在线，在线列表："+userhtml;
            //添加系统消息
            var html="";
            html+='';
            html+=user.username;
            html+=(action=='login')?'加入了聊天室':'退出了聊天室';
            html+='';
            var section= d.createElement('section');
            section.className='system J-mjrlinkWrap J-cutMsg';
            section.innerHTML=html;
            this.msgObj.appendChild(section);
            this.scrollToBottom();
        },
        //第一个界面用户提交用户名
        usernameSubmit:function(){
            var username= d.getElementById("username").value;
            if(username!=''){
                d.getElementById("username").value='';
                d.getElementById("loginbox").style.display="none";
                d.getElementById("chatbox").style.display="block";
                this.init(username);
            }
            return false;
        },
        init:function(username){
            this.userid=this.genUID();
            this.username=username;
            d.getElementById("showusername").innerHTML=this.username;
            this.msgObj.style.minHeight=(this.screenheight-db.clientHeight+this.msgObj.clientHeight)+"px";
            this.scrollToBottom();
            //连接websocket后端服务器
            this.socket=io.connect("http://localhost:3000");
            //告诉服务器端有用户登录
            this.socket.emit("login",{userid:this.userid,username:this.username});
            //监听新用户登录
            this.socket.on("login",function(o){
                chat.updateSysmsg(o,'login');
            });
            this.socket.on("logout", function (o) {
                chat.updateSysmsg(o,'logout');
            });
            //监听消息发送
            this.socket.on("message",function(obj){
                var isme=(obj.userid==chat.userid)?true:false;
                var contentDiv='<div>'+obj.content+'</div>';
                var usernameDiv='<span>'+obj.username+'</span>';
                var section= d.createElement("section");
                if(isme){
                    section.className="user";
                    section.innerHTML=contentDiv+usernameDiv;
                }else{
                    section.className="service7";
                    section.innerHTML=usernameDiv+contentDiv;
                }
                chat.msgObj.appendChild(section);
                chat.scrollToBottom();
            });
        }
    };
    //通过过车提交用户名
    d.getElementById("username").onkeydown=function(e){
        e=e||event;
        if(e.keyCode===13){
            chat.usernameSubmit();
        }
    };
    //通过回车提交信息
    d.getElementById("content").onkeydown=function(e){
        e=e||event;
        if(e.keyCode===13){
            chat.submit();
        }
    }
})();
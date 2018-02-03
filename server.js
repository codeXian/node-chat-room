var express = require('express');

var app = express();

var http = require('http').Server(app);
var io = require('socket.io')(http);

var users = [];       // 存储登录用户
var usersInfo = [];   // 存储用户姓名和头像

// 路由为/默认为www静态文件夹
app.use('/', express.static(__dirname + '/www'))

io.on('connection', function (socket) { 
  // 渲染在线人数
  io.emit('disUser', usersInfo) // 会触发所有客户端用户的foo事件

  // 登录, 检测用户名
  socket.on('login', (user) => {
    if (users.indexOf(user.name) > -1) {
      socket.emit('loginError')
    } else {
      users.push(user.name);
      usersInfo.push(user);
      socket.emit('loginSuc'); // 只触发当前客户端用户的foo事件
      socket.nickname = user.name;
      io.emit('system', {
        name: user.name,
        status: '进入'
      })
      io.emit('disUser', usersInfo);
      console.log(users.length + ' user connect.');
    }
  })
  // 发送消息事件
  socket.on('sendMsg', (data) => {
    var img = '';
    for (var i = 0; i < usersInfo.length; i++) {
      if (usersInfo[i].name === socket.nickname) {
        img = usersInfo[i].img
      }
    }
    socket.broadcast.emit('receiveMsg', {
      name: socket.nickname,
      img: img,
      msg: data.msg,
      color: data.color,
      side: 'left'
    });
    socket.emit('receiveMsg', {
      name: socket.nickname,
      img: img,
      msg: data.msg,
      color: data.color,
      side: 'right'
    })
  })
  // 离开聊天室
  socket.on('disconnect', () => {
    var index = users.indexOf(socket.nickname);
    if (index > -1) {
      users.splice(index, 1)
      usersInfo.splice(index, 1)

      io.emit('system', {
        name: socket.nickname,
        status: '离开'
      })

      io.emit('disUser', usersInfo);
      console.log('a user left.');
    }
  })
})

app.get('/', function (req, res) {
  res.send('<h1>Hello World</h1>');
})

http.listen(3000, function () {
  console.log('listen on *:3000');
})
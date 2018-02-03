$(function () {
  var socket = io();
  var color = '#000000'; 
  $('#clear').click(() => {
    $('#messages').text('');
    socket.emit('disconnect');
  })

  $('#nameBtn').click(() => {
    var imgN = Math.floor(Math.random() * 4) + 1;
    console.log('image/user' + imgN + '.jpg');
    if ($('#name').val().trim() !== '') {
      socket.emit('login', {
        name: $('#name').val(),
        img: 'image/user' + imgN + '.jpg'
      })
    }
  })
  
  var lihtml = '';
  for (var i = 1; i < 142; i++) {
    lihtml += `<li><img src='image/emoji/emoji (${i}).png'/></li>`
  }
  $('.emoji').html(lihtml);

  function displayUser(users) {
    $('#users').text('');
    if (!users.length) {
      $('.contacts p').show();
    } else {
      $('.contacts p').hide();
    }
    $('#num').text(users.length);
    for (var i = 0; i <users.length; i++) {
      var $html = `<li>
        <img src="${users[i].img}">
        <span>${users[i].name}</span>
      </li>`;
      $('#users').append($html);
    }
  }

  // 点击按钮或回车键发送消息
  $('#sub').click(sendMsg);
  $('#m').keyup((ev) => {
    if (ev.whick === 13) {
      sendMsg()
    }
  })
  function sendMsg() {
    if ($('#m').val() === '') {
      alert('请输入内容')
      return false;
    }

    socket.emit('sendMsg', {
      msg: $('#m').val()
    });
    $('#m').val('');
    return false;
  }

  $('#smile').click(() => {
    $('.selectBox').css('display', 'block')
  })
  
  $('#smile').dblclick((ev) => {
    $('.selectBox').css('display', 'none')
  })

  $('#m').click(() => {
    $('.selectBox').css('display', 'none')
  })

  $('.emoji li img').click((ev) => {
    ev = ev || window.event;
    var src = ev.target.src;
    var emoji = src.replace(/\D*/g, '').substr(6, 8);
    var old = $('#m').val();
    $('#m').val(old + '[emoji' + emoji + ']');
    $('.selectBox').css('display', 'none')
  })

  $('#file').change(function () {
    var file = this.files[0];
    var reader = new FileReader();

    reader.onerror = function () {
      console.log('读取文件失败, 请重试!');
    }

    reader.onload = function () {
      var src = reader.result;
      var img = '<img class="sendImg" src="'+src+'">';
      socket.emit('sendMsg', {
        msg: img,
        color: color,
        type: 'img'
      })
    }
    reader.readAsDataURL(file);
  })

  // 登录成功, 隐藏登录层
  socket.on('loginSuc', () => {
    $('.name').hide()
  })

  socket.on('loginError', () => {
    alert('用户名已存在, 请重新输入!');
    $('#name').val('');
  })

  socket.on('system', (user) => {
    var data = new Date().toTimeString().substring(0,8);
    $('#messages').append(`<p class='system'><span>${data}</span><br /><span>${user.name}  ${user.status}了聊天室<span></p>`)
    $('#messages').scrollTop($('#messages')[0].scrollHeight)
  })

  socket.on('disUser', (usersInfo) => {
    displayUser(usersInfo);
  })

  socket.on('receiveMsg', (obj)=> { 
    // 发送为图片
    if(obj.type == 'img') {
      $('#messages').append(`
        <li class='${obj.side}'>
          <img src="${obj.img}">
          <div>
            <span>${obj.name}</span>
            <p style="padding: 0;">${obj.msg}</p>
          </div>
        </li>
      `); 
      $('#messages').scrollTop($('#messages')[0].scrollHeight);
      return;
    }

    // 提取文字中的表情加以渲染
    var msg = obj.msg;
    var content = '';
    while(msg.indexOf('[') > -1) {  // 其实更建议用正则将[]中的内容提取出来
      var start = msg.indexOf('[');
      var end = msg.indexOf(']');

      content += '<span>'+msg.substr(0, start)+'</span>';
      content += '<img src="image/emoji/emoji%20('+msg.substr(start+6, end-start-6)+').png">';
      msg = msg.substr(end+1, msg.length);
    }
    content += '<span>'+msg+'</span>';
    
    $('#messages').append(`
      <li class='${obj.side}'>
        <img src="${obj.img}">
        <div>
          <span>${obj.name}</span>
          <p style="color: ${obj.color};">${content}</p>
        </div>
      </li>
    `);
    // 滚动条总是在最底部
    $('#messages').scrollTop($('#messages')[0].scrollHeight);
  }); 
})
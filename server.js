'use strict';

const express = require('express');
const socketIO = require('socket.io');
const OneSignal = require('onesignal-node');

const PORT = process.env.PORT || 3000;
const INDEX = '/index.html';

const server = express()
  .use((req, res) => res.sendFile(INDEX, { root: __dirname }))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

const io = socketIO(server);
const client = new OneSignal.Client('d3649ef9-6aee-4293-bd73-789919953f73','NThiN2VhYTgtOWMzMy00OGU5LWFhM2UtM2RiNDllMjU3OWUz');

io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on("sendMessageToServer", function (id,data) {

      var author = JSON.parse(id);
      var Message = JSON.parse(data);

      let notification = {
      contents: {
        'en': `${Message}`,
      },
      included_segments: ['Subscribed Users'],
      channel_for_external_user_ids: "push",
      filters: [
          {"field": "tag","key": "ID","relation": "=","value": `${author}`}
        ]
    };

      console.log(notification);
      client.createNotification(notification)
    console.log("送信しました。")

    });

  socket.on("sendAllusers", function (data) {

      var Message = JSON.parse(data);

      let notification = {
      contents: {
        'en': '新しい通話が開始されました。/bn' + '[' + `${Message}` + ']',
      },
      included_segments: ['Subscribed Users'],
      channel_for_external_user_ids: "push"
    };

      console.log(notification);
      client.createNotification(notification)
    console.log("送信しました。")

    });

  socket.on("disconnect", function () {
      console.log('接続が切れました。');
    });

});



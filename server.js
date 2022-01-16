'use strict';

const express = require('express');
const socketIO = require('socket.io');
const OneSignal = require('onesignal-node');
//メモリリーク調査用
//const memwatch = require('@airbnb/node-memwatch');

const PORT = process.env.PORT || 3000;
const INDEX = '/index.html';

const server = express()
  .use((req, res) => res.sendFile(INDEX, { root: __dirname }))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

const io = socketIO(server);
const client = new OneSignal.Client('d3649ef9-6aee-4293-bd73-789919953f73','NThiN2VhYTgtOWMzMy00OGU5LWFhM2UtM2RiNDllMjU3OWUz');

//var PeerID = [];

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
      //include_external_user_ids: [`${data}`],
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


  socket.on('Token', function(id,token){
　　
    var id = JSON.parse(id);
    var token = JSON.parse(token);

    try {
      (async () =>{
      const response = await client.addDevice({
        tags:{"ID":`${id}`},
        device_type: '0',
        identifier: `${token}`,
      });
      console.log(response.body);
      })()
    } catch (e) {
      if (e instanceof OneSignal.HTTPError) {
        // When status code of HTTP response is not 2xx, HTTPError is thrown.
        console.log(e.statusCode);
        console.log(e.body);
      }
    }

    console.log("データを受け取りました");
    console.log(id);
    console.log(token);
  });

  socket.on("Terminate", function (peer,token) {

    var token = JSON.parse(token);

    try {
      (async () =>{
      const response = await client.addDevice({
        tags:{"PeerID":`${peer}`},
        device_type: '0',
        test_type: '1',
        identifier: `${token}`,
      });
      console.log(response.body);
      })()
    } catch (e) {
      if (e instanceof OneSignal.HTTPError) {
        // When status code of HTTP response is not 2xx, HTTPError is thrown.
        console.log(e.statusCode);
        console.log(e.body);
      }
    }

    console.log("デバイスがオフラインであることを検知しました");
    console.log(peer);
    console.log(token);
  });

  socket.on("disconnect", function () {
      console.log('接続が切れました。');
    });

});



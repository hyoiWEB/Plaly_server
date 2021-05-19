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

  //const memwatch = require('memwatch-next');
  // メモリ使用状況の最初のスナップショットを取得
  //const hd = new memwatch.HeapDiff();

  //global.gc();

  // 2.メモリ使用状況を出力
    //const heapUsed = process.memoryUsage().heapUsed;
    //console.log(heapUsed + " バイト使用中")

  // process.on('SIGINT', function() {
  //   const diff = hd.end();
  //   // diff情報をコンソール出力:
  //   console.log("memwatch diff:", JSON.stringify(diff, null, 2));
  //   // diff情報をファイルにダンプするのも良いかも:
  //   // const fs = require("fs");
  //   // fs.writeFileSync("./memdiffdump.json", JSON.stringify(diff, null, 2));
  //   process.exit();
  // });

   //定期的にメモリ使用量を吐き出す
   // const used = process.memoryUsage()
   // const messages = []
   // for (let key in used) {
   //   messages.push(`${key}: ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`)
   // }
   // console.log(new Date(), messages.join(', '))



  socket.on("sendMessageToServer", function (data) {

      var frontPeer = JSON.parse(data);

      let notification = {
      contents: {
        'ja': '新しい着信',
        'en': 'New call',
      },
      included_segments: ['Subscribed Users'],
      channel_for_external_user_ids: "push",
      //include_external_user_ids: [`${data}`],
      filters: [
          {"field": "tag","key": "PeerID","relation": "=","value": `${frontPeer}`}
        ]
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

  socket.on('androidToken', function(peer,token){
　　
    var jsonPeer = JSON.parse(peer);
    var jsonToken = JSON.parse(token);

    var peer = jsonPeer.peerID
    var token = jsonToken.deviceToken

     try {
       (async () =>{
       const response = await client.addDevice({
         tags:{"PeerID":`${peer}`},
         device_type: '1',
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

    console.log("データを受け取りました");
    console.log(peer);
    console.log(token);
  });

  socket.on("disconnect", function () {
      console.log('接続が切れました。');
    });

});



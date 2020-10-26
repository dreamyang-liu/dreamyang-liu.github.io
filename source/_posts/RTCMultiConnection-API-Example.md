---
title: RTCMultiConnection API & Example
date: 2019-10-18 17:27:29
tags:
    - WebRTC
    - RTCMultiConnection
---


# RTCMultiConnection
RTCMultiConnection 是一个对WebRTC进行高级封装后的js库。其内置了房间服务器，信令服务器。因此在构建多对多的PeerConnection 时较为方面，另外也引入了Peer中继机制来降低带宽损耗（该方法存在一定问题，会在本文最后描述）。So，show you the code.

## 创建连接
```js
var connection = new RTCMultiConnection();
var userid = "123"
if(userid != null){
    connection.userid = userid;
}
//这里可以对userid进行设置，其他的属性也可以以类似的方式进行赋值

connection.autoCloseEntireSession = false;
// autoCloseEntireSession 属性设为ture时，开启房间Peer在退出房间后会关闭整个房间，一般不建议设置为true，除非会议主持者确定会最后退出。

// 信令服务器地址
connection.socketURL = signalingServerAddress;
// 设置穿透服务器和TURN服务器地址
connection.iceServers = [];
connection.iceServers.push({
    urls: 'stun:' + relayServerAddress
});
connection.iceServers.push({
    urls: 'turn:' + relayServerAddress,
    credential: turnCredential,
    username: turnUsername
});
```

## PS：这里是一个低版本兼容，FireFox， 关于屏幕视频流获取方式存在几种方式
1. Firefox66 或 Chrome70以上 支持API getDisplayMedia()
2. Firefox33-66 可以通过getUserMedia()添加特殊的videoConstraint 进行获取
3. 低版本Chrome 通过插件进行获取，调用插件进行屏幕视频流获取‘
```js
// 用于兼容低版本Firefox视频共享
function getScreenStream(callback) {
    if (navigator.getDisplayMedia) {
        navigator.getDisplayMedia({
            video: true
        }).then(screenStream => {
            callback(screenStream);
        });
    } else if (navigator.mediaDevices.getDisplayMedia) {
        navigator.mediaDevices.getDisplayMedia({
            video: true
        }).then(screenStream => {
            callback(screenStream);
        });
    } else {
        getScreenId(function(error, sourceId, screen_constraints) {
            navigator.mediaDevices.getUserMedia(screen_constraints).then(function(screenStream) {
                callback(screenStream);
            });
        });
    }
}
```

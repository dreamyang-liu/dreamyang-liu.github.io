---
title: WebRTC Signaling Server Deployment
date: 2019-10-18 13:17:38
tags:
    - WebRTC
    - Signaling Server
---

# Signaling Server Deployment
信令服务器作为Peer连接的信号交互服务终端，需要保证所有的Peer都能与其建立稳定的连接。因此一般部署在公网或局域网的顶层。
### Https 设置
由于WebRTC API getUserMedia()需要在建立安全连接时才能被调用，因此需要使用Https服务来承载服务页面。这里需要注意的是如果浏览器设置中允许混合内容时其实不需要设置信令的Https服务，但为了安全起见建议设置Https信令服务。其步骤可以概括为以下两部分。
#### 生成证书
```bash
openssl genrsa -des3 -out server.key 2048
openssl rsa -in server.key -out server.key
openssl req -new -x509 -key server.key -out ca.crt -days 36500
openssl req -new -key server.key -out server.csr
openssl x509 -req -days 36500 -in server.csr -CA ca.crt -CAkey server.key -CAcreateserial -out server.crt
```
#### 修改信令服务器配置文件
```bash
cd node_modules/rtcmulticonnection-server
vim config.json
```
编辑以下文件，其中isUserHTTPs 设置为true代表启动Https服务。sslKey和sslCert代表生成的证书和密钥的路径。
```json
{
  "socketURL": "/",
  "dirPath": "",
  "homePage": "/demos/index.html",
  "socketMessageEvent": "RTCMultiConnection-Message",
  "socketCustomEvent": "RTCMultiConnection-Custom-Message",
  "port": "9001",
  "enableLogs": "false",
  "autoRebootServerOnFailure": "false",
  "isUseHTTPs": "true",
  "sslKey": "./fake-keys/server.key",
  "sslCert": "./fake-keys/server.crt",
  "sslCabundle": "",
  "enableAdmin": "false",
  "adminUserName": "username",
  "adminPassword": "password"
}
```
### 启动Signaling Server
```bash
cd node_modules/rtcmulticonnection-server
node server.js
```

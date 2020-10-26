---
title: WebRTC TURN Server Deployment
date: 2019-10-18 11:16:08
tags: 
    - WebRTC
    - Turnserver
---

# Turn Server 配置

```bash
yum install -y make gcc cc gcc-c++ wget
yum install -y openssl-devel libevent libevent-devel mysql-devel mysql-server
wget https://github.com/downloads/libevent/libevent/libevent-2.0.21-stable.tar.gz
tar xvfz libevent-2.0.21-stable.tar.gz
cd libevent-2.0.21-stable && ./configure
make && make install
wget httn-sys.org/downloads/v3.2.3.8/turnserver-3.2.3.8.tar.gz
tar -xvzf turnserver-3.2.3.8.tar.gz
cd turnserver-3.2.3.8 && ./configure
make && make install
sudo vim /usr/local/etc/turnserver/turnserver.conf
turnserver -v -r  47.103.90.218:3478 -a -b turnuserdb.conf -c turnserver.conf -u lmy -r 47.103.90.218:3478 -p lmy
```
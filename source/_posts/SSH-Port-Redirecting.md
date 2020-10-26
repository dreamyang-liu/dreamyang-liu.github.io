---
title: SSH Port Redirecting
date: 2019-10-18 11:23:49
tags: 
    - SSH
    - VS Code
---
# SSH Port Redirecting LAN Penetrating
内网穿透一般用于ssh连接到一台内网服务器，使用反向端口转发可以避免在内网服务器IP变更时需要重新设置的问题。由于需要一个公网IP来对其唯一标识，故需要额外的一台公网服务器。公网服务器需要对sshd服务进行设置。

```bash
cd /etc/ssh/
vim sshd_config
```
将以下内容添加到配置文件中
```bash
GatewayPorts yes
```
并重启sshd服务
```bash
service sshd restart
```
在内网服务器中，需要启动autossh来保证穿透隧道连接的稳定性，并将其ssh公钥添加到公网服务器中
```bash
ssh-copy-id root@47.XXX.90.218
apt-get install autossh
autossh -M 20002 -NfR 0.0.0.0:20001:localhost:22 root@47.XXX.90.218
```
端口需要为空闲端口，不能被占用。现在即可使用公网服务器来进行ssh连接。
在VS Code中，其配置如下：
```text
Host VPN
    HostName 47.XXX.90.218
    User root
    Port 22001
```
---
title: SSH secret key login
date: 2019-10-18 11:25:18
tags: 
    - SSH
    - VS Code
---
## SSH免密登陆
### 生成ssh密钥
```bash
ssh-keygen -t rsa -f local_rsa
-t 指定密钥类型，默认是 rsa ，可以省略。
-C 设置注释文字，比如邮箱，可以省略。
-f 指定密钥文件存储文件名，可以省略。默认id_rsa
```
一路回车会发现在~/.ssh目录下生成了local_rsa.pub和local_rsa。

### Linux环境下向远程服务器添加本机公钥
```zsh
ssh-copy-id remoteUser@remoteIp
```
输入对应密码即可直接登陆

### Windows环境下/无ssh-copy-id 向远程服务器添加本机公钥
```bash
scp path/to/local_rsa.pub remoteUser@remoteIp:~/.ssh
```
再通过ssh连接到远程服务器，进入~/.ssh目录
```bash
cat local_rsa.pub > authorized_keys
```
之后便可直接进行登陆
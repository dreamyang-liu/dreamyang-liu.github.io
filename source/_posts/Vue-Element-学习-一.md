---
title: Vue Element 学习(一)
date: 2019-10-22 13:08:44
tags:
    - Vue
    - 前端
    - Vue Element
---

# Vue Element
好了，为了一个全栈项目，我得学前端了。~~其实是大佬看不起我不帮我干活，嘤嘤嘤~~

## 好了，快乐的Vue前端开课啦

## Vue 的安装
这里推荐是Vue-cli3，似乎好用点，当然对我这种菜鸡来说还是被胖揍。~~不打脸行不~~～T_T～
```bash
npm install -g @vue/cli
```
没错，你没有看错，一行命令即可带回Vue全家桶，走过路过千万不要错过.......
## Vue项目的创建
所以然后嘞，我们开始快乐的构建一个vue项目，由于vue-cli3的便利性，可以直接使用vue命令进行新建

```bash
vue start site
```
一行命令，也很简单，但是需要我们接下来引入一些组件库，比如这里使用的是elementUI。
```bash
cd site
vue add element
```
会提示你是全部引入还是咋地，建议直接全部引入得了。
下一步，构建路由，这里还是使用vue命令

```bash
vue add router
```
这里会新建一个router文件夹，里面的index.js文件就是我们配置路由的地方。具体下次再继续分享喽 ( T_T ) 托福选手要去学习了
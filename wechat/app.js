/*
* koa 搭建nodejs服务  类似于express
* wechat 配值 access_token 信息和 验证微信服务端接口配置信息
* wechat_file 工具js 保存access_token 信息和 expires_in 过期时间
**/ 
var Koa = require('koa');
var wechat = require('./wechat/g.js');
var config = require('./config.js');
var weixin = require('./weixin.js')
/*
* app: 创建服务器函数 Koa
**/ 
var app = new Koa();

/* 挂载中间件 微信接口验证 and 异步获取，保存access_token 中间件函数*/
app.use(wechat(config.wechat,weixin.reply));

/* 监听端口号 */
app.listen(80,function (){
	console.log('Server success http://192.168.16.107');
});
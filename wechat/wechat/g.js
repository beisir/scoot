/*
* sha1 加密配置信息 模块（验证微信接信息会用）
* Promise ：异步对象封装的promise模块
* request : 用来请求数据模块 类似于 axios
**/ 
var sha1 = require('sha1');
var Wechat = require('./wechat.js');
var util = require('./util.js');
/*
* 	raw-body: 通过这个raw-body模块可以将 this.request
* 对象，就是http的request(req)对象,去拼装他的数据，
* 最终可以拿到一个buffer的xml数据
**/
var getRawBody = require('raw-body');

// var Promise = require('bluebird');
// var request = Promise.promisify(require('request'));

// Generator 函数是协程在 ES6 的实现，最大特点就是可以交出函数的执行权（即暂停执行）。
module.exports = function (wechat, handler){
	Wechat = new Wechat(wechat);	
	return function *(next){
/*
*	将拿到的微信系统发来的参数进行排序
*	1.nonce 2.timesamp 3.Token (申请微信接口时填入的Token)
*	进行数组排序。数组方法 sort 直接进行排序
*	将排序后的数组转为字符串
*	再讲字符串进行 sha1 进行加密  (在这里使用crypto )
*	最后将加密之后的 字符串和 signature (微信服务端返回的) 进行比对 如果相同 则验证成功	
*	将验证成功 加密字符串返回给微信服务器
**/
		var that = this;
		var token = wechat.token;
		var signature = this.query.signature,
			nonce = this.query.nonce,
			timestamp = this.query.timestamp,
			echostr = this.query.echostr;
		var str = [token,timestamp,nonce].sort().join('');	
		var sha = sha1(str);
		if (this.method === 'GET'){
			if (sha === signature){
				this.body = echostr + ''
			} else {
				this.body = 'error';
			}
		} else if (this.method === 'POST'){
			if (sha !== signature){
				this.body = 'error';
				return false;
			};
			var data = yield getRawBody(this.req,{
				length: this.length,
				limit: '1mb',
				encoding: this.charset
			})
			var content = yield util.parseXMLAsync(data);
			var message = util.formatMessage(content.xml);

			console.log(message)
			this.weixin = message;
						
			yield handler.call(this,next);
			Wechat.reply.call(this);
		}
		
	};
}
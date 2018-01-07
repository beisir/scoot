var axios = require('axios');
var util = require('./util.js');
var fs = require('fs');
var mise = require('bluebird');
var request = mise.promisify(require('request'));
// 使用Promise对象将xml格式对象转为JSON并且返回调用Promise

/*
* prefix 获取access_token的接口路径
* api > accessToken: 拼接access_token的接口参数 grant_type=client_credential 由于此值不为动态 所以写死
**/ 
var prefix = 'https://api.weixin.qq.com/cgi-bin/'
var api = {
	accessToken: prefix + 'token?grant_type=client_credential',
	
	upload: prefix + 'media/upload?'
}

/*
* Wechat() { 构造函数 } (opts: 为请求接口所用参数，以及读取保存 access_token 方法)
* this.appID : 接口参数 appID获取微信平台提供唯一标识 (办选项)
* this.appSecret : 接口参数 appSecret获取微信平台提供唯一标识 (必选项)
* this.getAccessToken : 获取本地 保存的access_token  文件 
* this.saveAccessToken : 因为请求到的 expires_in 每2小时刷新一次 所以需要重新请求并保存到本地文件
**/ 
function Wechat(opts){
	var that = this;
	this.appID = opts.appID;
	this.appSecret = opts.appSecret;
	this.getAccessToken = opts.getAccessToken;
	this.saveAccessToken = opts.saveAccessToken;

	/*
	* this.getAccessToken().then() :{data: 返回本地读取到的access_token 文件}
	* this.appID : 接口参数 appID获取微信平台提供唯一标识 (办选项)
	* this.appSecret : 接口参数 appSecret获取微信平台提供唯一标识 (必选项)
	* this.getAccessToken : 获取本地 保存的access_token  文件 
	* this.saveAccessToken : 因为请求到的 expires_in 每2小时刷新一次 所以需要重新请求并保存到本地文件
	**/ 
	this.getAccessToken().then(function (data){
		try {	// 如果返回值没有错误 直接转为对象
			data = JSON.parse(data);
		}
		catch(e){	// 如有异常则重新请求更新access_token
			return that.updateAccessToken();
		}
			// 如果本地保存的expires_in 时间没有过期 则返回请求的到的expires_in and access_token值
		if (that.isValidAccessToken(data)){	
			return Promise.resolve(data);	//
		} else {
			return that.updateAccessToken();	// 否则如果过期则重新请求 expires_in and access_token值
		}
	}).then(function (data){  // 获取本地为未期的expires_in and access_token值
		that.access_token = data.access_token;	// 并保存在Wechat 构造器
		that.expires_in = data.expires_in;
		that.saveAccessToken(data);		// 并将expires_in and access_token 值保存在本地
	})
}
/* 判断本地读取到的access_token和 expires_inmei 有没有值 或者是否为空 是否为一个对象*/ 
Wechat.prototype.isValidAccessToken = function (data){
	/*
	* 第一次调用请求参数的放法就是以下 if判断 因为第一次本地保存文件肯定是为空所以放法不成立
	* 如果获取data不是一个对象 或者data.access_token和data.expires_inmei 
	* 没有的话，直接返回false  从新更新data对象
	**/ 
	if (!data || !data.access_token || !data.expires_in){
		return false;
	};
	// 获取本地保存的access_token and expires_in 值	
	var access_token = data.access_token;
	var expires_in = data.expires_in;
	var now = (new Date().getTime()); // 获取当前系统时间 时间戳
	if (now < expires_in) {	// 如果当前时间小于 expires_in 时间  证明expires_in没有过期 返回true
 		return true;
	} else{
		return false;
	}
}
// 更新 || 请求函数 expires_in and access_token 值方法
Wechat.prototype.updateAccessToken = function (){
	var appID = this.appID;	// 获取构造器参数appID
	var appSecret = this.appSecret;	// 获取构造器参数appSecret
		// 拼接参数发起请求
	var url = `${api.accessToken}&appid=${appID}&secret=${appSecret}`; 
	return new Promise(function (resolve,reject){	
		// 发起ajax请求道微信端
		axios({
			url: url,
		}).then(function (response){	// 获取返回值	expires_in and access_token
			var data = response.data;
			var now = (new Date().getTime());	// 获取当前时间戳
				// 在本地保存的时间戳实际上 提前20ms, 以防止有网络延时不能获取最新的 expires_in and access_token
			var expires_in = now + (data.expires_in - 20) *1000;  
			data.expires_in = expires_in;	// 修改expires_in 之后将 expires_in and access_token 保存到本地
			resolve(data);
		})
	})
}

// 更新 || 请求函数 expires_in and access_token 值方法
Wechat.prototype.uploadMaterial = function (type, filepath){
	var that = this;
	var form = {
		media: fs.createReadStream(filepath)
	}	
	var appID = this.appID;	// 获取构造器参数appID
	var appSecret = this.appSecret;	// 获取构造器参数appSecret
		// 拼接参数发起请求
	return new Promise(function (resolve,reject){	
		that.fetchAccessToken().then(function (data){
			var url = `${api.upload}&access_token=${data.access_token}&type=${type}`;
			// 发起ajax请求道微信端
			request({
				url: url,
				method: 'post',
				formData: form
			}).then(function (response){	// 获取返回值	expires_in and access_token
				var _data = response.body;
				if (_data){
					resolve(_data);
				} else {
					reject(new Error('Upload fuil'));
				}
			}).catch(function (err){
				reject(err);
			})
		})
	})
}

Wechat.prototype.fetchAccessToken = function (){
	var that = this;
	if (this.access_token && this.expires_in){
		if (this.isValidAccessToken(this)){
			return Promise.resolve(this);
		} 
	}
	this.getAccessToken().then(function (data){
		try {	// 如果返回值没有错误 直接转为对象
			data = JSON.parse(data);
		}
		catch(e){	// 如有异常则重新请求更新access_token
			return that.updateAccessToken();
		}
			// 如果本地保存的expires_in 时间没有过期 则返回请求的到的expires_in and access_token值
		if (that.isValidAccessToken(data)){	
			return Promise.resolve(data);	//
		} else {
			return that.updateAccessToken();	// 否则如果过期则重新请求 expires_in and access_token值
		}
	}).then(function (data){  // 获取本地为未期的expires_in and access_token值
		that.access_token = data.access_token;	// 并保存在Wechat 构造器
		that.expires_in = data.expires_in;
		that.saveAccessToken(data);		// 并将expires_in and access_token 值保存在本地
		Promise.resolve(data);
	})
}



Wechat.prototype.reply = function (){
	var content = this.body;
	var message = this.weixin;
	var xml = util.tpl(content, message);
	this.status = 200;
	this.type = 'application/xml';
	this.body = xml;
}



module.exports = Wechat;
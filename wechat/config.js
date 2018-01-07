var path = require('path');
var wechat_file = path.join(__dirname,'./config/wechat.txt');
var util = require('./libs/util.js');

/*
* appID: 'wxcb8bea02f882d880' 验证获取access_token 和 expires_in有效时间的必填参数
* appSecret: 'e7382bb54af48903d99ec251e03dce2d' 验证获取access_token 和 expires_in有效时间的必填参数 
* token: 'hsy7426' 验证微信端接口 token值和微信公众平台所填信息相同
* getAccessToken: 获取access_token 和 expires_in 的文件		返回值{Promise对象}
* saveAccessToken: 保存access_token 和 expires_in 的文件 	返回值{Promiss对象}
**/ 
var config = {
	wechat: {
		appID: 'wxcb8bea02f882d880',
		appSecret: 'e7382bb54af48903d99ec251e03dce2d',
		token: 'hsy7426',
		getAccessToken: function (){
			return util.readFileAsync(wechat_file,'utf8')
		},
		saveAccessToken: function(data){
			data = JSON.stringify(data);
			return util.writeFileAsync(wechat_file,data);
		}
	}
};
module.exports = config;
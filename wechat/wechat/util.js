/*
* xml2js：将xml格式转为JSON对象的模块
* tpl.js：生成模板的js文件
**/ 

var xml2js = require('xml2js');
var tpl = require('./tpl.js');

exports.parseXMLAsync = function (xml){
	return new Promise(function (resolve,reject){	
		// xml2js.parseString 
		xml2js.parseString(xml, {trim: true}, function (err, content){
			if (err){
				reject(err)
			} else {
				resolve(content);
			}
		})
	})		
}	
// 对象过滤函数 微信端返回数据格式为[大多数组]格式,
function formatMessage (result){
	var message = {};
	if (typeof result === 'object'){	// 如果传入的result 为一个对象
		var keys = Object.keys(result);	//获取result对象的所有key值为一个数组
		for (var i = 0;i<keys.length;i++){	// 循环数组
			var item = result[keys[i]],	// item 为对象的每一项
				key = keys[i];	// key 为对象的每一个key值
				// 如果item(item为当前对象值，应该是数组)不是一个数组 或者当前值的长度为0 就跳过本次循环
			if (!(item instanceof Array) || item.length === 0){	
				continue ;
			}
			if (item.length === 1){	// 如果当前值长度为1
				var val = item[0];	// 获取当前值
				if (typeof val === 'object' ){ // 判断当前值是否是一个对象
					message[key] = formatMessage(val);	// 如果当前值为对象则递归便利取值
				} else {
					message[key] = (val || '').trim();	// 否则把当前值作为{key:val} 存储在message对象中 
				}
			} else {	// 否则当前值(应该是数组) 长度超过1
				message[key] = [];	// 把数组中所有值放在当前key值为[] 空数组之中
				for (var j = 0, k = item.length; j < k ;j++){	// 在此循环数组
					message[key].push(formatMessage(item[j]));	// 将数组中每一个值 (值应该数组二维)
				}
			}
		}
	}
 	return message;	//最后返回对象
}
/*
*{ ToUserName: 'gh_544688e100f5',	
*  FromUserName: 'oUeEY0-HVSvxvJf7EAKJs2Dn_KMA',	// 关注者的openid 
*  CreateTime: '1515257184',	//时间戳
*  MsgType: 'text',		// 发送的事件类型
*  Content: 'hello',	// 发送的文字内容
*  MsgId: '6507980050728391531' }
**/


exports.formatMessage = formatMessage;

/*
*  设置默认值模板渲染数据	
*  FromUserName: 'oUeEY0-HVSvxvJf7EAKJs2Dn_KMA',	// 关注者的openid 
*  CreateTime: '1515257184',	//时间戳
*  MsgType: 'text',		// 发送的事件类型
*  Content: 'hello',	// 发送的文字内容
*  MsgId: '6507980050728391531' }
**/
exports.tpl = function (content, message){
	var info = {},
		type = 'text',
		fromUsername = message.FromUserName,
		toUsername = message.ToUserName;
	if (Array.isArray(content)){
		type = 'news'
	};
	type = content.type || type;
	info.content = content;
	info.createTime = new Date().getTime();
	info.msgType = type;
	info.toUserName = fromUsername;
	info.fromUserName = toUsername;
	return tpl.compiled(info);
};

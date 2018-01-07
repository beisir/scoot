// 调用次函数的方法改变this指向 将this指向数据回调
var Wechat = require('./wechat/wechat.js');
var config = require('./config.js');
var WechatApi = new Wechat(config.wechat);
exports.reply = function* (next) {
	var message = this.weixin;	// 公众号客户端用户操作行为
	if (message.MsgType === 'event'){ // 事件推送
		if (message.Event === 'subscribe'){ // 关注订阅号事件
			if (message.EventKey){
				console.log('扫二维码进来:' +message.EventKey + '' +message.ticket);
			}
			this.body = '哈哈，你扫描了二维码订阅了这个号\r\n' + '消息id:' +message.MsgId;
		} else if (message.Event === 'unsubscribe'){ // 取消订阅
			console.log('取消订阅了');
			this.body = '';
		} else if (message.Event === 'LOCALTION'){ // 上报当前地理位置
			this.body = '您上报的位置是：'+ message.Latitude + '/' +
				message.Longitude + '-' + message.Precision;
		} else if (message.Event === 'CLICK'){ // 点击菜单
			this.body = '您点击了菜单：'+ message.EventKey;
		} else if (message.Event === 'SCAN'){ // s扫描了二维码
			this.body = '关注扫描二维码：'+ message.EventKey + '/' +
				message.Ticket;
		} else if (message.Event === 'VIEW'){ // 点击了菜单的链接
			this.body = '您点击了菜单的链接：'+ message.EventKey;
		} 	
	}else if (message.MsgType === 'text'){ // 图文信息
		var content = message.Content;
		if (content === '6'){
			this.body = [{
				title: '我爱你一生一世',
				description: 'I LOVE YOU',
				picUrl: 'http://photocdn.sohu.com/20151126/mp44506945_1448520375000_1.jpeg',
				url: 'https://b2b.hc360.com/h5/index.html?u=anfang01&t=3&d=1'
			},{
				title: '我爱你一生一世',
				description: 'I LOVE YOU',
				picUrl: 'http://photocdn.sohu.com/20151126/mp44506945_1448520375000_4.jpeg',
				url: 'https://b2b.hc360.com/h5/index.html?u=anfang01&t=3&d=1'
			},{
				title: '我爱你一生一世',
				description: 'I LOVE YOU',
				picUrl: 'http://photocdn.sohu.com/20151126/mp44506945_1448520375000_7.jpeg',
				url: 'https://b2b.hc360.com/h5/index.html?u=anfang01&t=3&d=1'
			},{
				title: '我爱你一生一世',
				description: 'I LOVE YOU',
				picUrl: 'http://photocdn.sohu.com/20151126/mp44506945_1448520375000_14.jpeg',
				url: 'https://b2b.hc360.com/h5/index.html?u=anfang01&t=3&d=1'
			}]
		} else if (content === '8'){
			var data = yield WechatApi.uploadMaterial('image', __dirname + '/images/2.jpg');
				data = JSON.parse(data);
				this.body = data;
		} else if (content === '0'){
			var vidoData = yield WechatApi.uploadMaterial('video', __dirname + '/images/0.mp4');
				vidoData = JSON.parse(vidoData);
			var objs = {title:'回复视屏文件',description: '这是一个爱你的证明'}
				this.body = Object.assign(objs,vidoData);
		} else if (content === '9'){
			var musicImg = yield WechatApi.uploadMaterial('image', __dirname + '/images/4.jpeg');
				musicImg = JSON.parse(musicImg);
			var objs = {
					type: 'music',
					title:'深情即是死罪，又怎怕挫骨扬灰!',
					description: '想你的夜，只想一直留在你身边.',
					MUSIC_Url: 'http://up.mcyt.net/down/42028.mp3',
					HQ_MUSIC_Url: 'http://photocdn.sohu.com/20151126/mp44506945_1448520375000_7.jpeg'
				}
				this.body = Object.assign(musicImg,objs);
		} else {
			this.body = content + '66666';
		}
	}  else {
		this.body = '其他其他s';
	}
	yield next;
}

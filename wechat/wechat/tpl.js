var ejs = require('ejs');		// 获取模板引擎生成模板字符串 xml
var heredoc = require('heredoc');	// 将函数内注释内容转为字符串; 不必用 + 拼接


var tpl = heredoc(function (){/*
	<xml>
		<ToUserName><![CDATA[<%= toUserName %>]]></ToUserName>
		<FromUserName><![CDATA[<%= fromUserName %>]]></FromUserName>
		<CreateTime><%= createTime %></CreateTime>
		<MsgType><![CDATA[<%= msgType %>]]></MsgType>
		<% if(msgType === 'text'){ %>	
			<Content><![CDATA[<%= content %>]]></Content>
		<% } else if(msgType === 'image'){ %>
			<Image>
				<MediaId><![CDATA[<%= content.media_id %>]]></MediaId>
			</Image>
		<% } else if(msgType === 'voice'){ %>
			<Voice>
				<MediaId><![CDATA[<%= content.media_id %>]]></MediaId>
			</Voice>
		<% } else if(msgType === 'video'){ %>
			<Video>
				<MediaId><![CDATA[<%= content.media_id %>]]></MediaId>
				<Title><![CDATA[<%= content.title %>]]></Title>
				<Description><![CDATA[<%= content.description %>]]></Description>
			</Video>
		<% } else if(msgType === 'music'){ %>
			<Music>
				<Title><![CDATA[<%= content.title %>]]></Title>
				<Description><![CDATA[<%= content.description %>]]></Description>
				<MusicUrl><![CDATA[<%= content.MUSIC_Url %>]]></MusicUrl>
				<HQMusicUrl><![CDATA[<%= content.HQ_MUSIC_Url %>]]></HQMusicUrl>
				<ThumbMediaId><![CDATA[<%= content.media_id %>]]></ThumbMediaId>
			</Music>
		<% } else if(msgType === 'news'){ %>
			<ArticleCount><%= content.length %></ArticleCount>
			<Articles>
				<% content.forEach(function (item,index){ %>
				<item>
					<Title><![CDATA[<%= item.title %>]]></Title>
					<Description><![CDATA[<%= item.description %>]]></Description>
					<PicUrl><![CDATA[<%= item.picUrl %>]]></PicUrl>
					<Url><![CDATA[<%= item.url %>]]></Url>
				</item>
				<% }) %>
			</Articles>
		<% } %>	
	</xml>
*/})
var compiled = ejs.compile(tpl);	// 模板之内有条件判断，最后取出生成的模板
exports = module.exports = {	// 抛出compiled 方法
	compiled: compiled 	
}
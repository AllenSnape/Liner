// 向被注入页面发送信息并处理回调
function sendMessage(jsonmsg, exec){
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		var tab = tabs[0];
		chrome.tabs.sendMessage(tab.id, jsonmsg, {}, function(res){
			console.log(res);
			if(exec instanceof Function) exec(res);
		});
	});
}

// 确认popup页面与被注入页面能建立通信
function init(){
	sendMessage(JSON.stringify({"code":CODE_INIT, message:"init"}), function(res){
		$("#title").text(res.data.laststatus == "block" ? "显示" : "隐藏");
	});
}

$(function(){
	// 初始化
	$("#title").bind({
		click:function(){
			init();
		}
	});
});
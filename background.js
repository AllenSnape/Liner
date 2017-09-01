var files = {};

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		console.log((sender.tab ? "from a content script:" + sender.tab.url : "from the extension")+", with: "+JSON.stringify(request));
		
		switch(request.command){
			case "hello": sendResponse({message: "通信后台OK!", data: "OK!"}); break;
			case "readfile":
				if(request.filename){
					chrome.runtime.getPackageDirectoryEntry(function (dirEntry) {
					    dirEntry.getFile(request.filename, undefined, function (fileEntry) {
					    fileEntry.file(
					    	function (file) {
					            var reader = new FileReader()
					            reader.readAsText(file);
					            reader.addEventListener("load", function (event) {
					                files[request.filename] = reader.result;
					            });
					        });
					    }, function (e) {
					    	files[request.filename] = e;
					        console.log(e);
					    });
					});
					sendResponse({message: "已读取"+request.filename+"!"}); break;
				}else{
					sendResponse({message: request.filename+"读取失败!"}); break;
					
				}
				break;
			case "readfiles": sendResponse({message: "文件读取成功!", data: files}); break;
			default: sendResponse({message: "未知命令!"});
		}
	}
);
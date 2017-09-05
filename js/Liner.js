var Liner = {
	// 每次缩放递进的倍数
	zoomValue: 0.08,
	// 最小宽度, px
	minPixel: 200,
	// 最大缩放等级, 倍数
	maxScale: 2.99,
	// 拖拽读取区静态显示的文字
	readzoneInitWords: "拖拽图片到此",
	// 拖拽读取区当有数据悬浮时提示的文字
	readzoneDragoverWords: "放手!",
	// 拖拽读取区对象
	readzone: undefined,
	// 图片(长或者高)超出网页可视化区域时对其的缩放等级
	// 主要是为了留白, 例如当该值为0.9时, 如果图片的长(width)超出了可视化区域的宽度(document.documentElement.clientWidth), 此时图片被缩放之后, 该图片左右留白皆为网页可视化区域的0.05
	// 优先判断长(width)是否超出可视范围; 如果缩放之后高任然超出可视化范围, 则不进一步缩放
	oversizeImageOffset: 0.9,
	// 额外忽略的json文件名称
	ignoreJSON: "resource/ignore.json",
	// 各个线的参数
	lines: {
		// 对角线默认参数
		diagonal:{
			color:"#ffffff",
			draw:false
		},
		// 水平垂直对折线默认参数(vh = vertical + horizontal)
		vhCrossFoldline:{
			color:"#ffffff",
			draw:false
		},
		// 三等分线默认参数
		trisector:{
			color:"#000000",
			draw:true
		},
		// 黄金分割线默认参数
		FibonacciLines:{
			color:"#eec710",
			draw:false
		}
	},
	
	/**
	 * 初始化数据
	 */
	init: function(){
		if(!document.getElementById("v0_as_shadow")){
			var thiz = this;
			// 拼接dom
			var style = document.createElement("style");
			style.setAttribute("type", "text/css");
			style.innerHTML = 
				"#v0_as_readzone i{position:relative !important;top:auto !important;left:auto !important;width:auto !important;}"+
				
				"#v0_as_readzone{transition-duration:0.3s;z-index:999997;position:fixed;top:70px;right:10px;height:100px;width:100px;border:2px solid #4b4b4b;border-radius:10px;text-align:center;line-height:100px;background-color:#fff;color:#4b4b4b;font-size:14px;cursor:-webkit-grab;overflow:hidden;opacity:0.5;display:block;}"+
				"#v0_as_readzone *{-webkit-user-select:none;}"+
				"#v0_as_readzone:HOVER{height:210px;opacity:1;box-shadow:5px 5px 10px #888888;}"+
				"#v0_as_readzone:ACTIVE{cursor:-webkit-grabbing;/*box-shadow:10px 10px 20px #888888;*/}"+
				
				"#v0_as_readzone_reader{position:absolute;top:0px;left:0px;width:100%;height:100%;}"+
				
				"#v0_as_readzone_hiddenzone{position:absolute;left:0px;display:inline-block;width:80px;margin:100px 10px 0px 10px;}"+
				"#v0_as_readzone_hiddenzone_refreshImgsBtn{transition-duration:0.3s;width:78px;height:30px;border:1px solid #929292;color:#929292;border-radius:4px;line-height:30px;font-size:14px;}"+
				"#v0_as_readzone_hiddenzone_refreshImgsBtn:HOVER{color:#4b4b4b;border-color:#4b4b4b;box-shadow:2px 2px 4px #888888;}"+
				"#v0_as_readzone_hiddenzone_refreshImgsBtn:ACTIVE{color:#202020;border-color:#202020;box-shadow:1px 1px 2px #888888;}"+
				"#v0_as_readzone_hiddenzone_linesController{margin:10px 0px 0px 0px;width:80px;list-style:none;padding:0px;}"+
				"#v0_as_readzone_hiddenzone_linesController > li{font-size:12px;line-height:12px;}"+
				"#v0_as_readzone_hiddenzone_linesController > li > *:not(:last-child){margin-right:5px;}"+
				"#v0_as_readzone_hiddenzone_linesController > li > input{height:10px;width:10px;padding:0px;}"+
				"#v0_as_readzone_hiddenzone_linesController > li > input[type=checkbox]{display:none;}"+
				"#v0_as_readzone_hiddenzone_linesController > li > input[type=checkbox] + label{font-size:14px;}"+
				"#v0_as_readzone_hiddenzone_linesController > li > input[type=checkbox] + label > i:before{content:\"\\f10c\"}"+
				"#v0_as_readzone_hiddenzone_linesController > li > input[type=checkbox]:checked + label > i:before{content:\"\\f192\"}"+
				"#v0_as_readzone_hiddenzone_linesController > li > input[type=color]{display:none;}"+
				"#v0_as_readzone_hiddenzone_linesController > li > input[type=color] + div[role=colorDisplay]{display:inline-block;width:8px;height:8px;background-color:#000;border:1px solid #000;cursor:pointer;}"+
				
				"#v0_as_shadow{position:fixed;top:0px;left:0px;width:100%;height:100%;background-color:rgba(0,0,0,0.5);display:none;z-index:999998;}"+
				
				"#v0_as_box{position:fixed;background-repeat:no-repeat;background-attachment:fixed;background-position:center;cursor:-webkit-grab;transition-duration:0.3s;display:none;z-index:999999;}"+
				"#v0_as_box:ACTIVE{cursor:-webkit-grabbing;}";
			
			// 可拖拽图片读取区
			var readzone = document.createElement("div");
			readzone.setAttribute("id", "v0_as_readzone");
				// 读取区文字显示标签
				var readzoneTextSpan = document.createElement("span");
				readzoneTextSpan.innerText = this.readzoneInitWords;
				readzone.appendChild(readzoneTextSpan);
				// 读取区真实读取图片信息的标签
				var readzone_reader = document.createElement("div");
				readzone_reader.setAttribute("id", "v0_as_readzone_reader");
				readzone.appendChild(readzone_reader);
				// 图片读取区功能板块
				var readzone_hiddenzone = document.createElement("div");
				readzone_hiddenzone.setAttribute("id", "v0_as_readzone_hiddenzone");
					// 刷新img标签的按钮, 重新绑定可拖拽事件等等
					var readzone_hiddenzone_refreshImgsBtn = document.createElement("div");
					readzone_hiddenzone_refreshImgsBtn.setAttribute("id", "v0_as_readzone_hiddenzone_refreshImgsBtn");
					readzone_hiddenzone_refreshImgsBtn.innerText = "刷新";
					readzone_hiddenzone.appendChild(readzone_hiddenzone_refreshImgsBtn);
					// 线条控制器
					var readzone_hiddenzone_linesController = document.createElement("ul");
					readzone_hiddenzone_linesController.setAttribute("id", "v0_as_readzone_hiddenzone_linesController");
					readzone_hiddenzone.appendChild(readzone_hiddenzone_linesController);
						// 对角线
						var readzone_hiddenzone_diagonal = document.createElement("li");
						readzone_hiddenzone_diagonal.innerHTML = '<span>对角线</span><input '+(this.lines.diagonal.draw?'checked="checked"':'')+' id="diagonalCheckbox" type="checkbox" role="diagonal"/><label for="diagonalCheckbox"><i class="fa-li fa"></i></label><input type="color" role="diagonal" value="'+this.lines.diagonal.color+'" onchange="this.nextSibling.style.backgroundColor = this.value;"/><div role="colorDisplay" style="background-color:'+this.lines.diagonal.color+';" onclick="this.previousSibling.click();"></div>';
						readzone_hiddenzone_linesController.appendChild(readzone_hiddenzone_diagonal);
						// 水平垂直对折线
						var readzone_hiddenzone_vhCrossFoldline = document.createElement("li");
						readzone_hiddenzone_vhCrossFoldline.innerHTML = '<span>对折线</span><input '+(this.lines.vhCrossFoldline.draw?'checked="checked"':'')+' id="vhCrossFoldlineCheckbox" type="checkbox" role="vhCrossFoldline"/><label for="vhCrossFoldlineCheckbox"><i class="fa-li fa"></i></label><input type="color" role="vhCrossFoldline" value="'+this.lines.vhCrossFoldline.color+'" onchange="this.nextSibling.style.backgroundColor = this.value;"/><div role="colorDisplay" style="background-color:'+this.lines.vhCrossFoldline.color+';" onclick="this.previousSibling.click();"></div>';
						readzone_hiddenzone_linesController.appendChild(readzone_hiddenzone_vhCrossFoldline);
						// 三等分线
						var readzone_hiddenzone_trisector = document.createElement("li");
						readzone_hiddenzone_trisector.innerHTML = '<span>三等线</span><input '+(this.lines.trisector.draw?'checked="checked"':'')+' id="trisectorCheckbox" type="checkbox" role="trisector"/><label for="trisectorCheckbox"><i class="fa-li fa"></i></label><input type="color" role="trisector" value="'+this.lines.trisector.color+'" onchange="this.nextSibling.style.backgroundColor = this.value;"/><div role="colorDisplay" style="background-color:'+this.lines.trisector.color+';" onclick="this.previousSibling.click();"></div>';
						readzone_hiddenzone_linesController.appendChild(readzone_hiddenzone_trisector);
						// 黄金分割线
						var readzone_hiddenzone_FibonacciLines = document.createElement("li");
						readzone_hiddenzone_FibonacciLines.innerHTML = '<span>黄分线</span><input '+(this.lines.FibonacciLines.draw?'checked="checked"':'')+' id="FibonacciLinesCheckbox" type="checkbox" role="FibonacciLines"/><label for="FibonacciLinesCheckbox"><i class="fa-li fa"></i></label><input type="color" role="FibonacciLines" value="'+this.lines.FibonacciLines.color+'" onchange="this.nextSibling.style.backgroundColor = this.value;"/><div role="colorDisplay" style="background-color:'+this.lines.FibonacciLines.color+';" onclick="this.previousSibling.click();"></div>';
						readzone_hiddenzone_linesController.appendChild(readzone_hiddenzone_FibonacciLines);
				// 将功能板块拼接至图片读取区
				readzone.appendChild(readzone_hiddenzone);

			// 遮罩
			var shadow = document.createElement("div");
			shadow.setAttribute("id", "v0_as_shadow");

			// 图片显示区域
			var box = document.createElement("div");
			box.setAttribute("id", "v0_as_box");
			box.innerHTML = '<canvas id="v0_as_canvas"></canvas>';

			// 拼接控件至body
			document.body.appendChild(style);
			document.body.appendChild(readzone);
			document.body.appendChild(shadow);
			document.body.appendChild(box);
			
			// 初始化功能
			document.getElementById("v0_as_shadow").onclick = function(){
				thiz.hide();
			};
			
			document.getElementById("v0_as_readzone_hiddenzone_refreshImgsBtn").onclick = function(e){
				thiz.flushImages();
				thiz.doIgnoreJSON();
			}
			
			var readzone = document.getElementById("v0_as_readzone");
			var readzoneText = readzone.querySelector("span");
			
			readzoneText.ondrop = readzone.ondrop = function(e){
				event.preventDefault();
				readzoneText.innerText = thiz.readzoneInitWords;
				
				const src = event.dataTransfer.getData("src");
				if(src) thiz.drawline({src: src});
			};
			
			readzone.ondragover = function(e){
				event.preventDefault();
				readzoneText.innerText = thiz.readzoneDragoverWords;
			};
			
			readzone.ondragleave = function(e){
				event.preventDefault();
				readzoneText.innerText = thiz.readzoneInitWords;
			};
			
			this.readzone = this.draggable(readzone, readzone, true, function(){document.getElementById("v0_as_readzone").style.transitionDuration = "0.3s";});
		}
	},
	
	/**
	 * 显示控件
	 */
	show: function(){
		document.getElementById("v0_as_shadow").style.display = "block";
		document.getElementById("v0_as_box").style.display = "block";
		
		document.body.addEventListener("mousewheel", this.documentScroll);
	},
	
	/**
	 * 隐藏控件
	 */
	hide: function(){
		document.getElementById("v0_as_shadow").style.display = "none";
		document.getElementById("v0_as_box").style.display = "none";
		
		document.body.removeEventListener("mousewheel", this.documentScroll);
	},
	
	/**
	 * document对象的onmousewheel事件, 用于防止在缩放图片的时候, document.body任然能进行页面的滚动
	 */
	documentScroll: function(event){
		if(event.preventDefault){
			event.preventDefault();
		}
	},

	/**
	 * 在图片上绘制对角线, 对折线, 三等分线, 黄金分割线
	 * @param image 图片对象, 或者携带.src的对象
	 * @returns
	 */
	drawline: function(image){
		var box = document.getElementById("v0_as_box");
		var canvas = document.getElementById("v0_as_canvas");
		// 显示控件
		this.show();
		
		const img = new Image();
		img.src = image.src;
		
		const width = img.naturalWidth;
		const height = img.naturalHeight;
		
		// 设置画布大小
		canvas.width = width;
		canvas.height = height;
		canvas.setAttribute("originImageSrc", image.src);
		
		// document.documentElement.clientWidth, document.documentElement.clientHeight 设置预缩放等级
		var canvasScaleValue = 1;
		const whitespaceRate = (1 - this.oversizeImageOffset) / 2;
		// 优先判断宽
		if(width > document.documentElement.clientWidth){
			canvasScaleValue = this.oversizeImageOffset * document.documentElement.clientWidth / width;
			box.style.transform = "scale("+canvasScaleValue+")";
			box.style.left = (document.documentElement.clientWidth * whitespaceRate - (1 - canvasScaleValue) / 2 * width) + "px";
			box.style.top = -((1 - canvasScaleValue) * height) / 2 + (document.documentElement.clientHeight - height * canvasScaleValue) / 2 + "px";
		}
		// 次而判断高
		else if(height > document.documentElement.clientHeight){
			canvasScaleValue = this.oversizeImageOffset * document.documentElement.clientHeight / height;
			box.style.transform = "scale("+canvasScaleValue+")";
			box.style.top = (document.documentElement.clientHeight * whitespaceRate - (1 - canvasScaleValue) / 2 * height) + "px";
			box.style.left = -((1 - canvasScaleValue) * width) / 2 + (document.documentElement.clientWidth - width * canvasScaleValue) / 2 + "px";
		}
		// 都不符合表示图片大小小于可视化区域的大小
		else{
			box.style.transform = "scale("+canvasScaleValue+")";
			box.style.left = (document.documentElement.clientWidth - width) / 2 + "px";
			box.style.top = (document.documentElement.clientHeight - height) / 2 + "px";
		}
		
		// 获取绘制线的参数
		var linesParams = this.lines;
		var lineLis = document.getElementById("v0_as_readzone_hiddenzone_linesController").querySelectorAll("li");
		for(var i = 0; i < lineLis.length; i++){
			linesParams[lineLis[i].querySelector("input[type=checkbox]").getAttribute("role")].draw = lineLis[i].querySelector("input[type=checkbox]").checked;
			linesParams[lineLis[i].querySelector("input[type=color]").getAttribute("role")].color = lineLis[i].querySelector("input[type=color]").value;
		}
		
		// 初始化画布, 并开始画画
		var cv = canvas.getContext("2d");
		cv.drawImage(img, 0, 0, width, height);
		
		// 开始画线
		// 绘制的线宽, 因为如果图片大于可视化区域之后会被缩放, 缩放到一定等级之后绘制的线条就可能被压缩而看不到
		cv.lineWidth = 1 / canvasScaleValue;
		
		// 对角线
		if(linesParams.diagonal.draw){
			cv.beginPath();
			cv.moveTo(0, 0);
			cv.lineTo(width, height);
			cv.moveTo(0, height);
			cv.lineTo(width, 0);

			cv.strokeStyle = linesParams.diagonal.color;
			cv.stroke();
		}
		
		// 对折线
		if(linesParams.vhCrossFoldline.draw){
			cv.beginPath();
			cv.moveTo(width/2, 0);
			cv.lineTo(width/2, height);
			cv.moveTo(0, height/2);
			cv.lineTo(width, height/2);
	
			cv.strokeStyle = linesParams.vhCrossFoldline.color;
			cv.stroke();
		}
		
		// 三等分线
		if(linesParams.trisector.draw){
			cv.beginPath();
			// 横向线
			const rowOneOf3 = height / 3;
			cv.moveTo(0, rowOneOf3);
			cv.lineTo(width, rowOneOf3);
			cv.moveTo(0, rowOneOf3*2);
			cv.lineTo(width, rowOneOf3*2);
			// 纵向线
			const colOneOf3 = width / 3;
			cv.moveTo(colOneOf3, 0);
			cv.lineTo(colOneOf3, height);
			cv.moveTo(colOneOf3*2, 0);
			cv.lineTo(colOneOf3*2, height);
	
			cv.strokeStyle = linesParams.trisector.color;
			cv.stroke();
		}
		
		// 黄金分割线
		if(linesParams.FibonacciLines.draw){
			cv.beginPath();
			// 横向线
			cv.moveTo(0, 0.382*height);
			cv.lineTo(width, 0.382*height);
			cv.moveTo(0, 0.618*height);
			cv.lineTo(width, 0.618*height);
			// 纵向线
			cv.moveTo(0.382*width, 0);
			cv.lineTo(0.382*width, height);
			cv.moveTo(0.618*width, 0);
			cv.lineTo(0.618*width, height);
			cv.strokeStyle = linesParams.FibonacciLines.color;
			cv.stroke();
		}
		
		// 缩放等级限制最小大小在200px以上
		const minScale = this.minPixel / (width >= height ? width : height);
		
		var thiz = this;
		// 绑定滚轮滚动事件
		canvas.onmousewheel = function(e){
			// 获取当前的缩放等级
			var scale = /scale\(-?\d+(\.\d+\)*)/.exec(box.style.transform.replace(/\s/gi, ""));
			scale = (scale == null ? 1 : scale[0].replace(/[^\d\.]/gi, "")) * 1;
			scale += (e.wheelDelta < 0 ? -thiz.zoomValue : thiz.zoomValue);
			scale = scale < minScale ? minScale : (scale > thiz.maxScale ? thiz.maxScale : scale);
			box.style.transform = "scale("+scale+")";
		}
		
		// 绑定拖拽事件
		this.draggable(box, box, false, function(){document.getElementById("v0_as_box").style.transitionDuration = "0.3s";});
	},

	/**
	 * 使标签可拖拽
	 * @param bar 开始进行拖拽的标签
	 * @param box 被拖拽对象
	 * @param inscreen 是否仅限在屏幕以内
	 * @param callback 拖拽完成后的回调
	 * @returns
	 */
	draggable: function(bar, box, inscreen, callback){
		var thiz = this;
		// 初始化数据
		var params = {
			left: 0,
			top: 0,
			currentX: 0,
			currentY: 0,
			flag: false
		};
		if(this.getCss(box, "left") !== "auto"){
			params.left = this.getCss(box, "left");
		}
		if(this.getCss(box, "top") !== "auto"){
			params.top = this.getCss(box, "top");
		}
		
		// 将拖拽方法独立出来, 方便解绑
		var dragTargetFunc = function(event){
			// 动画延时
			box.style.transitionDuration = "0s";
			params.flag = true;
			if(!event){
				event = window.event;
				box.onselectstart = function(){
					return false;
				}  
			}
			var e = event;
			params.currentX = e.clientX;
			params.currentY = e.clientY;
			
			// 目标对象可能已经移动了位置, 所以在每次点击的时候刷新坐标
			if(thiz.getCss(box, "left") !== "auto"){
				params.left = thiz.getCss(box, "left");
			}
			if(thiz.getCss(box, "top") !== "auto"){
				params.top = thiz.getCss(box, "top");
			}
		};
		bar.addEventListener("mousedown", dragTargetFunc);
		
		var docMouseUpFunc = function(){
			params.flag = false;
		};
		document.addEventListener("mouseup", docMouseUpFunc);
		
		var docMouseMoveFunc = function(event){
			var e = event ? event: window.event;
			if(params.flag){
				var disX = e.clientX - params.currentX, disY = e.clientY - params.currentY;
				var left = parseInt(params.left) + disX, top = parseInt(params.top) + disY;
				var boxRect = thiz.getRect(box);
				var boxwidth = boxRect.right - boxRect.left, boxheight = boxRect.bottom - boxRect.top;
				box.style.left = (
					inscreen === true ? 
					(left < 0 ? 0 : ((left + boxwidth) > document.documentElement.clientWidth ? document.documentElement.clientWidth - boxwidth : left)) :
					left
				) + "px";
				
				box.style.top = (
					inscreen === true ? 
					(top < 0 ? 0 : ((top + boxheight) > document.documentElement.clientHeight ? document.documentElement.clientHeight - boxheight : top)) :
					top
				) + "px";
				
				if (event.preventDefault) {
					event.preventDefault();
				}
				return false;
			}
			
			if (typeof callback == "function") {
				callback(parseInt(params.left) + disX, parseInt(params.top) + disY, params);
			}
		};
		document.addEventListener("mousemove", docMouseMoveFunc);
		
		return {
			params: params,
			detach: function(){
				document.removeEventListener("mousedown", dragTargetFunc);
				document.removeEventListener("mouseup", docMouseUpFunc);
				document.removeEventListener("mousemove", docMouseMoveFunc);
			}
		};
	},

	/**
	 * 获取标签样式
	 * @param o 对象
	 * @param key 样式名称
	 * @returns
	 */
	getCss: function(o, key){
		return o.currentStyle ? o.currentStyle[key] : document.defaultView.getComputedStyle(o, false)[key]; 	
	},

	/**
	 * 获取元素绝对坐标
	 * @param element
	 * @returns
	 */
	getRect: function(element){
	    var rect = element.getBoundingClientRect();
	    return{
	        top: rect.top - document.documentElement.clientTop,
	        bottom: rect.bottom - document.documentElement.clientTop,
	        left: rect.left - document.documentElement.clientLeft,
	        right: rect.right - document.documentElement.clientLeft
	    };
	},
	
	/**
	 * 使所有图片可拖拽
	 */
	flushImages: function(){
		console.log("Liner -- 设置img标签可拖拽获取src!");
		var thiz = this;
		// 给所有图片绑定拖拽事件
		var images = document.body.getElementsByTagName("img");
		for(var i = 0; i < images.length; i++){
			images[i].setAttribute("draggable", "true");
			images[i].ondragstart = function(event) {
			    event.dataTransfer.setData("src", this.src);
			};
		}
	},
	
	/**
	 * 执行ignore.json中的需要额外执行的js
	 */
	doIgnoreJSON: function(){
		var thiz = this;
		
		// 获取github上最新的预设文件信息
		$.ajax({
			url:"https://raw.githubusercontent.com/AllenSnape/Liner/master/resource/ignore.json",
			type:"get",
			dataType:"json",
			success:function(data){
				try{
					thiz.doingIgnoreJSON(data);
				}catch(e){
					console.log("Liner -- "+e);
				}
			},
			error:function(e){
				console.log("Liner -- "+JSON.stringify(e));
			}
		});
	},
	/**
	 * doIgnoreJSON主要方法
	 */
	doingIgnoreJSON: function(data){
		try{
			// 改宽度至100px的标签
			for(var i = 0; i < data["class"].length; i++){
				var dumps = document.getElementsByClassName(data["class"][i]);
				for(var j = 0; j < dumps.length; j++){
					dumps[j].style.width = "100px";
				}
			}
			
			// 执行额外的js 
			for(var i = 0; i < data["extra_js"].length; i++){
				try{
					window.eval(data["extra_js"][i]);
				}catch(e){
					console.log("Liner -- extra_js -- " + e);
				}
			}
		}catch(e){
			console.log("Liner -- "+e);
		}
	}
};

(function(){
	Liner.init();
	console.log("Liner -- 初始化完成!");
})();

// 初始化操作
var onWindowLoaded = function(){
	Liner.flushImages();
	Liner.doIgnoreJSON();
	
	// 当窗口大小改变的时候, 重新定位图片读取器, 避免其逃出控制范围
	window.onresize = function(){
		var readzone = document.getElementById("v0_as_readzone");
		var readzoneRect = Liner.getRect(readzone);
		
		// 脱离左侧范围
		if(readzoneRect.right > document.documentElement.clientWidth){
			readzone.style.left = document.documentElement.clientWidth - (readzoneRect.right - readzoneRect.left) + "px";
		}
		
		// 脱离下部范围
		if(readzoneRect.bottom > document.documentElement.clientHeight){
			readzone.style.top = document.documentElement.clientHeight - (readzoneRect.bottom - readzoneRect.top) + "px";
		}
	}
}

if(document.readyState === "complete"){
	this.onWindowLoaded();
}else{
	window.onload = onWindowLoaded;
}

//注入页面消息接收端
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
	var json = JSON.parse(msg);
	// 设置相应对象
	switch(json.code){
		// 初始化操作
		case CODE_INIT:{
			var readzone = document.getElementById("v0_as_readzone");
			var laststatus = window.getComputedStyle(readzone).display;
			if(laststatus == "block")
				readzone.style.display = "none";
			else
				readzone.style.display = "block";
			sendResponse({result:1, message:"inited!", data:{laststatus:laststatus}});
		}; break;
		default : console.error("未知操作");
	}
});

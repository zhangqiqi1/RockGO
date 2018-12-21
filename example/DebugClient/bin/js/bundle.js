var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**This class is automatically generated by LayaAirIDE, please do not make any modifications. */
var NetTest_1 = require("./script/NetTest");
/*
* 游戏初始化配置;
*/
var GameConfig = /** @class */ (function () {
    function GameConfig() {
    }
    GameConfig.init = function () {
        var reg = Laya.ClassUtils.regClass;
        reg("script/NetTest.ts", NetTest_1.default);
    };
    GameConfig.width = 1136;
    GameConfig.height = 640;
    GameConfig.scaleMode = "showall";
    GameConfig.screenMode = "horizontal";
    GameConfig.alignV = "top";
    GameConfig.alignH = "left";
    GameConfig.startScene = "test/main.scene";
    GameConfig.sceneRoot = "";
    GameConfig.debug = false;
    GameConfig.stat = true;
    GameConfig.physicsDebug = true;
    GameConfig.exportSceneToJson = true;
    return GameConfig;
}());
exports.default = GameConfig;
GameConfig.init();
},{"./script/NetTest":3}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var GameConfig_1 = require("./GameConfig");
var Main = /** @class */ (function () {
    function Main() {
        //根据IDE设置初始化引擎		
        if (window["Laya3D"])
            Laya3D.init(GameConfig_1.default.width, GameConfig_1.default.height);
        else
            Laya.init(GameConfig_1.default.width, GameConfig_1.default.height, Laya["WebGL"]);
        Laya["Physics"] && Laya["Physics"].enable();
        Laya["DebugPanel"] && Laya["DebugPanel"].enable();
        Laya.stage.scaleMode = "all";
        Laya.stage.screenMode = GameConfig_1.default.screenMode;
        //兼容微信不支持加载scene后缀场景
        Laya.URL.exportSceneToJson = GameConfig_1.default.exportSceneToJson;
        //打开调试面板（通过IDE设置调试模式，或者url地址增加debug=true参数，均可打开调试面板）
        if (GameConfig_1.default.debug || Laya.Utils.getQueryString("debug") == "true")
            Laya.enableDebugPanel();
        if (GameConfig_1.default.physicsDebug && Laya["PhysicsDebugDraw"])
            Laya["PhysicsDebugDraw"].enable();
        if (GameConfig_1.default.stat)
            Laya.Stat.show();
        Laya.alertGlobalError = true;
        //激活资源版本控制，version.json由IDE发布功能自动生成，如果没有也不影响后续流程
        Laya.ResourceVersion.enable("version.json", Laya.Handler.create(this, this.onVersionLoaded), Laya.ResourceVersion.FILENAME_VERSION);
    }
    Main.prototype.onVersionLoaded = function () {
        //激活大小图映射，加载小图的时候，如果发现小图在大图合集里面，则优先加载大图合集，而不是小图
        Laya.AtlasInfoManager.enable("fileconfig.json", Laya.Handler.create(this, this.onConfigLoaded));
    };
    Main.prototype.onConfigLoaded = function () {
        //加载IDE指定的场景
        GameConfig_1.default.startScene && Laya.Scene.open(GameConfig_1.default.startScene);
    };
    return Main;
}());
//激活启动类
new Main();
},{"./GameConfig":1}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Event = Laya.Event;
var Socket = Laya.Socket;
var Byte = Laya.Byte;
var layaMaxUI_1 = require("../ui/layaMaxUI");
var NetTest = /** @class */ (function (_super) {
    __extends(NetTest, _super);
    function NetTest() {
        var _this = _super.call(this) || this;
        _this.btn_ConnectServer.on(Event.CLICK, _this, _this.connectToServer);
        _this.btn_CloseConnect.on(Event.CLICK, _this, _this.Close);
        _this.btn_Send.on(Event.CLICK, _this, _this.sendMessage);
        _this.btn_Login.on(Event.CLICK, _this, function () {
            this.messageType.text = "2";
            this.onChangeInput('{"Account":"zllang1"}');
        });
        _this.btn_Room.on(Event.CLICK, _this, function () {
            this.messageType.text = "2";
            this.onChangeInput('{"UID":123}');
        });
        return _this;
    }
    //连接服务器
    NetTest.prototype.connectToServer = function () {
        this.socket = new Socket();
        this.socket.connectByUrl(this.addr.text);
        this.output = this.socket.output;
        this.socket.on(Event.OPEN, this, this.onSocketOpen);
        this.socket.on(Event.CLOSE, this, this.onSocketClose);
        this.socket.on(Event.MESSAGE, this, this.onMessageReveived);
        this.socket.on(Event.ERROR, this, this.onConnectError);
    };
    NetTest.prototype.onSocketOpen = function () {
        console.log("Connected");
        this.Log("连接服务器成功");
    };
    NetTest.prototype.sendMessage = function () {
        // 使用output.writeByte发送
        var message = this.content.text;
        if (message == "") {
            alert("message can not be empty");
        }
        var mid = parseInt(this.messageType.text);
        var by = new Byte();
        by.endian = Byte.BIG_ENDIAN;
        by.writeUint32(mid);
        for (var i = 0; i < message.length; ++i) {
            by.writeByte(message.charCodeAt(i));
        }
        this.socket.send(by.buffer);
    };
    NetTest.prototype.onMessageReveived = function (message) {
        console.log("Message from server:");
        if (typeof message == "string") {
            this.Log(message);
        }
        else if (message instanceof ArrayBuffer) {
            var by = new Byte(message);
            by.endian = Byte.BIG_ENDIAN;
            var messageID = by.readUint32();
            var str = by.getCustomString(by.bytesAvailable);
            this.Log(str);
        }
        this.socket.input.clear();
    };
    NetTest.prototype.onChangeInput = function (str) {
        this.content.text = str;
    };
    NetTest.prototype.Close = function () {
        this.socket.close();
        this.Log("连接关闭");
    };
    NetTest.prototype.onSocketClose = function () {
        this.Log("连接关闭");
    };
    NetTest.prototype.onConnectError = function (e) {
        this.Log("连接错误");
    };
    NetTest.prototype.Log = function (str) {
        var time = new Date().toTimeString();
        this.log.text += (time + ": \n" + str + "\n");
        this.log.scrollTo(this.log.maxScrollY);
    };
    NetTest.prototype.onEnable = function () {
    };
    NetTest.prototype.onDisable = function () {
    };
    return NetTest;
}(layaMaxUI_1.ui.test.mainUI));
exports.default = NetTest;
},{"../ui/layaMaxUI":4}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Scene = Laya.Scene;
var ui;
(function (ui) {
    var test;
    (function (test) {
        var mainUI = /** @class */ (function (_super) {
            __extends(mainUI, _super);
            function mainUI() {
                return _super.call(this) || this;
            }
            mainUI.prototype.createChildren = function () {
                _super.prototype.createChildren.call(this);
                this.loadScene("test/main");
            };
            return mainUI;
        }(Scene));
        test.mainUI = mainUI;
    })(test = ui.test || (ui.test = {}));
})(ui = exports.ui || (exports.ui = {}));
},{}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL1Byb2dyYW0gRmlsZXMvTGF5YUFpcklERV9iZXRhL3Jlc291cmNlcy9hcHAvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInNyYy9HYW1lQ29uZmlnLnRzIiwic3JjL01haW4udHMiLCJzcmMvc2NyaXB0L05ldFRlc3QudHMiLCJzcmMvdWkvbGF5YU1heFVJLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ1ZBLGdHQUFnRztBQUNoRyw0Q0FBc0M7QUFDdEM7O0VBRUU7QUFDRjtJQWFJO0lBQWMsQ0FBQztJQUNSLGVBQUksR0FBWDtRQUNJLElBQUksR0FBRyxHQUFhLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDO1FBQzdDLEdBQUcsQ0FBQyxtQkFBbUIsRUFBQyxpQkFBTyxDQUFDLENBQUM7SUFDckMsQ0FBQztJQWhCTSxnQkFBSyxHQUFRLElBQUksQ0FBQztJQUNsQixpQkFBTSxHQUFRLEdBQUcsQ0FBQztJQUNsQixvQkFBUyxHQUFRLFNBQVMsQ0FBQztJQUMzQixxQkFBVSxHQUFRLFlBQVksQ0FBQztJQUMvQixpQkFBTSxHQUFRLEtBQUssQ0FBQztJQUNwQixpQkFBTSxHQUFRLE1BQU0sQ0FBQztJQUNyQixxQkFBVSxHQUFLLGlCQUFpQixDQUFDO0lBQ2pDLG9CQUFTLEdBQVEsRUFBRSxDQUFDO0lBQ3BCLGdCQUFLLEdBQVMsS0FBSyxDQUFDO0lBQ3BCLGVBQUksR0FBUyxJQUFJLENBQUM7SUFDbEIsdUJBQVksR0FBUyxJQUFJLENBQUM7SUFDMUIsNEJBQWlCLEdBQVMsSUFBSSxDQUFDO0lBTTFDLGlCQUFDO0NBbEJELEFBa0JDLElBQUE7a0JBbEJvQixVQUFVO0FBbUIvQixVQUFVLENBQUMsSUFBSSxFQUFFLENBQUM7Ozs7QUN4QmxCLDJDQUFzQztBQUN0QztJQUNDO1FBQ0MsZ0JBQWdC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QUFHLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDM0MsQ0FBQztJQUVELDBCQUFRLEdBQVI7SUFFQSxDQUFDO0lBRUQsMkJBQVMsR0FBVDtJQUNBLENBQUM7SUFDTCxjQUFDO0FBQUQsQ0FwR0EsQUFvR0MsQ0FwR29DLGNBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxHQW9HbEQ7Ozs7O0FDdEdELElBQU8sS0FBSyxHQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7QUFDeEIsSUFBYyxFQUFFLENBbUJmO0FBbkJELFdBQWMsRUFBRTtJQUFDLElBQUEsSUFBSSxDQW1CcEI7SUFuQmdCLFdBQUEsSUFBSTtRQUNqQjtZQUE0QiwwQkFBSztZQVk3Qjt1QkFBZSxpQkFBTztZQUFBLENBQUM7WUFDdkIsK0JBQWMsR0FBZDtnQkFDSSxpQkFBTSxjQUFjLFdBQUUsQ0FBQztnQkFDdkIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUNoQyxDQUFDO1lBQ0wsYUFBQztRQUFELENBakJBLEFBaUJDLENBakIyQixLQUFLLEdBaUJoQztRQWpCWSxXQUFNLFNBaUJsQixDQUFBO0lBQ0wsQ0FBQyxFQW5CZ0IsSUFBSSxHQUFKLE9BQUksS0FBSixPQUFJLFFBbUJwQjtBQUFELENBQUMsRUFuQmEsRUFBRSxHQUFGLFVBQUUsS0FBRixVQUFFLFFBbUJmIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgX19leHRlbmRzID0gKHRoaXMgJiYgdGhpcy5fX2V4dGVuZHMpIHx8IChmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgZXh0ZW5kU3RhdGljcyA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fFxyXG4gICAgICAgICh7IF9fcHJvdG9fXzogW10gfSBpbnN0YW5jZW9mIEFycmF5ICYmIGZ1bmN0aW9uIChkLCBiKSB7IGQuX19wcm90b19fID0gYjsgfSkgfHxcclxuICAgICAgICBmdW5jdGlvbiAoZCwgYikgeyBmb3IgKHZhciBwIGluIGIpIGlmIChiLmhhc093blByb3BlcnR5KHApKSBkW3BdID0gYltwXTsgfTtcclxuICAgIHJldHVybiBmdW5jdGlvbiAoZCwgYikge1xyXG4gICAgICAgIGV4dGVuZFN0YXRpY3MoZCwgYik7XHJcbiAgICAgICAgZnVuY3Rpb24gX18oKSB7IHRoaXMuY29uc3RydWN0b3IgPSBkOyB9XHJcbiAgICAgICAgZC5wcm90b3R5cGUgPSBiID09PSBudWxsID8gT2JqZWN0LmNyZWF0ZShiKSA6IChfXy5wcm90b3R5cGUgPSBiLnByb3RvdHlwZSwgbmV3IF9fKCkpO1xyXG4gICAgfTtcclxufSkoKTtcclxuKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIi8qKlRoaXMgY2xhc3MgaXMgYXV0b21hdGljYWxseSBnZW5lcmF0ZWQgYnkgTGF5YUFpcklERSwgcGxlYXNlIGRvIG5vdCBtYWtlIGFueSBtb2RpZmljYXRpb25zLiAqL1xyXG5pbXBvcnQgTmV0VGVzdCBmcm9tIFwiLi9zY3JpcHQvTmV0VGVzdFwiXHJcbi8qXHJcbiog5ri45oiP5Yid5aeL5YyW6YWN572uO1xyXG4qL1xyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHYW1lQ29uZmlne1xyXG4gICAgc3RhdGljIHdpZHRoOm51bWJlcj0xMTM2O1xyXG4gICAgc3RhdGljIGhlaWdodDpudW1iZXI9NjQwO1xyXG4gICAgc3RhdGljIHNjYWxlTW9kZTpzdHJpbmc9XCJzaG93YWxsXCI7XHJcbiAgICBzdGF0aWMgc2NyZWVuTW9kZTpzdHJpbmc9XCJob3Jpem9udGFsXCI7XHJcbiAgICBzdGF0aWMgYWxpZ25WOnN0cmluZz1cInRvcFwiO1xyXG4gICAgc3RhdGljIGFsaWduSDpzdHJpbmc9XCJsZWZ0XCI7XHJcbiAgICBzdGF0aWMgc3RhcnRTY2VuZTphbnk9XCJ0ZXN0L21haW4uc2NlbmVcIjtcclxuICAgIHN0YXRpYyBzY2VuZVJvb3Q6c3RyaW5nPVwiXCI7XHJcbiAgICBzdGF0aWMgZGVidWc6Ym9vbGVhbj1mYWxzZTtcclxuICAgIHN0YXRpYyBzdGF0OmJvb2xlYW49dHJ1ZTtcclxuICAgIHN0YXRpYyBwaHlzaWNzRGVidWc6Ym9vbGVhbj10cnVlO1xyXG4gICAgc3RhdGljIGV4cG9ydFNjZW5lVG9Kc29uOmJvb2xlYW49dHJ1ZTtcclxuICAgIGNvbnN0cnVjdG9yKCl7fVxyXG4gICAgc3RhdGljIGluaXQoKXtcclxuICAgICAgICB2YXIgcmVnOiBGdW5jdGlvbiA9IExheWEuQ2xhc3NVdGlscy5yZWdDbGFzcztcclxuICAgICAgICByZWcoXCJzY3JpcHQvTmV0VGVzdC50c1wiLE5ldFRlc3QpO1xyXG4gICAgfVxyXG59XHJcbkdhbWVDb25maWcuaW5pdCgpOyIsImltcG9ydCBHYW1lQ29uZmlnIGZyb20gXCIuL0dhbWVDb25maWdcIjtcclxuY2xhc3MgTWFpbiB7XHJcblx0Y29uc3RydWN0b3IoKSB7XHJcblx0XHQvL+agueaNrklEReiuvue9ruWIneWni+WMluW8leaTjlx0XHRcclxuXHRcdGlmICh3aW5kb3dbXCJMYXlhM0RcIl0pIExheWEzRC5pbml0KEdhbWVDb25maWcud2lkdGgsIEdhbWVDb25maWcuaGVpZ2h0KTtcclxuXHRcdGVsc2UgTGF5YS5pbml0KEdhbWVDb25maWcud2lkdGgsIEdhbWVDb25maWcuaGVpZ2h0LCBMYXlhW1wiV2ViR0xcIl0pO1xyXG5cdFx0TGF5YVtcIlBoeXNpY3NcIl0gJiYgTGF5YVtcIlBoeXNpY3NcIl0uZW5hYmxlKCk7XHJcblx0XHRMYXlhW1wiRGVidWdQYW5lbFwiXSAmJiBMYXlhW1wiRGVidWdQYW5lbFwiXS5lbmFibGUoKTtcclxuXHRcdExheWEuc3RhZ2Uuc2NhbGVNb2RlID0gXCJhbGxcIjtcclxuXHRcdExheWEuc3RhZ2Uuc2NyZWVuTW9kZSA9IEdhbWVDb25maWcuc2NyZWVuTW9kZTtcclxuXHRcdC8v5YW85a655b6u5L+h5LiN5pSv5oyB5Yqg6L29c2NlbmXlkI7nvIDlnLrmma9cclxuXHRcdExheWEuVVJMLmV4cG9ydFNjZW5lVG9Kc29uID0gR2FtZUNvbmZpZy5leHBvcnRTY2VuZVRvSnNvbjtcclxuXHJcblx0XHQvL+aJk+W8gOiwg+ivlemdouadv++8iOmAmui/h0lEReiuvue9ruiwg+ivleaooeW8j++8jOaIluiAhXVybOWcsOWdgOWinuWKoGRlYnVnPXRydWXlj4LmlbDvvIzlnYflj6/miZPlvIDosIPor5XpnaLmnb/vvIlcclxuXHRcdGlmIChHYW1lQ29uZmlnLmRlYnVnIHx8IExheWEuVXRpbHMuZ2V0UXVlcnlTdHJpbmcoXCJkZWJ1Z1wiKSA9PSBcInRydWVcIikgTGF5YS5lbmFibGVEZWJ1Z1BhbmVsKCk7XHJcblx0XHRpZiAoR2FtZUNvbmZpZy5waHlzaWNzRGVidWcgJiYgTGF5YVtcIlBoeXNpY3NEZWJ1Z0RyYXdcIl0pIExheWFbXCJQaHlzaWNzRGVidWdEcmF3XCJdLmVuYWJsZSgpO1xyXG5cdFx0aWYgKEdhbWVDb25maWcuc3RhdCkgTGF5YS5TdGF0LnNob3coKTtcclxuXHRcdExheWEuYWxlcnRHbG9iYWxFcnJvciA9IHRydWU7XHJcblxyXG5cdFx0Ly/mv4DmtLvotYTmupDniYjmnKzmjqfliLbvvIx2ZXJzaW9uLmpzb27nlLFJREXlj5HluIPlip/og73oh6rliqjnlJ/miJDvvIzlpoLmnpzmsqHmnInkuZ/kuI3lvbHlk43lkI7nu63mtYHnqItcclxuXHRcdExheWEuUmVzb3VyY2VWZXJzaW9uLmVuYWJsZShcInZlcnNpb24uanNvblwiLCBMYXlhLkhhbmRsZXIuY3JlYXRlKHRoaXMsIHRoaXMub25WZXJzaW9uTG9hZGVkKSwgTGF5YS5SZXNvdXJjZVZlcnNpb24uRklMRU5BTUVfVkVSU0lPTik7XHJcblx0fVxyXG5cclxuXHRvblZlcnNpb25Mb2FkZWQoKTogdm9pZCB7XHJcblx0XHQvL+a/gOa0u+Wkp+Wwj+WbvuaYoOWwhO+8jOWKoOi9veWwj+WbvueahOaXtuWAme+8jOWmguaenOWPkeeOsOWwj+WbvuWcqOWkp+WbvuWQiOmbhumHjOmdou+8jOWImeS8mOWFiOWKoOi9veWkp+WbvuWQiOmbhu+8jOiAjOS4jeaYr+Wwj+WbvlxyXG5cdFx0TGF5YS5BdGxhc0luZm9NYW5hZ2VyLmVuYWJsZShcImZpbGVjb25maWcuanNvblwiLCBMYXlhLkhhbmRsZXIuY3JlYXRlKHRoaXMsIHRoaXMub25Db25maWdMb2FkZWQpKTtcclxuXHR9XHJcblxyXG5cdG9uQ29uZmlnTG9hZGVkKCk6IHZvaWQge1xyXG5cdFx0Ly/liqDovb1JREXmjIflrprnmoTlnLrmma9cclxuXHRcdEdhbWVDb25maWcuc3RhcnRTY2VuZSAmJiBMYXlhLlNjZW5lLm9wZW4oR2FtZUNvbmZpZy5zdGFydFNjZW5lKTtcclxuXHR9XHJcbn1cclxuLy/mv4DmtLvlkK/liqjnsbtcclxubmV3IE1haW4oKTtcclxuIiwiaW1wb3J0IEV2ZW50ID0gTGF5YS5FdmVudDtcclxuaW1wb3J0IFNvY2tldCA9IExheWEuU29ja2V0O1xyXG5pbXBvcnQgQnl0ZSA9IExheWEuQnl0ZTtcclxuaW1wb3J0IHsgdWkgfSBmcm9tIFwiLi4vdWkvbGF5YU1heFVJXCI7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBOZXRUZXN0IGV4dGVuZHMgdWkudGVzdC5tYWluVUl7XHJcbiAgICBwcml2YXRlIHNvY2tldDpTb2NrZXQ7XHJcbiAgICBwcml2YXRlIG91dHB1dDpCeXRlO1xyXG4gICAgXHJcbiAgICBjb25zdHJ1Y3RvcigpIHsgXHJcbiAgICAgICAgc3VwZXIoKTsgXHJcbiAgICAgICAgdGhpcy5idG5fQ29ubmVjdFNlcnZlci5vbihFdmVudC5DTElDSyx0aGlzLHRoaXMuY29ubmVjdFRvU2VydmVyKTtcclxuICAgICAgICB0aGlzLmJ0bl9DbG9zZUNvbm5lY3Qub24oRXZlbnQuQ0xJQ0ssdGhpcyx0aGlzLkNsb3NlKTtcclxuICAgICAgICB0aGlzLmJ0bl9TZW5kLm9uKEV2ZW50LkNMSUNLLHRoaXMsdGhpcy5zZW5kTWVzc2FnZSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5idG5fTG9naW4ub24oRXZlbnQuQ0xJQ0ssIHRoaXMsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLm1lc3NhZ2VUeXBlLnRleHQgPVwiMlwiO1xyXG4gICAgICAgICAgICB0aGlzLm9uQ2hhbmdlSW5wdXQoJ3tcIkFjY291bnRcIjpcInpsbGFuZzFcIn0nKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmJ0bl9Sb29tLm9uKEV2ZW50LkNMSUNLLCB0aGlzLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5tZXNzYWdlVHlwZS50ZXh0ID1cIjJcIjtcclxuICAgICAgICAgICAgdGhpcy5vbkNoYW5nZUlucHV0KCd7XCJVSURcIjoxMjN9Jyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8v6L+e5o6l5pyN5Yqh5ZmoXHJcbiAgICBjb25uZWN0VG9TZXJ2ZXIoKTp2b2lke1xyXG4gICAgICAgIHRoaXMuc29ja2V0ID0gbmV3IFNvY2tldCgpO1xyXG4gICAgICAgIHRoaXMuc29ja2V0LmNvbm5lY3RCeVVybCh0aGlzLmFkZHIudGV4dCk7XHJcblxyXG4gICAgICAgIHRoaXMub3V0cHV0ID0gdGhpcy5zb2NrZXQub3V0cHV0O1xyXG5cclxuICAgICAgICB0aGlzLnNvY2tldC5vbihFdmVudC5PUEVOLCB0aGlzLCB0aGlzLm9uU29ja2V0T3Blbik7XHJcbiAgICAgICAgdGhpcy5zb2NrZXQub24oRXZlbnQuQ0xPU0UsIHRoaXMsIHRoaXMub25Tb2NrZXRDbG9zZSk7XHJcbiAgICAgICAgdGhpcy5zb2NrZXQub24oRXZlbnQuTUVTU0FHRSwgdGhpcywgdGhpcy5vbk1lc3NhZ2VSZXZlaXZlZCk7XHJcbiAgICAgICAgdGhpcy5zb2NrZXQub24oRXZlbnQuRVJST1IsIHRoaXMsIHRoaXMub25Db25uZWN0RXJyb3IpO1xyXG5cclxuICAgICAgICBcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG9uU29ja2V0T3BlbigpOiB2b2lkIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhcIkNvbm5lY3RlZFwiKTtcclxuICAgICAgICB0aGlzLkxvZyhcIui/nuaOpeacjeWKoeWZqOaIkOWKn1wiKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNlbmRNZXNzYWdlKCk6dm9pZHtcclxuICAgICAgICAvLyDkvb/nlKhvdXRwdXQud3JpdGVCeXRl5Y+R6YCBXHJcbiAgICAgICAgdmFyIG1lc3NhZ2U6IHN0cmluZyA9IHRoaXMuY29udGVudC50ZXh0O1xyXG4gICAgICAgIGlmIChtZXNzYWdlID09IFwiXCIpe1xyXG4gICAgICAgICAgICBhbGVydChcIm1lc3NhZ2UgY2FuIG5vdCBiZSBlbXB0eVwiKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIG1pZCA6bnVtYmVyID0gcGFyc2VJbnQodGhpcy5tZXNzYWdlVHlwZS50ZXh0KTtcclxuICAgICAgICB2YXIgYnk6Qnl0ZT1uZXcgQnl0ZSgpO1xyXG4gICAgICAgIGJ5LmVuZGlhbiA9IEJ5dGUuQklHX0VORElBTjtcclxuXHJcbiAgICAgICAgYnkud3JpdGVVaW50MzIobWlkKTtcclxuICAgICAgICBmb3IgKHZhciBpOiBudW1iZXIgPSAwOyBpIDwgbWVzc2FnZS5sZW5ndGg7ICsraSkge1xyXG4gICAgICAgICAgICBieS53cml0ZUJ5dGUobWVzc2FnZS5jaGFyQ29kZUF0KGkpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuc29ja2V0LnNlbmQoYnkuYnVmZmVyKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG9uTWVzc2FnZVJldmVpdmVkKG1lc3NhZ2U6IGFueSk6IHZvaWQge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwiTWVzc2FnZSBmcm9tIHNlcnZlcjpcIik7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBtZXNzYWdlID09IFwic3RyaW5nXCIpIHtcclxuICAgICAgICAgICAgdGhpcy5Mb2cobWVzc2FnZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKG1lc3NhZ2UgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcikge1xyXG4gICAgICAgICAgICB2YXIgYnk6Qnl0ZT1uZXcgQnl0ZShtZXNzYWdlKTtcclxuICAgICAgICAgICAgYnkuZW5kaWFuID0gQnl0ZS5CSUdfRU5ESUFOO1xyXG4gICAgICAgICAgICB2YXIgbWVzc2FnZUlEOm51bWJlciA9IGJ5LnJlYWRVaW50MzIoKTtcclxuICAgICAgICAgICAgdmFyIHN0ciA6c3RyaW5nID1ieS5nZXRDdXN0b21TdHJpbmcoYnkuYnl0ZXNBdmFpbGFibGUpO1xyXG4gICAgICAgICAgICB0aGlzLkxvZyhzdHIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnNvY2tldC5pbnB1dC5jbGVhcigpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgb25DaGFuZ2VJbnB1dChzdHI6c3RyaW5nKXtcclxuICAgICAgICB0aGlzLmNvbnRlbnQudGV4dCA9c3RyO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgQ2xvc2UoKTp2b2lke1xyXG4gICAgICAgIHRoaXMuc29ja2V0LmNsb3NlKCk7XHJcbiAgICAgICAgdGhpcy5Mb2coXCLov57mjqXlhbPpl61cIik7XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIG9uU29ja2V0Q2xvc2UoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5Mb2coXCLov57mjqXlhbPpl61cIik7XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIG9uQ29ubmVjdEVycm9yKGU6IEV2ZW50KTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5Mb2coXCLov57mjqXplJnor69cIik7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBMb2coc3RyOnN0cmluZyl7XHJcbiAgICAgICAgdmFyIHRpbWU6c3RyaW5nPW5ldyBEYXRlKCkudG9UaW1lU3RyaW5nKCk7XHJcbiAgICAgICAgdGhpcy5sb2cudGV4dCs9KHRpbWUrXCI6IFxcblwiK3N0citcIlxcblwiKTtcclxuICAgICAgICB0aGlzLmxvZy5zY3JvbGxUbyh0aGlzLmxvZy5tYXhTY3JvbGxZKTtcclxuICAgIH1cclxuXHJcbiAgICBvbkVuYWJsZSgpOiB2b2lkIHtcclxuICAgICAgICBcclxuICAgIH1cclxuXHJcbiAgICBvbkRpc2FibGUoKTogdm9pZCB7XHJcbiAgICB9XHJcbn0iLCIvKipUaGlzIGNsYXNzIGlzIGF1dG9tYXRpY2FsbHkgZ2VuZXJhdGVkIGJ5IExheWFBaXJJREUsIHBsZWFzZSBkbyBub3QgbWFrZSBhbnkgbW9kaWZpY2F0aW9ucy4gKi9cbmltcG9ydCBWaWV3PUxheWEuVmlldztcbmltcG9ydCBEaWFsb2c9TGF5YS5EaWFsb2c7XG5pbXBvcnQgU2NlbmU9TGF5YS5TY2VuZTtcbmV4cG9ydCBtb2R1bGUgdWkudGVzdCB7XHJcbiAgICBleHBvcnQgY2xhc3MgbWFpblVJIGV4dGVuZHMgU2NlbmUge1xyXG5cdFx0cHVibGljIGxpYW5qaWVmdXd1cWk6TGF5YS5TcHJpdGU7XG5cdFx0cHVibGljIGFkZHI6TGF5YS5UZXh0SW5wdXQ7XG5cdFx0cHVibGljIGJ0bl9Db25uZWN0U2VydmVyOkxheWEuQnV0dG9uO1xuXHRcdHB1YmxpYyBsb2c6TGF5YS5UZXh0QXJlYTtcblx0XHRwdWJsaWMgY29udGVudDpMYXlhLlRleHRJbnB1dDtcblx0XHRwdWJsaWMgYnRuX1NlbmQ6TGF5YS5CdXR0b247XG5cdFx0cHVibGljIGJ0bl9Mb2dpbjpMYXlhLkJ1dHRvbjtcblx0XHRwdWJsaWMgYnRuX1Jvb206TGF5YS5CdXR0b247XG5cdFx0cHVibGljIGJ0bl9PdGhlcjpMYXlhLkJ1dHRvbjtcblx0XHRwdWJsaWMgYnRuX0Nsb3NlQ29ubmVjdDpMYXlhLkJ1dHRvbjtcblx0XHRwdWJsaWMgbWVzc2FnZVR5cGU6TGF5YS5UZXh0SW5wdXQ7XG4gICAgICAgIGNvbnN0cnVjdG9yKCl7IHN1cGVyKCl9XHJcbiAgICAgICAgY3JlYXRlQ2hpbGRyZW4oKTp2b2lkIHtcclxuICAgICAgICAgICAgc3VwZXIuY3JlYXRlQ2hpbGRyZW4oKTtcclxuICAgICAgICAgICAgdGhpcy5sb2FkU2NlbmUoXCJ0ZXN0L21haW5cIik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHIiXX0=
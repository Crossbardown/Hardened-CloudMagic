if ("undefined" == typeof(CloudMagic)) {
  var CloudMagic = {};
};

CloudMagic.InterfaceLoader = function () {
    var self = this;
    var proto = CloudMagic.InterfaceLoader.prototype;

    self.cmextid = "cmExtNode";
    // VERSION_START //
	self.CMSCRIPTVER = "2_71_Beta";
	self.cmDebug = "0";
	self.CMHST = "www.cloudmagic.com";
	// VERSION_END //
    
    self.CMPTL = "https:";
    self.contentWindow = window;
    self.att = 1;

    proto.CMLOG = function (msg) {
        try {
            //if (window.top && window.top.console) {
            //window.top.console.log(message);
            //} else 
            if (console) {
                console.log(msg);
            }
        } catch (e) {
        }
    };

    proto.Inject = function (doc) {
        try {
            // Gmail has more than one iframe; 
            // Insert in all frames and execute only in #canvas_frame

            if (doc.getElementById(self.cmextid + "_initapp_js") && 
               !doc.getElementById("cmInterfacePlugin")) {
                var scriptnode = doc.getElementById(self.cmextid + "_initapp_js");
                if (scriptnode) {
                    scriptnode.parentNode.removeChild(scriptnode);
                }
                scriptnode = doc.getElementById(self.cmextid + "_app_css");
                if (scriptnode) {
                    scriptnode.parentNode.removeChild(scriptnode);
                }
                scriptnode = doc.getElementById(self.cmextid + "_print_css");
                if (scriptnode) {
                    scriptnode.parentNode.removeChild(scriptnode);
                }
                scriptnode = doc.getElementById(self.cmextid + "_app_js");
                if (scriptnode) {
                    scriptnode.parentNode.removeChild(scriptnode);
                }
            }

            if (!doc.getElementById(self.cmextid + "_initapp_js")) {
                self.CMPTL = window.location.protocol;
                // for debug
                if (self.cmDebug != "0") {
                    self.CMPTL = "http:";
                }
                var head = doc.getElementsByTagName("head")[0];

                var script = doc.createElement("script");
                script.type = "text/javascript";
                script.async = true;
                script.src = self.CMPTL + "//" + self.CMHST + "/res/" + self.CMSCRIPTVER +
                             "/php/initapp.php" + "?t=" + Number(new Date());
                script.setAttribute("id", self.cmextid + "_initapp_js");
                head.appendChild(script);
                return false;
            }
        } catch (e) {
            //alert(e);
            return false;
        }

        return true;

    };

    proto.InjectWrapper = function (doc, attempts) {
        attempts = attempts || 0;
        TRY_COUNT = 10;
        TRY_DELAY = 35000;

        try {
            if (self.Inject(doc) == true) {
                return;
            } else {
                if (attempts >= (TRY_COUNT - 1)) {
                    return;
                }
                var _arg = arguments;
                setTimeout(function () { _arg.callee.call(self, doc, ++attempts); }, TRY_DELAY);
            }
        } catch (e) {
        }
    };

    proto.OpenInTabHandler = function (doc) {
        if (doc.getElementById(self.cmextid + "_2")) {
            return;// already attached;
        }
        // Attachevent to handle open in a tab
        doc.addEventListener("CloudMagicOpenInTab",
                function (e) {
                    var url = e.target.getAttribute("CloudMagicOpenInTab_Param1");
                    chrome.extension.sendRequest({ requestType: "CloudMagicOpenInTab", openUrl: url }, function () { });
                },
                false,
                true);
        
    };
    
    // we can't hardcode extension uuid as it is different in extension published in our website and in Chrome gallery
    proto.FetchExtensionUUID = function(doc) {
        var protocol = "chrome-extension:";
        var bghtml = "background.html";
        var bgurl = chrome.extension.getURL(bghtml);
        var baseuuid = bgurl.substring(protocol.length + 2, bgurl.length - bghtml.length - 1);
        doc.body.setAttribute("CloudMagic_Ext_UUID", baseuuid);
        //alert("document.CloudMagic_Ext_UUID:"+doc.body.getAttribute("CloudMagic_Ext_UUID"));
    };

    proto.LoadInterface = function (attempts) {
        var ATTEMPTS = 30;
        var DELAY = 1000;
        try {
/*
            if (window.top != window) {
                return;
            }
*/
            if (window.location.pathname.indexOf("cloudmagic.php") != -1 ||
                window.location.pathname.indexOf("cloudmagic_debug.html") != -1 ||
                window.location.pathname.indexOf("cloudmagicgui.html") != -1) {
                self.OpenInTabHandler(document);
                self.FetchExtensionUUID(document);
                return;
            } else {
                var doc = document;
                if (window.location.href.indexOf("http://mail.google.com") != -1 ||
                    window.location.href.indexOf("https://mail.google.com") != -1) {
                    var canvas_frame = document.getElementById("canvas_frame");
                    if (canvas_frame) {
                        doc = canvas_frame.contentDocument;
                        self.contentWindow = canvas_frame.contentWindow;
                    }
                }

                if (doc && doc.body.hasAttribute("CloudMagic_Ext_UUID") == false &&(doc.getElementById('guser') || doc.getElementById('gbg'))) {
                    self.OpenInTabHandler(doc);
                    self.FetchExtensionUUID(doc);
                    self.InjectWrapper(doc);
                    return;
                }
            }
        } catch (e) {
            // alert(e);
            //console.log(e);
        }
        attempts = attempts || 0;
        if (attempts < ATTEMPTS) {
            var _arg = arguments;
            setTimeout(function () { _arg.callee.call(self, ++attempts); }, DELAY);
        }
    };
};


var cloudmagicinterfaceloader = new CloudMagic.InterfaceLoader();
cloudmagicinterfaceloader.LoadInterface();


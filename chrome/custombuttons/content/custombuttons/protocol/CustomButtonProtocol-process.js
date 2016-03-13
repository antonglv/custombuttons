/* -*- mode: js; tab-width: 4; indent-tabs-mode: t; js-indent-level: 4; js-switch-indent-offset: 4 -*- */

function LOG (msg) {
	msg = JSON. stringify (msg);
	var head = "----------------------------------------------------------------------";
	var body = "-                                                                    -";
	var msgbody = body. split ("");
	var j = 3;
	for (var i = 0; i < msg. length; i++) {
		if (j == 67) {
			msgbody [j] = "…";
			break;
		}
		msgbody [j++] = msg. charAt (i);
	}
	var r = [head, body, msgbody. join (""), body, head, ""]. join ("\n");
	dump(r);
}

LOG (this instanceof Components. interfaces. nsIContentProcessMessageManager);
LOG (typeof this);

Components.utils.import("resource://gre/modules/Services.jsm");
if(Services.appinfo.processType == Services.appinfo.PROCESS_TYPE_CONTENT) {
	Components.utils.import("chrome://custombuttons/content/protocol/CustomButtonProtocol.jsm");
	protocol.register(this);
}

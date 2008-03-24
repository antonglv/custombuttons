#include <project.hjs>

var custombutton =
{
    buttonConstructor: function (oBtn)
	{
		var cbd = SERVICE (CB_KEYMAP);
		cbd. Delete (oBtn. getAttribute ("id"));
		if (oBtn. hasAttribute ("cb-accelkey"))
		{
			cbd. Add
			(
				oBtn. getAttribute ("id"),
				oBtn. getAttribute ("cb-accelkey"),
				(oBtn. cbMode & CB_MODE_DISABLE_DEFAULT_KEY_BEHAVIOR)? true: false
			);
		}
		if (oBtn. hasAttribute ("cb-oncommand"))
			oBtn. cbCommand = oBtn. getAttribute ("cb-oncommand");
		if (oBtn. hasAttribute ("image"))
		{
			if (!oBtn. getAttribute ("image") ||
				(oBtn. getAttribute ("image") == "data:"))
			oBtn. removeAttribute ("image");
		}
		if (oBtn. hasAttribute ("Help"))
		{
			if (!oBtn. getAttribute ("Help"))
				oBtn. removeAttribute ("Help");
		}
		if (!oBtn. hasAttribute ("initialized"))
		{
			if (oBtn. hasAttribute ("cb-init"))
			{
				var ps = SERVICE (PREF). getBranch ("custombuttons.");
				var mode = ps. getIntPref ("mode");
				if ((oBtn. parentNode. nodeName != "toolbar") &&
					((mode & CB_MODE_DISABLE_INIT_IN_CTDIALOG_GLOBAL) ||
					!(oBtn. cbMode & CB_MODE_ENABLE_INIT_IN_CTDIALOG)))
				return;
				oBtn. cbInitCode = oBtn. getAttribute ("cb-init");
				oBtn. init ();
			}
			else
			{
				oBtn. setAttribute ("cb-init", "");
				oBtn. setAttribute ("initialized", "true");
			}
		}
	},
    
	buttonDestructor: function(oBtn)
	{
		if (oBtn. hasAttribute ("cb-accelkey"))
		{
			var cbd = SERVICE (CB_KEYMAP);
			cbd. Delete (oBtn. getAttribute ("id"));
		}
	},
	
	checkBind: function()
	{
		if (Function. prototype. bind == undefined)
		{
			Function. prototype. bind = function (object)
			{
				var method = this;
				return function ()
				{
					return method. apply (object, arguments);
				}
			}
		}
	},
	
	buttonInit: function(oBtn)
	{
		if (oBtn. cbInitCode)
		{
			while (oBtn. hasChildNodes ())
				oBtn. removeChild (oBtn. childNodes [0]);
			oBtn. _initPhase = true;
			this. buttonCbExecuteCode ({}, oBtn, oBtn. cbInitCode);
			oBtn. _initPhase = false;
		}
		oBtn. setAttribute ("initialized", "true");
	},
	
	buttonGetParameters: function(oBtn)
	{
		return {
			name:		oBtn. name,
			image:		oBtn. image,
			code:		oBtn. cbCommand,
			initCode:	oBtn. cbInitCode,
			accelkey:	oBtn. cbAccelKey,
			mode:		oBtn. cbMode,
			Help:		oBtn. Help
		};
	},
	
	buttonGetCbAccelKey: function(oBtn)
	{
		if (oBtn. hasAttribute ("cb-accelkey"))
			return oBtn. getAttribute ("cb-accelkey");
		return "";
	},
	
	buttonGetImage: function(oBtn)
	{
		if (oBtn. hasAttribute ("image"))
			return oBtn. getAttribute ("image");
		return "";
	},
	
	buttonGetHelp: function(oBtn)
	{
		if (oBtn. hasAttribute ("Help"))
			return oBtn. getAttribute ("Help");
		return "";
	},
	
	buttonGetCbMode: function(oBtn)
	{
		if (oBtn. hasAttribute ("cb-mode"))
			return oBtn. getAttribute ("cb-mode");
		return 0;
	},
	
	buttonGetOldFormatURI: function(oBtn)
	{
		var uri = "custombutton://" + escape
		(
			[
				oBtn. name,
				oBtn. image,
				oBtn. cbCommand,
				oBtn. cbInitCode
			]. join ("][")
		);
		return uri;
	},
	
	midFormatURI: function(oBtn)
	{
		var uri = "custombutton://" + escape
		(
			[
				oBtn. name,
				oBtn. image,
				oBtn. cbCommand,
				oBtn. cbInitCode,
				oBtn. Help
			]. join ("]▲[")
		);
		return uri;
	},
	
	buttonSetText: function(doc, nodeName, text, make_CDATASection)
	{
		var node = doc. getElementsByTagName (nodeName) [0], cds;
		if (!node)
			return;
		if (make_CDATASection)
		{
			cds = doc. createCDATASection (text || "");
			node. appendChild (cds);
		}
		else
		{
			node. textContent = text;
		}
	},
	
	
	xmlFormatURI: function(oBtn)
	{
		var doc = document. implementation. createDocument ("", "", null);
		doc. async = false;
		doc. load ("chrome://custombuttons/content/nbftemplate.xml");
		oBtn. setText (doc, "name",		oBtn. name, false);
		oBtn. setText (doc, "mode",		oBtn. cbMode, false);
		oBtn. setText (doc, "image",	oBtn. image, true);
		oBtn. setText (doc, "code",		oBtn. cbCommand, true);
		oBtn. setText (doc, "initcode",	oBtn. cbInitCode, true);
		oBtn. setText (doc, "accelkey",	oBtn. cbAccelKey, true);
		oBtn. setText (doc, "help",		oBtn. Help, true);
		var ser = new XMLSerializer ();
		var data = ser. serializeToString (doc);
		return "custombutton://" + escape (data);
	},
	
	buttonGetURI: function (oBtn)
	{
		var ps = Components. classes ["@mozilla.org/preferences-service;1"].
		getService (Components. interfaces. nsIPrefService).
		getBranch ("custombuttons.");
		var mode = ps. getIntPref ("mode");
		if (mode & CB_MODE_USE_XML_BUTTON_FORMAT)
			return this. xmlFormatURI (oBtn);
		else if (mode & CB_MODE_USE_CB2_OLD_BUTTON_FORMAT)
			return this. midFormatURI (oBtn);
		else
			return this. buttonGetOldFormatURI (oBtn);
	},
		
	buttonCbExecuteCode: function (event, oButton, code)
	{
		var scode = "var event = arguments [0];\n" + code;
		this. checkBind ();
		try
		{
			(new Function (scode)). apply (oButton, [event]);
		}
		catch (oError)
		{
			if (oError. stack)
			{
				var n1 = oError. lineNumber;
				var aStack = oError. stack. split ("\n");
				var aMatch;
				for (var i = 0; i < aStack. length; i++)
				{
					aMatch = aStack [i]. match (/\(\[.*?\],\[.*?\],".*"\)@.*\:(\d+)$/);
					if (aMatch)
						break;
				}
				var n2 = aMatch? aMatch [1]: 0;
				var oCBError = new Error ();
				oCBError. name = oError. name;
				oCBError. message = oError. message;
				var sFakeFileName = "custombutton://buttons/";
				sFakeFileName += oButton. _initPhase? "init/": "code/";
				oCBError. fileName = sFakeFileName + oButton. id;
				oCBError. lineNumber = n1 - n2;
				oCBError. stack = aStack. splice (0, i? (i - 1): 0). join ("\n");
				throw (oCBError);
			}
			else
				throw (oError);
		}
	},
	
	// TODO: check for code evaluation construction. Carefully check.
	buttonCommand: function(event, oBtn)
	{
		if (oBtn. cbCommand)
			this. buttonCbExecuteCode (event, oBtn, oBtn. cbCommand);
	}
};

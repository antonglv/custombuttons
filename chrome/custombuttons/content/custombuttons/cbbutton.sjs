#include <project.hjs>

var custombutton =
{
	cbService: SERVICE (CB),

    buttonConstructor: function (oBtn)
	{
		if (oBtn. destroy)
			oBtn. destroy ("constructor"); // to call onDestroy method, if exists
	        var windowId = this. cbService. getWindowId (document. documentURI);
		var cbd = SERVICE (CB_KEYMAP);
		cbd. Delete (windowId, oBtn. getAttribute ("id"));
		if (!oBtn. hasAttribute ("cb-name"))
		{
			if (oBtn. hasAttribute ("label"))
				oBtn. name = oBtn. getAttribute ("label");
		}
		if (oBtn. hasAttribute ("cb-accelkey"))
		{
			cbd. Add
			(
			    	windowId,
				oBtn. getAttribute ("id"),
				oBtn. getAttribute ("cb-accelkey"),
				(oBtn. cbMode & CB_MODE_DISABLE_DEFAULT_KEY_BEHAVIOR)? true: false
			);
		}
		if (oBtn. hasAttribute ("cb-oncommand"))
			oBtn. cbCommand = oBtn. getAttribute ("cb-oncommand");
		if (oBtn. hasAttribute ("image"))
		{
		    oBtn. image = oBtn. getAttribute ("image");
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
				var mode = this. cbService. mode;
				if (mode & CB_MODE_DISABLE_INITIALIZATION) // disable initialization
				    return;
				if (oBtn. parentNode && (oBtn. parentNode. nodeName != "toolbar"))
					return;
				oBtn. cbInitCode = oBtn. getAttribute ("cb-init");
				setTimeout (function () { oBtn. init (); }, 0);
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
		    	var windowId = this. cbService. getWindowId (document. documentURI);
			var cbd = SERVICE (CB_KEYMAP);
			cbd. Delete (windowId, oBtn. getAttribute ("id"));
		}
		if (oBtn. destroy)
			oBtn. destroy ("destructor");
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
			oBtn. setAttribute ("initializeerror");
			try
			{
				this. buttonCbExecuteCode ({}, oBtn, oBtn. cbInitCode);
				oBtn. setAttribute ("initialized", "true");
				oBtn. removeAttribute ("initializeerror");
			}
			finally
			{
				oBtn. _initPhase = false;
			}
		}
	},

	buttonDestroy: function (oBtn, reason)
	{
	    while (oBtn. _handlers. length != 0)
	    {
		oBtn. _handlers [0]. unregister ();
		oBtn. _handlers. shift ();
	    }
		if (oBtn. onDestroy)
		{
			try
			{
				oBtn. onDestroy (reason);
			}
			catch (e) {}
			oBtn. onDestroy = null;
		}
	},

	buttonGetParameters: function(oBtn)
	{
		var parameters = {
			name:		oBtn. name,
			image:		oBtn. image,
			code:		oBtn. cbCommand,
			initCode:	oBtn. cbInitCode,
			accelkey:	oBtn. cbAccelKey,
			mode:		oBtn. cbMode,
			Help:		oBtn. Help,
			stdIcon:	oBtn. cbStdIcon
		};
		if (custombuttons. lightning && oBtn. hasAttribute ("mode"))
		{
			parameters. attributes = {};
			parameters. attributes ["mode"] = oBtn. getAttribute ("mode");
		}
		return parameters;
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

	buttonSetText: function(doc, nodeName, text, make_CDATASection)
	{
		var node = doc. getElementsByTagName (nodeName) [0], cds;
		if (!node)
			return;
		if (make_CDATASection)
		{
			try
			{
				cds = doc. createCDATASection (text || "");
			}
			catch (e)
			{
				cds = doc. createTextNode (text || "");
			}
			node. appendChild (cds);
		}
		else
		{
			node. textContent = text;
		}
	},

	setAttribute: function (oDocument, sName, sValue)
	{
		var attsNode = oDocument. getElementsByTagName ("attributes") [0];
		var attr = oDocument. createElement ("attribute");
		attr. setAttribute ("name", sName);
		attr. setAttribute ("value", sValue);
		attsNode. appendChild (attr);
	},

	xmlFormatURI: function(oBtn)
	{
	    	var xr = new XMLHttpRequest ();
	    	xr. open ("GET", "chrome://custombuttons/content/nbftemplate.xml", false);
	    	xr. send (null);
	    	var doc = xr. responseXML;
		oBtn. setText (doc, "name",		oBtn. name, false);
		oBtn. setText (doc, "mode",		oBtn. cbMode, false);
		oBtn. setText (doc, "image",	oBtn. image || oBtn. cbStdIcon, true);
		oBtn. setText (doc, "code",		oBtn. cbCommand, true);
		oBtn. setText (doc, "initcode",	oBtn. cbInitCode, true);
		oBtn. setText (doc, "accelkey",	oBtn. cbAccelKey, true);
		oBtn. setText (doc, "help",		oBtn. Help, true);
		if (oBtn. parameters. attributes)
		{
			var atts = oBtn. parameters. attributes;
			for (var i in atts)
				this. setAttribute (doc, i, atts [i]);
		}
		var ser = new XMLSerializer ();
		var data = ser. serializeToString (doc);
		return "custombutton://" + escape (data);
	},

	buttonGetURI: function (oBtn)
	{
		return this. xmlFormatURI (oBtn);
	},

    buildExecutionContext: function (oButton, uri, executionContext)
    {
	var utils = {};
	utils ["oButton"] = oButton;
	utils ["buttonURI"] = uri;
	SERVICE (JS_SUBSCRIPT_LOADER). loadSubScript ("chrome://custombuttons/content/contextBuilder.js", utils);
	delete utils. oButton;
	delete utils. buttonURI;
	for (var i in utils)
	{
	    executionContext. argNames += "," + i;
	    executionContext. args. push (utils [i]);
	}
    },

	buttonCbExecuteCode: function (event, oButton, code)
	{
	    this. checkBind ();
	    var execurl = "chrome://custombuttons/content/button.js?windowId=";
	    execurl += this. cbService. getWindowId (document. documentURI) + "&id=";
	    execurl += oButton. id + "@";
	    execurl += oButton. _initPhase? "init": "code";
	    var executionContext = {};
	    executionContext ["oButton"] = oButton;
	    executionContext ["code"] = code;
	    executionContext ["argNames"] = "event";
	    executionContext ["args"] = [event];
	    this. buildExecutionContext (oButton, execurl, executionContext);
	    SERVICE (JS_SUBSCRIPT_LOADER). loadSubScript (execurl, executionContext);
	},

	// TODO: check for code evaluation construction. Carefully check.
	buttonCommand: function(event, oBtn)
	{
		if (oBtn. cbCommand)
			this. buttonCbExecuteCode (event, oBtn, oBtn. cbCommand);
	},

	canUpdate: function ()
	{
		return this. cbService. canUpdate ();
	},

	showElement: function (oElement, bShowFlag)
	{
		if (oElement. hasAttribute ("hidden"))
			oElement. removeAttribute ("hidden");
		if (!bShowFlag)
			oElement. setAttribute ("hidden", "true");
	},

	showBroadcast: function (sIdSuffix, bShowFlag)
	{
		var sBroadcasterId = "custombuttons-contextbroadcaster-" + sIdSuffix;
		var oBroadcaster = ELEMENT (sBroadcasterId);
		if (oBroadcaster)
			this. showElement (oBroadcaster, bShowFlag);
	},

	setContextMenuVisibility: function (oButton)
	{
		this. showBroadcast ("root", false); // hide all buttons menuitems
		this. showBroadcast ("update", true);
		this. showBroadcast ("help", true);
		this. showBroadcast ("customizeseparator", true);
		var bPrimary = !oButton. _ctxtObj;
		this. showBroadcast ("primary", bPrimary);
		this. showBroadcast ("secondary", !bPrimary);
		var nCurrentNum = oButton. id. replace (/custombuttons-button/, "");
		var sCurrentBroadcasterId = "custombuttons-buttonbroadcaster" + nCurrentNum;
		var oCurrentBroadcaster = ELEMENT (sCurrentBroadcasterId);
		var bHideUpdate = !this. canUpdate ();
		var bHideHelp = !this. buttonGetHelp (oButton);
		var bHideSeparator = bHideUpdate && bHideHelp && !ELEMENT ("custombuttons-contextpopup-bookmarkButton");
		if (oCurrentBroadcaster)
			this. showElement (oCurrentBroadcaster, !bPrimary);
		if (bHideUpdate)
			this. showBroadcast ("update", false);
		if (bHideHelp)
			this. showBroadcast ("help", false);
		if (bHideSeparator)
			this. showBroadcast ("customizeseparator", false);
	},

	onMouseDown: function (oEvent, oButton)
	{
		this. setContextMenuVisibility (oButton);
	},

    allowedSource: function (src)
    {
	return this. cbService. allowedSource (src);
    }
};

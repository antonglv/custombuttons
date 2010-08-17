// ***** BEGIN LICENSE BLOCK *****
// Version: MPL 1.1
//
// The contents of this file are subject to the Mozilla Public License Version
// 1.1 (the "License"); you may not use this file except in compliance with
// the License. You may obtain a copy of the License at
// http://www.mozilla.org/MPL/
//
// Software distributed under the License is distributed on an "AS IS" basis,
// WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
// for the specific language governing rights and limitations under the
// License.
//
// Custom Buttons:
// - Gives a possibility to create custom toolbarbuttons.
// - This component is intended to provide common extension's service
//
// Author: Anton Glazatov (c) 2009
//
// ***** END LICENSE BLOCK *****

#include <project.hjs>
#include <prio.hjs>

function allowedSource (src)
{
    var res = true;
    if (src. indexOf ("custombuttons-stdicon") == 0)
	return res;
    var ios = SERVICE (IO);
    try
    {
	var scheme = ios. extractScheme (src);
	var pfs = ios. getProtocolFlags (scheme);
	if (pfs & Components. interfaces. nsIProtocolHandler. URI_DOES_NOT_RETURN_DATA)
	    res = false;
    }
    catch (e)
    {
	res = false; // malformed URI
    }
    return res;
}

function makeSupportsArray ()
{
	var array = COMPONENT (SUPPORTS_ARRAY);
	var elt;
	for (var i = 0; i < arguments. length; i++)
	{
		elt = COMPONENT (SUPPORTS_STRING);
		elt. data = arguments [i];
		array. AppendElement (elt);
	}
	return array;
}

function getParamBlock ()
{
	return {
		windowId: "",
		id: "",
		name: "",
		image: "",
		code: "",
		initCode: "",
		accelkey: "",
		mode: 0,
		help: "",
		newButton: false,
	    updateButton: false
	};
}

function ImageConverter (imageURL, id, topic)
{
    this. topic = topic;
    this. id = id;
    if (!allowedSource (imageURL))
    {
	var array = makeSupportsArray ("", "");
	var os = SERVICE (OBSERVER);
	os. notifyObservers (array, this. topic, this. id);
	return;
    }
    this. imageURL = imageURL;
    var ios = SERVICE (IO);
    this. channel = ios. newChannel (imageURL, null, null);
    this. channel. notificationCallbacks = this;
    this. channel. asyncOpen (this, null);
}
ImageConverter. prototype =
{
	topic: "",
	id: "",
	imageURL: "",
    countRead: null,
    channel: null,
    bytes: [],
    stream: null,
    data: "",

	// nsISupports
	QueryInterface: function (iid)
    {
        if (!iid. equals (CI. nsISupports) &&
            !iid. equals (CI. nsIInterfaceRequestor) &&
            !iid. equals (CI. nsIRequestObserver) &&
            !iid. equals (CI. nsIStreamListener) &&
			!iid. equals (CI. nsIProgressEventSink))
        {
            throw NS_ERROR (NO_INTERFACE);
        }
        return this;
    },

    // nsIInterfaceRequestor
    getInterface: function (iid)
    {
        return this. QueryInterface (iid);
    },

    // nsIRequestObserver
    onStartRequest: function (aRequest, aContext)
    {
        this. stream = COMPONENT (BINARY_INPUT_STREAM);
    },

	onStopRequest: function (aRequest, aContext, aStatusCode)
    {
    	var array = makeSupportsArray (this. channel. contentType, String. fromCharCode. apply (null, this. bytes));
		this. channel = null;
		var os = SERVICE (OBSERVER);
		os. notifyObservers (array, this. topic, this. id);
    },

    // nsIStreamListener
    onDataAvailable: function (aRequest, aContext, aInputStream, aOffset, aCount)
    {
        this. stream. setInputStream (aInputStream);
        var chunk = this. stream. readByteArray (aCount);
        this. bytes = this. bytes. concat (chunk);
    },

    // nsIProgressEventSink
	onProgress: function (aRequest, aContext, progress, progressMax) {},
	onStatus: function (aRequest, aContext, status, statusArg) {}
};

function Overlay (path, fileName)
{
	this. path = path;
	this. fileName = fileName;
}
Overlay. prototype =
{
	path: "",
	fileName: "",
	_overlayDocument: null,

	get overlayDocument ()
	{
		if (!this. _overlayDocument)
		{
			var ios = SERVICE (IO);
			var uri = this. path + this. fileName;
			var xulchan = ios. newChannel (uri, null, null);
			var instr = xulchan. open ();
			var dp = COMPONENT (DOM_PARSER);
			this. _overlayDocument = dp. parseFromStream (instr, null, instr. available (), "application/xml");
		}
		return this. _overlayDocument;
	},

	getNumber: function (id)
	{
		if (id. indexOf ("custombuttons-button") != -1)
			return id. substring ("custombuttons-button". length);
		return "";
	},

	minButtonNumber: function (paletteId)
	{
		var palette = this. overlayDocument. getElementById (paletteId);
		var bt = new Object ();
		var buts = palette. childNodes;
		var butscount = buts. length;
		var n, id;
		for (var j = 0; j < butscount; j++)
		{
			if (buts [j]. nodeName == "#text")
				continue;
			id = buts [j]. getAttribute ("id");
			n = this. getNumber (id);
			if (n)
				bt [n] = true;
		}
		var z = 0;
		while (typeof bt [z] != "undefined")
			z++;
		return z;
	},

	saveOverlayToProfile: function ()
	{
		var serializer = COMPONENT (DOM_SERIALIZER);
		var data = serializer. serializeToString (this. overlayDocument);

		//beautifull output
		try
		{
			var oldPrettyPrinting = XML. prettyPrinting;
			XML. prettyPrinting = true;
			data = (new XML (data)). toXMLString ();
			XML. prettyPrinting = oldPrettyPrinting;
		}
		catch (e) {}

		var uniConv = COMPONENT (SCRIPTABLE_UNICODE_CONVERTER);
		uniConv. charset = "utf-8";
		data = uniConv. ConvertFromUnicode (data);

		var dir = SERVICE (PROPERTIES). get ("ProfD", CI. nsIFile); // get profile folder
		dir. append ("custombuttons");
		if (!dir. exists ())
		{
			try
			{
				dir. create (DIRECTORY_TYPE, 0755);
			}
			catch (e)
			{
				var msg = 'Custom Buttons error.]' +
				'[ Event: Creating custombuttons directory]' +
				'[ ' + e;
				Components. utils. reportError (msg);
			}
		}

		var file = dir. clone ();
		file. append (this. fileName);
		if (file. exists ())
		{
			//creating backup
			var backupfile = dir. clone ();
			var backupfileName = this. fileName + ".bak";
			backupfile. append (backupfileName);
			if (backupfile. exists ())
				backupfile. remove (false);
			file. copyTo (dir, backupfileName);
		}

		var foStream = COMPONENT (FILE_OUTPUT_STREAM);
		var flags = PR_WRONLY | PR_CREATE_FILE | PR_TRUNCATE;
		foStream. init (file, flags, 0664, 0);
		foStream. write (data, data. length);
		foStream. close ();
	}
};

function AppObject (sWindowId, overlayPath)
{
	if (overlayPath)
		this. overlayPath = overlayPath;
	this. windowId = sWindowId;
}
AppObject. prototype =
{
	_windowId: "",
	overlayPath: "resource://custombuttons/",
	overlayFileName: "",
	paletteId: "",
	_palette: null,
	notificationPrefix: "",
	overlay: null,

	set windowId (val)
	{
		var info = SERVICE (XUL_APP_INFO);
		if (!val)
			val = info. name;
		this. _windowId = val;
		switch (val)
		{
			case "Firefox":
			case "SeaMonkey":
			case "Browser":
				this. overlayFileName = "buttonsoverlay.xul";
				this. paletteId = "BrowserToolbarPalette";
				this. notificationPrefix = "custombuttons:69423527-65a1-4b8f-bd7a-29593fc46d27:";
				break;
			case "SeaMonkeyMail":
			case "Thunderbird":
				this. overlayFileName = "buttonsoverlay.xul";
				this. paletteId = "MailToolbarPalette";
				this. notificationPrefix = "custombuttons:69423527-65a1-4b8f-bd7a-29593fc46d28:";
				break;
			case "SeaMonkeyMailWindow":
			case "ThunderbirdMailWindow":
				this. overlayFileName = "mwbuttonsoverlay.xul";
				this. paletteId = "MailToolbarPalette";
				this. notificationPrefix = "custombuttons:69423527-65a1-4b8f-bd7a-29593fc46d29:";
				this. _windowId = "ThunderbirdMailWindow";
				break;
			case "SeaMonkeyComposeWindow":
			case "ThunderbirdComposeWindow":
				this. overlayFileName = "mcbuttonsoverlay.xul";
				this. paletteId = "MsgComposeToolbarPalette";
				this. notificationPrefix = "custombuttons:69423527-65a1-4b8f-bd7a-29593fc46d2a:";
				this. _windowId = "ThunderbirdComposeWindow";
				break;
			case "Sunbird":
				this. overlayFileName = "buttonsoverlay.xul";
				this. paletteId = "calendarToolbarPalette";
				this. notificationPrefix = "custombuttons:69423527-65a1-4b8f-bd7a-29593fc46d27:";
				break;
			case "KompoZer":
				this. overlayFileName = "buttonsoverlay.xul";
				this. paletteId = "NvuToolbarPalette";
				this. notificationPrefix = "custombuttons:69423527-65a1-4b8f-bd7a-29593fc46d27:";
		}
		this. overlay = new Overlay (this. overlayPath, this. overlayFileName);
	},

	get palette ()
	{
		if (!this. _palette)
			this. _palette = this. overlay. overlayDocument. getElementById (this. paletteId);
		return this. _palette;
	},

	getNewID: function ()
	{
		var minButtonNumber = this. overlay. minButtonNumber (this. paletteId);
		return "custombuttons-button" + minButtonNumber;
	},

	getButton: function (sButtonId)
	{
		var doc = this. overlay. overlayDocument;
		var palette = doc. getElementById (this. paletteId);
		var overlayButton = palette. getElementsByAttribute ("id", sButtonId) [0];
		return overlayButton;
	},

	createNewButton: function ()
	{
		var doc = this. overlay. overlayDocument;
		return doc. createElement ("toolbarbutton");
	},

	saveButtonToOverlay: function (button)
	{
		var doc = this. overlay. overlayDocument;
		var palette = doc. getElementById (this. paletteId);
		var id = button. getAttribute ("id");
		var overlayButton = palette. getElementsByAttribute ("id", id) [0];
		if (overlayButton)
			palette. removeChild (overlayButton);
		palette. appendChild (button);
		this. overlay. saveOverlayToProfile ();
	},

	notifyObservers: function (oSubject, sTopic, sData)
	{
		var os = SERVICE (OBSERVER);
		os. notifyObservers (oSubject, this. notificationPrefix + sTopic, sData);
	}
};

function CustombuttonsURIParser (uri)
{
	this. parse (uri);
}
CustombuttonsURIParser. prototype =
{
	doc: null,
	parameters: {},

	getText: function (nodeName)
	{
		var result = "";
		var node = this. doc. getElementsByTagName (nodeName) [0];
		if (!node)
			return result;
		if (!node. firstChild || (node. firstChild &&
            (node. firstChild. nodeType == node. TEXT_NODE)))
			result = node. textContent;
		else // CDATA
			result = unescape (node. firstChild. textContent);
		return result;
	},

	parse: function (uri)
	{
		var sProtocolPrefix = "custombutton:";
		if (uri. indexOf (sProtocolPrefix) == 0)
			uri = uri. substring (sProtocolPrefix. length);
		var button_code = unescape (uri);
		if (button_code. substring (0, 2) == "//")
			button_code = button_code. substring (2);
		var values = getParamBlock ();
		values. newButton = true;
		if (button_code. indexOf ("<?xml ") == 0)
		{
			var xp = COMPONENT (DOM_PARSER);
			this. doc = xp. parseFromString (button_code, "text/xml");
		        if (this. doc. documentElement. namespaceURI == "http://www.mozilla.org/newlayout/xml/parsererror.xml")
			    THROW ("Malformed custombutton:// URI");
			values. name	 = this. getText ("name");
			values. mode	 = this. getText ("mode");
			values. image	 = this. getText ("image") ||
							   this. getText ("stdicon") || "";
			values. code	 = this. getText ("code");
			values. initCode = this. getText ("initcode");
			values. accelkey = this. getText ("accelkey");
		        values. help = this. getText ("help");
			var attsNode = this. doc. getElementsByTagName ("attributes") [0];
			if (attsNode)
			{
				values. attributes = {};
				var attr, aName, aValue;
				for (var i = 0; i < attsNode. childNodes. length; i++)
				{
					attr = attsNode. childNodes [i];
					aName = attr. getAttribute ("name");
					aValue = attr. getAttribute ("value");
					values. attributes [aName] = aValue;
				}
			}
		}
		else
		{
			var az = ["%5D%E2%96%B2%5B", "]\u00e2\u0096\u00b2[", "\x5d\u25b2\x5b", "%5D%u25B2%5B"], idx = -1;
            for ( var i = 0; i < az.length; i++) {
                idx = (idx >= 0)? idx : (( button_code.indexOf(az[i]) != -1 )? i : idx);
            } // End for
            var sep = (idx >= 0)? az[idx] : "][";
            var ar =  button_code.split( sep );             // Split button
            if (ar.length >= 3) // some old buttons may have only 3 fields
            {
                values. name	 = ar [0] || "";
                values. image	 = ar [1] || "";
                values. code	 = ar [2] || "";
                values. initCode = ar [3] || "";
                values. help     = ar [4] || "";
            }
            else {
                THROW ("Malformed custombutton:// URI");
			}
		}
        this. parameters = values;
	}
};

function cbCustomButtonsService () {}
cbCustomButtonsService. prototype =
{
	_refcount: 0,
	_ps: null,

	get ps ()
	{
		if (!this. _ps)
		{
			var pbs = SERVICE (PREF);
			pbs = pbs. QI (nsIPrefBranch);
			this. _ps = pbs. getBranch ("extensions.custombuttons.");
		}
		return this. _ps;
	},

    get mode ()
    {
	return this. ps. getIntPref ("mode");
    },

    set mode (val)
    {
	this. ps. setIntPref ("mode", val);
    },

	QueryInterface: function (iid)
    {
        if (!iid. equals (CI. cbICustomButtonsService) &&
            !iid. equals (CI. nsIObserver) &&
			!iid. equals (CI. nsISupportsWeakReference) &&
            !iid. equals (CI. nsISupports))
            throw NS_ERROR (NO_INTERFACE);
        return this;
    },

    register: function (win)
    {
        this. _refcount++;
	},

    editors: [],

    closeEditorDialogs: function ()
	{
		var mode = this. ps. getIntPref ("mode");
		if (mode & CB_MODE_DO_NOT_CLOSE_EDITORS_ON_APPLICATION_CLOSE)
			return;
		for (var i = 0; i < this. editors. length; i++)
		{
			try
			{
				this. editors [i]. close ();
			} catch (e) {}
		}
	},

	unregister: function ()
	{
		this. _refcount--;
		if (this. _refcount == 0)
			this. closeEditorDialogs ();
	},

	getButtonParameters: function (buttonLink)
	{
		var link = this. parseButtonLink (buttonLink);
		var app = new AppObject (link. windowId);
		var param = getParamBlock ();
		param. buttonLink = buttonLink;
		param. windowId = link. windowId;
		if (!link. buttonId)
			param. newButton = true;
		var button = app. getButton (link. buttonId);
		if (button)
		{
			param. id = button. getAttribute ("id");
			param. name = button. getAttribute ("name") ||
						  button. getAttribute ("label") || "";
			param. image = button. getAttribute ("image") ||
						   button. getAttribute ("cb-stdicon") || "";
			param. code = button. getAttribute ("cb-oncommand") || "";
			param. initCode = button. getAttribute ("cb-init") || "";
			param. accelkey = button. getAttribute ("cb-accelkey") || "";
			param. mode = button. getAttribute ("cb-mode") || 0;
			param. help = button. getAttribute ("Help") || "";
		}
		else
			param. newButton = true;
		if (link. line)
		{
			var editorParameters = makeSupportsArray (link. phase, link. line);
			param ["editorParameters"] = editorParameters;
		}
		param. wrappedJSObject = param;
		return param;
	},

	editButton: function (opener, buttonLink, param)
	{
		var oButtonParameters = this. getButtonParameters (buttonLink);
		if (param)
		{
			for (var i in param. wrappedJSObject)
				oButtonParameters. wrappedJSObject [i] = param. wrappedJSObject [i];
		}
		this. openEditor (opener, oButtonParameters. windowId, oButtonParameters);
	},

    getEditorId: function (uri, param)
    {
	var sEditorId = "custombuttons-editor@" + uri + ":";
	sEditorId += param. id || param. name || (new Date (). valueOf ());
	return sEditorId;
    },

    findEditor: function (opener, uri, param)
    {
	var sEditorId = this. getEditorId (uri, param);
	var wws = SERVICE (WINDOW_WATCHER);
	var cbedw = wws. getWindowByName (sEditorId, opener);
	return cbedw;
    },

	openEditor: function (opener, uri, param)
	{
		var cbedw = this. findEditor (opener, uri, param);
	    	var wws = SERVICE (WINDOW_WATCHER);
	    	var sEditorId = this. getEditorId (uri, param);
		param. wrappedJSObject = param;
		if (cbedw)
		{
			cbedw. focus ();
			var app = new AppObject (param. windowId);
			app. notifyObservers (param, "setEditorParameters", "");
		}
		else
		{
			cbedw = wws. openWindow
			(
				opener,
				"chrome://custombuttons/content/editor.xul",
				sEditorId,
				"chrome,resizable,dialog=no",
				param
			);
			this. editors. push (cbedw);
		}
	},

	makeButton: function (button, param)
	{
		button. setAttribute ("id", param. id);
		button. setAttribute ("label", param. name || "");
		button. setAttribute ("tooltiptext", param. name || "");
		button. setAttribute ("class", "toolbarbutton-1 chromeclass-toolbar-additional");
		button. setAttribute ("context", "custombuttons-contextpopup");
		if (param. image. indexOf ("custombuttons-stdicon") == 0)
			button. setAttribute ("cb-stdicon", param. image);
		else if (allowedSource (param. image))
			button. setAttribute ("image", param. image || "");
	    else
		button. setAttribute ("image", "");
		button. setAttribute ("cb-oncommand", param. code || "");
		button. setAttribute ("cb-init", param. initCode || "");
		if (param. accelkey)
			button. setAttribute ("cb-accelkey", param. accelkey);
		button. setAttribute ("cb-mode", param. mode);
		if (param. help)
			button. setAttribute ("Help", param. help);
		if (param. attributes)
		{
			for (var i in param. attributes)
				button. setAttribute (i, param. attributes [i]);
		}
	},

	installButton: function (param)
	{
		param = param. wrappedJSObject;
		var app = new AppObject (param. windowId);
		var button = app. createNewButton ();
		if (!param. id)
			param. id = app. getNewID ();
		this. makeButton (button, param);
		app. saveButtonToOverlay (button);
		app. notifyObservers (button, param. newButton? "installButton": "updateButton", "");
		if (param. newButton)
			this. alert ("ButtonAddedAlert");
	},

	updateButton: function (buttonLink, uri)
	{
		var parameters = this. getButtonParameters (buttonLink);
		parameters = parameters. wrappedJSObject;
		var param = this. parseButtonURI (uri);
		if (!param)
		{
			this. alert ("ButtonErrors");
			return 1; // Cancel
		}
		param = param. wrappedJSObject;
		var ps = SERVICE (PROMPT);
		var msg = this. getLocaleString ("UpdateConfirm"). replace (/%s/, parameters. name);
		msg = msg. replace (/%n/, param. name);
	    	var link = this. parseButtonLink (buttonLink);
	    	param. newButton = false;
	    	param. windowId = link. windowId;
	    	param. id = link. buttonId;
	    	param ["updateButton"] = true;
	    	param. wrappedJSObject = param;
	    	var sEditButtonLabel = this. getLocaleString ("OpenInEditor");
	    	var buttonFlags = (ps. BUTTON_POS_0 * ps. BUTTON_TITLE_OK) |
				  (ps. BUTTON_POS_2 * ps. BUTTON_TITLE_IS_STRING) |
				  (ps. BUTTON_POS_1 * ps. BUTTON_TITLE_CANCEL);
	    	var checkState = { value: false };
	    	var res = ps. confirmEx (null, "Custom Buttons", msg, buttonFlags, "", "", sEditButtonLabel, null, checkState);
	    	if (res == 1) // Cancel pressed
		    return res;
	    	if ((res == 2) || this. findEditor (null, param. windowId, param)) // Edit... pressed or Ok pressed and Editor already opened
		    this. openEditor (null, param. windowId, param);
	    	else
		    this. installButton (param);
	    	return res;
	},

	getLocaleString: function (stringId)
	{
		var ls = SERVICE (LOCALE);
		var appLocale = ls. getApplicationLocale ();
		var sbs = SERVICE (STRING_BUNDLE);
		var sb = sbs. createBundle ("chrome://custombuttons/locale/custombuttons.properties", appLocale);
		return sb. GetStringFromName (stringId);
	},

	alert: function (msgId)
	{
		var msg = this. getLocaleString (msgId);
		var ps = SERVICE (PROMPT);
		ps. alert (null, "Custom Buttons", msg);
	},

	convertImageToRawData: function (windowId, buttonId, imageURL)
	{
		var topic = this. getNotificationPrefix (windowId) + "updateImage";
		var converter = new ImageConverter (imageURL, buttonId, topic);
	},

	getNotificationPrefix: function (windowId)
	{
		var app = new AppObject (windowId);
		return app. notificationPrefix;
	},

	parseButtonURI: function (uri)
	{
		try
		{
			var param = new CustombuttonsURIParser (uri). parameters;
			param. wrappedJSObject = param;
			return param;
		}
		catch (e)
		{
			return null;
		}
	},

	cloneButton: function (clonedButton)
	{
		var documentURI = clonedButton. ownerDocument. documentURI;
		var buttonId = clonedButton. getAttribute ("id");
		var parentId = clonedButton. parentNode. getAttribute ("id");
		var windowId = this. getWindowId (documentURI);
		var app = new AppObject (windowId);
		var button = app. getButton (buttonId);
		var newId = app. getNewID ();
		var newButton = button. cloneNode (true);
		newButton. setAttribute ("id", newId);
		app. notifyObservers (newButton, "cloneButton", parentId + ":" + buttonId);
		app. saveButtonToOverlay (newButton);
		return newId;
	},

	removeButton: function (removedButton, removeFromOverlay)
	{
		var documentURI = removedButton. ownerDocument. documentURI;
		var buttonId = removedButton. getAttribute ("id");
		var parentId = removedButton. parentNode. getAttribute ("id");
		var windowId = this. getWindowId (documentURI);
		var app = new AppObject (windowId);
		var button = app. getButton (buttonId);
		if (button && removeFromOverlay)
		{
			button. parentNode. removeChild (button);
			app. overlay. saveOverlayToProfile ();
		}
		app. notifyObservers (null, "removeButton", parentId + ":" + buttonId);
	},

	makeOverlay: function ()
	{
		var app = new AppObject ("", "chrome://custombuttons/content/");
		try
		{
			var numbers = this. ps. getChildList ("button", {});
			if (numbers. length > 0)
			{
				var data, param, button, i, id;
				var palette = app. palette;
				for (i = 0; i < numbers. length; i++)
				{
					id = "custombuttons-" + numbers [i];
					data = this. ps. getComplexValue (numbers [i], CI. nsISupportsString). data;
					param = this. parseButtonURI (data);
					if (param)
					{
						param = param. wrappedJSObject;
						param. id = id;
						button = app. createNewButton ();
						this. makeButton (button, param);
						palette. appendChild (button);
					}
				}
			}
		}
		finally
		{
			try
			{
				app. overlay. saveOverlayToProfile ();
			}
			finally
			{
				for (var i = 0; i < numbers. length; i++)
					this. ps. deleteBranch (numbers [i]);
			}
		}
	},

	installWebButton: function (parameters, buttonURI, showConfirmDialog)
	{
		var param = this. parseButtonURI (buttonURI);
		if (!param)
		{
			this. alert ("ButtonErrors");
			return false;
		}
		param = param. wrappedJSObject;
		if (parameters)
		{
			parameters = parameters. wrappedJSObject;
			param. windowId = parameters. windowId;
			param. attributes = parameters. attributes;
		}
		var res = 0;
		if (showConfirmDialog)
		{
			var msg = this. getLocaleString ("InstallConfirm"). replace (/%s/gi, param. name);
			var sEditButtonLabel = this. getLocaleString ("OpenInEditor");
			var ps = SERVICE (PROMPT);
			var buttonFlags = (ps. BUTTON_POS_0 * ps. BUTTON_TITLE_OK) |
							  (ps. BUTTON_POS_2 * ps. BUTTON_TITLE_IS_STRING) |
							  (ps. BUTTON_POS_1 * ps. BUTTON_TITLE_CANCEL);
			var checkState = { value: false };
			res = ps. confirmEx (null, "Custom Buttons", msg, buttonFlags, "", "", sEditButtonLabel, null, checkState);
		}
		if (res == 0) // Ok pressed
			this. installButton (param);
		else if (res == 2) // Edit... pressed
			this. openEditor (null, buttonURI, param);
		return true;
	},

	readFromClipboard: function ()
	{
		var str = {};
		var strLength = {};
		var result = "";
		try
		{
			var clip  = SERVICE (CLIPBOARD);
			var kGlobalClipboard = clip. kGlobalClipboard;
			var trans = COMPONENT (TRANSFERABLE);
			trans. addDataFlavor ("text/unicode");
			clip. getData (trans, kGlobalClipboard);
			trans. getTransferData ("text/unicode", str, strLength);
			if (str. value instanceof CI. nsISupportsString)
				result = str. value. data;
		} catch (e) {}
		return result;
	},

	writeToClipboard: function (str)
	{
		var clipid = Components. interfaces. nsIClipboard. kGlobalClipboard;
		var ch = SERVICE (CLIPBOARD_HELPER);
		ch. copyStringToClipboard (str, clipid);
	},

	alert2: function (msg)
	{
		var ps = SERVICE (PROMPT);
		ps. alert (null, "Custom Buttons", msg);
	},

	canUpdate: function ()
	{
		var param = this. parseButtonURI (this. readFromClipboard ());
		return param? true: false;
	},

	getWindowId: function (documentURI)
	{
		var info = SERVICE (XUL_APP_INFO);
		var windowId = info. name;
		if (info. name == "Thunderbird")
		{
			if (documentURI == "chrome://messenger/content/messageWindow.xul")
				windowId += "MailWindow";
			else if (documentURI == "chrome://messenger/content/messengercompose/messengercompose.xul")
				windowId += "ComposeWindow";
		}
		else if (info. name == "SeaMonkey")
		{
			if (documentURI == "chrome://messenger/content/messenger.xul")
				windowId += "Mail";
			else if (documentURI == "chrome://messenger/content/messageWindow.xul")
				windowId += "MailWindow";
			else if (documentURI == "chrome://messenger/content/messengercompose/messengercompose.xul")
				windowId += "ComposeWindow";
		}
		return windowId;
	},

	makeButtonLink: function (documentURI, action, buttonId)
	{
		var windowId = this. getWindowId (documentURI);
		var res = "custombutton://buttons/" + windowId + "/";
		if (action)
			res += action + "/";
		if (buttonId)
			res += buttonId;
		return res;
	},

	parseButtonLink: function (buttonLink)
	{
		var arr = buttonLink. split ("/");
		var res = {};
		res. windowId = arr [3];
		res. phase	  = arr [4];
		res. buttonId = arr [5];
		if (res. buttonId)
		{
			var id = res. buttonId. split ("#");
			res. buttonId = id [0];
			res. line = id [1];
		}
		return res;
	},

	observe: function (subject, topic, data)
	{
		switch (topic)
		{
			case "app-startup":
				var os = SERVICE (OBSERVER);
				os. addObserver (this, "profile-after-change", true);
				break;
			case "profile-after-change":
				var ios = SERVICE (IO);
				var rph = ios. getProtocolHandler ("resource"). QI (nsIResProtocolHandler);
				var dir = SERVICE (PROPERTIES). get ("ProfD", CI. nsIFile);
				dir. append ("custombuttons");
				var file = dir. clone ();
				file. append ("buttonsoverlay.xul");
				if (!file. exists ())
					this. makeOverlay ();
				var info = SERVICE (XUL_APP_INFO);
				if ((info. name == "SeaMonkey") ||
				    (info. name == "Thunderbird"))
				{
				    var ovl, doc;
				    file = dir. clone ();
				    file. append ("mwbuttonsoverlay.xul");
				    if (!file. exists ())
				    {
					ovl = new Overlay ("chrome://custombuttons/content/", "buttonsoverlay.xul");
					doc = ovl. overlayDocument;
					ovl. fileName = "mwbuttonsoverlay.xul";
					ovl. saveOverlayToProfile ();
				    }
				    file = dir. clone ();
				    file. append ("mcbuttonsoverlay.xul");
				    if (!file. exists ())
				    {
					ovl = new Overlay ("chrome://custombuttons/content/", "buttonsoverlay.xul");
					doc = ovl. overlayDocument;
					ovl. fileName = "mcbuttonsoverlay.xul";
					ovl. saveOverlayToProfile ();
				    }
				}
				var uri = ios. newFileURI (dir);
				rph. setSubstitution ("custombuttons", uri);
				break;
		}
	},

    allowedSource: function (src)
    {
	return allowedSource (src);
    }
};

var Module =
{
    CLSID: CID ("{64d03940-83bc-4ac6-afc5-3cbf6a7147c5}"),
    ContractID: CB_SERVICE_CID,
    ComponentName: "Custom Buttons extension service",
    canUnload: function (componentManager) { return true; },
    getClassObject: function (componentManager, cid, iid)
    {
	if (!cid. equals (this. CLSID))
	    THROW (NO_INTERFACE);
	if (!iid. equals (Components. interfaces. nsIFactory))
	    THROW (NOT_IMPLEMENTED);
	return this. CLASS_FACTORY;
    },

    unregisterSelf: function ()
    {
	var cm = SERVICE (CATEGORY_MANAGER);
	cm. deleteCategoryEntry ("app-startup", "service," + this. ContractID, true);
    },

    firstTime: true,
    registerSelf: function (compMgr, fileSpec, location, type)
    {
        if (this. firstTime)
            this. firstTime = false;
        else
	    THROW (FACTORY_REGISTER_AGAIN);
        compMgr = compMgr. QueryInterface (Components. interfaces. nsIComponentRegistrar);
        compMgr. registerFactoryLocation
	(
	    this. CLSID, this. ComponentName, this. ContractID,
	    fileSpec, location, type
	);
        var cm = SERVICE (CATEGORY_MANAGER);
	cm. addCategoryEntry ("app-startup", this. ComponentName, "service," + this. ContractID, true, true);
    },

    DEFINE_STD_CLASS_FACTORY (cbCustomButtonsService)
};

DEFINE_STD_NS_GET_MODULE (Module)
DEFINE_STD_NS_GET_FACTORY (Module. CLASS_FACTORY)

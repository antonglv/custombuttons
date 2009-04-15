#include <project.hjs>
#include <filepicker.hjs>

function Editor () {}
Editor. prototype =
{
	opener: null,
	cbService: null,
	notificationPrefix: "",
	param: {},
	CNSISS: CI. nsISupportsString,
	tempId: "",
	
	QueryInterface: function (iid)
	{
		if (iid. equals (CI. nsIObserver) ||
			iid. equals (CI. nsIWeakReference) ||
			iid. equals (CI. nsISupports))
			return this;
		return NS_ERROR (NO_INTERFACE);
	},
	
	QueryReferent: function (iid)
	{
		return this. QueryInterface (iid);
	},
	
	init: function ()
	{
		this. cbService = SERVICE (CB);
		if (!window. arguments || !window. arguments [0])
		{
			var ios = SERVICE (IO);
			var url = ios. newURI (document. documentURI, null, null);
			url = url. QI (nsIURL);
			var q = url. query || "";
			var windowId = q. match (/&?window=(\w*?)&?/);
			var buttonId = q. match (/&?id=(custombuttons-button\d+)&?/);
			var info = SERVICE (XUL_APP_INFO);
			windowId = windowId? windowId [1]: info. name;
			if (windowId. indexOf (info. name) != 0)
				windowId = info. name;
			buttonId = buttonId? buttonId [1]: "";
			var link = "custombutton://buttons/" + windowId + "/edit/" + buttonId;
			this. param = this. cbService. getButtonParameters (link). wrappedJSObject;
		}
		else
			this. param = window. arguments [0]. wrappedJSObject;
		this. notificationPrefix = this. cbService. getNotificationPrefix (this. param. windowId);
		var os = SERVICE (OBSERVER);
		os. addObserver (this, this. notificationPrefix + "updateImage", false);
		os. addObserver (this, this. notificationPrefix + "setEditorParameters", false);
		this. setValues ();
		ELEMENT ("name"). focus ();
		if (this. param. editorParameters)
			this. setEditorParameters (this. param);
		this. tempId = this. param. id || (new Date (). valueOf ());
		var ps = SERVICE (PREF). getBranch ("custombuttons.");
		var cbMode = ps. getIntPref ("mode");
		var sab = cbMode & CB_MODE_SHOW_APPLY_BUTTON;
		if (this. param. newButton || !sab)
		{
			document. documentElement. getButton ("extra2"). setAttribute ("hidden", "true");
			ELEMENT ("cbUpdateButtonCommand"). setAttribute ("disabled", "true");
		}
	},
	
	setEditorParameters: function (param)
	{
		var editorParameters = param. wrappedJSObject. editorParameters;
		if (editorParameters instanceof CI. nsISupportsArray)
		{
			window. focus ();
			var phase = editorParameters. GetElementAt (0). QI (nsISupportsString);
			var lineNumber = parseInt (editorParameters. GetElementAt (1). QI (nsISupportsString));
			var tabbox = ELEMENT ("custombuttons-editbutton-tabbox");
			tabbox. selectedIndex = (phase == "code")? 0: 1;
			var textboxId = (phase == "code")? "code": "initCode";
			var textbox = ELEMENT (textboxId);
			textbox. focus ();
			textbox. selectLine (lineNumber);
			textbox. scrollTo (lineNumber);
		}
	},
	
	setValues: function ()
	{
		var field;
		for (var v in this. param)
		{
			var field = ELEMENT (v);
			if (field && this. param [v])
				field. value = this. param [v];
		}
		ELEMENT ("code"). editor. transactionManager. clear ();
		ELEMENT ("initCode"). editor. transactionManager. clear ();
		var mode = this. param. mode;
		ELEMENT ("initInCustomizeToolbarDialog"). checked = mode && (mode & CB_MODE_ENABLE_INIT_IN_CTDIALOG) || false;
		ELEMENT ("disableDefaultKeyBehavior"). checked = mode && (mode & CB_MODE_DISABLE_DEFAULT_KEY_BEHAVIOR) || false;
		if (this. param. newButton)
			document. title = this. cbService. getLocaleString ("AddButtonEditorDialogTitle");
		if (this. param. name)
			document. title += ": " + this. param. name;
		else if (this. param. id)
			document. title += ": " + this. param. id;
	},
	
	updateButton: function ()
	{
		var uri = ELEMENT ("urlfield-textbox"). value;
		if (uri)
		{
			if (this. param. newButton)
			{
				return this. cbService. installWebButton (this. param, uri, true);
			}
			else
			{
				var link = this. cbService. makeButtonLink (this. param. windowId, "update", this. param. id);
				return this. cbService. updateButton (link, uri);
			}
		}
		var field;
		for (var v in this. param)
		{
			field = ELEMENT (v);
			if (field)
				this. param [v] = field. value;
		}
		this. param ["mode"] = ELEMENT ("initInCustomizeToolbarDialog"). checked? CB_MODE_ENABLE_INIT_IN_CTDIALOG: 0;
		this. param ["mode"] |= ELEMENT ("disableDefaultKeyBehavior"). checked? CB_MODE_DISABLE_DEFAULT_KEY_BEHAVIOR: 0;
		this. cbService. installButton (this. param);
		return true;
	},
	
	onAccept: function ()
	{
		if (this. updateButton ())
		{
			this. destroy ();
			return true;
		}
		return false;
	},
	
	selectImage: function ()
	{
		var fp = COMPONENT (FILE_PICKER);
		fp. init (window, "Select an image", 0);
		fp. appendFilters (fp. filterImages);
		var res = fp. show ();
		if (res == fp. returnOK)
			ELEMENT ("image"). value = fp. fileURL. spec;
	},
	
	execute_oncommand_code: function ()
	{
		var box = ELEMENT ("code");
		var code = box. value;
		var opener = window. opener;
		if (!opener)
		{
			try
			{
				opener = window. QI (nsIInterfaceRequestor).
						 getInterface (CI. nsIWebNavigation).
						 QI (nsIDocShellTreeItem).
						 rootTreeItem. QI (nsIInterfaceRequestor).
						 getInterface (CI. nsIDOMWindow);
			}
			catch (e) {};

		}
		if (opener)
		{
			var CB = opener. custombuttons;
			if (CB)
			{
				var doc = opener. document;
				var button = doc. getElementById (this. param. id);
				if (button)
					CB. execute_oncommand_code (code, button);
				else
					this. cbService. alert ("ButtonDoesntExist");
				window. focus ();
			}
		}
	},
	
	observe: function (subject, topic, data)
	{
		if (topic == this. notificationPrefix + "updateImage")
		{
			if ((data == this. param. id) ||
				(data == this. tempId))
			{
				var array = subject. QI (nsISupportsArray);
				var contentType = array. GetElementAt (0). QI (nsISupportsString);
				var dataString = array. GetElementAt (1). QI (nsISupportsString);
				ELEMENT ("image"). value = MAKE_DATA_URI (contentType. data, dataString. data);
			}
		}
		else if (topic == this. notificationPrefix + "setEditorParameters")
		{
			var param = subject. wrappedJSObject;
			if (this. param. id == param. id)
				this. setEditorParameters (subject);
		}
	},
	
	imageChanged: function ()
	{
		if (!this. param. id || !this. notificationPrefix)
			return;
		var image_input = ELEMENT ("image");
		var aURL = COMPONENT (SUPPORTS_STRING);
		aURL. data = image_input. value;
		var os = SERVICE (OBSERVER);
		os. notifyObservers (aURL, this. notificationPrefix + "updateIcon", this. param. id);
	},
	
	convert_image: function ()
	{
		var image_input = ELEMENT ("image");
		var aURL = image_input. value;
		if (aURL. indexOf ("custombuttons-stdicon") == 0)
		{
			aURL = window. getComputedStyle (image_input, null). getPropertyValue ("list-style-image");
			if (aURL. indexOf ("url(") == 0)
				aURL = aURL. substring (4, aURL. length - 1);
			else
				aURL = "";
		}
		this. cbService. convertImageToRawData (this. param. windowId, this. param. id || this. tempId, aURL);
	},
	
	destroy: function ()
	{
		var os = SERVICE (OBSERVER);
		os. removeObserver (this, this. notificationPrefix + "setEditorParameters");
		os. removeObserver (this, this. notificationPrefix + "updateImage");
	}
};

var editor = new Editor ();

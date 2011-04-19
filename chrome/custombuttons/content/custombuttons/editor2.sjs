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
		    iid. equals (CI. nsIDOMEventListener) ||
		    iid. equals (CI. nsIEditorObserver) ||
			iid. equals (CI. nsIWeakReference) ||
			iid. equals (CI. nsISupports))
			return this;
		return NS_ERROR (NO_INTERFACE);
	},

    _changed: false,

    get saveButton ()
    {
	return document. documentElement. getButton ("extra2");
    },

    get changed ()
    {
	return this. _changed;
    },

    set changed (val)
    {
	if (val && !this. _changed)
	    document. title = "* " + document. title;
	else if (!val && this. _changed)
	    document. title = document. title. replace (/^\* /, "");
	this. _changed = val;
	if (val)
	    this. saveButton. removeAttribute ("disabled");
	else
	    this. saveButton. setAttribute ("disabled", "true");
    },

    /* nsIEditorObserver */
    EditAction: function ()
    {
	var codeEditor = ELEMENT ("code");
	var initEditor = ELEMENT ("initCode");
	var helpEditor = ELEMENT ("help");
	if (codeEditor. changed ||
	    initEditor. changed ||
	    helpEditor. changed)
	    this. changed = true;
	else
	    this. changed = false;
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
	    	os. addObserver (this, this. notificationPrefix + "updateButton", false);
		this. setValues ();
		ELEMENT ("name"). focus ();
		if (this. param. editorParameters)
			this. setEditorParameters (this. param);
		this. tempId = this. param. id || (new Date (). valueOf ());
		var ps = SERVICE (PREF). getBranch ("custombuttons.");
		var cbMode = this. cbService. mode;
		var sab = cbMode & CB_MODE_SHOW_APPLY_BUTTON;
	    this. saveButton. setAttribute ("icon", "save");
	    this. saveButton. setAttribute ("disabled", "true");
		if (this. param. newButton || !sab)
			this. saveButton. setAttribute ("hidden", "true");

		ELEMENT ("code"). addEditorObserver (this);
		ELEMENT ("initCode"). addEditorObserver (this);
		ELEMENT ("help"). addEditorObserver (this);
		window. addEventListener ("mousedown", this, true);
		window. addEventListener ("focus", this, true);
		window. addEventListener ("blur", this, true);
	    if (cbMode & CB_MODE_SAVE_EDITOR_SIZE_SEPARATELY)
	    {
		// window manager may ignore screenX and screenY, so let's move window manually
		var x = ELEMENT ("custombuttonsEditor"). getAttribute ("screenX");
		var y = ELEMENT ("custombuttonsEditor"). getAttribute ("screenY");
		if (x && y)
		    window. moveTo (x, y);
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
			//textbox. scrollTo (lineNumber);
		}
	    	if (param. wrappedJSObject. updateButton == true)
	    	{
		    this. param = param. wrappedJSObject;
		    this. setValues ();
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
		ELEMENT ("disableDefaultKeyBehavior"). checked = mode && (mode & CB_MODE_DISABLE_DEFAULT_KEY_BEHAVIOR) || false;
		if (this. param. newButton)
			document. title = this. cbService. getLocaleString ("AddButtonEditorDialogTitle");
		if (this. param. name)
			document. title += ": " + this. param. name;
		else if (this. param. id)
			document. title += ": " + this. param. id;
	},

    	notificationSender: false,
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
				var link = "custombutton://buttons/" + this. param. windowId + "/update/" + this. param. id;
				var res = this. cbService. updateButton (link, uri);
			    if (res == 1) // Cancel
				return false;
			    if (res == 0) // Ok
			    {
				this. cbService. installButton (this. param);
				return true;
			    }
			    else // Edit…
			    {
				ELEMENT ("urlfield-textbox"). value = "";
				return false;
			    }
			}
		}
		var field;
		for (var v in this. param)
		{
			field = ELEMENT (v);
			if (field)
				this. param [v] = field. value;
		}
		this. param ["mode"] = ELEMENT ("disableDefaultKeyBehavior"). checked? CB_MODE_DISABLE_DEFAULT_KEY_BEHAVIOR: 0;
	    	this. notificationSender = true;
		this. cbService. installButton (this. param);
	    	this. notificationSender = false;
		var os = SERVICE (OBSERVER);
		os. notifyObservers (null, this. notificationPrefix + "edit:focus", this. param. id);
		return true;
	},

	get canClose ()
	{
		if (!window. opener && !window. arguments)
			return false;
		return true;
	},

        acceptDialog: function ()
        {
	    var dialog = ELEMENT ("custombuttonsEditor");
	    dialog. acceptDialog ();
	},

	onAccept: function ()
	{
		if (this. updateButton ())
			return this. canClose;
		return false;
	},

	selectImage: function ()
	{
		var fp = COMPONENT (FILE_PICKER);
	    	var fpdt = this. cbService. getLocaleString ("editorImageFilePickerDialogTitle");
		fp. init (window, fpdt, 0);
		fp. appendFilters (fp. filterImages);
		var res = fp. show ();
		if (res == fp. returnOK)
			ELEMENT ("image"). value = fp. fileURL. spec;
	},

	execute_oncommand_code: function ()
	{
		var fe = document. commandDispatcher. focusedElement;
		var box = ELEMENT ("code");
		if (fe != box. textbox. inputField)
			return;
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
	    	else if ((topic == this. notificationPrefix + "updateButton") &&
			(subject. getAttribute ("id") == this. param. id))
	    	{
		    var link = "custombutton://buttons/" + this. param. windowId + "/edit/" + this. param. id;
		    this. param = this. cbService. getButtonParameters (link). wrappedJSObject;
		    if (!this. notificationSender)
			this. setValues ();
		    this. changed = false;
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
			aURL = aURL. replace (/^"/, "");
			aURL = aURL. replace (/"$/, "");
		}
		this. cbService. convertImageToRawData (this. param. windowId, this. param. id || this. tempId, aURL);
	},

	destroy: function ()
	{
	    var cs = SERVICE (CONSOLE);
	    cs. logStringMessage ("destroy…");
	    window. removeEventListener ("blur", this, true);
	    window. removeEventListener ("focus", this, true);
	    window. removeEventListener ("mousedown", this, true);
	    ELEMENT ("code"). removeEditorObserver (this);
	    ELEMENT ("initCode"). removeEditorObserver (this);
	    ELEMENT ("help"). removeEditorObserver (this);

		var os = SERVICE (OBSERVER);
		os. notifyObservers (null, this. notificationPrefix + "edit:done", this. param. id);
	    	os. removeObserver (this, this. notificationPrefix + "updateButton");
		os. removeObserver (this, this. notificationPrefix + "setEditorParameters");
		os. removeObserver (this, this. notificationPrefix + "updateImage");
	    cs. logStringMessage ("destroy done");
	},

        // next field and method are needed to rewind focus to active element
        // if "Cancel" button will be pressed twice
        // I think there should be more easiest way to do it
        // but I don't know it
        lastFocused: null,

        handleEvent: function (event)
        {
	    switch (event. type)
	    {
		case "mousedown":
		    var cbtn = ELEMENT ("custombuttonsEditor"). getButton ("cancel");
		    if (event. originalTarget == cbtn)
			this. lastFocused = document. activeElement;
		    break;
		case "focus":
		    if (event. target != window)
			return;
		    var os = SERVICE (OBSERVER);
		    os. notifyObservers (null, this. notificationPrefix + "edit:focus", this. param. id);
		    break;
		case "blur":
		    if (event. target != window)
			return;
		    var cs = SERVICE (CONSOLE);
		cs. logStringMessage ("blur");
		    var os = SERVICE (OBSERVER);
		    os. notifyObservers (null, this. notificationPrefix + "edit:blur", this. param. id);
		    break;
		default:;
	    }
	},

	onCancel: function ()
	{
	    const RES_SAVE = 0;
	    const RES_CANCEL = 1;
	    const RES_DONT_SAVE = 2;
	    var res;
	    if (this. changed)
	    {
		var ps = SERVICE (PROMPT);
		var aButtonFlags = ps. BUTTON_POS_0 * ps. BUTTON_TITLE_SAVE +
		                   ps. BUTTON_POS_1 * ps. BUTTON_TITLE_CANCEL +
		                   ps. BUTTON_POS_2 * ps. BUTTON_TITLE_DONT_SAVE +
		                   ps. BUTTON_POS_0_DEFAULT;
		var promptMsg = this. cbService. getLocaleString ("ConfirmSaveChanges");
		res = ps. confirmEx (window, "Custom Buttons", promptMsg, aButtonFlags, "", "", "", "", {});
		if (res == RES_SAVE)
		{
		    this. acceptDialog ();
		    return true;
		}
		else
		{
		    if ((res == RES_CANCEL) && this. lastFocused)
			this. lastFocused. focus ();
		    return (res == RES_DONT_SAVE);
		}
	    }

	    return this. canClose;
	},

	fullScreen: function ()
	{
	    if (window. windowState == Components. interfaces. nsIDOMChromeWindow. STATE_MAXIMIZED)
		window. restore ();
	    else
		window. maximize ();
	},

	tabSelect: function (event)
	{
	    var tab = event. target;
	    if (tab. nodeName != "tab")
		return;
	    event. preventDefault ();
	    var tabs = ELEMENT ("custombuttons-editbutton-tabbox");
	    tabs. selectedTab = tab;
	    var controlId = tab. getAttribute ("cbcontrol");
	    if (controlId)
	    {
		var control = ELEMENT (controlId);
		control. focus ();
	    }
	}
};

var editor = new Editor ();

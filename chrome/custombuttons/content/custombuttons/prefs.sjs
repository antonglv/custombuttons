#include <project.hjs>

function Prefs () {}
Prefs. prototype =
{
	_ps: null,
	get ps ()
	{
		if (!this. _ps)
		{
			this. _ps = SERVICE (PREF);
			this. _ps = this. _ps. QI (nsIPrefBranch);
		}
		return this. _ps;
	},

	cbs: SERVICE (CB),

	handleCheckboxes: function (mode)
	{
		var setCheckboxesFlag = (mode || (mode == 0));
		var cbks = document. getElementsByTagName ("checkbox");
		var mask, num, result = 0;
		for (var i = 0; i < cbks. length; i++)
		{
			num = cbks [i]. id. match (/modebit(\d+)$/);
			if (!num)
				continue;
			mask = 1 << num [1];
			if (setCheckboxesFlag)
				cbks [i]. checked = ((mode & mask) == mask);
			else
				result |= cbks [i]. checked? mask: 0;
		}
		return result;
	},

	removeAttribute: function (oElement, sAttributeName)
	{
		if (oElement. hasAttribute (sAttributeName))
			oElement. removeAttribute (sAttributeName);
	},

	getTopLevelWindow: function ()
	{
	    var res;
	    try
	    {
		res = window. QI (nsIInterfaceRequestor).
		      getInterface (CI. nsIWebNavigation).
		      QI (nsIDocShellTreeItem).
		      rootTreeItem. QI (nsIInterfaceRequestor).
		      getInterface (CI. nsIDOMWindow);
	    }
	    catch (e) {}
	    return res;
	},

	sizeWindowToContent: function (forced)
	{
		if (window != this. getTopLevelWindow ()) // the editor is opened in some other window
		    return;
		var oDialog = ELEMENT ("custombuttonsPrefsDialog");
		if (oDialog. hasAttribute ("width"))
			this. removeAttribute (oDialog, "width");
		if (oDialog. hasAttribute ("height"))
			this. removeAttribute (oDialog, "height");
		window. sizeToContent ();
	},

	onLoad: function ()
	{
		var mode = this. cbs. mode;
		this. handleCheckboxes (mode);
		this. sizeWindowToContent (true);
	},

	onAccept: function ()
	{
		window. removeEventListener ("command", this, false);
		var mode = this. handleCheckboxes (null);
		this. cbs. mode = mode;
		return true;
	},

	onCancel: function ()
	{
		window. removeEventListener ("command", this, false);
		return true;
	}
};

function TBPrefs () {}
TBPrefs. prototype =
{
	_checkbox: null,
	get checkbox ()
	{
		if (!this. _checkbox)
			this. _checkbox = ELEMENT ("modebit7");
		return this. _checkbox;
	},

    sizeWindowToContent: function (forced)
    {
	SUPER (sizeWindowToContent);
	if (forced)
	    setTimeout (window. sizeToContent, 0);
    },

	onLoad: function ()
    {
		SUPER (onLoad);
		this. checkbox. removeAttribute ("hidden"); // checkbox visible only in Thunderbird
		return true;
	}
};
EXTENDS (TBPrefs, Prefs);

var info = SERVICE (XUL_APP_INFO);
var cbPrefs;
if (["Thunderbird", "SeaMonkey"]. indexOf (info. name) != -1)
    cbPrefs = new TBPrefs ();
else
    cbPrefs = new Prefs ();

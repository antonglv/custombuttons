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

	sizeWindowToContent: function ()
	{
		var oDialog = ELEMENT ("custombuttonsSettingsDialog");
		if (oDialog. hasAttribute ("width"))
			this. removeAttribute (oDialog, "width");
		if (oDialog. hasAttribute ("height"))
			this. removeAttribute (oDialog, "height");
		window. sizeToContent ();
	},

	onLoad: function ()
	{
		var cbps = this. ps. getBranch ("custombuttons.");
		var mode = cbps. getIntPref ("mode");
		this. handleCheckboxes (mode);
		var oFormatSelector = ELEMENT ("modebit3");
		oFormatSelector. hidden = mode & CB_MODE_USE_XML_BUTTON_FORMAT;
		window. addEventListener ("command", this, false);
		this. sizeWindowToContent ();
	},

	onAccept: function ()
	{
		window. removeEventListener ("command", this, false);
		var mode = this. handleCheckboxes (null);
		var cbps = this. ps. getBranch ("custombuttons.");
		cbps. setIntPref ("mode", mode);
		return true;
	},

	onCancel: function ()
	{
		window. removeEventListener ("command", this, false);
		return true;
	},

	onCommand: function (oEvent)
	{
		var oTarget = oEvent. target;
		if (oTarget. nodeName == "checkbox")
		{
			if (oTarget. hasAttribute ("cbblocks"))
			{
				var sBlockedElementId = oTarget. getAttribute ("cbblocks");
				var oBlockedElement = ELEMENT (sBlockedElementId);
				oBlockedElement. hidden = oTarget. checked;
				this. sizeWindowToContent ();
			}
		}
	},

	// EventListener interface
	handleEvent: function (oEvent)
	{
		if (oEvent. type == "command")
			this. onCommand (oEvent);
	}
};

function TBPrefs () {}
TBPrefs. prototype =
{
	pn: "network.protocol-handler.expose.custombutton",

	_checkbox: null,
	get checkbox ()
	{
		if (!this. _checkbox)
			this. _checkbox = ELEMENT ("cbEnableCBProtocol");
		return this. _checkbox;
	},

	onLoad: function ()
	{
		SUPER (onLoad);
		var state = this. ps. prefHasUserValue (this. pn) &&
					this. ps. getBoolPref (this. pn);
		this. checkbox. setAttribute ("checked", state);
		this. checkbox. removeAttribute ("hidden"); // checkbox visible only in Thunderbird
		return true;
	},

	onAccept: function ()
	{
		SUPER (onAccept);
		if (this. checkbox. hasAttribute ("checked") &&
			(this. checkbox. getAttribute ("checked") == "true"))
		{
			this. ps. setBoolPref (this. pn, true);
		}
		else if (this. ps. prefHasUserValue (this. pn))
		{
			try
			{
				this. ps. deleteBranch (this. pn);
			}
			catch (e)
			{
				this. ps. setBoolPref (this. pn, false);
			}
		}
		return true;
	}
};
EXTENDS (TBPrefs, Prefs);

var cbPrefs = new custombuttonsFactory (). Prefs;

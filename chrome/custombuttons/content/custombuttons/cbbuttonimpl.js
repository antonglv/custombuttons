function _callNativeMethod (name, args)
{
	var res;
	try
	{
		var nativeMethod = Components. lookupMethod (this, name);
		res = nativeMethod. apply (this, args);
	} catch (err) {}
	return res;
}

__defineGetter__
(
	"id",
	function ()
	{
		return this. _callNativeMethod ("id", []);
	}
);

__defineSetter__
(
	"id",
	function (val)
	{
		return this. _callNativeMethod ("id", [val]);
	}
);

__defineGetter__
(
	"localName",
	function ()
	{
		return this. _callNativeMethod ("localName", []);
	}
);

__defineSetter__
(
	"localName",
	function (val)
	{
		return this. _callNativeMethod ("localName", [val]);
	}
);

__defineGetter__
(
	"title",
	function ()
	{
		return this. _callNativeMethod ("title", []);
	}
);

__defineSetter__
(
	"title",
	function (val)
	{
		return this. _callNativeMethod ("title", [val]);
	}
);

function getAttribute (name)
{
	return this. _callNativeMethod ("getAttribute", [name]);
}

function setAttribute (name, value)
{
	return this. _callNativeMethod ("setAttribute", [name, value]);
}

function hasAttribute (name)
{
	return this. _callNativeMethod ("hasAttribute", [name]);
}

function removeAttribute (name)
{
	return this. _callNativeMethod ("removeAttribute", [name]);
}

function init ()
{
	custombutton. buttonInit (this);
}

function destroy (reason)
{
	custombutton. buttonDestroy (this, reason);
}

__defineGetter__
(
	"parameters",
	function ()
	{
		return custombutton. buttonGetParameters (this);
	}
);

__defineGetter__
(
	"cbAccelKey",
	function ()
	{
		return custombutton. buttonGetCbAccelKey (this);
	}
);

__defineGetter__
(
	"image",
	function ()
	{
		return custombutton. buttonGetImage (this);
	}
);

__defineSetter__
(
	"image",
	function (val)
	{
		this. setAttribute ("image", val);
	}
);

__defineGetter__
(
	"cbStdIcon",
	function ()
	{
		return this. getAttribute ("cb-stdicon") || "";
	}
);

__defineSetter__
(
	"cbStdIcon",
	function (val)
	{
		this. setAttribute ("cb-stdicon", val);
		return val;
	}
);

__defineGetter__
(
	"Help",
	function ()
	{
		return custombutton. buttonGetHelp (this);
	}
);

__defineSetter__
(
	"Help",
	function (val)
	{
		this. setAttribute ("Help", val);
	}
);

__defineGetter__
(
	"cbMode",
	function ()
	{
		return custombutton. buttonGetCbMode (this);
	}
);

function setText (doc, nodeName, text, make_CDATASection)
{
	custombutton. buttonSetText (doc, nodeName, text, make_CDATASection);
}

__defineGetter__
(
	"URI",
	function ()
	{
		return custombutton. buttonGetURI (this);
	}
);

var _name = "";

__defineGetter__
(
	"name",
	function ()
	{
		if (this. hasAttribute ("cb-name"))
			return this. getAttribute ("cb-name");
		else
			return this. _name;
	}
);

__defineSetter__
(
	"name",
	function (val)
	{
		if (!val)
			return;
		if (!this. hasAttribute ("label") ||
			!this. getAttribute ("label"))
			this. setAttribute ("label", val);
		this. _name = val;
		this. setAttribute ("cb-name", val);
	}
);

var _cbCommand = null;
var _initPhase = false;

__defineGetter__
(
	"cbCommand",
	function ()
	{
		return this. getAttribute ("cb-oncommand") || "";
	}
);

__defineSetter__
(
	"cbCommand",
	function (val) {}
);

var _cbInitCode = null;

__defineGetter__
(
	"cbInitCode",
	function ()
	{
		return this. getAttribute ("cb-init") || "";
	}
);

__defineSetter__
(
	"cbInitCode",
	function (val)
	{
		if (this. hasAttribute ("initialized"))
		this. removeAttribute ("initialized");
	}
);

function cbExecuteCode ()
{
	custombutton. buttonCommand ({}, this);
}

var _ctxtObj = false;
var _handlers = [];
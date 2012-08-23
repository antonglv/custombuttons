var EXPORTED_SYMBOLS = [];

Components. utils. import ("resource://gre/modules/AddonManager.jsm");
Components. utils. import ("resource://gre/modules/Services.jsm");
Components. utils. import ("resource://gre/modules/XPCOMUtils.jsm");

var CB_ADDON_TYPE = "custombuttons-button";

const Cu = Components. utils;

var AddonProvider = {
    getOverlayDocument: function (overlayFileName) {
	var overlayDocument = null;
	var ios = Components. classes ["@mozilla.org/network/io-service;1"]. getService (Components. interfaces. nsIIOService);
	var uri = "resource://custombuttons/" + overlayFileName;
	var xulchan = ios. newChannel (uri, null, null);
	var instr = xulchan. open ();
	var dp = Components. classes ["@mozilla.org/xmlextras/domparser;1"]. createInstance (Components. interfaces. nsIDOMParser);
	try {
	    var fakeOverlayURI = ios. newURI ("chrome://custombuttons/content/buttonsoverlay.xul", null, null);
	    var chromeProtocolHandler = Components. classes ["@mozilla.org/network/protocol;1?name=chrome"]. getService ();
	    chromeProtocolHandler = chromeProtocolHandler. QueryInterface (Components. interfaces. nsIProtocolHandler);
	    var fakeOverlayChannel = chromeProtocolHandler. newChannel (fakeOverlayURI);
	    try {
		dp. init (fakeOverlayChannel. owner, ios. newURI (uri, null, null), null, null);
	    } catch (e) {
		dp = Components. classes ["@mozilla.org/xmlextras/domparser;1"]. createInstance (Components. interfaces. nsIDOMParser);
	    }
	} catch (e) {}
	overlayDocument = dp. parseFromStream (instr, null, instr. available (), "application/xml");
	return overlayDocument;
    },

    getAddonById: function AddonProvider_getAddonById (aId, aCallback) {
	aCallback ([]);
    },

    makeButtonLink: function (overlayFileName, paletteId, buttonId)
    {
	var res = "custombutton://buttons/";
	var info = Components. classes ["@mozilla.org/xre/app-info;1"]. getService (Components. interfaces. nsIXULAppInfo);
	switch (paletteId)
	{
	    case "BrowserToolbarPalette":
		res += info. name; // Firefox, SeaMonkey, Browser
		break;
	    case "MailToolbarPalette":
		res += info. name; // Thunderbird, SeaMonkey
		if (("buttonsoverlay.xul" == overlayFileName) &&
		    ("SeaMonkey" == info. name))
		    res += "Mail"; // SeaMonkeyMail
		else if ("mwbuttonsoverlay.xul" == overlayFileName)
			res += "MailWindow"; // ThunderbirdMailWindow, SeaMonkeyMailWindow
		break;
	    case "MsgComposeToolbarPalette":
		res += info. name + "ComposeWindow"; // ThunderbirdComposeWindow, SeaMonkeyComposeWindow
		break;
	    case "calendarToolbarPalette":
		res += "Sunbird"; // Sunbird, Calendar
		break;
	    case "NvuToolbarPalette":
		res += "KompoZer"; // KompoZer
		break;
	    default:
		res += "Browser";
		break;
	}
	res += "/edit/" + buttonId;
	return res;
    },

    collectButtonsFromOverlay: function (overlayFileName)
    {
	var res = [];
	var doc;
	try {
	    doc = this. getOverlayDocument (overlayFileName);
	} catch (e) {}
	if (!doc)
	    return res;
	var btns = doc. getElementsByTagName ("toolbarbutton");
	var btn, image, btnLink;
	for (var i = 0; i < btns. length; i++) {
	    btn = new CustombuttonsButton ();
	    btn. id = btns [i]. getAttribute ("id");
	    btn. name = btns [i]. getAttribute ("label");
	    btnLink = this. makeButtonLink (overlayFileName, btns [i]. parentNode. id, btn. id);
	    btn. buttonLink = btnLink;
	    image = "chrome://custombuttons/skin/button.png";
	    if (btns [i]. hasAttribute ("cb-stdicon")) {
		switch (btns [i]. getAttribute ("cb-stdicon")) {
		case "custombuttons-stdicon-2":
		    image = "chrome://custombuttons/skin/stdicons/rbutton.png";
		    break;
		case "custombuttons-stdicon-3":
		    image = "chrome://custombuttons/skin/stdicons/gbutton.png";
		    break;
		case "custombuttons-stdicon-4":
		    image = "chrome://custombuttons/skin/stdicons/bbutton.png";
		    break;
		default:;
		}
	    }
	    if (btns [i]. hasAttribute ("image")) {
		image = btns [i]. getAttribute ("image");
	    }
	    btn. iconURL = image;
	    res. push (btn);
	}
	return res;
    },

    getAddonsByTypes: function AddonProvider_getAddonsByTypes (aTypes, aCallback) {
	if (aTypes && (aTypes. indexOf (CB_ADDON_TYPE) == -1)) {
	    aCallback ([]);
	    return;
	}
	var res = [];
	var btns = this. collectButtonsFromOverlay ("buttonsoverlay.xul");
	res = res. concat (btns);
	btns = this. collectButtonsFromOverlay ("mwbuttonsoverlay.xul");
	res = res. concat (btns);
	btns = this. collectButtonsFromOverlay ("mcbuttonsoverlay.xul");
	res = res. concat (btns);
	aCallback (res);
    },

    getInstallsByTypes: function (aTypes, aCallback) {
	aCallback ([]);
    },

    __noSuchMethod__: function (id) {
	Cu. reportError ("__noSuchMethod__: " + id);
    }
};

function CustombuttonsButton (aButton) {}
// TODO: implement aboutURL, size, sourceURI
CustombuttonsButton. prototype = {
    id: null,
    type: CB_ADDON_TYPE,
    isCompatible: true,
    blocklistState: 0,
    appDisabled: false,
    scope: AddonManager. SCOPE_PROFILE,
    name: "",
    pendingOperations: AddonManager. PENDING_NONE,
    permissions: AddonManager. PERM_CAN_UNINSTALL,
    operationsRequiringRestart: AddonManager. OP_NEEDS_RESTART_NONE,
    description: null,
    iconURL: null,
    isActive: true,

    _button: null
};

var firstRun = true;
if (firstRun) {
    firstRun = false;
    AddonManagerPrivate. registerProvider (
	/* AddonProvider,
	 [{ id: CB_ADDON_TYPE,
	 name: "Custom Buttons",
	 uiPriority: 3500,
	 viewType: AddonManager. VIEW_TYPE_LIST,
	 flags: AddonManager. TYPE_UI_HIDE_EMPTY }] */
	AddonProvider,
	[{ id: CB_ADDON_TYPE }]
    );
}

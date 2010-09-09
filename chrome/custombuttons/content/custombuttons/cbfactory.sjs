#include <project.hjs>

function custombuttonsFactory ()
{
    var info = SERVICE (XUL_APP_INFO);
    var oVC = COMPONENT (VERSION_COMPARATOR);
    switch (document. documentURI)
    {
	case "chrome://browser/content/browser.xul": // Firefox, Flock
	    if (oVC. compare ("3.0a1", info. version) <= 0)
	    {
		custombuttons. makeBookmark = function (CbLink, sName)
		{
		    var uri = COMPONENT (SIMPLE_URI); // since there was 'bookmarkLink' execution problem
		    uri. spec = CbLink;               // it seems nsIURI spec re-passing solves it
		    PlacesCommandHook. bookmarkLink (PlacesUtils. bookmarksMenuFolderId, uri. spec, sName);
		};
		if (oVC. compare ("3.1b3", info. version) <= 0)
		    custombuttons. shouldAddToPalette = false;
	    }
	    break;
	case "chrome://navigator/content/navigator.xul": // Seamonkey
	    custombuttons. makeBookmark = function (CbLink, sName)
	    {
		var uri = COMPONENT (SIMPLE_URI); // since there was 'bookmarkLink' execution problem
		uri. spec = CbLink;               // it seems nsIURI spec re-passing solves it
		PlacesCommandHook. bookmarkLink (PlacesUtils. bookmarksMenuFolderId, uri. spec, sName);
	    };
	    custombuttons. shouldAddToPalette = false;
	    break;
	case "chrome://messenger/content/messenger.xul": // Seamonkey, Thunderbird
	case "chrome://messenger/content/messageWindow.xul": // Seamonkey, Thunderbird
	case "chrome://messenger/content/messengercompose.xul": // Seamonkey, Thunderbird
	    custombuttons. toolbarpaletteName = "MailToolbarPalette";
	    if (document. documentURI == "chrome://messenger/content/messengercompose.xul")
		custombuttons. toolbarpaletteName = "MsgComposeToolbarPalette";
	    custombuttons. init = (function (fn)
	    {
		return function ()
		{
		    fn ();
		    var oBookmarkButtonMenuitem = ELEMENT ("custombuttons-contextpopup-bookmarkButton");
		    oBookmarkButtonMenuitem. parentNode. removeChild (oBookmarkButtonMenuitem);
		    oBookmarkButtonMenuitem = ELEMENT ("custombuttons-contextpopup-bookmarkButton-sub");
		    oBookmarkButtonMenuitem. parentNode. removeChild (oBookmarkButtonMenuitem);
		};
	    }) (custombuttons. init);
	    custombuttons. __defineGetter
	    (
		"gToolbox",
		function ()
		{
		    return ELEMENT ("mail-toolbox") || // main window and message window
			   ELEMENT ("compose-toolbox"); // compose message
		}
	    );
	    custombuttons. openEditor = function (oButton)
	    {
		var mode = "";
		var param;
		if ("gCurrentMode" in window)
		{
			var mode = window ["gCurrentMode"];
			var mb = ELEMENT ("modeBroadcaster");
			mode = mode || (mb? mb. getAttribute ("mode"): "");
			if (document. popupNode && (document. popupNode. nodeName == "toolbar"))
			{
				if (document. popupNode. id == "mode-toolbar")
					mode = "mode";
				else if (document. popupNode. id == "calendar-toolbar")
					mode = "calendar";
				else if (document. popupNode. id == "task-toolbar")
					mode = "task";
			}
		}
		if (mode)
		{
			param = {};
			param ["attributes"] = {};
			param. attributes ["mode"] = mode;
			param. wrappedJSObject = param;
		}
		var link = this. makeButtonLink ("edit", oButton? oButton. id: "");
		this. cbService. editButton (window, link, param);
	    };
	    custombuttons. makeBookmark = function () {};
	    if (info. name == "SeaMonkey")
		custombuttons. shouldAddToPalette = false;
	    if ((info. name == "Thunderbird") && (oVC. compare ("3.0", info. version) <= 0))
		custombuttons. shouldAddToPalette = false;
	    break;
	case "chrome://sunbird/content/calendar.xul": // Sunbird
	case "chrome://calendar/content/calendar.xul": // Sunbird
	    custombuttons. toolbarpaletteName = "calendarToolbarPalette";
	    custombuttons. shouldAddToPalette = true;
	    custombuttons. __defineGetter
	    (
		"gToolbox",
		function ()
		{
		    return ELEMENT ("calendar-toolbox"); // calendar
		}
	    );
	    custombuttons. makeBookmark = function () {};
	    if (oVC. compare ("1.0b2pre", info. version) <= 0)
		custombuttons. shouldAddToPalette = false;
	    break;
	case "chrome://editor/content/editor.xul": // KompoZer
	    custombuttons. toolbarpaletteName = "NvuToolbarPalette";
	    custombuttons. shouldAddToPalette = true;
	    custombuttons. __defineGetter
	    (
		"gToolbox",
		function ()
		{
		    return ELEMENT ("EditorToolbox"); // calendar
		}
	    );
	    custombuttons. makeBookmark = function () {};
	    break;
    }
}


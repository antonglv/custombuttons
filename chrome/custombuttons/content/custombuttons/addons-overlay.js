/* ****
 * addons-overlay.js
 */

Components. utils. import ("resource://gre/modules/AddonManager.jsm");
Components. utils. import ("resource://custombuttons-modules/addons4.js");

var cbAddonManager = {
    QueryInterface: function (iid) {
	if (iid. equals (Components. interfaces. nsIObserver) ||
	    iid. equals (Components. interfaces. nsIDOMEventListener) ||
	    iid. equals (Components. interfaces. nsIWeakReference) ||
	    iid. equals (Components. interfaces. nsISupports))
	    return this;
	return Components. results. NS_ERROR_NO_INTERFACE;
    },

    init: function () {
	window. removeEventListener ("load", this, false);

	gViewController. commands. cmd_custombuttons_edit = {
	    isEnabled: function () {
		return "addons://list/custombuttons" == gViewController. currentViewId;
	    },

	    doCommand: function (aAddon) {
		var cbs = Components. classes ["@xsms.nm.ru/custombuttons/cbservice;1"].
			  getService (Components. interfaces. cbICustomButtonsService);
		cbs. editButton (window, aAddon. buttonLink, null);
	    }
	};

	gViewController. commands. cmd_custombuttons_add = {
	    isEnabled: function () {
		return true;
	    },

	    doCommand: function (aAddon) {
		var cbs = Components. classes ["@xsms.nm.ru/custombuttons/cbservice;1"].
			  getService (Components. interfaces. cbICustomButtonsService);
		cbs. editButton (window, "", null);
	    }
	};

	window. addEventListener ("ViewChanged", this, false);
	this. onViewChanged ();
    },

    destroy: function (aEvent) {
	window. removeEventListener ("ViewChanged", this, false);
	window. removeEventListener ("unload", this, false);
    },

    onViewChanged: function (aEvent) {
	if ("addons://list/custombuttons" == gViewController. currentViewId) {
	    document. documentElement. classList. add ("custombuttons");
	    this. sortButtons ();
	} else {
	    document. documentElement. classList. remove ("custombuttons");
	}
    },

    changeSort: function () {
	var sortButton = document. getElementById ("custombuttons-sorting-name");
	var checkState = (sortButton. getAttribute ("checkState") == "1")? "2": "1";
	sortButton. setAttribute ("checkState", checkState);
	this. sortButtons ();
    },

    sortButtons: function () {
	var sortButton = document. getElementById ("custombuttons-sorting-name");
	var checkState = sortButton. getAttribute ("checkState");
	this. applySort (["name"], checkState != "1");
    },

    applySort: function (sortFields, ascending) {
	var list = document. getElementById ("addon-list");
	var elements = Array. slice (list. childNodes, 0);
	sortElements (elements, sortFields, ascending);
	while (list. hasChildNodes ())
	    list. removeChild (list. lastChild);
	elements. forEach (function (element) {
	    list. appendChild (element);
	});
    },

    /* nsIDOMEventListener interface */
    handleEvent: function (aEvent) {
	switch (aEvent. type) {
	    case "load":
		this. init ();
		break;
	    case "unload":
		this. destroy ();
		break;
	    case "ViewChanged":
		this. onViewChanged (aEvent);
		break;
	    default:
		break;
	}
    }
};

window. addEventListener ("load", cbAddonManager, false);
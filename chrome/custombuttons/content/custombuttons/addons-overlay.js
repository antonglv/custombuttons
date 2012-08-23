/* ****
 *
 */
(function () {
Components. utils. import ("resource://gre/modules/AddonManager.jsm");
Components. utils. import ("resource://custombuttons-modules/addons4.js");

function init (aEvent)
{
    gViewController. commands. cmd_custombuttons_edit = {
	isEnabled: function () {
	     return true;
	},
	doCommand: function (aAddon)
	{
	    var cbs = Components. classes ["@xsms.nm.ru/custombuttons/cbservice;1" /* CB_SERVICE_CID */]. getService (Components. interfaces. cbICustomButtonsService /* CB_SERVICE_IID */);
	    cbs. editButton (window, aAddon. buttonLink, null);
	}
    };
    gViewController. commands. cmd_custombuttons_add = {
	isEnabled: function () {
	     return true;
	},
	doCommand: function (aAddon)
	{
	    var cbs = Components. classes ["@xsms.nm.ru/custombuttons/cbservice;1" /* CB_SERVICE_CID */]. getService (Components. interfaces. cbICustomButtonsService /* CB_SERVICE_IID */);
	    cbs. editButton (window, "", null);
	}
    };
    window. addEventListener ("ViewChanged", onViewChanged, false);
    onViewChanged ();
}

function onViewChanged (aEvent)
{
    if ("addons://list/custombuttons" == gViewController. currentViewId)
    {
	document. documentElement. classList. add ("custombuttons");
    }
    else
    {
	document. documentElement. classList. remove ("custombuttons");
    }
};

window. addEventListener ("load", init, false);
}) ();
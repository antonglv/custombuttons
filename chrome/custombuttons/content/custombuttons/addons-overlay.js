/* ****
 *
 */
Components. utils. import ("resource://gre/modules/AddonManager.jsm");
Components. utils. import ("resource://custombuttons-modules/addons4.js");

function cbInit (aEvent)
{
    window. addEventListener ("ViewChanged", cbOnViewChanged, false);
    cbOnViewChanged ();
}

function cbOnViewChanged (aEvent)
{
    if ("addons://list/custombuttons-button" == gViewController. currentViewId)
    {
	document. documentElement. classList. add ("custombuttons");
    }
    else
    {
	document. documentElement. classList. remove ("custombuttons");
    }
};

window. addEventListener ("load", cbInit, false);

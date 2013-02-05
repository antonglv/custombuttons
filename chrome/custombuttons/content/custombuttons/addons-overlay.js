/* ****
 *
 */
(function () {
     Components. utils. import ("resource://gre/modules/AddonManager.jsm");
     Components. utils. import ("resource://custombuttons-modules/addons4.js");

     function init (aEvent) {
	 gViewController. commands. cmd_custombuttons_edit = {
	     isEnabled: function () {
		 return "addons://list/custombuttons" == gViewController. currentViewId;
	     },
	     doCommand: function (aAddon) {
		 var cbs = Components. classes ["@xsms.nm.ru/custombuttons/cbservice;1" /* CB_SERVICE_CID */].
			   getService (Components. interfaces. cbICustomButtonsService /* CB_SERVICE_IID */);
		 cbs. editButton (window, aAddon. buttonLink, null);
	     }
	 };

	 gViewController. commands. cmd_custombuttons_add = {
	     isEnabled: function () {
		 return true;
	     },

	     doCommand: function (aAddon) {
		 var cbs = Components. classes ["@xsms.nm.ru/custombuttons/cbservice;1" /* CB_SERVICE_CID */].
			   getService (Components. interfaces. cbICustomButtonsService /* CB_SERVICE_IID */);
		 cbs. editButton (window, "", null);
	     }
	 };

	 var sortButton = document. getElementById ("custombuttons-sorting-name");
	 sortButton. addEventListener ("command", changeSort, false);

	 window. addEventListener ("ViewChanged", onViewChanged, false);
	 onViewChanged ();
     }

     function onViewChanged (aEvent) {
	 if ("addons://list/custombuttons" == gViewController. currentViewId) {
	     document. documentElement. classList. add ("custombuttons");
	     applySort ();
	 } else {
	     document. documentElement. classList. remove ("custombuttons");
	 }
     }

     function changeSort () {
	 var sortButton = document. getElementById ("custombuttons-sorting-name");
	 var checkState = (sortButton. getAttribute ("checkState") == "1")? "2": "1";
	 sortButton. setAttribute ("checkState", checkState);
	 applySort ();
     }

     function applySort () {
	 var sortButton = document. getElementById ("custombuttons-sorting-name");
	 var ascending = ("1" != sortButton. getAttribute ("checkState"));
	 var list = document. getElementById ("addon-list");
	 var elements = Array. slice (list. childNodes, 0);
	 sortElements (elements, ["name"], ascending);
	 while (list. hasChildNodes ())
	     list. removeChild (list. lastChild);
	 elements. forEach (function (element) {
	     list. appendChild (element);
	 });
     }

     window. addEventListener ("load", init, false);
}) ();
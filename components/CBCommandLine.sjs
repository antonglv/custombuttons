// ***** BEGIN LICENSE BLOCK *****
// Version: MPL 1.1
//
// The contents of this file are subject to the Mozilla Public License Version
// 1.1 (the "License"); you may not use this file except in compliance with
// the License. You may obtain a copy of the License at
// http://www.mozilla.org/MPL/
//
// Software distributed under the License is distributed on an "AS IS" basis,
// WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
// for the specific language governing rights and limitations under the
// License.
//
// Custom Buttons:
// - Gives a possibility to create custom toolbarbuttons.
// - This component is intended to handle extension's specific command line arguments
//
// Author: Anton Glazatov (c) 2010
//
// ***** END LICENSE BLOCK *****

#include <project.hjs>
#include <prio.hjs>

function cbCommandLineHandler () {}
cbCommandLineHandler. prototype =
{
    QueryInterface: function (iid)
    {
	if (iid. equals (CI. nsICommandLineHandler) ||
	    (iid. equals (CI. nsISupports)))
	    return this;
	throw NS_ERROR (NO_INTERFACE);
    },

    _cbs: null,
    get cbs ()
    {
	if (!this. _cbs)
	    this. _cbs = SERVICE (CB);
	return this. _cbs
    },

    handle: function (commandLine)
    {
	var mode = this. cbs. mode;
	var param = commandLine. handleFlagWithParam ("custombuttons", false);
	if (!param)
	    return;
	if (param == "disable-buttons-initialization")
	    mode = mode | CB_MODE_DISABLE_INITIALIZATION;
	this. cbs. mode = mode;
    },

    helpInfo: "  -custombuttons\n    disable-buttons-initialization               Disable buttons initialisation\n"
};

var Module =
{
    CLSID: CID ("{cafd9345-65a1-46b2-944d-ff4a9725a609}"),
    ContractID: CB_COMMAND_LINE_HANDLER_COMPONENT_CID,
    ComponentName: "Custombuttons extension command line handler component",

    QueryInterface: function (iid)
    {
	if (iid. equals (CI. nsIModule) ||
	    iid. equals (CI. nsISupports))
	    return this;
	throw NS_ERROR (NO_INTERFACE);
    },

    getClassObject: function (compMgr, cid, iid)
    {
	if (!cid. equals (this. CLSID))
	    throw NS_ERROR (NO_INTERFACE);
	if (!iid. equals (Components. interfaces. nsIFactory))
	    throw NS_ERROR (NOT_IMPLEMENTED);
	return this. CLASS_FACTORY;
    },

    firstTime: true,
    registerSelf: function (compMgr, fileSpec, location, type)
    {
	if (this. firstTime)
            this. firstTime = false;
        else
	    throw NS_ERROR (FACTORY_REGISTER_AGAIN);
	compMgr = compMgr. QI (nsIComponentRegistrar);
	compMgr. registerFactoryLocation
	(
	    this. CLSID, this. ComponentName, this. ContractID,
	    fileSpec, location, type
	);
        var cm = SERVICE (CATEGORY_MANAGER);
	cm. addCategoryEntry ("command-line-handler", "m-custombuttons", this. ContractID, true, true);

    },

    unregisterSelf: function (compMgr, location, type)
    {
	compMgr = compMgr. QI (nsIComponentRegistrar);
	compMgr. unregisterFactoryLocation (this. CID, location);
	var cm = SERVICE (CATEGORY_MANAGER);
	cm. deleteCategoryEntry ("command-line-handler", "m-custombuttons");
    },

    canUnload: function (compMgr)
    {
	return true;
    },

    CLASS_FACTORY:
    {
	QueryInterface: function (iid)
	{
	    if (iid. equals (CI. nsIFactory) ||
		iid. equals (CI. nsISupports))
		return this;
	    throw NS_ERROR (NO_INTERFACE);
	},

	createInstance: function (outer, iid)
	{
	    if (outer != null)
		throw NS_ERROR (NO_AGGREGATION);
	    return (new cbCommandLineHandler ()). QueryInterface (iid);
	}
    }
};

DEFINE_STD_NS_GET_MODULE (Module)
DEFINE_STD_NS_GET_FACTORY (Module. CLASS_FACTORY)

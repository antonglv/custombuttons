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
// - This component is intended to prevent local disk access vulnerability
// - via chrome://custombuttons-profilefolder/%2e%2e%2f...
// - (see bug #413250: https://bugzilla.mozilla.org/show_bug.cgi?id=413250)
// 
// Author: Anton Glazatov (c) 2008
// 
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// Portions of this code have been based upon
// Adblock Plus - http://adblockplus.org/
// Copyright (c) 2006-2007 Wladimir Palant
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// 
// ***** END LICENSE BLOCK *****
#include <project.hjs>
#include <contentpolicy.hjs>
#include <node.hjs>

var info = SERVICE (XUL_APP_INFO);
var oVC = COMPONENT (VERSION_COMPARATOR);
if (oVC. compare (info. platformVersion, "1.8.0.5") < 0)
{
	// Adblock Plus code
	//HACKHACK: need a way to get an implicit wrapper for nodes because of bug 337095 (fixed in Gecko 1.8.0.5)
	var fakeFactory =
	{
		createInstance: function (outer, iid)
		{
			return outer;
		},
	
		QueryInterface: function (iid)
		{
			if (iid. equals (CI. nsISupports) ||
				iid. equals (CI. nsIFactory))
			return this;
	
			throw NS_ERROR (NO_INTERFACE);
		}
	};
	var array = COMPONENT (SUPPORTS_ARRAY);
	array. AppendElement (fakeFactory);
	fakeFactory = array. GetElementAt (0). QI (nsIFactory);
	array = null;

	function wrapNode (insecNode)
	{
		return fakeFactory. createInstance (insecNode, CI. nsISupports);
	}
	
	// Retrieves the window object for a node or returns null if it isn't possible
	function getWindow (node)
	{
		if (node && node. nodeType != NODE_DOCUMENT_NODE)
			node = node. ownerDocument;
	
		if (!node || node. nodeType != NODE_DOCUMENT_NODE)
			return null;
	
		return node. defaultView;
	}
	// end Adblock Plus code
}

function cbContentPolicyComponent () {}
cbContentPolicyComponent. prototype =
{
	QueryInterface: function (iid)
	{
		if (!iid. equals (CI. nsIContentPolicy) &&
			!iid. equals (CI. nsISupports))
			throw NS_ERROR (NO_INTERFACE);
		return this;
	},

	// Adblock Plus code	
	shouldLoad: function (contentType, contentLocation, requestOrigin, context,
						  mimeTypeGuess, extra)
	{
		if (!context)
			return CONTENT_POLICY_ACCEPT;

		// HACKHACK: Pass the node though XPCOM to work around bug 337095
		var node = wrapNode (context);
		var wnd = getWindow (node);
		if (!wnd)
			return CONTENT_POLICY_ACCEPT;

		// Only block in content windows
		var wndType = wnd. QI (nsIInterfaceRequestor).
					  getInterface (CI. nsIWebNavigation).
					  QI (nsIDocShellTreeItem). itemType;
		if (wndType != CI. nsIDocShellTreeItem. typeContent)
			return CONTENT_POLICY_ACCEPT;

		if ((contentLocation. spec. indexOf ("custombutton://content/") == 0) ||
			(contentLocation. spec. indexOf ("custombuttons://content/") == 0))
			return CONTENT_POLICY_REJECT_REQUEST;

		return CONTENT_POLICY_ACCEPT;
	},
	
	shouldProcess: function (contentType, contentLocation, requestOrigin,
							 context, mimeType, extra)
	{
		return CONTENT_POLICY_ACCEPT;
	}
	// end Adblock Plus code
};

var Module =
{
    CLSID: CID ("{cb267f0c-88ed-430d-bd9c-f4e132cd71d5}"),
    ContractID: CB_CONTENT_POLICY_COMPONENT_CID,
    ComponentName: "Custombuttons extension content policy component",

    DEFINE_STD_CAN_UNLOAD,
	DEFINE_STD_GET_CLASS_OBJECT,

	FIRST_TIME: true,																
	registerSelf: function (componentManager, fileSpec, location, type)
	{
		var info = SERVICE (XUL_APP_INFO);
		var oVC = COMPONENT (VERSION_COMPARATOR);
		if (oVC. compare (info. platformVersion, "1.8.0.5") >= 0)
			return;
		if (this. FIRST_TIME)
	        this. FIRST_TIME = false;
	    else
	        throw NS_ERROR (FACTORY_REGISTER_AGAIN);
	    componentManager = componentManager. QI (nsIComponentRegistrar);
	    componentManager. registerFactoryLocation
	    (
	        this. CLSID, this. ComponentName,
	        this. ContractID, fileSpec,
	        location, type
	    );
	    var cm = SERVICE (CATEGORY_MANAGER);
		cm. deleteCategoryEntry ("content-policy", CLASS (CB_CONTENT_POLICY), true);
		cm. addCategoryEntry
		(
			"content-policy", CLASS (CB_CONTENT_POLICY),
			CLASS (CB_CONTENT_POLICY), true, true
		);
	},

	unregisterSelf: function (componentManager, location, loaderStr)
	{
		var cm = SERVICE (CATEGORY_MANAGER);
		cm. deleteCategoryEntry ("content-policy", CLASS (CB_CONTENT_POLICY), true);
	},
	
	DEFINE_STD_CLASS_FACTORY (cbContentPolicyComponent)
};

DEFINE_STD_NS_GET_MODULE (Module)

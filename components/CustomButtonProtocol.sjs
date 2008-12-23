/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Mozilla.
 *
 * The Initial Developer of the Original Code is IBM Corporation.
 * Portions created by IBM Corporation are Copyright (C) 2004
 * IBM Corporation. All Rights Reserved.
 *
 * Contributor(s):
 *   Darin Fisher <darin@meer.net>
 *   Doron Rosenberg <doronr@us.ibm.com>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

#include <project.hjs>
#include <protocolhandler.hjs>

const kSIMPLEURI_CONTRACTID = "@mozilla.org/network/simple-uri;1";
const nsIURI = CI. nsIURI;

function CustombuttonProtocol (sProtocolName)
{
	this. scheme = sProtocolName;
	this. protocolFlags = URI_NORELATIVE | URI_NOAUTH | URI_LOADABLE_BY_ANYONE |
						  URI_NON_PERSISTABLE | URI_DOES_NOT_RETURN_DATA;
	if (sProtocolName == "custombuttons")
		this. protocolFlags |= URI_IS_LOCAL_RESOURCE;
	return this;
}
CustombuttonProtocol. prototype =
{
	DEFINE_STD_QI (nsIProtocolHandler),
	
	defaultPort: -1,
	protocolFlags: URI_NORELATIVE | URI_NOAUTH | URI_LOADABLE_BY_ANYONE |
				   URI_NON_PERSISTABLE | URI_DOES_NOT_RETURN_DATA,
	
	scheme: "custombutton",
	
	allowPort: function (port, scheme)
	{
		return false;
	},
	
	newURI: function (spec, charset, baseURI)
	{
		var uri = CC [kSIMPLEURI_CONTRACTID]. createInstance (nsIURI);
		uri. spec = spec;
		return uri;
	},
	
	_system_principal: null,
	
	fakeOverlayChannel: function ()
	{
		var chromeProtocolHandler = CC ["@mozilla.org/network/protocol;1?name=chrome"].
									getService ();
		chromeProtocolHandler = chromeProtocolHandler. QI (nsIProtocolHandler);
		var fakeOverlayURI = "chrome://custombuttons/content/buttonsoverlay.xul";
		var chromeURI = chromeProtocolHandler. newURI (fakeOverlayURI, null, null);
		return chromeProtocolHandler. newChannel (chromeURI);
	},
	
	sCbPrefix: "custombuttons://content/",
	
	newChannel: function (aURI)
	{
		if (this. scheme == "custombuttons")
		{
			var sFileName = aURI. spec. substring (this. sCbPrefix. length);
			if (!this. _system_principal)
			{
				var chromeChannel = this. fakeOverlayChannel ();
				this. _system_principal = chromeChannel. owner;
				var chromeRequest = chromeChannel. QI (nsIRequest);
				chromeRequest. cancel (0x804b0002);
			}
			var dir = SERVICE (PROPERTIES). get ("ProfD", CI. nsIFile); // get profile folder
			if (!dir. exists ())
				return this. fakeOverlayChannel ();
			dir. append ("custombuttons");
			var file = dir. clone ();
			file. append (sFileName);
			if (!file. exists ())
				return this. fakeOverlayChannel ();
			var ios = SERVICE (IO);
			var uri = ios. newFileURI (file);
			var channel = ios. newChannelFromURI (uri);
			channel. originalURI = aURI;
			channel. owner = this. _system_principal;
			return channel;
		}
		var windowService = SERVICE (WINDOW);
		var currentWindow = windowService. getMostRecentWindow ("navigator:browser");
		if (!currentWindow)
			currentWindow = windowService. getMostRecentWindow ("mail:3pane");
		var ButtonUri = aURI. spec;
		ButtonUri = ButtonUri. substring (ButtonUri. indexOf (":") + 1);
		currentWindow. custombuttons. installWebButton (ButtonUri);
		return false;
	}
};

function CustombuttonsProtocolClassFactory (sProtocolName)
{
	this. protocol = sProtocolName;
	return this;
}
CustombuttonsProtocolClassFactory. prototype =
{
	protocol: "",
	
	createInstance: function (outer, iid)
	{
		if (outer != null)
			throw NS_ERROR (NO_AGGREGATION);
		if (!iid. equals (CI. nsIProtocolHandler) &&
			!iid. equals (CI. nsISupports))
			throw NS_ERROR (NO_INTERFACE);
		return new CustombuttonProtocol (this. protocol);
	}
};

var Module =
{
    CLSID: [CID ("{78D452B8-2CE8-4a7b-8A59-DA3C0960DAE7}"),
			CID ("{1c796f9e-9a22-4604-84e4-fa7c4b8d80a4}")],
    ContractID: ["@mozilla.org/network/protocol;1?name=custombutton",
				 "@mozilla.org/network/protocol;1?name=custombuttons"],
    ComponentName: ["Custombutton Protocol", "Custombuttons Extension Protocol"],
	protocolName: ["custombutton", "custombuttons"],

    canUnload: function (componentManager)
	{
		return true;
	},

	getClassObject: function (componentManager, cid, iid)
	{
		if (!cid. equals (this. CLSID [0]) &&
			!cid. equals (this. CLSID [1]))
			throw NS_ERROR (NO_INTERFACE);
		if (!iid. equals (CI. nsIFactory))
			throw NS_ERROR (NOT_IMPLEMENTED);
		var protocol;
		for (var i = 0; i < this. CLSID. length; i++)
		{
			if (cid. equals (this. CLSID [i]))
			{
				protocol = this. protocolName [i];
				break;
			}
		}
		return new CustombuttonsProtocolClassFactory (protocol);
	},
	
	FIRST_TIME: true,
	
	registerSelf: function (componentManager, fileSpec, location, type)
	{
		if (this. FIRST_TIME)
			this. FIRST_TIME = false;
		else
			throw NS_ERROR (FACTORY_REGISTER_AGAIN);
		componentManager = componentManager. QI (nsIComponentRegistrar);
		for (var i = 0; i < this. CLSID. length; i++)
			componentManager. registerFactoryLocation
			(
				this. CLSID [i],
				this. ComponentName [i],
				this. ContractID [i],
				fileSpec,
				location,
				type
			);
	},
	
	unregisterSelf: function (componentManager, location, loaderStr) {}
};

DEFINE_STD_NS_GET_MODULE (Module)

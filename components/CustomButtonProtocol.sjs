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
						  URI_NON_PERSISTABLE;
	if (sProtocolName == "custombutton")
		this. protocolFlags |= URI_DOES_NOT_RETURN_DATA;
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
	
	get chromeProtocolHandler ()
	{
		var chromeProtocolHandler = CC ["@mozilla.org/network/protocol;1?name=chrome"].
									getService ();
		chromeProtocolHandler = chromeProtocolHandler. QI (nsIProtocolHandler);
		return chromeProtocolHandler;
	},
	
	get fakeOverlayURI ()
	{
		var fakeOverlayURI = "chrome://custombuttons/content/buttonsoverlay.xul";
		return this. chromeProtocolHandler. newURI (fakeOverlayURI, null, null);
	},
	
	fakeOverlayChannel: function ()
	{
		return this. chromeProtocolHandler. newChannel (this. fakeOverlayURI);
	},
	
	sCbPrefix: "custombuttons://content/",
	
	getChromePrincipal: function ()
	{
		var ssm = SERVICE (SCRIPT_SECURITY_MANAGER);
		var res;
		try
		{
			res = ssm. getCodebasePrincipal (this. fakeOverlayURI);
		}
		catch (e)
		{
			res = this. fakeOverlayChannel (). owner;
		}
		return res;
	},
	
	getJSVersion: function ()
	{
		var info = SERVICE (XUL_APP_INFO);
		var pv = info. platformVersion;
		var oVC = COMPONENT (VERSION_COMPARATOR);
		if (oVC. compare (pv, "1.9")   >= 0) return ";version=1.8";
		if (oVC. compare (pv, "1.8.1") >= 0) return ";version=1.7";
		if (oVC. compare (pv, "1.8")   >= 0) return ";version=1.6";
		return "";
	},
	
	getXULTemplate: function ()
	{
		var ios = SERVICE (IO);
		var xulchan = ios. newChannel ("chrome://custombuttons/content/tcbbutton.xul", null, null);
		var instr = xulchan. open ();
		var dp = COMPONENT (DOM_PARSER);
		var doc = dp. parseFromStream (instr, null, instr. available (), "application/xml");
		var script = doc. getElementsByTagName ("script") [0];
		script. setAttribute ("type", "application/x-javascript" + this. getJSVersion ());
		return doc;
	},
	
	pumpDocumentToPipe: function (doc, pipe)
	{
		var bos = COMPONENT (BINARY_OUTPUT_STREAM);
		bos. setOutputStream (pipe. outputStream);
		var xs = COMPONENT (DOM_SERIALIZER);
		xs. serializeToStream (doc, bos, "");
		bos. close ();
	},
	
	cbbuttonxulchannel: function (aURI)
	{
		var pipe = COMPONENT (PIPE);
		pipe. init (true, true, 0, 0, null);
		var doc = this. getXULTemplate ();
		this. pumpDocumentToPipe (doc, pipe);
		pipe. outputStream. close ();
		var chan = COMPONENT (INPUT_STREAM_CHANNEL);
		chan. contentStream = pipe. inputStream;
		chan. QI (nsIChannel);
		chan. setURI (aURI);
		chan. owner = this. getChromePrincipal ();
		chan. contentType = "application/vnd.mozilla.xul+xml";
		return chan;
	},
	
	getCustomButtonsFile: function (aURI, sFileName)
	{
		var cbs = SERVICE (CB);
		var dir = SERVICE (PROPERTIES). get ("ProfD", CI. nsIFile); // get profile folder
		dir. append ("custombuttons");
		if (!dir. exists ())
		{
			if (sFileName == "buttonsoverlay.xul")
				cbs. makeOverlay ();
			else
				return this. fakeOverlayChannel ();
		}
		var file = dir. clone ();
		file. append (sFileName);
		if (!file. exists ())
		{
			if (sFileName == "buttonsoverlay.xul")
				cbs. makeOverlay ();
			else
				return this. fakeOverlayChannel ();
		}
		var ios = SERVICE (IO);
		var uri = ios. newFileURI (file);
		var channel = ios. newChannelFromURI (uri);
		channel. originalURI = aURI;
		channel. owner = this. getChromePrincipal ();
		return channel;
	},
	
	newChannel: function (aURI)
	{
		if (this. scheme == "custombuttons")
		{
			var sFileName = aURI. spec. substring (this. sCbPrefix. length);
			if (sFileName == "cbbutton.xul")
				return this. cbbuttonxulchannel (aURI);
			else
				return this. getCustomButtonsFile (aURI, sFileName);
		}
		var cbs = SERVICE (CB);
		cbs. installWebButton (null, aURI. spec, true);
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

function NSGetFactory (cid)
{
    var protocol;
    if (cid. equals (CID ("{78D452B8-2CE8-4a7b-8A59-DA3C0960DAE7}")))
	protocol = "custombutton";
    else if (cid. equals (CID ("{1c796f9e-9a22-4604-84e4-fa7c4b8d80a4}")))
    	protocol = "custombuttons";
    return new CustombuttonsProtocolClassFactory (protocol);
}
DEFINE_STD_NS_GET_MODULE (Module)

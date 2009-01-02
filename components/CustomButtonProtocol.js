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
const kSIMPLEURI_CONTRACTID = "@mozilla.org/network/simple-uri;1";
const nsIURI = Components. interfaces. nsIURI;

function CustombuttonProtocol (sProtocolName)
{
 this. scheme = sProtocolName;
 this. protocolFlags = 1 | 2 | 64 |
        1024;
 if (sProtocolName == "custombutton")
  this. protocolFlags |= 2048;
 if (sProtocolName == "custombuttons")
  this. protocolFlags |= 4096;
 return this;
}
CustombuttonProtocol. prototype =
{
 QueryInterface: function (iid) { if (!iid. equals (Components. interfaces. nsIProtocolHandler) && !iid. equals (Components. interfaces. nsISupports)) throw Components. results. NS_ERROR_NO_INTERFACE; return this; },

 defaultPort: -1,
 protocolFlags: 1 | 2 | 64 |
       1024 | 2048,

 scheme: "custombutton",

 allowPort: function (port, scheme)
 {
  return false;
 },

 newURI: function (spec, charset, baseURI)
 {
  var uri = Components. classes [kSIMPLEURI_CONTRACTID]. createInstance (nsIURI);
  uri. spec = spec;
  return uri;
 },

 get chromeProtocolHandler ()
 {
  var chromeProtocolHandler = Components. classes ["@mozilla.org/network/protocol;1?name=chrome"].
         getService ();
  chromeProtocolHandler = chromeProtocolHandler. QueryInterface (Components. interfaces. nsIProtocolHandler);
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
  var ssm = Components. classes ["@mozilla.org/scriptsecuritymanager;1"]. getService (Components. interfaces. nsIScriptSecurityManager);
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

 newChannel: function (aURI)
 {
  if (this. scheme == "custombuttons")
  {
   var sFileName = aURI. spec. substring (this. sCbPrefix. length);
   var dir = Components. classes ["@mozilla.org/file/directory_service;1"]. getService (Components. interfaces. nsIProperties). get ("ProfD", Components. interfaces. nsIFile); // get profile folder
   if (!dir. exists ())
    return this. fakeOverlayChannel ();
   dir. append ("custombuttons");
   var file = dir. clone ();
   file. append (sFileName);
   if (!file. exists ())
    return this. fakeOverlayChannel ();
   var ios = Components. classes ["@mozilla.org/network/io-service;1"]. getService (Components. interfaces. nsIIOService);
   var uri = ios. newFileURI (file);
   var channel = ios. newChannelFromURI (uri);
   channel. originalURI = aURI;
   channel. owner = this. getChromePrincipal ();
   return channel;
  }
  var windowService = Components. classes ["@mozilla.org/appshell/window-mediator;1"]. getService (Components. interfaces. nsIWindowMediator);
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
   throw Components. results. NS_ERROR_NO_AGGREGATION;
  if (!iid. equals (Components. interfaces. nsIProtocolHandler) &&
   !iid. equals (Components. interfaces. nsISupports))
   throw Components. results. NS_ERROR_NO_INTERFACE;
  return new CustombuttonProtocol (this. protocol);
 }
};

var Module =
{
    CLSID: [Components. ID ("{78D452B8-2CE8-4a7b-8A59-DA3C0960DAE7}"),
   Components. ID ("{1c796f9e-9a22-4604-84e4-fa7c4b8d80a4}")],
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
   throw Components. results. NS_ERROR_NO_INTERFACE;
  if (!iid. equals (Components. interfaces. nsIFactory))
   throw Components. results. NS_ERROR_NOT_IMPLEMENTED;
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
   throw Components. results. NS_ERROR_FACTORY_REGISTER_AGAIN;
  componentManager = componentManager. QueryInterface (Components. interfaces. nsIComponentRegistrar);
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

function NSGetModule (componentManager, fileSpec) { return Module; }

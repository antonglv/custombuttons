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

function CustombuttonProtocol () {}
CustombuttonProtocol. prototype =
{
 QueryInterface: function (iid) { if (!iid. equals (Components. interfaces. nsIProtocolHandler) && !iid. equals (Components. interfaces. nsISupports)) throw Components. results. NS_ERROR_NO_INTERFACE; return this; },

 defaultPort: -1,
 protocolFlags: 1 | 2 | 64 |
       1024 | 2048,

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

 _system_principal: null,

 fakeOverlayChannel: function ()
 {
  var chromeProtocolHandler = Components. classes ["@mozilla.org/network/protocol;1?name=chrome"].
         getService ();
  chromeProtocolHandler = chromeProtocolHandler. QueryInterface (Components. interfaces. nsIProtocolHandler);
  var fakeOverlayURI = "chrome://custombuttons/content/buttonsoverlay.xul";
  var chromeURI = chromeProtocolHandler. newURI (fakeOverlayURI, null, null);
  return chromeProtocolHandler. newChannel (chromeURI);
 },

 sCbPrefix: "custombutton://content/",

 newChannel: function (aURI)
 {
  if (aURI. spec. indexOf (this. sCbPrefix) == 0)
  {
   var sFileName = aURI. spec. substring (this. sCbPrefix. length);
   if (!this. _system_principal)
   {
    var chromeChannel = this. fakeOverlayChannel ();
    this. _system_principal = chromeChannel. owner;
    var chromeRequest = chromeChannel. QueryInterface (Components. interfaces. nsIRequest);
    chromeRequest. cancel (0x804b0002);
   }
   var dir = Components. classes ["@mozilla.org/file/directory_service;1"]. getService (Components. interfaces. nsIProperties). get ("ProfD", Components. interfaces. nsIFile); // get profile folder
   if (!dir. exists ())
    return this. fakeOverlayChannel ();
   dir. append ("custombuttons");
   var file = dir. clone ();
   if (!file. exists ())
    return this. fakeOverlayChannel ();
   file. append (sFileName);
   var ios = Components. classes ["@mozilla.org/network/io-service;1"]. getService (Components. interfaces. nsIIOService);
   var uri = ios. newFileURI (file);
   var channel = ios. newChannelFromURI (uri);
   channel. originalURI = aURI;
   channel. owner = this. _system_principal;
   return channel;
  }
  var windowService = Components. classes ["@mozilla.org/appshell/window-mediator;1"]. getService (Components. interfaces. nsIWindowMediator);
  var currentWindow = windowService. getMostRecentWindow ("navigator:browser");
  if (!currentWindow)
   currentWindow = windowService. getMostRecentWindow ("mail:3pane");
  ButtonUri = aURI. spec;
  ButtonUri = ButtonUri. substring (ButtonUri. indexOf (":") + 1);
  currentWindow. custombuttons. installWebButton (ButtonUri);
  return false;
 }
}

var Module =
{
    CLSID: Components. ID ("{78D452B8-2CE8-4a7b-8A59-DA3C0960DAE7}"),
    ContractID: "@mozilla.org/network/protocol;1?name=custombutton",
    ComponentName: "Custombutton Protocol",

    canUnload: function (componentManager) { return true; }, getClassObject: function (componentManager, cid, iid) { if (!cid. equals (this. CLSID)) throw Components. results. NS_ERROR_NO_INTERFACE; if (!iid. equals (Components. interfaces. nsIFactory)) throw Components. results. NS_ERROR_NOT_IMPLEMENTED; return this. CLASS_FACTORY; }, FIRST_TIME: true, registerSelf: function (componentManager, fileSpec, location, type) { if (this. FIRST_TIME) this. FIRST_TIME = false; else throw Components. results. NS_ERROR_FACTORY_REGISTER_AGAIN; componentManager = componentManager. QueryInterface (Components. interfaces. nsIComponentRegistrar); componentManager. registerFactoryLocation ( this. CLSID, this. ComponentName, this. ContractID, fileSpec, location, type ); }, unregisterSelf: function (componentManager, location, loaderStr) {},

    CLASS_FACTORY:
 {
     createInstance: function (outer, iid)
     {
         if (outer != null)
             throw Components. results. NS_ERROR_NO_AGGREGATION;
         if (!iid. equals (Components. interfaces. nsIProtocolHandler) &&
          !iid. equals (Components. interfaces. nsISupports))
          throw Components. results. NS_ERROR_NO_INTERFACE;
         return new CustombuttonProtocol ();
     }
 }
};

function NSGetModule (componentManager, fileSpec) { return Module; }

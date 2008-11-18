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
// - This component is intended to support custombuttons "hot keys" definition
// 
// Author: Anton Glazatov (c) 2008
// 
// ***** END LICENSE BLOCK *****
function cbKeyMapService () {}
cbKeyMapService. prototype =
{
 QueryInterface: function (iid) { if (!iid. equals (Components. interfaces. cbIKeyMapService) && !iid. equals (Components. interfaces. nsISupports)) throw Components. results. NS_ERROR_NO_INTERFACE; return this; },

    keymap: {},

    Add: function (id, key, disableDefaultAction)
    {
  if (!id)
   return;
  if (key)
   this. keymap [id] = [key, disableDefaultAction];
  else
   this. Delete (id);
 },

 Delete: function (id)
 {
  if (this. keymap [id])
   delete this. keymap [id];
 },

 Get: function (key, count)
 {
  var values = new Array ();
  var mode = false;
  for (var i in this. keymap)
  {
   if (this. keymap [i] [0] == key)
   {
    values. push (i);
    mode = mode || this. keymap [i] [1];
   }
  }
  if (values. length != 0)
   values. unshift (mode? "true": "");
  count. value = values. length;
  return values;
 }
};

var Module =
{
    CLSID: Components. ID ("{86216795-2b22-470a-9388-785cb4b4101b}"),
    ContractID: "@xsms.nm.ru/custombuttons/cbkeymap;1",
    ComponentName: "Custombuttons extension keymap service component",

    canUnload: function (componentManager) { return true; }, getClassObject: function (componentManager, cid, iid) { if (!cid. equals (this. CLSID)) throw Components. results. NS_ERROR_NO_INTERFACE; if (!iid. equals (Components. interfaces. nsIFactory)) throw Components. results. NS_ERROR_NOT_IMPLEMENTED; return this. CLASS_FACTORY; }, FIRST_TIME: true, registerSelf: function (componentManager, fileSpec, location, type) { if (this. FIRST_TIME) this. FIRST_TIME = false; else throw Components. results. NS_ERROR_FACTORY_REGISTER_AGAIN; componentManager = componentManager. QueryInterface (Components. interfaces. nsIComponentRegistrar); componentManager. registerFactoryLocation ( this. CLSID, this. ComponentName, this. ContractID, fileSpec, location, type ); }, unregisterSelf: function (componentManager, location, loaderStr) {},
 CLASS_FACTORY: { QueryInterface: function (iid) { if (iid. equals (Components. interfaces. nsIFactory) || iid. equals (Components. interfaces. nsISupports)) return this; throw Components. results. NS_ERROR_NO_INTERFACE; }, createInstance: function (outer, iid) { if (outer != null) throw Components. results. NS_ERROR_NO_AGGREGATION; return (new cbKeyMapService ()). QueryInterface (iid); } }
};

function NSGetModule (componentManager, fileSpec) { return Module; }
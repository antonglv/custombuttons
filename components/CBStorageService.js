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
// - This component is intended to provide extension's
// - subservient data storage
// 
// Author: Anton Glazatov (c) 2008
// 
// ***** END LICENSE BLOCK *****
function CustombuttonsStorageService ()
{
 this. wrappedJSObject = this;
}
CustombuttonsStorageService. prototype =
{
 QueryInterface: function (iid) { if (!iid. equals (Components. interfaces. cbIStorageService) && !iid. equals (Components. interfaces. nsISupports)) throw Components. results. NS_ERROR_NO_INTERFACE; return this; },

    storage: {},

 wasChanged: function (id)
 {
  return this. storage [id]? true: false;
 },

 getChangedButtonsIds: function (count)
 {
  var values = new Array ();
  for (var i in this. storage)
   values. push (i);
  count. value = values. length;
  return values;
 },

 storeButtonParameters: function (id, buttonParameters)
 {
  if (this. storage [id])
   delete this. storage [id];
  this. storage [id] = buttonParameters;
 },

 getButtonParameters: function (id)
 {
  return this. storage [id] || null;
 }
};

var Module =
{
 CLSID: Components. ID ("{85a63191-33a3-4d77-a70d-ed4b3cc4c0d2}"),
    ContractID: "@xsms.nm.ru/custombuttons/cbstorageservice;1",
    ComponentName: "Custombuttons extension storage service",

 canUnload: function (componentManager) { return true; }, getClassObject: function (componentManager, cid, iid) { if (!cid. equals (this. CLSID)) throw Components. results. NS_ERROR_NO_INTERFACE; if (!iid. equals (Components. interfaces. nsIFactory)) throw Components. results. NS_ERROR_NOT_IMPLEMENTED; return this. CLASS_FACTORY; }, FIRST_TIME: true, registerSelf: function (componentManager, fileSpec, location, type) { if (this. FIRST_TIME) this. FIRST_TIME = false; else throw Components. results. NS_ERROR_FACTORY_REGISTER_AGAIN; componentManager = componentManager. QueryInterface (Components. interfaces. nsIComponentRegistrar); componentManager. registerFactoryLocation ( this. CLSID, this. ComponentName, this. ContractID, fileSpec, location, type ); }, unregisterSelf: function (componentManager, location, loaderStr) {},
 CLASS_FACTORY: { QueryInterface: function (iid) { if (iid. equals (Components. interfaces. nsIFactory) || iid. equals (Components. interfaces. nsISupports)) return this; throw Components. results. NS_ERROR_NO_INTERFACE; }, createInstance: function (outer, iid) { if (outer != null) throw Components. results. NS_ERROR_NO_AGGREGATION; return (new CustombuttonsStorageService ()). QueryInterface (iid); } }
};

function NSGetModule (componentManager, fileSpec) { return Module; }

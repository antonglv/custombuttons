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

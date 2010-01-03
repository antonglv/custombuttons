var custombutton =
{
 cbService: Components. classes ["@xsms.nm.ru/custombuttons/cbservice;1"]. getService (Components. interfaces. cbICustomButtonsService),

    buttonConstructor: function (oBtn)
 {
  if (oBtn. destroy)
   oBtn. destroy (); // to call onDestroy method, if exists
  var cbd = Components. classes ["@xsms.nm.ru/custombuttons/cbkeymap;1"]. getService (Components. interfaces. cbIKeyMapService);
  cbd. Delete (oBtn. getAttribute ("id"));
  if (!oBtn. hasAttribute ("cb-name"))
  {
   if (oBtn. hasAttribute ("label"))
    oBtn. name = oBtn. getAttribute ("label");
  }
  if (oBtn. hasAttribute ("cb-accelkey"))
  {
   cbd. Add
   (
    oBtn. getAttribute ("id"),
    oBtn. getAttribute ("cb-accelkey"),
    (oBtn. cbMode & 2)? true: false
   );
  }
  if (oBtn. hasAttribute ("cb-oncommand"))
   oBtn. cbCommand = oBtn. getAttribute ("cb-oncommand");
  if (oBtn. hasAttribute ("image"))
  {
   if (!oBtn. getAttribute ("image") ||
    (oBtn. getAttribute ("image") == "data:"))
   oBtn. removeAttribute ("image");
  }
  if (oBtn. hasAttribute ("Help"))
  {
   if (!oBtn. getAttribute ("Help"))
    oBtn. removeAttribute ("Help");
  }

  if (!oBtn. hasAttribute ("initialized"))
  {
   if (oBtn. hasAttribute ("cb-init"))
   {
    var ps = Components. classes ["@mozilla.org/preferences-service;1"]. getService (Components. interfaces. nsIPrefService). getBranch ("custombuttons.");
    var mode = ps. getIntPref ("mode");
    if (oBtn. parentNode && (oBtn. parentNode. nodeName != "toolbar") &&
     ((mode & 4) ||
     !(oBtn. cbMode & 1)))
     return;
    oBtn. cbInitCode = oBtn. getAttribute ("cb-init");
    oBtn. init ();
   }
   else
   {
    oBtn. setAttribute ("cb-init", "");
    oBtn. setAttribute ("initialized", "true");
   }
  }
 },

 buttonDestructor: function(oBtn)
 {
  if (oBtn. hasAttribute ("cb-accelkey"))
  {
   var cbd = Components. classes ["@xsms.nm.ru/custombuttons/cbkeymap;1"]. getService (Components. interfaces. cbIKeyMapService);
   cbd. Delete (oBtn. getAttribute ("id"));
  }
  if (oBtn. destroy)
   oBtn. destroy ();
 },

 checkBind: function()
 {
  if (Function. prototype. bind == undefined)
  {
   Function. prototype. bind = function (object)
   {
    var method = this;
    return function ()
    {
     return method. apply (object, arguments);
    }
   }
  }
 },

 buttonInit: function(oBtn)
 {
  if (oBtn. cbInitCode)
  {
   while (oBtn. hasChildNodes ())
    oBtn. removeChild (oBtn. childNodes [0]);
   oBtn. _initPhase = true;
   oBtn. setAttribute ("initializeerror");
   try
   {
    this. buttonCbExecuteCode ({}, oBtn, oBtn. cbInitCode);
    oBtn. setAttribute ("initialized", "true");
    oBtn. removeAttribute ("initializeerror");
   }
   finally
   {
    oBtn. _initPhase = false;
   }
  }
 },

 buttonDestroy: function (oBtn)
 {
  if (oBtn. onDestroy)
  {
   try
   {
    oBtn. onDestroy ();
   }
   catch (e) {}
   oBtn. onDestroy = null;
  }
 },

 buttonGetParameters: function(oBtn)
 {
  var parameters = {
   name: oBtn. name,
   image: oBtn. image,
   code: oBtn. cbCommand,
   initCode: oBtn. cbInitCode,
   accelkey: oBtn. cbAccelKey,
   mode: oBtn. cbMode,
   Help: oBtn. Help,
   stdIcon: oBtn. cbStdIcon
  };
  if (custombuttons. lightning && oBtn. hasAttribute ("mode"))
  {
   parameters. attributes = {};
   parameters. attributes ["mode"] = oBtn. getAttribute ("mode");
  }
  return parameters;
 },

 buttonGetCbAccelKey: function(oBtn)
 {
  if (oBtn. hasAttribute ("cb-accelkey"))
   return oBtn. getAttribute ("cb-accelkey");
  return "";
 },

 buttonGetImage: function(oBtn)
 {
  if (oBtn. hasAttribute ("image"))
   return oBtn. getAttribute ("image");
  return "";
 },

 buttonGetHelp: function(oBtn)
 {
  if (oBtn. hasAttribute ("Help"))
   return oBtn. getAttribute ("Help");
  return "";
 },

 buttonGetCbMode: function(oBtn)
 {
  if (oBtn. hasAttribute ("cb-mode"))
   return oBtn. getAttribute ("cb-mode");
  return 0;
 },

 buttonGetOldFormatURI: function(oBtn)
 {
  var uri = "custombutton://" + escape
  (
   [
    oBtn. name,
    oBtn. image,
    oBtn. cbCommand,
    oBtn. cbInitCode
   ]. join ("][")
  );
  return uri;
 },

 midFormatURI: function(oBtn)
 {
  var uri = "custombutton://" + escape
  (
   [
    oBtn. name,
    oBtn. image,
    oBtn. cbCommand,
    oBtn. cbInitCode,
    oBtn. Help
   ]. join ("]▲[")
  );
  return uri;
 },

 buttonSetText: function(doc, nodeName, text, make_CDATASection)
 {
  var node = doc. getElementsByTagName (nodeName) [0], cds;
  if (!node)
   return;
  if (make_CDATASection)
  {
   try
   {
    cds = doc. createCDATASection (text || "");
   }
   catch (e)
   {
    cds = doc. createTextNode (text || "");
   }
   node. appendChild (cds);
  }
  else
  {
   node. textContent = text;
  }
 },

 setAttribute: function (oDocument, sName, sValue)
 {
  var attsNode = oDocument. getElementsByTagName ("attributes") [0];
  var attr = oDocument. createElement ("attribute");
  attr. setAttribute ("name", sName);
  attr. setAttribute ("value", sValue);
  attsNode. appendChild (attr);
 },

 xmlFormatURI: function(oBtn)
 {
  var doc = document. implementation. createDocument ("", "", null);
  doc. async = false;
  doc. load ("chrome://custombuttons/content/nbftemplate.xml");
  oBtn. setText (doc, "name", oBtn. name, false);
  oBtn. setText (doc, "mode", oBtn. cbMode, false);
  oBtn. setText (doc, "image", oBtn. image || oBtn. cbStdIcon, true);
  oBtn. setText (doc, "code", oBtn. cbCommand, true);
  oBtn. setText (doc, "initcode", oBtn. cbInitCode, true);
  oBtn. setText (doc, "accelkey", oBtn. cbAccelKey, true);
  oBtn. setText (doc, "help", oBtn. Help, true);
  if (oBtn. parameters. attributes)
  {
   var atts = oBtn. parameters. attributes;
   for (var i in atts)
    this. setAttribute (doc, i, atts [i]);
  }
  var ser = new XMLSerializer ();
  var data = ser. serializeToString (doc);
  return "custombutton://" + escape (data);
 },

 buttonGetURI: function (oBtn)
 {
  var ps = Components. classes ["@mozilla.org/preferences-service;1"].
  getService (Components. interfaces. nsIPrefService).
  getBranch ("custombuttons.");
  var mode = ps. getIntPref ("mode");
  if (mode & 1)
   return this. xmlFormatURI (oBtn);
  else if (mode & 8)
   return this. midFormatURI (oBtn);
  else
   return this. buttonGetOldFormatURI (oBtn);
 },

 buttonCbExecuteCode: function (event, oButton, code)
 {
  this. checkBind ();
  var oCBError, errLine;
  var cd = null, cm = null;
  if ("custombuttonsUtils" in window)
  {
   cd = custombuttonsUtils. createDebug;
   cm = custombuttonsUtils. createMsg;
  }
  try
  {
   errLine = new Error (). lineNumber + 1;
   (new Function ("event,createDebug,createMsg", code)). apply
   (
    oButton, [event, cd, cm]
   );
  }
  catch (oError)
  {
   errLine = oError. lineNumber - errLine + 1;
   if (errLine == 4294967295)
    errLine = 0;
   oCBError = new Error ();
   oCBError. name = oError. name;
   oCBError. message = oError. message;
   var phase = oButton. _initPhase? "init": "code";
   oCBError. fileName = this. cbService. makeButtonLink (document. documentURI, phase, oButton. id);
   oCBError. lineNumber = errLine;
   oCBError. stack = oError. stack;
   throw (oCBError);
  }
 },

 // TODO: check for code evaluation construction. Carefully check.
 buttonCommand: function(event, oBtn)
 {
  if (oBtn. cbCommand)
   this. buttonCbExecuteCode (event, oBtn, oBtn. cbCommand);
 },

 canUpdate: function ()
 {
  return this. cbService. canUpdate ();
 },

 showElement: function (oElement, bShowFlag)
 {
  if (oElement. hasAttribute ("hidden"))
   oElement. removeAttribute ("hidden");
  if (!bShowFlag)
   oElement. setAttribute ("hidden", "true");
 },

 showBroadcast: function (sIdSuffix, bShowFlag)
 {
  var sBroadcasterId = "custombuttons-contextbroadcaster-" + sIdSuffix;
  var oBroadcaster = document. getElementById (sBroadcasterId);
  if (oBroadcaster)
   this. showElement (oBroadcaster, bShowFlag);
 },

 setContextMenuVisibility: function (oButton)
 {
  this. showBroadcast ("root", false); // hide all buttons menuitems
  this. showBroadcast ("update", true);
  this. showBroadcast ("help", true);
  this. showBroadcast ("customizeseparator", true);
  var bPrimary = !oButton. _ctxtObj;
  this. showBroadcast ("primary", bPrimary);
  this. showBroadcast ("secondary", !bPrimary);
  var nCurrentNum = oButton. id. replace (/custombuttons-button/, "");
  var sCurrentBroadcasterId = "custombuttons-buttonbroadcaster" + nCurrentNum;
  var oCurrentBroadcaster = document. getElementById (sCurrentBroadcasterId);
  var bHideUpdate = !this. canUpdate ();
  var bHideHelp = !this. buttonGetHelp (oButton);
  var bHideSeparator = bHideUpdate && bHideHelp && !document. getElementById ("custombuttons-contextpopup-bookmarkButton");
  if (oCurrentBroadcaster)
   this. showElement (oCurrentBroadcaster, !bPrimary);
  if (bHideUpdate)
   this. showBroadcast ("update", false);
  if (bHideHelp)
   this. showBroadcast ("help", false);
  if (bHideSeparator)
   this. showBroadcast ("customizeseparator", false);
 },

 onMouseDown: function (oEvent, oButton)
 {
  this. setContextMenuVisibility (oButton);
 }
};

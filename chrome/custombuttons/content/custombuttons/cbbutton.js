    function dLOG (text)
    {
          var consoleService = Components. classes ["@mozilla.org/consoleservice;1"]. getService (Components. interfaces. nsIConsoleService);
          consoleService. logStringMessage (text);
    }
    function dEXTLOG (aMessage, aSourceName, aSourceLine, aLineNumber,
              aColumnNumber, aFlags, aCategory)
    {
      var consoleService = Components. classes ["@mozilla.org/consoleservice;1"]. getService (Components. interfaces. nsIConsoleService);
      var scriptError = Components. classes ["@mozilla.org/scripterror;1"]. createInstance (Components. interfaces. nsIScriptError);
      scriptError. init (aMessage, aSourceName, aSourceLine, aLineNumber,
                 aColumnNumber, aFlags, aCategory);
      consoleService. logMessage (scriptError);
    }
var custombutton =
{
    buttonConstructor: function (oBtn)
 {
  var cbd = Components. classes ["@xsms.nm.ru/custombuttons/cbkeymap;1"]. getService (Components. interfaces. cbIKeyMapService);
  cbd. Delete (oBtn. getAttribute ("id"));
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
    if ((oBtn. parentNode. nodeName != "toolbar") &&
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
   this. checkBind ();
   try
   {
    (new Function (oBtn. cbInitCode)). apply (oBtn);
   }
   catch (e)
   {
    var msg = "Custom Buttons error.]" +
    "[ Event: Initialization]" +
    "[ Button name: " +
    oBtn. getAttribute ("label") +
    "]" +
    "[ Button ID: " +
    oBtn. getAttribute ("id") +
    "]" +
    "[ " +
    e;
    throw new Error (msg);;
   }
  }
  oBtn. setAttribute ("initialized", "true");
 },

 buttonGetParameters: function(oBtn)
 {
  return {
   name: oBtn. name,
   image: oBtn. image,
   code: oBtn. cbCommand,
   initCode: oBtn. cbInitCode,
   accelkey: oBtn. cbAccelKey,
   mode: oBtn. cbMode,
   Help: oBtn. Help
  };
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
    oBtn. cbInitCode
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
   cds = doc. createCDATASection (text || "");
   node. appendChild (cds);
  }
  else
  {
   node. textContent = text;
  }
 },


 xmlFormatURI: function(oBtn)
 {
  var doc = document. implementation. createDocument ("", "", null);
  doc. async = false;
  doc. load ("chrome://custombuttons/content/nbftemplate.xml");
  oBtn. setText (doc, "name", oBtn. name, false);
  oBtn. setText (doc, "mode", oBtn. cbMode, false);
  oBtn. setText (doc, "image", oBtn. image, true);
  oBtn. setText (doc, "code", oBtn. cbCommand, true);
  oBtn. setText (doc, "initcode", oBtn. cbInitCode, true);
  oBtn. setText (doc, "accelkey", oBtn. cbAccelKey, true);
  oBtn. setText (doc, "help", oBtn. Help, true);
  var ser = new XMLSerializer ();
  var data = ser. serializeToString (doc);
  return "custombutton://" + escape (data);
 },

 buttonGetURI: function (oBtn)
 {
  var ps = Components. classes ["@mozilla.org/preferences-service;1"].
  getService (Components. interfaces. nsIPrefService).
  getBranch ("custombuttons.");
  if (ps. getIntPref ("mode") && 1)
   return this. xmlFormatURI (oBtn);
  else
   return this. midFormatURI (oBtn);
 },

 buttonCbExecuteCode: function(oBtn)
 {
  if (oBtn. cbCommand)
  {
   this. checkBind ();
   (new Function (oBtn. cbCommand)). apply (oBtn);
  }
 },

    buttonContext: function (event, oBtn)
    {
        var helpButtonMenuitem = document. getElementById ("custombuttons-contextpopup-buttonHelp");
        var bHasHelp = oBtn. hasAttribute ("help") || oBtn. hasAttribute ("Help");
        helpButtonMenuitem. setAttribute ("hidden", bHasHelp? "false": "true");
  var updateButtonMenuitem = document. getElementById ("custombuttons-contextpopup-updateButton");
  var bShouldHideUpdateMenuitem = true;
  try
  {
   var uri = new CustombuttonsURIParser (custombuttonsUtils. gClipboard. read ());
   bShouldHideUpdateMenuitem = false;
  }
  catch (e) {}
  updateButtonMenuitem. setAttribute ("hidden", bShouldHideUpdateMenuitem);
  var bShouldHideSeparator = (!bHasHelp && bShouldHideUpdateMenuitem);
  if (document. getElementById ("custombuttons-contextpopup-bookmarkButton"))
   bShouldHideSeparator = false;
  var oSeparator = document. getElementById ("custombuttons-contextpopup-separator3");
  oSeparator. setAttribute ("hidden", bShouldHideSeparator);
    },

 // TODO: check for code evaluation construction. Carefully check.
 buttonCommand: function(event, oBtn)
 {
  if (oBtn. cbCommand)
  {
   var code = "var event = arguments[0];\n";
   code += oBtn. cbCommand;
   this. checkBind ();
   (new Function (code)). apply (oBtn, arguments);
  }
 }
};

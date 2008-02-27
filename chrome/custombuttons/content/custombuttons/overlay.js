function CustombuttonsButton (uri)
{
 this. parse (uri);
}
CustombuttonsButton. prototype =
{
 doc: null,
 parameters: {},

 getText: function (nodeName)
 {
  var result = "";
  var node = this. doc. getElementsByTagName (nodeName) [0];
  if (!node)
   return result;
  if (!node. firstChild || (node. firstChild &&
            (node. firstChild. nodeType == node. TEXT_NODE)))
   result = node. textContent;
  else // CDATA
   result = node. firstChild. textContent;
  return result;
 },

 parse: function (uri)
 {
  var button_code = unescape (uri);
  if (button_code. substring (0, 2) == "//")
   button_code = button_code. substring (2);
  values = {};
  if (button_code. indexOf ("<?xml ") == 0)
  {
   var xp = new DOMParser ();
   this. doc = xp. parseFromString (button_code, "text/xml");
   values. name = this. getText ("name");
   values. mode = this. getText ("mode");
   values. image = this. getText ("image");
   values. code = this. getText ("code");
   values. initCode = this. getText ("initcode");
   values. accelkey = this. getText ("accelkey");
            values. help = this. getText ("help");
  }
  else
  {
   var az = ["%5D%E2%96%B2%5B", "]\u00e2\u0096\u00b2[", "]▲[", "%5D%u25B2%5B"], idx = -1;
            for ( var i = 0; i < az.length; i++) {
                idx = (idx >= 0)? idx : ( button_code.indexOf(az[i]) > -1 )? i : idx ;
            } // End for
            sep = (idx >= 0)? az[idx] : "][";
            var ar = button_code.split( sep ); // Split button
            if (ar.length == 5 || ar.length == 4 )
            {
                values. name = ar [0] || "";
                values. image = ar [1] || "";
                values. code = ar [2] || "";
                values. initCode = ar [3] || "";
                values. help = ar [4] || "";
            }
            else {
                throw new Error ("Malformed custombutton:// URI");;
   }
  }
        this. parameters = values;
 }
};

function Custombuttons () {}
Custombuttons. prototype =
{
 ps: Components. classes ["@mozilla.org/preferences-service;1"]. getService (Components. interfaces. nsIPrefService). getBranch ("custombuttons.button"),
 buttonParameters: ["name", "image", "code", "initCode", "accelkey", "help"],
 buttonsLoadedFromProfileOverlay: null,
 button: null,
 values: null,
 toolbar: null,
 notificationSender: false,
 _palette: null,
 get palette ()
 {
  if (!this. _palette)
   this. _palette = this. getPalette ();
  return this. _palette;
 },

 getPalette: function ()
 {
  var gToolbox = document. getElementById ("navigator-toolbox") || // FF3b2 and lower
  document. getElementById ("browser-toolbox"); // FF3b3pre and higher
  return gToolbox. palette;
 },

 getButtonParameters: function (num)
 { //using for compatibility with older format
  try
  {
   var data = this. ps. getComplexValue (num, Components. interfaces. nsISupportsString). data;
   var button = new CustombuttonsButton (data);
   return button. parameters;
 } catch (err) {}
 return false;
 },

 isCustomizableToolbar: function (aElt)
 { //using for compatibility with older format
  return (aElt. localName == "toolbar") &&
  (aElt. getAttribute ("customizable") == "true");
 },

 getButtonsPlacesOnToolbars: function ()
 { //using for compatibility with older format
  var toolbars = this. getToolbars ();
  var places = new Array ();
  for (var i = 0; i < toolbars. length; i++)
  {
   var toolbar = toolbars [i];
   var currentSet = toolbar. getAttribute ("currentset");
   //BEGIN AIOS - нахождение currentSet для binding-панелей слева и справа от tabbar
   if (toolbar. getAttribute ("anonymous") == "true")
   {
    var attr = "_toolbar_currentset_" +
    toolbar. getAttribute ("anonid");
    currentSet = document. documentElement. getAttribute (attr);
   }
   //END AIOS

   var ar = currentSet. split (",");
   var last = ar. pop ();
   var z = 0;
   for (var j = 0; j < ar. length; j++)
   {
    if (ar [j]. indexOf ("custombuttons-button") != -1)
     places. push ([toolbar, ar [j], z]);
    else
     z++;
   }
   if (last. indexOf ("custombuttons-button") != -1)
   {
    var pos = null;
    //BEGIN AIOS bug с пропаданием кнопок в статусбаре (из-за aios-bmbugfix в AIOS)
    if ((toolbar. id == "aiostbx-toolbar-statusbar-right") &&
     (toolbar. lastChild. id == "aiostbx-bmbugfix"))
    pos = toolbar. childNodes. length - 1;
    //END AIOS
    places. push ([toolbar, last, pos]);
   }
  }
  return places;
 },

 makeButtons: function ()
 { //using for compatibility with older format AND for Initialization
  var numbers = this. ps. getChildList ("", {});
  if (numbers. length > 0)
  {
   var buttons = new Object ();
   for (var i = 0; i < numbers. length; i++)
   {
    var values = this. getButtonParameters (numbers [i]);
    var button = this. getButtonById (numbers [i]);
    if (values && !button)
    {
     var newButton = this. createButton (numbers [i], values);
     buttons [newButton. id] = newButton;
    }
   }
   for (var but in buttons)
    this. palette. appendChild (buttons [but]);
   var places = this. getButtonsPlacesOnToolbars ();
   for (var i = places. length - 1; i >= 0; i--)
   {
    var nowButtonNum = this. getNumber (places [i] [1]);
    if (nowButtonNum)
    {
     var aBefore = places [i] [0]. childNodes [places [i] [2]];
     var values = this. getButtonParameters (nowButtonNum);
     var newButton = this. createButton (nowButtonNum, values);
     this. insertToToolbar (places [i] [0], newButton, aBefore);
    }
   }
   //deleting buttons from prefs.js, now they would be saved in the profile
   for (var i = 0; i < numbers. length; i++)
   {
    this. ps. deleteBranch (numbers [i]);
   }
   this. saveButtonsToProfile ();
  }
  //reinit buttons that for some reasons were not initialized in xbl
  this. reInitializeButtons ();
 },

 getButtonById: function (id)
 {
  var id2 = (isFinite (id)? "custombuttons-button": "") + id;
  return this. palette. getElementsByAttribute ("id", id2) [0] || null;
 },

 createButton: function (num, values)
 { //updated
  var oItem = null;
  for (var i = 0; i < this. palette. childNodes. length; i++)
   if (this. palette. childNodes [i]. id == "custombuttons-template-button")
   {
    var cbpb = this. palette. childNodes [i];
    oItem = cbpb. cloneNode (true);
    break;
   }
   if (!oItem)
    oItem = document. createElement ("toolbarbutton");
   oItem. className = "toolbarbutton-1 chromeclass-toolbar-additional";
   oItem. setAttribute ("context", "custombuttons-contextpopup");
   oItem. setAttribute ("id", "custombuttons-button" + num);
   oItem. setAttribute ("label", values. name || "");
   oItem. setAttribute ("tooltiptext", values. name || "");
   if (values. image && values. image. length != -1)
    oItem. setAttribute ("image", values. image);
   if (values. mode)
    oItem. setAttribute ("cb-mode", values. mode);
   if (values. accelkey)
    oItem. setAttribute ("cb-accelkey", values. accelkey);
   var code = values. code || "";
   var initCode = values. initCode || "";
   var Help = values. help || "";
   oItem. setAttribute ("cb-oncommand", code);
   oItem. setAttribute ("cb-init", initCode);
            oItem. setAttribute ("Help", Help);
   return oItem;
 },

 getToolbars: function ()
 { //used.
  var toolbars = new Array;
  var main_toolbars = document. getElementsByTagName ("toolbar");
  for (var i = 0; i < main_toolbars. length; i++)
   if (this. isCustomizableToolbar (main_toolbars [i]))
   toolbars. push (main_toolbars [i]);

  //BEGIN AIOS binding toolbars
  //added support for tbx 15.06.2006
  var aiostbx_bindingBoxes = new Array
  (
   "aiostbx-tableft-toolbox",
   "aiostbx-tabright-toolbox",
   "aiostbx-belowtabs-toolbox",
   "tbx-tableft-toolbox",
   "tbx-tabright-toolbox",
   "tbx-belowtabs-toolbox"
   );
  var aios_toolbox;
  for (var i = 0; i < aiostbx_bindingBoxes. length; i++)
  {
   aios_toolbox = document. getElementById (aiostbx_bindingBoxes [i]);
   if (aios_toolbox)
   {
    var children = aios_toolbox. childNodes;
    for (var j = 0; j < children. length; j++)
     if (this. isCustomizableToolbar (children [j]))
     toolbars. push (children [j]);
   }
  }
  //END AIOS belowtabs toolbars

  return toolbars;
 },

 insertToToolbar: function (toolbar, newItem, aBeforeElt)
 { //checked-used
  if (aBeforeElt)
   toolbar. insertBefore (newItem, aBeforeElt);
  else
   toolbar. appendChild (newItem);
 },

 reInitializeButtons: function ()
 {
  for (var j = 0; j < this. palette. childNodes. length; j++)
  {
   var id = this. palette. childNodes [j]. getAttribute ("id");
   if (id. indexOf ("custombuttons-button") != -1)
   {
    var tbButton = document. getElementById (id);
    if (tbButton && !tbButton. hasAttribute ("initialized"))
     tbButton. init ();
   }
  }
 },

 init: function ()
 {
  var pref = "settings.editor.showApplyButton";
  var ps = Components. classes ["@mozilla.org/preferences-service;1"]. getService (Components. interfaces. nsIPrefService);
  ps = ps. QueryInterface (Components. interfaces. nsIPrefBranch);
  var cbps = ps. getBranch ("custombuttons.");
  var mode = cbps. getIntPref ("mode");
  if (ps. prefHasUserValue (pref))
  {
   mode |= (ps. getBoolPref (pref)? 2: 0);
   try
   {
    ps. deleteBranch (pref);
   }
   catch (e) {}
  }
  cbps. setIntPref ("mode", mode);
  setTimeout ("custombuttons.makeButtons()", 200);
  var cbss = Components. classes ["@xsms.nm.ru/custombuttons/cbstorageservice;1"]. getService (Components. interfaces. cbIStorageService);
  var result = {};
  var aChangedButtons = cbss. getChangedButtonsIds (result);
  var buttonParameters, values, id;
  for (var i = 0; i < aChangedButtons. length; i++)
  {
   id = aChangedButtons [i];
   values = {};
   buttonParameters = cbss. getButtonParameters (id);
   values. name = buttonParameters. name;
   values. mode = buttonParameters. mode;
   values. image = buttonParameters. image;
   values. code = buttonParameters. code;
   values. initCode = buttonParameters. initcode;
   values. accelkey = buttonParameters. accelkey;
   values. help = buttonParameters. help;
   this. setButtonParameters (this. getNumber (id), values);
  }
  var os = Components. classes ["@mozilla.org/observer-service;1"]. getService (Components. interfaces. nsIObserverService);
  os. addObserver (this, "2c73fe2f-2ed5-432d-9901-a8dbc4961e83", false);
 },

 openButtonDialog: function (editDialogFlag)
 {
  openDialog
  (
   "chrome://custombuttons/content/edit.xul",
   "custombuttons-edit",
   "chrome,resizable,dependent,dialog=no",
   editDialogFlag? document. popupNode: null
  );
 },

 editButton: function ()
 {
  this. openButtonDialog (true);
 },

 addButton: function ()
 {
  this. openButtonDialog (false);
 },

 prepareButtonOperation: function ()
 {
  this. button = document. popupNode;
  this. values = this. button. parameters;
  this. toolbar = this. button. parentNode;
 },

 finalizeButtonOperation: function (newButtonId)
 {
  //Исправляем currentSet для toolbar
  var repstr = "";
  if (newButtonId)
   repstr = this. button. id + "," + newButtonId;
  var cs = this. toolbar. getAttribute ("currentset");
  var ar = cs. split (this. button. id);
  cs = ar. slice (0, 2). join (repstr);
  if (ar. length > 2)
   cs = cs + ar. slice (2). join ("");
  cs = cs. replace (/^,/, "");
  cs = cs. replace (/,,/g, ",");
  cs = cs. replace (/,$/, "");
  this. toolbar. setAttribute ("currentset", cs);
  document. persist (this. toolbar. id, "currentset");

  //если это custom-toolbar, то исправляем атрибуты в toolbarSet...
  var customindex = this. toolbar. getAttribute ("customindex");
  if (customindex > 0)
  {
   var attrName = "toolbar" + customindex;
   var toolbarSet = document. getElementById ("customToolbars");
   var oldSet = toolbarSet. getAttribute (attrName);
   cs = oldSet. substring (0, oldSet. indexOf (":") + 1) + cs;
   toolbarSet. setAttribute (attrName, cs);
   document. persist ("customToolbars", attrName);
  }
  //Исправления для AIOS
  if (document. getElementById ("aiostbx-belowtabs-toolbox"))
   persistCurrentSets ();
  this. saveButtonsToProfile ();
 },

 removeButton: function ()
 {
  this. prepareButtonOperation ();
  var str = document. getElementById ("cbStrings"). getString ("RemoveConfirm"). replace (/%s/gi, this. values. name);
  var buts = this. palette. childNodes;
  if (confirm (str))
  {
   var but = this. getButtonById (this. button. id);
   if (but)
    this. palette. removeChild (but);
   this. toolbar. removeChild (this. button);
   this. finalizeButtonOperation (null);
  }
 },

 cloneButton: function ()
 {
  this. prepareButtonOperation ();
  var newNum = this. min_button_number ();
  var newButton = this. createButton (newNum, this. values);
  var newButton2 = this. createButton (newNum, this. values);
  var newButtonId = newButton. id;
  this. palette. appendChild (newButton2);
  var aBefore = this. button. nextSibling;
  this. insertToToolbar (this. toolbar, newButton, aBefore);
  this. finalizeButtonOperation (newButtonId);
 },

 copyURI: function ()
 { //checked
        custombuttonsUtils. gClipboard. write (document. popupNode. URI);
        // note: if we want to use external implementation
        // we shall be sure it will not change suddenly.
 },

 getNumber: function (id)
 { //checked
  if (id. indexOf ("custombuttons-button") != -1)
   return id. substring ("custombuttons-button". length);
  return "";
 },

 min_button_number: function ()
 { //updated
  var bt = new Object ();
  var buts = this. palette. childNodes;
  var butscount = buts. length;
  var n, id;
  for (var j = 0; j < butscount; j++)
  {
   id = buts [j]. getAttribute ("id");
   n = this. getNumber (id);
   if (n)
    bt [n] = true;
  }
  var z = 0;
  while (typeof bt [z] != "undefined")
   z++;
  return z;
 },

 setButtonParameters: function (num, values)
 { //updated
  if (num) // edit button
  {
   //заменяем button в Palette и на панели на обновленную
   var newButton = this. createButton (num, values);
   var newButton2 = this. createButton (num, values);
   var buts;
   //toolbar
   buts = document. getElementsByAttribute ("id", newButton2. id);
   if (buts [0])
    buts [0]. parentNode. replaceChild (newButton2, buts [0]);
   //palette
   buts = this. getButtonById (newButton. id);
   if (buts)
    buts. parentNode. replaceChild (newButton, buts);
   this. notificationSender = true;
   var os = Components. classes ["@mozilla.org/observer-service;1"]. getService (Components. interfaces. nsIObserverService);
   os. notifyObservers (newButton2, "2c73fe2f-2ed5-432d-9901-a8dbc4961e83", num);
   this. notificationSender = false;
  }
  else // install web button or add new button
  { //checked
   num = this. min_button_number ();
   var newButton = this. createButton (num, values);
   /*вставляем button в Palette и выдаем алерт об успешном создании*/
   //palette
   this. palette. appendChild (newButton);
   var str = document. getElementById ("cbStrings"). getString ("ButtonAddedAlert");
   alert (str);
  }
  this. saveButtonsToProfile ();
 },

 installWebButton: function (uri)
 { //checked
  try
  {
   var button = new CustombuttonsButton (uri);
  }
  catch (err)
  {
   var str = document. getElementById ("cbStrings"). getString ("ButtonErrors");
   alert (str);
   return false;
  }
  var str = document. getElementById ("cbStrings"). getString ("InstallConfirm"). replace (/%s/gi, button. parameters. name);
  if (confirm (str))
   this. setButtonParameters (null, button. parameters);
  return true;
 },

 execute_oncommand_code: function (code, button)
 { //checked
  var x = new Function (code);
  x. apply (button);
 },

 saveButtonsToProfile: function ()
 {
  var doc;
  doc = this. makeOverlay ("BrowserToolbarPalette");
  this. saveOverlayToProfile (doc, "buttonsoverlay.xul");
 },

 makeOverlay: function (paletteId)
 {
  var doc = document. implementation. createDocument ("", "", null);
  doc. async = false;
  doc. load ("chrome://custombuttons/content/buttonsoverlay.xul");
  var palette = doc. getElementById (paletteId);
  var copiedAttributes =
  {
   "class" : true,
   "id" : true,
   "label" : true,
   "image" : true,
   "cb-oncommand" : true,
   "cb-init" : true,
   "cb-mode" : true,
   "cb-accelkey" : true,
   "context" : true,
   "tooltiptext" : true,
   "Help" : true
  };

  //adding buttons from palette to new doc
  for (var j = 0; j < this. palette. childNodes. length; j++)
  {
   var but = this. palette. childNodes [j];
   if (but. getAttribute ("id"). indexOf ("custombuttons-button") != -1)
   {
    var newButton = doc. createElement (but. nodeName);
    for (a in copiedAttributes)
    {
     if (but. hasAttribute (a))
      newButton. setAttribute (a, but. getAttribute (a));
    }
    palette. appendChild (newButton);
   }
  }
  return doc;
 },

 saveOverlayToProfile: function (doc, fileName)
 {
  var serializer = new XMLSerializer ();
  var data = serializer. serializeToString (doc);

  //beautifull output
  XML. prettyPrinting = true;
  data = (new XML (data)). toXMLString ();

  var uniConv = Components. classes ["@mozilla.org/intl/scriptableunicodeconverter"]. createInstance (Components. interfaces. nsIScriptableUnicodeConverter);
  uniConv. charset = "utf-8";
  data = uniConv. ConvertFromUnicode (data);

  var dir = Components. classes ["@mozilla.org/file/directory_service;1"]. getService (Components. interfaces. nsIProperties). get ("ProfD", Components. interfaces. nsIFile); // get profile folder
  dir. append ("custombuttons");
  if (!dir. exists ())
  {
   try
   {
    dir. create (1, 0755);
   }
   catch (e)
   {
    var msg = 'Custom Buttons error.]' +
    '[ Event: Creating custombuttons directory]' +
    '[ ' + e;
    Components. utils. reportError (msg);
   }
  }

  var file = dir. clone ();
  file. append (fileName);
  if (file. exists ())
  {
   //creating backup
   var backupfile = dir. clone ();
   var backupfileName = fileName + ".bak";
   backupfile. append (backupfileName);
   if (backupfile. exists ())
    backupfile. remove (false);
   file. copyTo (dir, backupfileName);
  }

  var foStream = Components. classes ["@mozilla.org/network/file-output-stream;1"]. createInstance (Components. interfaces. nsIFileOutputStream);
  var flags = 0x02 | 0x08 | 0x20;
  foStream. init (file, flags, 0664, 0);
  foStream. write (data, data. length);
  foStream. close ();
 },

 _eventKeymap: [],
 getKey: function (event)
 {
  if (event. which)
   return String. fromCharCode (event. which);
  if (this. _eventKeymap. length == 0)
  {
   var prefix = "DOM_VK_";
   for (i in event)
    if (i. indexOf (prefix) == 0)
     this. _eventKeymap [event [i]] = i. substr (prefix. length);
  }
  return this. _eventKeymap [event. keyCode];
 },

 onKeyPress: function (event)
 {
  var prefixedKey = "";
  if (event. altKey) prefixedKey += "Alt+";
  if (event. ctrlKey) prefixedKey += "Ctrl+";
  if (event. shiftKey) prefixedKey += "Shift+";
  var key = this. getKey (event);
  prefixedKey += key;
  if ((key == "TAB") || (prefixedKey == "ESCAPE"))
   return;
  var cbd = Components. classes ["@xsms.nm.ru/custombuttons/cbkeymap;1"]. getService (Components. interfaces. cbIKeyMapService);
  var lenobj = {};
  var ids = cbd. Get (prefixedKey, lenobj);
  if (ids. length == 0)
   return;
  var mode = (ids. shift () == "true");
  if (mode)
  {
   event. stopPropagation ();
   event. preventDefault ();
  }
  for (var i = 0; i < ids. length; i++)
  {
   try
   {
    document. getElementById (ids [i]). cbExecuteCode ();
   }
   catch (e) {}
  }
 },

 /* EventHandler interface */
 handleEvent: function (event)
 {
  switch (event. type)
  {
   case "load":
    this. init ();
    break;
   case "unload":
    var os = Components. classes ["@mozilla.org/observer-service;1"]. getService (Components. interfaces. nsIObserverService);
    os. removeObserver (this, "2c73fe2f-2ed5-432d-9901-a8dbc4961e83");
    window. removeEventListener ("load", custombuttons, false);
    window. removeEventListener ("unload", custombuttons, false);
    window. removeEventListener ("keypress", custombuttons, true);
    break;
   case "keypress":
    this. onKeyPress (event);
    break;
   default:
    break;
  }
 },

 /* nsIObserver interface */
 observe: function (subject, topic, data)
 {
  if ((topic == "2c73fe2f-2ed5-432d-9901-a8dbc4961e83") &&
   !this. notificationSender)
  {
   this. setButtonParameters (data, subject. parameters);
  }
 },

    /**  bookmarkButton(  )
      Author George Dunham
    
      Args:
      Returns: Nothing
      Scope:	 private
      Called:   from overlay.xul
      Purpose: Allows one to save a button as a bookmark
      UPDATED: 11/12/2007 to improve stability.
      changed by Anton 24.02.08
    **/
    bookmarkButton: function (oBtn)
    {
        var Button = (oBtn)? oBtn: document. popupNode;
        this. makeBookmark (Button. URI, Button. label);
    },

    makeBookmark: function (CbLink, sName)
    {
        BookmarksUtils. addBookmark (CbLink, sName);
    }
};

function CustombuttonsMF () {}
CustombuttonsMF. prototype =
{
    makeBookmark: function (CbLink, sName)
    {
  var uri = Components. classes ["@mozilla.org/network/simple-uri;1"]. createInstance (Components. interfaces. nsIURI); // since there was 'bookmarkLink' execution problem
  uri. spec = CbLink; // it seems nsIURI spec re-passing solves it
  PlacesCommandHook. bookmarkLink (PlacesUtils. bookmarksMenuFolderId, uri. spec, sName);
  /* alternative code, does not show dialog
		var uri = COMPONENT (SIMPLE_URI);
		uri. spec = CbLink;
        var bmsvc = SERVICE (NAV_BOOKMARKS);
        bmsvc. insertBookmark
        (
            bmsvc. bookmarksMenuFolder,
			uri,
			bmsvc. DEFAULT_INDEX,
			sName
		);
		*/
    }
};
CustombuttonsMF. prototype. __proto__ = Custombuttons. prototype;

function CustombuttonsTB () {}
CustombuttonsTB. prototype =
{
    getPalette: function ()
 {
  var gToolbox = document. getElementById ("mail-toolbox") || // main window and message window
  document. getElementById ("compose-toolbox"); // compose message
  return gToolbox. palette;
 },

 saveButtonsToProfile: function ()
 {
  var doc;
  doc = this. makeOverlay ("MailToolbarPalette");
  this. saveOverlayToProfile (doc, "buttonsoverlay.xul");
  doc = this. makeOverlay ("MsgComposeToolbarPalette");
  this. saveOverlayToProfile (doc, "mcbuttonsoverlay.xul");
 },

    makeBookmark: function (CbLink, sName) {}
};
CustombuttonsTB. prototype. __proto__ = Custombuttons. prototype;

const custombuttons = new custombuttonsFactory (). Custombuttons;

// add-ons
/**  uChelpButton(  )
  Author Yan, George Dunham

  Args:
  Returns: Nothing
  Scope:	 private
  Called:	 By:
     1. Custom buttons context menu.
  Purpose: To:
     1. Display the button's help text.
     2. Insert the help data into the clipboard.
     TODO: Provide a means to display help in the form of
           web page.
     Add
     changed by Anton 24.02.08
     TODO: refactor it
**/
custombuttons.uChelpButton = function ( oBtn ) //{{{
{
  // UPDATED: 11/8/2007 to accept oBtn as an arg.
  var Button = ( oBtn )? oBtn : document.popupNode;
  var bId = this.getNumber(Button.id); // <---
  var str = Button.getAttribute( "Help" ).split( "[,]" )[0] || Button.getAttribute( "help" ).split( "," )[1];

  var hlpTitle = document. getElementById ("cbStrings"). getString ("ButtonHelpTitle"). replace (/%s/gi, Button. label);
  hlpTitle = hlpTitle. replace (/%y/gi, bId);
  var hlp = createMsg(hlpTitle);
  gClipboard.write(str.replace(/\<label\>/gi,Button.label).replace(/\<id\>/gi,bId));
  hlp.aMsg(gClipboard.read());
}; //}}} End Method uChelpButton(  )

// Custombuttons utils
const custombuttonsUtils =
{

    /**  createMsg( [title] )
 Author:	George Dunham aka: SCClockDr

 Scope:		global
 Args:		title - Optional Title to init the object with.
 Returns:	Msg
 Called by:	1. Any process wanting to instance this message object.
 Purpose: 	1. Create a message object and return it to the caller process.
 How it works:	gMsg uses the constructor method to create an object gMsg
 Setup:		MyObj = new gMsg();
 Use:		MyObj.aMsg("Any string", ["Optional Title"]);
 changed by Anton 24.02.08
 TODO: refactor it
**/
createMsg: function (title) //{{{
{
  /**  Object Msg
   Author:	George Dunham aka: SCClockDr

   Scope:		Public
   Properties:	prompts - nsIPromptService
      check - Provides a check box if value = true.
      sTitle - Retains the default/assigned title for the
         Dialog box.
   Methods:	aMsg - Displays the dialog box.
   Purpose:	1. Provide a better means to alert the operator.
  **/
  var Msg = { //{{{
    // Properties:
    prompts: Components. classes ["@mozilla.org/embedcomp/prompt-service;1"]. getService (Components. interfaces. nsIPromptService),
    check:{value: false},
    sTitle:"Custom Buttons²",
    button:false,
    // Methods
    /**  aMsg( str, [title] )

     Scope:		global
     Args:		str - String to display
        title - Optional title of the dialog
     Returns:	Nothing
     Called by:	1. Any process which has the aMsg object
           available
     Purpose: 	1. Present a confirm dialog.
    **/
    aMsg:function ( str, title ) //{{{
    {
      if (typeof title == "string"){this.sTitle = title}
      var flags = this.prompts.BUTTON_POS_0 * this.prompts.BUTTON_TITLE_IS_STRING;
      var button = this.prompts.confirmEx(null, this.sTitle, str, flags, document. getElementById ("cbStrings"). getString ("ContinueButton"), "", "", "", this.check);
    } //}}} End Method aMsg( str, [title] )


  }; //}}} End Object Msg
  if (typeof title == "string"){Msg.sTitle = title}
  return Msg;
}, //}}} End createMsg( [title] )

get ps ()
{
    return Components. classes ["@mozilla.org/preferences-service;1"]. getService (Components. interfaces. nsIPrefService);
},

/*--------------------------- Preference Utilities ---------------------------*/

/**  isPref( sPrefId, aDefault )
  Author	 George Dunham

  Args:	 aprefId - Preference ID string
     aDefault - Default Preference Value
  Returns: lRet - Boolean, true if the preference exists.
  Scope:	 public
  Called:	 By:
     1. Any process which passes aprefId and will accept
        a boolean return.
     2. Passing the optional [Default] will cause the pref
        to be created if not defined.
  Purpose: To:
     1. Test for the presence of a specified pref.
     NOTE: Inserted with ver. 2.0.02a
**/
isPref: function ( sPrefId, aDefault ) //{{{
{
  try{
    var lRet = (this.getPrefs( sPrefId ) !== null ); // UPDATED: 11/29/2007
    if ( typeof aDefault != "undefined" && !lRet ) {
      this.setPrefs( sPrefId, aDefault )
      lRet = true;
    } // End if ( typeof aDefault != CB2const.VOID && !rRet )
  }
  catch(e) {
    alert([sPrefId, aDefault, e, e.stack]);
  }
  return lRet;
}, //}}} End Method isPref( sPrefId, aDefault )
/**  getPrefs( sPrefId )
  Author	 George Dunham

  Args:	 sPrefId - Preference ID string
  Returns: rRet - Preference value in the correct type.
     1. null if Preference ID not in about:config list.
  Scope:	 public
  Called:	 By:
     1. Any process passing a prefid string and accepting
        its value.
  Purpose: To:
     1. Return the pref specified in sPrefId
     NOTE: Inserted with ver. 2.0.02a
**/
getPrefs: function ( sPrefId ) //{{{
{
  var rRet = null;
  var nsIPrefBranchObj = this.ps.getBranch( null );
  switch ( nsIPrefBranchObj.getPrefType( sPrefId ) ){
  case 32: // string
    rRet = nsIPrefBranchObj.getCharPref( sPrefId );
    break;
  case 64: // number
    rRet = nsIPrefBranchObj.getIntPref( sPrefId );
    break;
  case 128: //  boolean
    rRet = nsIPrefBranchObj.getBoolPref( sPrefId );
    break;
  default:
    rRet = null;
  }
  return rRet;
}, //}}} End Method getPrefs( sPrefId )
/**  setPrefs( sPrefId, prefValue )
  Author	 George Dunham

  Args:	 sPrefId - Preference ID string
     prefValue - Value to set into the Preference ID.
  Returns: Nothing
  Scope:	 public
  Called by:
     1. Any process which passes a pref id and it's new value.
  Purpose: To:
     1. Modify the specified pref to the passed value.
     NOTE: Inserted with ver. 2.0.02a
**/
setPrefs: function ( sPrefId, prefValue ) //{{{
{
  var nsIPrefBranchObj = this.ps.getBranch(null);
  switch (typeof prefValue){
  case "undefined":
    break;
  case "string":
    nsIPrefBranchObj.setCharPref( sPrefId, prefValue );
    this.ps.savePrefFile( null );
    break;
  case "number":
    nsIPrefBranchObj.setIntPref( sPrefId, prefValue );
    this.ps.savePrefFile( null );
    break;
  case "boolean":
    nsIPrefBranchObj.setBoolPref( sPrefId, prefValue );
    this.ps.savePrefFile( null );
    break;
  default:
  }
}, //}}} End Method setPrefs( sPrefId, prefValue )

/**  clearPrefs( sPrefId )
 Author:    George Dunham aka: SCClockDr
 Scope:	    global
 Args:	    sPrefId - Preference ID string

 Returns:   Nothing
 Called by: 1.
 Purpose:   1. Clear specified User preference
 changed by Anton 25.02.08
 */
 clearPrefs: function(sPrefId) //{{{
{
  var nsIPrefBranchObj = this.ps.getBranch(null);
  nsIPrefBranchObj.clearUserPref(sPrefId);
  this.ps.savePrefFile( null );
}, //}}} End Method clearPrefs( sPrefId )

/**  readFile( fPath )
 Author:    George Dunham aka: SCClockDr
 Scope:	    private
 Args:	    fPath -
 Returns:   sRet
 Called by: 1.
 Purpose:   1.
 TODO:	    1.
 changed by Anton 25.02.08
 */
 readFile: function(fPath) //{{{
{
  var sRet = null;
  var file = null;
  fPath = (fPath.indexOf(':\\') > -1 )? fPath.replace(/\//g,'\\') : fPath;
  try {
    netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
  } catch (e) {
    alert("Permission to read file was denied.");
  }
  file = Components. classes ["@mozilla.org/file/local;1"]. createInstance (Components. interfaces. nsILocalFile);
  file.initWithPath( fPath );
  var fis = Components. classes ["@mozilla.org/network/file-input-stream;1"]. createInstance (Components. interfaces. nsIFileInputStream);
  fis.init( file,0x01, 00004, null);
  var sis = Components. classes ["@mozilla.org/scriptableinputstream;1"]. createInstance (Components. interfaces. nsIScriptableInputStream);
  sis.init( fis );
  sRet = sis.read( sis.available() );
  return sRet;
}, //}}} End Method readFile( fPath )

/**  writeFile( fPath, sData )
 Author:    George Dunham aka: SCClockDr
 Scope:	    private
 Args:	    fPath -
            sData -
 Returns:   Nothing
 Called by: 1.
 Purpose:   1.
 TODO:	    1.
 */
 writeFile: function(fPath, sData) //{{{
{
  try{
    fPath = (fPath.indexOf(':\\') > -1 )? fPath.replace(/\//g,'\\') : fPath;
    var file = Components. classes ["@mozilla.org/file/local;1"]. createInstance (Components. interfaces. nsILocalFile);
    file.QueryInterface(Components.interfaces.nsIFile);
    file.initWithPath( fPath );
    if( file.exists() == true ) file.remove( false );
    var strm = Components. classes ["@mozilla.org/network/file-output-stream;1"]. createInstance (Components. interfaces. nsIFileOutputStream);
    strm.QueryInterface(Components.interfaces.nsIOutputStream);
    strm.QueryInterface(Components.interfaces.nsISeekableStream);
    strm.init( file, 0x04 | 0x08, 420, 0 );
    strm.write( sData, sData.length );
    strm.flush();
    strm.close();
  }catch(ex){
    window.alert(ex.message+'nnn');
  }
},

/**  Object gClipboard
 Author:  George Dunham aka: SCClockDr
 Date:    2007-02-11
 Scope:    Public
 Properties:
    sRead - An array which holds the local clipboard data.
 Methods:
    write - Stuffs data into the system clipboard.
    clear - Clears the system clipboard.
    Clear - Clears the local clipboard.
    read - Retrieves the system clipboard data.
    Write - Stuffs data into the local clipboard.
    Read - Retrieves the local clipboard data.
 Purpose:  1. Provide a simple means to access the system clipboard
    2. Provid an alternate clipboard for storing a buffer of
       copied strings.
 TODO:    1. gClipboard.ClearHist sets sRead.length to 0
 TODO:    2. gClipboard.History offers a context menu of up to 10 past clips to paste
 TODO:    3. gClipboard.SystoI adds the sys Clipboard to the internal clipboard

**/
gClipboard: { //{{{
 // Properties:
 sRead:new Array(),
 // Methods
 /**  write( str )

  Scope:    public
  Args:    sToCopy
  Returns:  Nothing
  Called by:  1. Any process wanting to place a string in the clipboard.
  Purpose:  1.Stuff and Retrieve data from the system clipboard.
  UPDATED:  9/18/2007 Modified to conform to the MDC suggested process.
 **/
 write:function ( sToCopy ) //{{{
 {
   if (sToCopy != null){ // Test for actual data
     var str = Components.classes["@mozilla.org/supports-string;1"].createInstance(Components.interfaces.nsISupportsString);
     str.data = sToCopy;
     var trans = Components.classes["@mozilla.org/widget/transferable;1"].createInstance(Components.interfaces.nsITransferable);
     trans.addDataFlavor("text/unicode");
     trans.setTransferData("text/unicode", str, sToCopy.length * 2);
     var clipid = Components.interfaces.nsIClipboard;
     var clip = Components.classes["@mozilla.org/widget/clipboard;1"].getService(clipid);
     clip.setData(trans, null, clipid.kGlobalClipboard);
   } // End if (str != null)
 }, //}}} End Method write( str )

 /**  clear(  )

  Scope:    public
  Args:
  Returns:  Nothing
  Called by:
     1. Any process wanting to clear the clipboard
  Purpose:
     1. Clear the system cllipboard
  TODO:
     1.
 **/
 clear:function ( ) //{{{
 {
   this.write("");
 }, //}}} End Method clear(  )
 /**  Clear(  )

  Scope:    public
  Args:
  Returns:  Nothing
  Called by:
     1. Any process wanting to clear the local clipboard
  Purpose:
     1. Clear the local cllipboard
  TODO:
     1.
 **/
 Clear:function ( ) //{{{
 {
   this.sRead[0] = "";
 }, //}}} End Method Clear(  )
 /**  read(  )

  Scope:    public
  Args:
  Returns:  sRet
  Called by:
     1.
  Purpose:
     1.
  TODO:
     1.
 **/
 read:function ( ) //{{{
 {
   var str = new Object();
   var strLength = new Object();
   var pastetext = null;
   var clip = Components.classes["@mozilla.org/widget/clipboard;1"].getService(Components.interfaces.nsIClipboard);
   if (!clip) return pastetext;
   var trans = Components.classes["@mozilla.org/widget/transferable;1"].createInstance(Components.interfaces.nsITransferable);
   if (!trans) return pastetext;
   trans.addDataFlavor("text/unicode");
   clip.getData(trans, clip.kGlobalClipboard);
   trans.getTransferData("text/unicode", str, strLength);
   if (str) str = str.value.QueryInterface(Components.interfaces.nsISupportsString);
   if (str) pastetext = str.data.substring(0, strLength.value / 2);
   return pastetext;
 }, //}}} End Method read(  )

 /**  Write( str )

  Scope:    public
  Args:    str
  Returns:  Nothing
  Called by:
     1.
  Purpose:
     1.
  TODO:
     1.
 **/
 Write:function ( str ) //{{{
 {
   this.sRead[0] = str;
 }, //}}} End Method Write( str )

 /**  Read(  )

  Scope:    public
  Args:
  Returns:  sRet
  Called by:
     1.
  Purpose:
     1.
  TODO:
     1.
 **/
 Read:function ( ) //{{{
 {
   var sRet = this.sRead[0];
   return sRet;
 } //}}} End Method Read(  )

} //}}} End Object gClipboard
}; // -- custombuttonsUtils

// Custombuttons API

const createMsg = custombuttonsUtils. createMsg;
const gClipboard = custombuttonsUtils. gClipboard;
custombuttons. isPref = custombuttonsUtils. isPref;
custombuttons. getPrefs = custombuttonsUtils. getPrefs;
custombuttons. setPrefs = custombuttonsUtils. setPrefs;
custombuttons. clearPrefs = custombuttonsUtils. clearPrefs;
custombuttons. readFile = custombuttonsUtils. readFile;
custombuttons. writeFile = custombuttonsUtils. writeFile;

window. addEventListener ("load", custombuttons, false);
window. addEventListener ("unload", custombuttons, false);
window. addEventListener ("keypress", custombuttons, true);

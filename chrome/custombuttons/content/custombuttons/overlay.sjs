#include <project.hjs>
#include <prio.hjs>

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
    if (node. firstChild && (node. firstChild. nodeType == node. TEXT_NODE))
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
      values. name     = this. getText ("name");
      values. mode     = this. getText ("mode");
      values. image    = unescape (this. getText ("image"));
      values. code     = unescape (this. getText ("code"));
      values. initCode = unescape (this. getText ("initcode"));
      values. accelkey = unescape (this. getText ("accelkey"));
    }
    else
    {
      var ar = button_code. split ("][");
      if (ar. length < 3)
        THROW ("Malformed custombutton:// URI");
      values. name     = ar [0] || "";
      values. image    = ar [1] || "";
      values. code     = ar [2] || "";
      values. initCode = ar [3] || "";
    }
    this. parameters = values;
  }
};

function Custombuttons () {}
Custombuttons. prototype =
{
  ps: SERVICE (PREF). getBranch ("custombuttons.button"),
  buttonParameters: ["name", "image", "code", "initCode", "accelkey"],
  buttonsLoadedFromProfileOverlay: true,
  button: null,
  values: null,
  toolbar: null,
  _palette: null,
  get palette ()
  {
    if (!this. _palette)
      this. _palette = this. getPalette ();
    return this. _palette;
  },

  getPalette: function ()
  {
    var gToolbox = ELEMENT ("navigator-toolbox") || // FF3b2 and lower
             ELEMENT ("browser-toolbox");     // FF3b3pre and higher
    return gToolbox. palette;
  },

  getButtonParameters: function (num)
  { //using for compatibility with older format
    try
    {
      var data = this. ps. getComplexValue (num, CI. nsISupportsString). data;
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
      dump ('\nfound buttons in prefs.js...');
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
        dump ("\ndeleting button #" + i);
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
    oItem. setAttribute ("cb-oncommand", code);
    oItem. setAttribute ("cb-init", initCode);
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
      aios_toolbox = ELEMENT (aiostbx_bindingBoxes [i]);
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
        var tbButton = ELEMENT (id);
        if (tbButton && !tbButton. hasAttribute ("initialized"))
          tbButton. init ();
      }
    }
  },

  init: function ()
  {
    var pref = "settings.editor.showApplyButton";
    var ps = SERVICE (PREF);
    ps = ps. QI (nsIPrefBranch);
    var cbps = ps. getBranch ("custombuttons.");
    var mode = cbps. getIntPref ("mode");
    if (ps. prefHasUserValue (pref))
    {
      mode |= (ps. getBoolPref (pref)? CB_MODE_SHOW_APPLY_BUTTON: 0);
      try
      {
        ps. deleteBranch (pref);
      }
      catch (e) {}
    }
    cbps. setIntPref ("mode", mode);
    setTimeout ("custombuttons.makeButtons()", 200);
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
      var toolbarSet = ELEMENT ("customToolbars");
      var oldSet = toolbarSet. getAttribute (attrName);
      cs = oldSet. substring (0, oldSet. indexOf (":") + 1) + cs;
      toolbarSet. setAttribute (attrName, cs);
      document. persist ("customToolbars", attrName);
    }
    //Исправления для AIOS
    if (ELEMENT ("aiostbx-belowtabs-toolbox"))
      persistCurrentSets ();
    this. saveButtonsToProfile ();
  },

  removeButton: function ()
  {
    this. prepareButtonOperation ();
    var str = CB_STRING ("cbStrings", "RemoveConfirm", this. values. name);
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
    SERVICE (CLIPBOARD_HELPER). copyString (document. popupNode. URI);
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
    }
    else // install web button or add new button
    { //checked
      num = this. min_button_number ();
      var newButton = this. createButton (num, values);
      /*вставляем button в Palette и выдаем алерт об успешном создании*/
      //palette
      this. palette. appendChild (newButton);
      var str = GET_STRING ("cbStrings", "ButtonAddedAlert");
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
      var str = GET_STRING ("cbStrings", "ButtonErrors");
      alert (str);
      return false;
    }
    var str = CB_STRING ("cbStrings", "InstallConfirm", button. parameters. name);
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
      "class"        : true,
      "id"           : true,
      "label"        : true,
      "image"        : true,
      "cb-oncommand" : true,
      "cb-init"      : true,
      "cb-mode"     : true,
      "cb-accelkey"  : true,
      "context"      : true,
      "tooltiptext"  : true
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

    var uniConv = COMPONENT (SCRIPTABLE_UNICODE_CONVERTER);
    uniConv. charset = "utf-8";
    data = uniConv. ConvertFromUnicode (data);

    var dir = SERVICE (PROPERTIES). get ("ProfD", CI. nsIFile); // get profile folder
    dir. append ("custombuttons");
    if (!dir. exists ())
    {
      try
      {
        dir. create (DIRECTORY_TYPE, 0755);
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

    var foStream = COMPONENT (FILE_OUTPUT_STREAM);
    var flags = PR_WRONLY | PR_CREATE_FILE | PR_TRUNCATE;
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
    var cbd = SERVICE (CB_KEYMAP);
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
        ELEMENT (ids [i]). cbExecuteCode ();
      }
      catch (e) {}
    }
  },

  handleEvent: function (event)
  {
    switch (event. type)
    {
      case "load":
        this. init ();
        break;
      case "unload":
        this. saveButtonsToProfile ();
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
  }
};

function TBCustombuttons () {}
TBCustombuttons. prototype =
{
  getPalette: function ()
  {
    var gToolbox = ELEMENT ("mail-toolbox") ||  // main window and message window
             ELEMENT ("compose-toolbox"); // compose message
    return gToolbox. palette;
  },

  saveButtonsToProfile: function ()
  {
    var doc;
    doc = this. makeOverlay ("MailToolbarPalette");
    this. saveOverlayToProfile (doc, "buttonsoverlay.xul");
    doc = this. makeOverlay ("MsgComposeToolbarPalette");
    this. saveOverlayToProfile (doc, "mcbuttonsoverlay.xul");
  }
};
EXTEND (TBCustombuttons, Custombuttons);

var custombuttons = new custombuttonsFactory (). Custombuttons;

window. addEventListener ("load", custombuttons, false);
window. addEventListener ("unload", custombuttons, false);
window. addEventListener ("keypress", custombuttons, true);

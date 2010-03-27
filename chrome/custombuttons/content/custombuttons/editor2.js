


function Editor () {}
Editor. prototype =
{
 opener: null,
 cbService: null,
 notificationPrefix: "",
 param: {},
 CNSISS: Components. interfaces. nsISupportsString,
 tempId: "",

 QueryInterface: function (iid)
 {
  if (iid. equals (Components. interfaces. nsIObserver) ||
      iid. equals (Components. interfaces. nsIEditorObserver) ||
   iid. equals (Components. interfaces. nsIWeakReference) ||
   iid. equals (Components. interfaces. nsISupports))
   return this;
  return Components. results. NS_ERROR_NO_INTERFACE;
 },

    _changed: false,

    get changed ()
    {
 return this. _changed;
    },

    set changed (val)
    {
 if (val && !this. _changed)
     document. title = document. title + " *";
 else if (!val && this. _changed)
     document. title = document. title. replace (/ \*$/, "");
 this. _changed = val;
    },

    /* nsIEditorObserver */
    EditAction: function ()
    {
 var codeEditor = document. getElementById ("code");
 var initEditor = document. getElementById ("initCode");
 var helpEditor = document. getElementById ("help");
 if (codeEditor. changed ||
     initEditor. changed ||
     helpEditor. changed)
     this. changed = true;
 else
     this. changed = false;
    },

 QueryReferent: function (iid)
 {
  return this. QueryInterface (iid);
 },

 init: function ()
 {
  this. cbService = Components. classes ["@xsms.nm.ru/custombuttons/cbservice;1"]. getService (Components. interfaces. cbICustomButtonsService);
  if (!window. arguments || !window. arguments [0])
  {
   var ios = Components. classes ["@mozilla.org/network/io-service;1"]. getService (Components. interfaces. nsIIOService);
   var url = ios. newURI (document. documentURI, null, null);
   url = url. QueryInterface (Components. interfaces. nsIURL);
   var q = url. query || "";
   var windowId = q. match (/&?window=(\w*?)&?/);
   var buttonId = q. match (/&?id=(custombuttons-button\d+)&?/);
   var info = Components. classes ["@mozilla.org/xre/app-info;1"]. getService (Components. interfaces. nsIXULAppInfo);
   windowId = windowId? windowId [1]: info. name;
   if (windowId. indexOf (info. name) != 0)
    windowId = info. name;
   buttonId = buttonId? buttonId [1]: "";
   var link = "custombutton://buttons/" + windowId + "/edit/" + buttonId;
   this. param = this. cbService. getButtonParameters (link). wrappedJSObject;
  }
  else
   this. param = window. arguments [0]. wrappedJSObject;
  this. notificationPrefix = this. cbService. getNotificationPrefix (this. param. windowId);
  var os = Components. classes ["@mozilla.org/observer-service;1"]. getService (Components. interfaces. nsIObserverService);
  os. addObserver (this, this. notificationPrefix + "updateImage", false);
  os. addObserver (this, this. notificationPrefix + "setEditorParameters", false);
  this. setValues ();
  document. getElementById ("name"). focus ();
  if (this. param. editorParameters)
   this. setEditorParameters (this. param);
  this. tempId = this. param. id || (new Date (). valueOf ());
  var ps = Components. classes ["@mozilla.org/preferences-service;1"]. getService (Components. interfaces. nsIPrefService). getBranch ("custombuttons.");
  var cbMode = ps. getIntPref ("mode");
  var sab = cbMode & 2;
  if (this. param. newButton || !sab)
  {
   document. documentElement. getButton ("extra2"). setAttribute ("hidden", "true");
   document. getElementById ("cbUpdateButtonCommand"). setAttribute ("disabled", "true");
  }

     document. getElementById ("code"). editor. addEditorObserver (this);
     document. getElementById ("initCode"). editor. addEditorObserver (this);
     document. getElementById ("help"). editor. addEditorObserver (this);
     window. addEventListener ("mousedown", this, true);
 },

 setEditorParameters: function (param)
 {
  var editorParameters = param. wrappedJSObject. editorParameters;
  if (editorParameters instanceof Components. interfaces. nsISupportsArray)
  {
   window. focus ();
   var phase = editorParameters. GetElementAt (0). QueryInterface (Components. interfaces. nsISupportsString);
   var lineNumber = parseInt (editorParameters. GetElementAt (1). QueryInterface (Components. interfaces. nsISupportsString));
   var tabbox = document. getElementById ("custombuttons-editbutton-tabbox");
   tabbox. selectedIndex = (phase == "code")? 0: 1;
   var textboxId = (phase == "code")? "code": "initCode";
   var textbox = document. getElementById (textboxId);
   textbox. focus ();
   textbox. selectLine (lineNumber);
   //textbox. scrollTo (lineNumber);
  }
 },

 setValues: function ()
 {
  var field;
  for (var v in this. param)
  {
   var field = document. getElementById (v);
   if (field && this. param [v])
    field. value = this. param [v];
  }
  document. getElementById ("code"). editor. transactionManager. clear ();
  document. getElementById ("initCode"). editor. transactionManager. clear ();
  var mode = this. param. mode;
  document. getElementById ("initInCustomizeToolbarDialog"). checked = mode && (mode & 1) || false;
  document. getElementById ("disableDefaultKeyBehavior"). checked = mode && (mode & 2) || false;
  if (this. param. newButton)
   document. title = this. cbService. getLocaleString ("AddButtonEditorDialogTitle");
  if (this. param. name)
   document. title += ": " + this. param. name;
  else if (this. param. id)
   document. title += ": " + this. param. id;
 },

 updateButton: function ()
 {
  var uri = document. getElementById ("urlfield-textbox"). value;
  if (uri)
  {
   if (this. param. newButton)
   {
    return this. cbService. installWebButton (this. param, uri, true);
   }
   else
   {
    var link = this. cbService. makeButtonLink (this. param. windowId, "update", this. param. id);
    return this. cbService. updateButton (link, uri);
   }
  }
  var field;
  for (var v in this. param)
  {
   field = document. getElementById (v);
   if (field)
    this. param [v] = field. value;
  }
  this. param ["mode"] = document. getElementById ("initInCustomizeToolbarDialog"). checked? 1: 0;
  this. param ["mode"] |= document. getElementById ("disableDefaultKeyBehavior"). checked? 2: 0;
  this. cbService. installButton (this. param);
  return true;
 },

 get canClose ()
 {
  if (!window. opener && !window. arguments)
   return false;
  return true;
 },

        acceptDialog: function ()
        {
     var dialog = document. getElementById ("custombuttonsEditor");
     dialog. acceptDialog ();
 },

 onAccept: function ()
 {
  if (this. updateButton ())
   return this. canClose;
  return false;
 },

 selectImage: function ()
 {
  var fp = Components. classes ["@mozilla.org/filepicker;1"]. createInstance (Components. interfaces. nsIFilePicker);
  fp. init (window, "Select an image", 0);
  fp. appendFilters (fp. filterImages);
  var res = fp. show ();
  if (res == fp. returnOK)
   document. getElementById ("image"). value = fp. fileURL. spec;
 },

 execute_oncommand_code: function ()
 {
  var fe = document. commandDispatcher. focusedElement;
  var box = document. getElementById ("code");
  if (fe != box. textbox. inputField)
   return;
  var code = box. value;
  var opener = window. opener;
  if (!opener)
  {
   try
   {
    opener = window. QueryInterface (Components. interfaces. nsIInterfaceRequestor).
       getInterface (Components. interfaces. nsIWebNavigation).
       QueryInterface (Components. interfaces. nsIDocShellTreeItem).
       rootTreeItem. QueryInterface (Components. interfaces. nsIInterfaceRequestor).
       getInterface (Components. interfaces. nsIDOMWindow);
   }
   catch (e) {};

  }
  if (opener)
  {
   var CB = opener. custombuttons;
   if (CB)
   {
    var doc = opener. document;
    var button = doc. getElementById (this. param. id);
    if (button)
     CB. execute_oncommand_code (code, button);
    else
     this. cbService. alert ("ButtonDoesntExist");
    window. focus ();
   }
  }
 },

 observe: function (subject, topic, data)
 {
  if (topic == this. notificationPrefix + "updateImage")
  {
   if ((data == this. param. id) ||
    (data == this. tempId))
   {
    var array = subject. QueryInterface (Components. interfaces. nsISupportsArray);
    var contentType = array. GetElementAt (0). QueryInterface (Components. interfaces. nsISupportsString);
    var dataString = array. GetElementAt (1). QueryInterface (Components. interfaces. nsISupportsString);
    document. getElementById ("image"). value = "data:" + contentType. data + ";base64," + btoa (dataString. data);
   }
  }
  else if (topic == this. notificationPrefix + "setEditorParameters")
  {
   var param = subject. wrappedJSObject;
   if (this. param. id == param. id)
    this. setEditorParameters (subject);
  }
 },

 imageChanged: function ()
 {
  if (!this. param. id || !this. notificationPrefix)
   return;
  var image_input = document. getElementById ("image");
  var aURL = Components. classes ["@mozilla.org/supports-string;1"]. createInstance (Components. interfaces. nsISupportsString);
  aURL. data = image_input. value;
  var os = Components. classes ["@mozilla.org/observer-service;1"]. getService (Components. interfaces. nsIObserverService);
  os. notifyObservers (aURL, this. notificationPrefix + "updateIcon", this. param. id);
 },

 convert_image: function ()
 {
  var image_input = document. getElementById ("image");
  var aURL = image_input. value;
  if (aURL. indexOf ("custombuttons-stdicon") == 0)
  {
   aURL = window. getComputedStyle (image_input, null). getPropertyValue ("list-style-image");
   if (aURL. indexOf ("url(") == 0)
    aURL = aURL. substring (4, aURL. length - 1);
   else
    aURL = "";
   aURL = aURL. replace (/^"/, "");
   aURL = aURL. replace (/"$/, "");
  }
  this. cbService. convertImageToRawData (this. param. windowId, this. param. id || this. tempId, aURL);
 },

 destroy: function ()
 {
     window. removeEventListener ("mousedown", this, true);
     document. getElementById ("code"). editor. removeEditorObserver (this);
     document. getElementById ("initCode"). editor. removeEditorObserver (this);
     document. getElementById ("help"). editor. removeEditorObserver (this);

  var os = Components. classes ["@mozilla.org/observer-service;1"]. getService (Components. interfaces. nsIObserverService);
  os. removeObserver (this, this. notificationPrefix + "setEditorParameters");
  os. removeObserver (this, this. notificationPrefix + "updateImage");
 },

        // next field and method are needed to rewind focus to active element
        // if "Cancel" button will be pressed twice
        // I think there should be more easiest way to do it
        // but I don't know it
        lastFocused: null,

        handleEvent: function (event)
        {
     var cbtn = document. getElementById ("custombuttonsEditor"). getButton ("cancel");
     if (event. originalTarget == cbtn)
  this. lastFocused = document. activeElement;
 },

 onCancel: function ()
 {
     const RES_SAVE = 0;
     const RES_DONT_SAVE = 1;
     const RES_CANCEL = 2;
     var res;
     if (this. changed)
     {
  var ps = Components. classes ["@mozilla.org/embedcomp/prompt-service;1"]. getService (Components. interfaces. nsIPromptService);
  var aButtonFlags = ps. BUTTON_POS_0 * ps. BUTTON_TITLE_SAVE +
                     ps. BUTTON_POS_1 * ps. BUTTON_TITLE_DONT_SAVE +
                     ps. BUTTON_POS_2 * ps. BUTTON_TITLE_CANCEL +
                     ps. BUTTON_POS_0_DEFAULT;
  var promptMsg = this. cbService. getLocaleString ("ConfirmSaveChanges");
  res = ps. confirmEx (null, "Custom Buttons", promptMsg, aButtonFlags, "", "", "", "", {});
  if (res == RES_SAVE)
  {
      this. acceptDialog ();
      return true;
  }
  else
  {
      if ((res == RES_CANCEL) && this. lastFocused)
   this. lastFocused. focus ();
      return (res == RES_DONT_SAVE);
  }
     }

     return this. canClose;
 },

 fullScreen: function ()
 {
     if (window. windowState == Components. interfaces. nsIDOMChromeWindow. STATE_MAXIMIZED)
  window. restore ();
     else
  window. maximize ();
 },

 tabSelect: function (event)
 {
     var tab = event. target;
     if (tab. nodeName != "tab")
  return;
     event. preventDefault ();
     var tabs = document. getElementById ("custombuttons-editbutton-tabbox");
     tabs. selectedTab = tab;
     var controlId = tab. getAttribute ("cbcontrol");
     if (controlId)
     {
  var control = document. getElementById (controlId);
  control. focus ();
     }
 }
};

var editor = new Editor ();

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
function ImageLoader (channel)
{
  this. mChannel = channel;
  this. mData = "";
}
ImageLoader. prototype =
{
    mCountRead: null,
    mChannel: null,
    mBytes: Array (),
    mStream: null,
    callBackFunction: null,

    // nsISupports
  QueryInterface: function (iid)
    {
        if (!iid. equals (Components. interfaces. nsISupports) &&
            !iid. equals (Components. interfaces. nsIInterfaceRequestor) &&
            !iid. equals (Components. interfaces. nsIRequestObserver) &&
            !iid. equals (Components. interfaces. nsIStreamListener) &&
      !iid. equals (Components. interfaces. nsIProgressEventSink))
        {
            throw Components. results. NS_ERROR_NO_INTERFACE;
        }
        return this;
    },

    // nsIInterfaceRequestor
    getInterface: function (iid)
    {
        return this. QueryInterface (iid);
    },

    // nsIRequestObserver
    onStartRequest: function (aRequest, aContext)
    {
        this. mStream = Components. classes ["@mozilla.org/binaryinputstream;1"]. createInstance (Components. interfaces. nsIBinaryInputStream);
    },

  onStopRequest: function (aRequest, aContext, aStatusCode)
    {
    this. mData = "data:" + this. mChannel. contentType + ";base64," +
            btoa (String. fromCharCode. apply (null, this. mBytes));
    this. callBackFunction (this. mData);
    this. mChannel = null;
    },

    // nsIStreamListener
    onDataAvailable: function (aRequest, aContext, aInputStream, aOffset, aCount)
    {
        this. mStream. setInputStream (aInputStream);
        var chunk = this. mStream. readByteArray (aCount);
        this. mBytes = this. mBytes. concat (chunk);
    },

    // nsIProgressEventSink
  onProgress: function (aRequest, aContext, progress, progressMax) {},
  onStatus: function (aRequest, aContext, status, statusArg) {}
}

function Editor () {}
Editor. prototype =
{
  CB: null,

  onLoad: function ()
  {
    this. CB = window. opener. custombuttons;
    if (window. arguments [0])
    {
      var button = window. arguments [0];
      this. setValues (button. parameters);
    }
    //назначение метода bind
    if ((typeof Function. prototype. bind == "undefined") &&
      window. opener. Function. prototype. bind)
    {
      Function. prototype. bind = window. opener. Function. prototype. bind;
    }
    var ps = Components. classes ["@mozilla.org/preferences-service;1"]. getService (Components. interfaces. nsIPrefService). getBranch ("custombuttons.");
    var mode = ps. getIntPref ("mode");
    var sab = (ps. getIntPref ("mode") & 2);
    if (sab)
    {
      // nothing to do.
    }
    else
    {
      document. documentElement. getButton ("extra2").
        setAttribute ("hidden", "true");
    }
  },

  setValues: function (values)
  {
   var id = window. arguments [0]. id;
    for each (var v in this. CB. buttonParameters)
        document. getElementById (v). value = (v != "help")? values [v]: (values ["Help"] || "");
    document. getElementById ("initInCustomizeToolbarDialog"). checked = values. mode && (values. mode & 1) || false;
    document. getElementById ("disableDefaultKeyBehavior"). checked = values. mode && (values. mode & 2) || false;
  },

  setButtonParameters: function ()
  {
    var values = {};
    for each (var v in this. CB. buttonParameters)
      values [v] = document. getElementById (v). value;
    values ["mode"] = document. getElementById ("initInCustomizeToolbarDialog"). checked? 1: 0;
    values ["mode"] |= document. getElementById ("disableDefaultKeyBehavior"). checked? 2: 0;
    if (window. arguments [0])
    {
      var button = window. arguments [0];
      var num = this. CB. getNumber (button. id);
      this. CB. setButtonParameters (num, values, true);
    }
    else
      this. CB. setButtonParameters (null, values);
  },

  select_image: function ()
  {
    var fp = Components. classes ["@mozilla.org/filepicker;1"]. createInstance (Components. interfaces. nsIFilePicker);
    fp. init (window, "Select an image", 0);
    fp. appendFilters (8);
    var res = fp. show ();
    if (res == 0)
      document. getElementById ("image"). value = fp. fileURL. spec;
  },

  convert_image: function ()
  {
    var image_input = document. getElementById ("image");
    var aURL = image_input. value;
    var IOSVC = Components. classes ["@mozilla.org/network/io-service;1"]. getService (Components. interfaces. nsIIOService);
    var chan = IOSVC. newChannel (aURL, null, null);
    var listener = new ImageLoader (chan);
    chan. notificationCallbacks = listener;
    listener. callBackFunction = this. setImageURL;
    chan. asyncOpen (listener, null);
  },

  setImageURL: function (url)
  {
    var image_input = document. getElementById ("image");
    image_input. value = url;
  },

  execute_oncommand_code: function ()
  {
    if (window. arguments [0])
    {
      var button = window. arguments [0];
      var box = document. getElementById ("code");
      var code = box. value;
      this. CB. execute_oncommand_code (code, button);
      window. focus ();
    }
    else
    {
      alert ("Error! The button doesn't exist!");
    }
  }
};

function TBEditor () {}
TBEditor. prototype =
{
  onLoad: function ()
  {
    if (!window. arguments [0]) // new button
      document. getElementById ("urlfield"). removeAttribute ("hidden");
    this. __super. prototype. onLoad. apply (this, []);
  },

  setButtonParameters: function ()
  {
    var uri = document. getElementById ("urlfield-textbox"). value;
    if (uri && (uri. indexOf ("custombutton:") == 0))
    {
      uri = uri. substring ("custombutton:". length);
      this. CB. installWebButton (uri);
      return;
    }
    this. __super. prototype. setButtonParameters. apply (this, []);
  }
};
TBEditor. prototype. __proto__ = Editor. prototype; TBEditor. prototype. __super = Editor;

var editor = new custombuttonsFactory (). Editor;

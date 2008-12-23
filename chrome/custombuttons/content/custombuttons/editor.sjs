#include <project.hjs>
#include <filepicker.hjs>

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
        if (!iid. equals (CI. nsISupports) &&
            !iid. equals (CI. nsIInterfaceRequestor) &&
            !iid. equals (CI. nsIRequestObserver) &&
            !iid. equals (CI. nsIStreamListener) &&
			!iid. equals (CI. nsIProgressEventSink))
        {
            throw NS_ERROR (NO_INTERFACE);
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
        this. mStream = COMPONENT (BINARY_INPUT_STREAM);
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
  button: null,
  
  onLoad: function ()
  {
	  this. CB = window. opener. custombuttons;
	  var oWArgs = window. arguments [0];
	  if (oWArgs. button)
	  {
		  this. button = oWArgs. button;
		  this. setValues (this. button. parameters);
		  if (oWArgs. lineNumber)
		  {
			  var tabbox = ELEMENT ("custombuttons-editbutton-tabbox");
			  tabbox. selectedIndex = (oWArgs. phase == "code")? 0: 1;
			  var textboxId = (oWArgs. phase == "code")? "code": "initCode";
			  var textbox = ELEMENT (textboxId);
			  textbox. focus ();
			  textbox. selectLine (oWArgs. lineNumber);
			  textbox. scrollTo (oWArgs. lineNumber);
		  }
	  }
	  // назначение метода bind
	  if ((typeof Function. prototype. bind == "undefined") &&
		  window. opener. Function. prototype. bind)
	  {
		  Function. prototype. bind = window. opener. Function. prototype. bind;
	  }
	  var ps = SERVICE (PREF). getBranch ("custombuttons.");
	  var mode = ps. getIntPref ("mode");
	  var sab = (ps. getIntPref ("mode") & CB_MODE_SHOW_APPLY_BUTTON);
	  if (sab)
	  {
		  // nothing to do
	  }
	  else
	  {
		  document. documentElement. getButton ("extra2").
		  	  setAttribute ("hidden", "true");
	  }
  },

  setValues: function (values)
  {
    for each (var v in this. CB. buttonParameters)
        ELEMENT (v). value = (v != "help")? values [v]: (values ["Help"] || "");
    ELEMENT ("initInCustomizeToolbarDialog"). checked = values. mode && (values. mode & CB_MODE_ENABLE_INIT_IN_CTDIALOG) || false;
    ELEMENT ("disableDefaultKeyBehavior"). checked = values. mode && (values. mode & CB_MODE_DISABLE_DEFAULT_KEY_BEHAVIOR) || false;
  },

  setButtonParameters: function ()
  {
    var values = {};
    for each (var v in this. CB. buttonParameters)
      values [v] = ELEMENT (v). value;
    values ["mode"] = ELEMENT ("initInCustomizeToolbarDialog"). checked? CB_MODE_ENABLE_INIT_IN_CTDIALOG: 0;
    values ["mode"] |= ELEMENT ("disableDefaultKeyBehavior"). checked? CB_MODE_DISABLE_DEFAULT_KEY_BEHAVIOR: 0;
	window. arguments [0]. parameters = values;
    if (this. button && this. button. id)
    {
      var button = this. button;
      var num = this. CB. getNumber (button. id);
    }
	this. CB. SetParametersFromEditor (window. arguments [0]);
  },
  
  getOverlayDocument: function () { alert ("getOverlayDocument"); },

  select_image: function ()
  {
    var fp = COMPONENT (FILE_PICKER);
    fp. init (window, "Select an image", 0);
    fp. appendFilters (FP_filterImages);
    var res = fp. show ();
    if (res == FP_returnOK)
      ELEMENT ("image"). value = fp. fileURL. spec;
  },

  convert_image: function ()
  {
    var image_input = document. getElementById ("image");
    var aURL = image_input. value;
    var IOSVC = SERVICE (IO);
    var chan = IOSVC. newChannel (aURL, null, null);
    var listener = new ImageLoader (chan);
    chan. notificationCallbacks = listener;
    listener. callBackFunction = this. setImageURL;
    chan. asyncOpen (listener, null);
  },

  setImageURL: function (url)
  {
    var image_input = ELEMENT ("image");
    image_input. value = url;
  },

  execute_oncommand_code: function ()
  {
    if (this. button)
    {
      var button = this. button;
      var box = ELEMENT ("code");
      var code = box. value;
      this. CB. execute_oncommand_code (code, button);
      window. focus ();
    }
    else
    {
      alert ("Error! The button doesn't exist!");
    }
  },
  
  openMoreKeysDialog: function ()
  {
  }
};

function TBEditor () {}
TBEditor. prototype =
{
  onLoad: function ()
  {
    if (!this. button) // new button
      ELEMENT ("urlfield"). removeAttribute ("hidden");
    SUPER (onLoad);
  },

  setButtonParameters: function ()
  {
    var uri = ELEMENT ("urlfield-textbox"). value;
    if (uri && (uri. indexOf ("custombutton:") == 0))
    {
      uri = uri. substring ("custombutton:". length);
	  // delayed install
	  var CB = this. CB;
	  window. opener. setTimeout
	  (
		  	function ()
			{
				CB. installWebButton (uri);
			},
			0
	  );
	  // end delayed install
      return;
    }
    SUPER (setButtonParameters);
  }
};
EXTENDS (TBEditor, Editor);

var editor = new custombuttonsFactory (). Editor;

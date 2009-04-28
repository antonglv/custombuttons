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
var cbCustomizeToolbarHandler =
{
  templateButton: null,
  palette: null,

  hideTemplateButton: function ()
  {
    var gToolbox = window. arguments [0];
    var palette = gToolbox. palette;
    this. palette = palette;
    for (var i = 0; i < palette. childNodes. length; i++)
    {
      if (palette. childNodes [i]. id == "custombuttons-template-button")
      {
        this. templateButton = palette. childNodes [i];
        palette. removeChild (palette. childNodes [i]);
        break;
      }
    }
  },

  restoreTemplateButton: function ()
  {
 if (this. templateButton)
  this. palette. appendChild (this. templateButton);
  }
};

window. addEventListener ( "unload", function (event) { cbCustomizeToolbarHandler. restoreTemplateButton (); }, false );
cbCustomizeToolbarHandler. hideTemplateButton ();

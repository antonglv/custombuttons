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
if (!window. custombuttonsFactory)
{
  Components. classes ["@mozilla.org/moz/jssubscript-loader;1"]. getService (Components. interfaces. mozIJSSubScriptLoader).
    loadSubScript ("chrome://custombuttons/content/cbfactory.js");
}
if (!window. custombuttons)
{
  Components. classes ["@mozilla.org/moz/jssubscript-loader;1"]. getService (Components. interfaces. mozIJSSubScriptLoader).
    loadSubScript ("chrome://custombuttons/content/overlay.js");
}

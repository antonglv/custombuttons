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
function custombuttonsFactory ()
{
  var retobj = null;
  var info = Components. classes ["@mozilla.org/xre/app-info;1"]. getService (Components. interfaces. nsIXULAppInfo);
  switch (info. name)
  {
    case "Firefox": // Firefox
        var oVC = Components. classes ["@mozilla.org/xpcom/version-comparator;1"]. createInstance (Components. interfaces. nsIVersionComparator);
        if (oVC. compare ("3.0a1", info. version) <= 0)
            retobj = this. CustombuttonsMFFactory;
        else
            retobj = this. CustombuttonsFactory;
        break;
    case "Browser": // strange name for Flock
  retobj = this. CustombuttonsFactory;
  break;
    case "Thunderbird": // Thunderbird
  retobj = this. CustombuttonsTBFactory;
  break;
    case "Sunbird":
  retobj = this. CustombuttonsSBFactory;
  break;
  }
  return retobj;
}
custombuttonsFactory. prototype =
{
 CustombuttonsFactory:
 {
  get Custombuttons () { return new Custombuttons (); },
  get Editor () { return new Editor (); },
  get Prefs () { return new Prefs (); }
 },

 CustombuttonsTBFactory:
 {
  get Custombuttons () { return new CustombuttonsTB (); },
  get Editor () { return new TBEditor (); },
  get Prefs () { return new TBPrefs (); }
 },

 CustombuttonsMFFactory:
 {
  get Custombuttons () { return new CustombuttonsMF (); },
  get Editor () { return new Editor (); },
  get Prefs () { return new Prefs (); }
 },

 CustombuttonsSBFactory:
 {
  get Custombuttons () { return new CustombuttonsSB (); },
  get Editor () { return new TBEditor (); },
  get Prefs () { return new Prefs (); }
 }
};

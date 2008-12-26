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
        else if (oVC. compare ("3.1b3", info. version) <= 0)
   retobj = this. CustombuttonsSTFactory;
  else
            retobj = this. CustombuttonsFactory;
        break;
    case "Browser": // strange name for Flock
  retobj = this. CustombuttonsFactory;
  break;
    case "Thunderbird": // Thunderbird
  switch (document. documentURI)
  {
   case "chrome://messenger/content/messenger.xul":
    retobj = this. CustombuttonsTBFactory;
    break;
   case "chrome://messenger/content/messageWindow.xul":
    retobj = this. CustombuttonsTBMWFactory;
    break;
   case "chrome://messenger/content/messengercompose/messengercompose.xul":
   default: // message compose window
    retobj = this. CustombuttonsTBMCFactory;
  }
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

 CustombuttonsTBMWFactory:
 {
  get Custombuttons () { return new CustombuttonsTBMW (); },
  get Editor () { return new TBEditor (); },
  get Prefs () { return new TBPrefs (); }
 },

 CustombuttonsTBMCFactory:
 {
  get Custombuttons () { return new CustombuttonsTBMC (); },
  get Editor () { return new TBEditor (); },
  get Prefs () { return new TBPrefs (); }
 },

 CustombuttonsMFFactory:
 {
  get Custombuttons () { return new CustombuttonsMF (); },
  get Editor () { return new Editor (); },
  get Prefs () { return new Prefs (); }
 },

 CustombuttonsSTFactory:
 {
  get Custombuttons () { return new CustombuttonsST (); },
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

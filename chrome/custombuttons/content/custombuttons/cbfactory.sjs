#include <project.hjs>

function custombuttonsFactory ()
{
  var retobj = null;
  var info = SERVICE (XUL_APP_INFO);
  switch (info. name)
  {
    case "Firefox": // Firefox
        var oVC = COMPONENT (VERSION_COMPARATOR);
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
  }
  return retobj;
}
custombuttonsFactory. prototype =
{
  CustombuttonsFactory:
  {
    DEFINE_GETTER (Custombuttons, Custombuttons),
    DEFINE_GETTER (Editor, Editor),
    DEFINE_GETTER (Prefs, Prefs)
  },

  CustombuttonsTBFactory:
  {
    DEFINE_GETTER (Custombuttons, CustombuttonsTB),
    DEFINE_GETTER (Editor, TBEditor),
    DEFINE_GETTER (Prefs, TBPrefs)
  },
  
  CustombuttonsMFFactory:
  {
      DEFINE_GETTER (Custombuttons, CustombuttonsMF),
      DEFINE_GETTER (Editor, Editor),
      DEFINE_GETTER (Prefs, Prefs)
  }
};

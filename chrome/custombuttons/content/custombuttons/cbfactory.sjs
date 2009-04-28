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
	case "KompoZer":
		retobj = this. CustombuttonsNVUFactory;
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
	
	CustombuttonsTBMWFactory:
	{
		DEFINE_GETTER (Custombuttons, CustombuttonsTBMW),
		DEFINE_GETTER (Editor, TBEditor),
		DEFINE_GETTER (Prefs, TBPrefs)
	},
	
	CustombuttonsTBMCFactory:
	{
		DEFINE_GETTER (Custombuttons, CustombuttonsTBMC),
		DEFINE_GETTER (Editor, TBEditor),
		DEFINE_GETTER (Prefs, TBPrefs)
	},
	
	CustombuttonsMFFactory:
	{
		DEFINE_GETTER (Custombuttons, CustombuttonsMF),
		DEFINE_GETTER (Editor, Editor),
		DEFINE_GETTER (Prefs, Prefs)
	},
	
	CustombuttonsSTFactory:
	{
		DEFINE_GETTER (Custombuttons, CustombuttonsST),
		DEFINE_GETTER (Editor, Editor),
		DEFINE_GETTER (Prefs, Prefs)
	},
	
	CustombuttonsSBFactory:
	{
		DEFINE_GETTER (Custombuttons, CustombuttonsSB),
		DEFINE_GETTER (Editor, TBEditor),
		DEFINE_GETTER (Prefs, Prefs)
	},
	
	CustombuttonsNVUFactory:
	{
		DEFINE_GETTER (Custombuttons, CustombuttonsNVU),
		DEFINE_GETTER (Editor, TBEditor),
		DEFINE_GETTER (Prefs, Prefs)
	}
};

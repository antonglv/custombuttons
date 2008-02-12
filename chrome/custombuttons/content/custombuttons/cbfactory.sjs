#include <project.hjs>

function custombuttonsFactory ()
{
	var retobj = null;
	var info = SERVICE (XUL_APP_INFO);
	switch (info. name)
	{
		case "Firefox": // Firefox
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
		DEFINE_GETTER (Custombuttons, TBCustombuttons),
		DEFINE_GETTER (Editor, TBEditor),
		DEFINE_GETTER (Prefs, TBPrefs)
	}
};

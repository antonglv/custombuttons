#include <project.hjs>
if (!window. custombuttonsFactory)
{
	SERVICE (JS_SUBSCRIPT_LOADER).
		loadSubScript ("chrome://custombuttons/content/cbfactory.js");
}
if (!window. custombuttons)
{
	SERVICE (JS_SUBSCRIPT_LOADER).
		loadSubScript ("chrome://custombuttons/content/overlay.js");
}

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

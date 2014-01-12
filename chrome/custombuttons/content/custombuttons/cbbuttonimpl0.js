if (Components. lookupMethod)
    Components. classes ["@mozilla.org/moz/jssubscript-loader;1"].
	getService (Components. interfaces. mozIJSSubScriptLoader).
	    loadSubScript ("chrome://custombuttons/content/cbbiNativeMethod.js", this);

if (!this. _handlers)
    Components. classes ["@mozilla.org/moz/jssubscript-loader;1"].
	getService (Components. interfaces. mozIJSSubScriptLoader).
	    loadSubScript ("chrome://custombuttons/content/cbbuttonimpl.js", this);

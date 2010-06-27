#include <project.hjs>

if (!("custombutton" in window))
    SERVICE (JS_SUBSCRIPT_LOADER). loadSubScript ("chrome://custombuttons/content/cbbutton.js");

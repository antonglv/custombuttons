#include <project.hjs>

var cbCustomizeToolbarHandler =
{
  templateButton: null,
  palette: null,

  hideTemplateButton: function ()
  {
    var gToolbox = window. arguments [0];
    var palette = gToolbox. palette;
    this. palette = palette;
    for (var i = 0; i < palette. childNodes. length; i++)
    {
      if (palette. childNodes [i]. id == "custombuttons-template-button")
      {
        this. templateButton = palette. childNodes [i];
        palette. removeChild (palette. childNodes [i]);
        break;
      }
    }
  },

  restoreTemplateButton: function ()
  {
    this. palette. appendChild (this. templateButton);
  }
};

ADD_BUBBLING_EVENT_HANDLER ("unload", cbCustomizeToolbarHandler. restoreTemplateButton ());
cbCustomizeToolbarHandler. hideTemplateButton ();

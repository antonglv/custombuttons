var gConsole, gConsoleBundle;

window. onload = function()
{
  gConsole = document.getElementById("CBConsoleBox");
  gConsoleBundle = document.getElementById("ConsoleBundle");
  
  updateSortCommand(gConsole.sortOrder);
  updateModeCommand(gConsole.mode);
}

/* :::::::: Console UI Functions ::::::::::::::: */

function changeMode(aMode)
{
  switch (aMode) {
    case "Errors":
    case "Warnings":
    case "Messages":
      gConsole.mode = aMode;
      break;
    case "All":
      gConsole.mode = null;
  }
  
  document.persist("ConsoleBox", "mode");
}

function clearConsole()
{
  gConsole.clear();
}

function changeSortOrder(aOrder)
{
  updateSortCommand(gConsole.sortOrder = aOrder);
}

function updateSortCommand(aOrder)
{
  var orderString = aOrder == 'reverse' ? "Descend" : "Ascend";
  var bc = document.getElementById("Console:sort"+orderString);
  bc.setAttribute("checked", true);  

  orderString = aOrder == 'reverse' ? "Ascend" : "Descend";
  bc = document.getElementById("Console:sort"+orderString);
  bc.setAttribute("checked", false);
}

function updateModeCommand(aMode)
{
  /* aMode can end up invalid if it set by an extension that replaces */
  /* mode and then it is uninstalled or disabled */
  var bc = document.getElementById("Console:mode" + aMode) ||
           document.getElementById("Console:modeAll");
  bc.setAttribute("checked", true);
}

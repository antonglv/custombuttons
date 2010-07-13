var phase = oButton. _initPhase? "init": "code";
var id = oButton. id;
var doc = document;
var uri = buttonURI;
if ("custombuttonsUtils" in window)
{
    var createDebug = custombuttonsUtils. createDebug;
    var createMsg = custombuttonsUtils. createMsg;
}

/**
 * Logs an message to Error Console
 * @param {String} msg A message to log to
 * @version 0.0.5.1
 */
function LOG (msg)
{
    var oButton = doc. getElementById (id);
    var name = oButton. name;
    var head = "[Custom Buttons: id: " + id + "@" + phase + ", line: " + Components. stack. caller. lineNumber + ", name: " + name + "]";
    var cs = Components. classes ["@mozilla.org/consoleservice;1"]. getService (Components. interfaces. nsIConsoleService);
    cs. logStringMessage (head + (msg? ("\n" + msg): ""));
}

/**
 * Registers an event listener so the listener may be deleted on button destruction
 * @param {String} eventType
 * @param {nsIDOMEventListener|function} eventHandler
 * @param {Boolean} captureFlag 
 * @param {nsIDOMEventTarget} [eventTarget=window]
 * @version 0.0.5.1
 */
function addEventListener (eventType, eventHandler, captureFlag, eventTarget)
{
    var handler =
    {
	eventType: "",
	eventHandler: null,
	captureFlag: null,
	eventTarget: null,
	context: null,
	
	handleEvent: function (event)
	{
	    switch (typeof this. eventHandler)
	    {
	    case "function":
		this. eventHandler. apply (this. context, [event]);
		break;
	    case "object":
		this. eventHandler. handleEvent (event);
		break;
	    default:;
	    }
	},
	
	register: function ()
	{
	    try
	    {
		this. eventTarget. addEventListener (this. eventType, this, this. captureFlag);
	    }
	    catch (e) {}
	},
	
	unregister: function ()
	{
	    try
	    {
		this. eventTarget. removeEventListener (this. eventType, this, this. captureFlag);
	    }
	    catch (e) {}
	}
    };
    handler. eventType = eventType;
    if ((eventHandler instanceof Components. interfaces. nsIDOMEventListener) ||
	(typeof (eventHandler) == "function") ||
	((typeof (eventHandler) == "object") && (typeof (eventHandler ["handleEvent"]) == "function")))
	handler. eventHandler = eventHandler;
    else
	throw new TypeError ("Custom Buttons: addEventListener: eventHandler isn't a function or hasn't nsIDOMEventListener interface", uri, Components. stack. caller. lineNumber);
    handler. captureFlag = captureFlag;
    if (!eventTarget)
	eventTarget = window;
    if (eventTarget instanceof Components. interfaces. nsIDOMEventTarget)
	handler. eventTarget = eventTarget;
    else
	throw new TypeError ("Custom Buttons: addEventListener: eventTarget hasn't interface nsIDOMEventTarget\n", uri, Components. stack. caller. lineNumber);
    var oButton = doc. getElementById (id);
    handler. context = oButton;
    handler. register ();
    oButton. _handlers. push (handler);
}

/**
 * Unregisters an event listener registered with addEventListener
 * @param {String} eventType
 * @param {nsIDOMEventListener|function} eventHandler
 * @param {Boolean} captureFlag
 * @param {nsIDOMEventTarget} [eventTarget=window]
 */
function removeEventListener (eventType, eventHandler, captureFlag, eventTarget)
{
    var handler;
    var oButton = doc. getElementById (id);
    if (!eventTarget)
	eventTarget = window;
    for (var i = 0; i < oButton. _handlers. length; i++)
    {
	handler = oButton. _handlers [i];
	if ((handler. eventType == eventType) && (handler. eventHandler == eventHandler) && (handler. captureFlag == handler. captureFlag) && (handler. eventTarget == eventTarget))
	{
	    handler. unregister ();
	    oButton. _handlers. splice (i, 1);
	    break;
	}
    }
}

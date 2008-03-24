#include <project.hjs>
#include <timer.hjs>

var CB2const =    //{{{
{
  bFieldSepHack:              "] [",      // No Translation Please
  bFieldSepNew:               "]▲[",      // No Translation Please
  bFieldSepNewx:              "%5D%u25B2%5B",    // No Translation Please
  bFieldSep:                  "][" ,      // No Translation Please
  bFieldSepUTF8:              "]\u00e2\u0096\u00b2[",  // No Translation Please
  bFieldSepEscaped:           "%5D%E2%96%B2%5B",    // No Translation Please
  sOvrlyCB2ExtName:           "Custom Buttons&#178;",  // No Translation Please
  VOID:                       "undefined",      // No Translation Please
  OBJECT:                     "object",      // No Translation Please
  FUNCTION:                   "function",      // No Translation Please
  STRING:                     "string",      // No Translation Please
  NUMBER:                     "number",      // No Translation Please
  BOOLEAN:                    "boolean",      // No Translation Please
  NULL:                       null,        // No Translation Please
  XML:                        "xml object",      // No Translation Please
  BUTTON_COMMENT_FILLER:      "----------------------------------------",
  CODE_START_COMMENT:         "/" + "*",
  CODE_END_COMMENT:           "*" + "/",
  CODE_LINE_COMMENT:          "/" + "/",
  CODE_COMMENT_WIDTH:         80,
  FIREFOX_BUT_OVERLAY:        "buttonsoverlay",
  T_BIRD_MAIL_BUT_OVERLAY:    "buttonsoverlay",
  T_BIRD_MW_BUT_OVERLAY:      "mw_buttonsoverlay",
  T_BIRD_COMPOSE_BUT_OVERLAY: "compose_buttonsoverlay",
  NAV_TOOL_BOX:               "navigator-toolbox",
  BROWSE_TOOL_BOX:            "browser-toolbox",
  MAIL_TOOL_BOX:              "mail-toolbox",
  COMPOSE_TOOL_BOX:           "compose-toolbox",
  INSTALL_BAR_FF:             "nav-bar",
  INSTALL_BAR_MF:             "navigator-toolbar",
  INSTALL_BAR_TB:             "mail-bar2",
  TOOLBAR_PALETTE_FF:         "BrowserToolbarPalette",
  TOOLBAR_PALETTE_TB:         "MailToolbarPalette",
  TOOLBAR_PALETTE_TB_MC:      "MsgComposeToolbarPalette",
  CUSTOMIZE_TOOLBAR_FF:       "cmd_CustomizeToolbars",
  CUSTOMIZE_TOOLBAR_TB:       "menu_customizeToolbar",
  CUSTOMIZE_TOOLBAR_TBC:      "CustomizeMailToolbar",
  BUTTON_TT_CB_ID:            "extensions.custombuttons.include.toolTip_Cb_Id",
  DE_BUG:                     "extensions.custombuttons.deBug",
  buttonFields:               4,
  sCbGUID:                    "CustomButtons2@cbtnext.org",
  sCbMFVersion:               "3.0*",
  sFIREFOX_ID:                "{ec8030f7-c20a-464f-9b0e-13a3a9e97384}",
  sTHUNDERBIRD_ID:            "{3550f703-e582-4d05-9a08-453d09bdfdc6}",
  rCbLinkPrefix:              /custombutton\:\/\//,
  sAIOStbxstatbarRight:       "aiostbx-toolbar-statusbar-right",
  sAIOStbxbmbugfix:           "aiostbx-bmbugfix",
  cbMakeBtnsfunc:             "custombuttons.makeButtons()",
  nInitTO:                    200,
  sItemViewCodes:             "context-custombuttons-viewcodes",
  sContextViewSourceId:       "context-viewsource",
  sContentAreaContextMenu:    "contentAreaContextMenu",
  sMozPrefServ:               "@mozilla.org/preferences-service;1",
  sMozStrBundle:              "@mozilla.org/intl/stringbundle;1",
  sCBPropURI:                 "chrome://custombuttons/locale/custombuttons.properties",
  sUndefined:                 "undefined",
  sCB2Homepage:               "http://custombuttons2.com/forum/index.php",
  sCBCtxtMenu:                "custombuttons-contextpopup",
  sCBCtxtMenuSub:             "custombuttons-contextpopup-sub",
  CBC_PREF_EDITOR_BRANCH:     "extensions.custombuttons.editor",
  CBC_PREF_SOFTAB:            ".softTab",
  CBC_PREF_SOFTAB_WIDTH:      ".softTabWidth",
  sCBCtxtMenuEdit:            "-edit",
  sCBCtxtMenuRemove:          "-remove",
  sCBCtxtMenuDisable:         "-disable",
  sCBCtxtMenuSep1:            "-separator1",
  sCBCtxtMenuClone:           "-clone",
  sCBCtxtMenuHyperlink:       "-hyperlink",
  sCBCtxtMenuBBCodelink:      "-bbcodelink",
  sCBCtxtMenuCopyURI:         "-copyURI",
  sCBCtxtMenuCopybuttonname:  "-copybuttonname",
  sCBCtxtMenuBackup:          "-backup",
  sCBCtxtMenuUpdate:          "-update",
  sCBCtxtMenuBookmark:        "-bookmark",
  sCBCtxtMenuButes:           "-butes",
  sCBCtxtMenuBtnhelp:         "-btnhelp",
  sCBCtxtMenuHomepage:        "-homepage",
  sCBCtxtMenuSep2:            "-separator2",
  sCBCtxtMenuAdd:             "-add",
  sCBCtxtMenuCustomize:       "-customize",
  sCBCtxtMenuCustomizeTB:     "-add1",
  sCBCtxtMenuSubCall:         "-subCall",
  nClipbrd:                   0,
  nHyper:                     1,
  nBBCode:                    2,
  nHyperBu:                   4,
  sButtonLinkMethod:          "extensions.custombuttons.originalButtonSplitMethod",
  xLast:                      "last item no comma"
};  //}}}

/**  Object gCounter
Author:      SCClockDr

Scope:       private
Properties:  count -
Methods:     inc -
Purpose:     1. Maintain a counter
**/
custombuttons.gCounter = function ( nC, nS ) //{{{
{
	var oRet = {
		// Properties:
		count:0,
		step:1,
		// Methods
		init:function ( nCt, nSt )
		{
			this.count = ( typeof nCt == "number")? nCt : 0;
			this.step  = ( typeof nSt == "number")? nSt : 1;
		}, // End Method init(  )
		dec:function (  )
		{
			var a = this.count;
			this.count -= this.step;
			return [a, this.count];
		}, // End Method dec(  )
		inc:function (  )
		{
			var a = this.count;
			this.count += this.step;
			return [a, this.count];
		}, // End Method inc(  )
		get:function (  )
		{
			return this.count;
		} // End Method get(  )
	}
	oRet.init( nC, nS );
	return oRet;
}; //}}} End Method gCounter(  )

/**  getCbContextObj( oBtn )

Scope:   global
Args:    oBtn -
Returns: oRet
Called:  1. Any Custom Buttons² Button
Purpose: 1. Maintain and manipilate the Custom Buttons² Context
Menu
NOTE:    1. Must be named this.mObj within the button's
Initialization Code field
2. The Object is presented to the button as Initalized,
no setup required.
3. View usage documentation within the object's comments
**/
custombuttons.getCbContextObj = function ( oBtn ) //{{{
{
	/**  Object mObj
	Author:  SCClockDr
	
	Scope:    Private - Each instance of this object is unique.
	Global - It's properties and methods are available
	within the button's namedspace.
	ButtonObj.mObj.property/method()
	Properties:  BtnIdNum - Owner's id #
	ItemIdPre - Init to "Cb2-BtnIdNum-"
	mCtxtSub - Context mode flag.
	setSub makes this true
	setPri makes this false
	oMenu - Primary Context menu Object
	nMenu - SubMenu Context menu Object
	oId - Primary Context menu id
	nId - SubMenu Context menu id
	OurCount - Counter Object used to provide the
	sequential number in the item id
	menuitems - Holds the menu child count
	itemStack - Holds a stack of the owner id's
	aElements - Holds the menu child collection
	aItemIdx - An array of Menuitem property names
    Methods:  init - Sets the initial state and is called by
	the wrapper prior to presenting the object
	to the caller.
	setSub - Sets the Sub menu on and reduces the
	primary menu to one Custom Buttons² item
	"Custom Button" which invokes the subMenu
	If button specific Items are already in
	the primary menu they will be presented
	as well.
	setPri - Resets the Primary menu and kills the
	SubMenu. It hides any button specific
	Items appended to the primary menu.
	getItem - Retrieves an object with named
	properties. Which the user populates with
	the item data specific to their
	application. Fields not populated will not
	alter the menuitem when populated.
	Id is REQUIRED and if ommitted a default
	will be substituted. the Id's structure
	is: "Cb2-##-YourID++" Where:
	## is the button's id number
	++ is a 0 based sequential number
	Menuseparators are invoked by omitting
	the label property
	insertBefore - Inserts a menuitem to the primary
	Context menu before the menuitem specified in arg2
	Requires the populated getItem Object as an arg
	and a reference menuitem as arg 2
	insertAfter - Inserts a menuitem to the primary
	Context menu after the menuitem specified in arg2
	Requires the populated getItem Object as an arg
	and a reference menuitem as arg 2
	addItem - Prepends a menuitem to the primary
	Context menu. Requires the populated
	getItem Object as an arg.
	populate - Populated the menuitem with the data
	supplied.
	remItem - Removes the specified item (by Id) from the
	Primary Context Menu.
	remAll - Removes all the menuItem in the stack
	Purpose:  1. See preceding comment block
    **/
    var oRet =
    {
		// Properties:
		BtnIdNum:0,
		ItemIdPre:"Cb2-",
		sIdPrefix: "",
		mCtxtSub:false,
		oMenu:null,
		nMenu:null,
		oButton: null,
		oId:"",
		nId:"",
		OurCount:{},
		listener:function(){},
		aItemIdx:["id","label","image","oncommand","command","acceltext","accesskey","allowevents",
		"autocheck","checked","crop","description","disabled","key", "name",
		"tabindex","type","validate","value"],

		/**
		 * @author Anton
		 */
		get menuitems ()
		{
			if (this. oMenu && this. oMenu. childNodes)
				return this. oMenu. childNodes. length;
			return 0;
		},
		
		/*
		 * @author Anton
		 */
		get aElements ()
		{
			if (this. oMenu && this. oMenu. childNodes)
				return this. oMenu. childNodes;
			return [];
		},
		
		// Methods
		/**  init(   )
		
		Scope:   global
		Args:
		Returns: Nothing
		Called:  1.
		Purpose: 1.
		**/
		init:function ( oBtn ) //{{{
		{
			//oBtn. _ctxtObj = this;
			this. oButton = oBtn;
			var ct = this;
			ct.BtnIdNum = custombuttons. getNumber( oBtn.id );
			ct.sIdPrefix = ct. ItemIdPre + ct. BtnIdNum + "-";
			ct.OurCount = custombuttons. gCounter();
			ct.oMenu = document. getElementById ("custombuttons-contextpopup");
			ct.nMenu = document. getElementById ("custombuttons-contextpopup-sub");
			ct.oId = ct.oMenu.id;
			ct.nId = ct.nMenu.id;
			ct.remItem();
		}, //}}} End Method init(  )
		/**  setSub(  )
		
		Scope:   global
		Args:
		Returns: Nothing
		Called:  1.
		Purpose: 1.
		**/
		setSub:function (  ) //{{{
		{
			this. oButton. _ctxtObj = true;
			this. mCtxtSub = true;
		}, //}}} End Method setSub(  )
		/**  setPri(  )
		
		Scope:   global
		Args:
		Returns: Nothing
		Called:  1.
		Purpose: 1.
		**/
		setPri:function (  ) //{{{
		{
			this. oButton. _ctxtObj = false;
			this. mCtxtSub = false;
		}, //}}} End Method setPri(  )
		/**  getItem(  )
		
		Scope:   global
		Args:
		Returns: oItem
		Called:  1.
		Purpose: 1.
		**/
		getItem:function (  ) //{{{
		{
			if ( this.mCtxtSub ) {
				var oItem = {
					id:"",
					label:"",
					image:"",
					oncommand:"",
					command:"",
					acceltext:"",
					accesskey:"",
					allowevents:false,
					autocheck:false,
					checked:false,
					crop:"",
					description:"",
					disabled:false,
					key:"",
					tabindex:"",
					type:"",
					validate:"",
					value:""
				}// End oItem
				return oItem;
			} // End if ( mCtxtSub )
			return null;
		}, //}}} End Method getItem(  )
		
		/*
		 * @author Anton
		 */
		constructItem: function (oNew, bInc)
		{
			var sIdPre = this. sIdPrefix;
			var sTagName = oNew. label? "menuitem": "menuseparator";
			var oNewItem = document. createElement (sTagName);
			sIdPre += oNew. id || oNew. label || "separator";
			sIdPre += this. OurCount [bInc? "inc": "get"] () [0];
			oNew. id = sIdPre;
			this. populate (oNew, oNewItem);
			return oNewItem;
		},
		/**  insertBefore( oMenuItem )
		
		Scope:   global
		Args:    oNew - Data Object
		oChildNode - Node to insert before
		Returns: sRet - ItemId
		Called:  1.
		Purpose: 1.
		**/
		insertBefore:function ( oNew, oChildNode ) //{{{
		{
			var ct = this;
			var sTemp = "";
			if ( !oChildNode ) {
				oChildNode = ct.oMenu.firstChild;
			} // End if ( oChildNode )
			if ( ct.mCtxtSub ) {
				var oRet = ""
				var newItem = this. constructItem (oNew, true);
				oRet = ct.oMenu.insertBefore( newItem, oChildNode );
			} // End if ( mCtxtSub )
			return oRet
		}, //}}} End Method insertBefore( oNew, oChildNode )
		
		/**  insertAfter( oMenuItem, oChildNode )
		Scope:   global
		Args:    oNew - Data Object
		oChildNode - Node to insert before
		Returns: sRet - ItemId
		Called:  1.
		Purpose: 1.
		**/
		insertAfter:function ( oNew, oChildNode ) //{{{
		{
			var ct = this;
			var sTemp = "";
			if ( ct.mCtxtSub ) {
				var oRet = {}
				var newItem = this. constructItem (oNew, false);
				oRet = ct.oMenu.insertBefore(newItem, oChildNode);
				ct.OurCount.inc();
			} // End if ( mCtxtSub )
			return oRet
		}, //}}} End Method insertAfter( oNew, oChildNode )
		
		/**  addItem( oMenuItem )
		
		Scope:   global
		Args:    oNew - Data Object
		Returns: sRet - ItemId
		Called:  1.
		Purpose: 1.
		**/
		addItem:function ( oNew ) //{{{
		{
			var ct = this;
			var sTemp = "";
			if ( ct.mCtxtSub ) {
				var oRet = ""
				var newItem = this. constructItem (oNew, true);
				oRet = ct.oMenu.insertBefore( newItem, ct.oMenu.firstChild );
				
			} // End if ( mCtxtSub )
			return oRet
		}, //}}} End Method addItem( oNew )
		
		/**  populate( oData, mItem )
		
		Scope:   private
		Args:    oData -
		mItem -
		Returns: Nothing
		Called:  1.
		Purpose: 1.
		**/
		populate:function ( oData, mItem ) //{{{
		{
			var ct = this;
			for (var i in ct.aItemIdx ) {
				if ( oData[ct.aItemIdx[i]] ) mItem.setAttribute( ct.aItemIdx[i], oData[ct.aItemIdx[i]] );
			} // End for
		}, //}}} End Method populate( oData, mItem )
		
		/*
		 * @author Anton
		 */
		constructId: function (sId)
		{
			var cId = sId || "";
			if (cId. indexOf (this. sIdPrefix) == 0)
				return cId;
			return this. sIdPrefix + cId;
		},
		
		/**  getItemsById( id )
		
		Scope:   global
		Args:    id -
		Returns: aRet
		Called:  1.
		Purpose: 1.
		**/
		getItemsById:function ( id ) //{{{
		{
			var aRet = [];
			var ct = this
			var cId = this. constructId (id);
			for ( var i = 0; i < ct.menuitems; i++) {
				if ( ct.aElements.item(i).id.indexOf( cId ) > -1 ) {
					aRet.push( ct.aElements.item(i) );
				}
			} // End for
			return aRet;
		}, //}}} End Method getItemsById( id )
		
		/**  remItem( id )
		
		Scope:   private
		Args:    id -
		Returns: Nothing
		Called:  1.
		Purpose: 1.
		**/
		remItem:function ( id ) //{{{
		{
			var ct = this;
			var cId = this. constructId (id);
			for ( var i = 0; i < ct.menuitems; i++) {
				if ( ct.aElements.item(i).id.indexOf( cId ) > -1 ) {
					ct.oMenu.removeChild( ct.aElements.item(i) );
					i--;
				}
			} // End for
		},  //}}} End Method remItem( id )

		/**  deInit(  )
		Scope:     private
		Args:
		Returns:   Nothing
		Called by: 1. editor.onload
		2. this.removeButton
		Purpose:   1. De Initializes this object
		TODO:      1.
		*/
		deInit:function () //{{{
		{
			this.setPri();
			this.listener = function(){};
		} //}}} End Method deInit(  )
		
}; //}}} End Object mObj

oRet.init( oBtn );
return oRet;
}; //}}} End Method getCbContextObj( oBtn )

/**  Object   gQuot
Author:  George Dunham aka: SCClockDr

Scope:    Public
Properties:
Methods:
mHandler -
this.gQuot.gShowPopup -
Purpose:  1. Handle mouse clicks
2. Popup the Custom Buttons² context menu
How it works:    On a click the calling button is strobed via
"this.setAttribute("onclick", "  gQuot(event, this);");"
line in its Initialization Code section. This passes
the event and button (this) object here.
Execution:  1. First we check for a shift + right click if that was
the event we call this.gQuot.gShowPopup(cButton) passing it the
button object.
2. If not a shift + right click we proceed to check for
a click event called function presence pair.
a. Testing progress down the tree till we arrive
at the clicked button with no extra key
qualifier.
b. If that function is persent execution passes
to the called function within the calling
button. We pass the event object to the called
function to provide the button author the info
for further processing.
3. If no matches are found then all combinations will put
up the menu.
Calls:      1. "cButton.cleftclick(evt)" calls the button object that
was passed function cleftclick.
It passes the Click event object to the button and
expects nothing in return.
2. When control returns to this function we encounter
break and the function exits to the button's calling
attribute "onclick" statement.
3. We are then done with that event.
UPDATED:    8/25/2007 Moved to custombuttons object
UPDATED: 10.03.08 by Anton
**/
custombuttons.gQuot = { //{{{
	// Properties:
	dcWaitFlag: false, // double click wait flag
	oTimer: null,	   // timer object
	dcDelay: 350,   // no clicks after doubleclick
	savEvent: null, // save Event for handling doClick().
	// Methods
	/**  mHandler( evt, cButton )
	
	Scope:   private
	Args:    evt -  Mouse click event used to direct code
	execution based on the button clicked and
	any extra state keys held during the
	event.
	cButton - Button of the calling button used to
	appropriatly locate the context menu.
	Returns: Nothing
	Called:  1. Custom Buttons² buttons onclick Attribute
	Purpose: 1. Call the appropriate click function based on
	the mouse button clicked and its modifiers.
	**/
	mHandler:function ( evt ) //{{{
	{
		if ((evt. button == 2) && evt. shiftKey)
			return;
		if (evt. target. _cbcontext)
			return;
		evt.preventDefault();
		if (evt.target.hasAttribute("initialized") && evt.target.getAttribute("initialized") == "false") return;
		switch (evt.type)
		{
		case "click":
			if (this. dcWaitFlag) return;
			this.savEvent = evt;
			// Otherwise set timer to act.  It may be preempted by a doubleclick.
			this. setTimer ();
			break;
		case "dblclick":
			this.doDoubleClick(evt);
			break;
		default :
			break;
		} // End switch ( evt.type )
	},
	
	/**
	 * Sets timer
	 * @author Anton
	 * 
	 */
	setTimer: function ()
	{
		this. oTimer = COMPONENT (TIMER);
		this. oTimer. initWithCallback (this, this. dcDelay, TIMER_TYPE_ONE_SHOT);
		this. dcWaitFlag = true;
	},
	
	/**
	 * nsITimerCallback interface implementation
	 * Returns this object on nsITimerCallback interface query
	 * For possible QI's
	 * @author Anton
	 * @return this object
	 *
	 */
	DEFINE_STD_QI (nsITimerCallback),
	
	/**
	 * nsITimerCallback interface implementation
	 * Receives timer notification
	 * @author Anton
	 * @arguments {nsITimer} oTimer Timer object
	 *
	 */
	notify: function (oTimer)
	{
		this. doDoubleClick (this. savEvent);
	},
	
	/**
	 * Deletes timer
	 * @Author Anton
	 *
	 */
	deleteTimer: function ()
	{
		this. dcWaitFlag = false;
		if (!this. oTimer)
			return;
		this. oTimer. cancel ();
		this. oTimer = null;
	},
	
	doDoubleClick: function (oEvent)
	{
		this. deleteTimer ();
		this. click (oEvent)
	},
	
	/**
	* Construct callback method name for given event object
	* @author Anton Glazatov
	* @type {String}
	* @argument {Event} oEvent Event object
	*
	*/
	getMethodName: function (oEvent)
	{
		var sMethodName = "";
		try // because error in FF1.5.0.2 js console
		{
			if (oEvent. altKey) sMethodName = "a";
			if (oEvent. ctrlKey) sMethodName += "c";
			if (oEvent. shiftKey) sMethodName += "s";
			sMethodName += ["left", "mid", "right"] [oEvent. button];
			if (oEvent. type == "click")
				sMethodName += "click";
			else if (oEvent. type == "dblclick")
				sMethodName += "Dclick";
			else
				sMethodName += "mouseevent";
		} catch (e) {}
		return sMethodName;
	},
	
	/**
	* Search and execute button's callback method or show context menu
	* @author Anton Glazatov
	* @returns none
	* @argument {Event} oEvent Event object
	*
	*/
	click: function (oEvent)
	{
		var oButton = oEvent. target;
		var sMethodName = this. getMethodName (oEvent);
		if (sMethodName && oButton [sMethodName])
			oButton [sMethodName] (oEvent);
		else
			this. gShowPopup (oButton);
	},
	
	/**  gShowPopup( node )
	
	Scope:   public
	Args:    node - Button in focus
	Returns: Nothing
	Called:  1. this.mHandler
	2. Any process which passes node as an object
	and will handle the Custom Buttons² context
	menu.
	Purpose: 1. Display the Custom Buttons² context menu.
	2. No button author intervention expected.
	UPDATED:    *  8/25/2007 - Added as an object in custombuttons
	UPDATED:    *  2/2/2008 - Modified to handle new popup method.
	UPDATED: 10.03.08 by Anton - added context menu items visibility test
	**/
	gShowPopup:function ( node, menuId ) //{{{
	{
		var position = "overlap";
		if ( typeof menuId != "string") menuId = "custombuttons-contextpopup";
		var popup = document.getElementById( menuId );        // Get the menu
		document.popupNode = node;                            // Post node to document.
		if (typeof popup.openPopup == "function") {    // Test for new popup function
			var x = node.boxObject.width/1.6;                   // Set x OffSet
			var y = node.boxObject.height/1.6;                  // Set y OffSet
			popup.openPopup(node, position, x, y, true, false); // Pop up the menu
		}  // End if ( typeof popup.openPopup == CB2const.FUNCTION )
		else {
			var x = node.boxObject.x + (node.boxObject.width*.6);                           // Get xCoord.
			var y = node.boxObject.y + (node.boxObject.height*.6);   // Get yCoord.
			popup.showPopup(node, x, y, "popup", null, null);   // Pop up the menu
		} // End else ( typeof popup.openPopup == CB2const.FUNCTION )
	}  //}}} End Method gShowPopup( node )
}; //}}} End Object   gQuot
	
/**  gQuot( evt, cButton )
Author:  George Dunham aka: SCClockDr

Scope:   global
Args:    evt -
cButton -
Returns: Nothing
Called:  1. Any custombuttons-button.
Purpose: 1. Handle mouse click events.
**/
var gQuot = function( evt, cButton ) //{{{
{
	custombuttons.gQuot.mHandler( evt, cButton );
} //}}} End Function gQuot( evt, cButton ) 

/**  gShowPopup( node )
Author:  George Dunham aka: SCClockDr

Scope:    global
Args:     node -
Returns:  Nothing
Called:  1. ???
Purpose: 1. Display the Custom Buttons² context menu.
2. No button author intervention expected.
**/
var gShowPopup = function( node ) //{{{
{
	custombuttons.gQuot.gShowPopup( node );
}; //}}} End gShowPopup( node )
	
/**  getButtonParameters2( num )
Author Yan, George Dunham

Args:    num
Returns: ret,
Returns: Nothing
Scope:  private
Called:
Purpose:
Updated 8/23/2007 to format and document the function
UPDATED: 10.03.08 by Anton
**/
custombuttons.getButtonParameters2 = function ( num ) //{{{
{
	var ret = null;
	var but1 = this. getButtonById (num);
	var but = document.getElementById( "custombuttons-button"+num );
	if (!but) return false;
	var sHelp = but.getAttribute("Help") || but.getAttribute("help") || "";
	var ret = {
		"name":     but.getAttribute("label")||"",
		"image":    but.getAttribute("image")||"",
		"code":     but.getAttribute("cb-oncommand")||"",
		"initCode": but.getAttribute("cb-init")||"",
		"Help":     sHelp
	};
	return ret;
}; //}}} End Method getButtonParameters2(num )

/**
 * CB2api emulation
 * @author Anton
 */
custombuttons. setButtonOpacity = function (oButton, sProperty, aValues)
{
	if (oButton. id. indexOf ("custombuttons-button") == 0)
		oButton. style. opacity = aValues [oButton [sProperty]? 0: 1]
};
custombuttons. ButtonBrt = function (oEvent)
{
	this. setButtonOpacity (oEvent. target, "disabled", ["0.25", "0.99"]);
};
custombuttons. ButtonDim = function (oEvent)
{
	this. setButtonOpacity (oEvent. target, "disabled", ["0.25", "0.65"]);
};

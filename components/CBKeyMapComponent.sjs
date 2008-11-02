// ***** BEGIN LICENSE BLOCK *****
// Version: MPL 1.1
// 
// The contents of this file are subject to the Mozilla Public License Version
// 1.1 (the "License"); you may not use this file except in compliance with
// the License. You may obtain a copy of the License at
// http://www.mozilla.org/MPL/
// 
// Software distributed under the License is distributed on an "AS IS" basis,
// WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
// for the specific language governing rights and limitations under the
// License.
// 
// Custom Buttons:
// - Gives a possibility to create custom toolbarbuttons.
// - This component is intended to support custombuttons "hot keys" definition
// 
// Author: Anton Glazatov (c) 2008
// 
// ***** END LICENSE BLOCK *****
#include <project.hjs>

function cbKeyMapService () {}
cbKeyMapService. prototype =
{
	DEFINE_STD_QI (cbIKeyMapService),

    keymap: {},
    
    Add: function (id, key, disableDefaultAction)
    {
		if (!id)
			return;
		if (key)
			this. keymap [id] = [key, disableDefaultAction];
		else
			this. Delete (id); 
	},
	
	Delete: function (id)
	{
		if (this. keymap [id])
			delete this. keymap [id];
	},
	
	getKeyPrefix: function (event)
	{
		var prefix = "";
		if (event. altKey) prefix += "Alt+";
		if (event. ctrlKey) prefix += "Ctrl+";
		if (event. shiftKey) prefix += "Shift+";
		return prefix;
	},
	
	_eventKeymap: [],
	get eventKeymap ()
	{
		if (this. _eventKeymap. length == 0)
		{
			var prefix = "DOM_VK_";
			var ikey = Components. interfaces. nsIDOMKeyEvent;
			for (i in ikey)
			{
				if (i. indexOf (prefix) == 0)
					this. _eventKeymap [ikey [i]] = i. substr (prefix. length);
			}
		}
		return this. _eventKeymap;
	},
	
	getKey: function (event)
	{
		var key = "";
		if (event. which)
			key = String. fromCharCode (event. which);
		else
			key = this. eventKeymap [event. keyCode];
		return key;
	},
	
	Get: function (event, count)
	{
		var key = this. getKeyPrefix (event) + this. getKey (event);
		var values = new Array ();
		var mode = false;
		for (var i in this. keymap)
		{
			if (this. keymap [i] [0] == key)
			{
				values. push (i);
				mode = mode || this. keymap [i] [1];
			}
		}
		if (values. length != 0)
			values. unshift (mode? "true": "");
		count. value = values. length;
		return values;
	}
};

var Module =
{
    CLSID: CID ("{86216795-2b22-470a-9388-785cb4b4101b}"),
    ContractID: CB_KEYMAP_SERVICE_CID,
    ComponentName: "Custombuttons extension keymap service component",

    DEFINE_STD_MODULE_INTERFACE,
	DEFINE_STD_CLASS_FACTORY (cbKeyMapService)
};

DEFINE_STD_NS_GET_MODULE (Module)

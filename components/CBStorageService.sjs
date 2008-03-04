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
// - This component is intended to provide extension's
// - subservient data storage
// 
// Author: Anton Glazatov (c) 2008
// 
// ***** END LICENSE BLOCK *****
#include <project.hjs>

function CustombuttonsStorageService ()
{
	this. wrappedJSObject = this;
}
CustombuttonsStorageService. prototype =
{
	DEFINE_STD_QI (cbIStorageService),

    storage: {},
    
	wasChanged: function (id)
	{
		return this. storage [id]? true: false;
	},
	
	getChangedButtonsIds: function (count)
	{
		var values = new Array ();
		for (var i in this. storage)
			values. push (i);
		count. value = values. length;
		return values;
	},
	
	storeButtonParameters: function (id, buttonParameters)
	{
		if (this. storage [id])
			delete this. storage [id];
		this. storage [id] = buttonParameters;
	},
	
	getButtonParameters: function (id)
	{
		return this. storage [id] || null;
	}
};

var Module =
{
	CLSID: CID ("{85a63191-33a3-4d77-a70d-ed4b3cc4c0d2}"),
    ContractID: CB_STORAGE_SERVICE_CID,
    ComponentName: "Custombuttons extension storage service",
	
	DEFINE_STD_MODULE_INTERFACE,
	DEFINE_STD_CLASS_FACTORY (CustombuttonsStorageService)
};

DEFINE_STD_NS_GET_MODULE (Module)

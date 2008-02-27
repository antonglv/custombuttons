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
// - These components is intended to provide extension's
// - subservient data storage
// 
// Author: Anton Glazatov (c) 2008
// 
// ***** END LICENSE BLOCK *****
#include <project.hjs>

function cbButtonParameters () {}
cbButtonParameters. prototype =
{
	DEFINE_STD_QI (cbIButtonParameters),
	name: "",
	mode: 0,
	image: "",
	code: "",
	initCode: "",
	accelkey: "",
	help: ""
};

var cbStorageService =
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
	CLSID: [CID ("{cb3c9904-7d0e-4efc-bffd-291ae91d4a6f}"),
			CID ("{85a63191-33a3-4d77-a70d-ed4b3cc4c0d2}")],
    ContractID: [CB_BUTTON_PARAMETERS_COMPONENT_CID, CB_STORAGE_SERVICE_CID],
    ComponentName: ["Custombuttons extension button parameters component",
					"Custombuttons extension storage service"],
	
	canUnload: function (componentManager)
	{
		return true;
	},
	
	getClassObject: function (componentManager, cid, iid)
	{
		if (!cid. equals (this. CLSID [0]) && !cid. equals (this. CLSID [1]))
			throw NS_ERROR (NO_INTERFACE);
		if (!iid. equals (CI. nsIFactory))
			throw NS_ERROR (NOT_IMPLEMENTED);
		return this. CLASS_FACTORY;
	},
	
	FIRST_TIME: true,
	
	registerSelf: function (componentManager, fileSpec, location, type)
	{
		if (this. FIRST_TIME)
			this. FIRST_TIME = false;
		else
			throw NS_ERROR (FACTORY_REGISTER_AGAIN);
		componentManager = componentManager. QI (nsIComponentRegistrar);
		componentManager. registerFactoryLocation
		(
			this. CLSID [0], this. ComponentName [0], this. ContractID [0],
			fileSpec, location, type
		);
		componentManager. registerFactoryLocation
		(
			this. CLSID [1], this. ComponentName [1], this. ContractID [1],
			fileSpec, location, type
		);
	},
	
	unregisterSelf: function (componentManager, location, loaderStr) {},
	
	CLASS_FACTORY:
	{
		QueryInterface: function (iid)
		{
			if (iid. equals (CI. nsIFactory) || iid. equals (CI. nsISupports))
				return this;
			throw NS_ERROR (NO_INTERFACE);
		},
		
		createInstance: function (outer, iid)
		{
			if (outer != null)
				throw NS_ERROR (NO_AGGREGATION);
			if (iid. equals (CI. cbIButtonParameters))
				return (new cbButtonParameters ()). QueryInterface (iid);
			else
				return cbStorageService;
		},
		
		getService: function (iid)
		{
			return cbStorageService;
		}
	}

};

DEFINE_STD_NS_GET_MODULE (Module)

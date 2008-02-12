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
	
	Get: function (key, count)
	{
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

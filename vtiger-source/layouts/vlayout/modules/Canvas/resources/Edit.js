/*+***********************************************************************************
 * The contents of this file are subject to the vtiger CRM Public License Version 1.0
 * ("License"); You may not use this file except in compliance with the License
 * The Original Code is:  vtiger CRM Open Source
 * The Initial Developer of the Original Code is vtiger.
 * Portions created by vtiger are Copyright (C) vtiger.
 * All Rights Reserved.
 *************************************************************************************/

Vtiger_Edit_Js("Canvas_Edit_Js", {}, {

	/**
	 * Function which will register event for Reference Fields Selection
	 */
	registerReferenceSelectionEvent : function(container) {
		this._super(container);
		var thisInstance = this;
		
	},
	
	/**
	 * Function to get popup params
	 */
	getPopUpParams : function(container) {
		var params = this._super(container);

        return params;
    },

	registerEvents: function(){
		console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
		this.setForm(jQuery('#reasonLoss'));
		this._super();
		
		
	}
});



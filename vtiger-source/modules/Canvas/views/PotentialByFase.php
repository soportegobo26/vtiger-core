<?php
/*+**********************************************************************************
 * The contents of this file are subject to the vtiger CRM Public License Version 1.1
 * ("License"); You may not use this file except in compliance with the License
 * The Original Code is:  vtiger CRM Open Source
 * The Initial Developer of the Original Code is vtiger.
 * Portions created by vtiger are Copyright (C) vtiger.
 * All Rights Reserved.
 ************************************************************************************/

class Canvas_PotentialByFase_View extends Vtiger_Index_View {
	
	public function getHeaderScripts(Vtiger_Request $request) {
		$headerScriptInstances = parent::getHeaderScripts($request);
		$moduleName = $request->getModule();
		$jsFileNames = array(
		    'https://hammerjs.github.io/dist/hammer.min.js',
			'~/libraries/hammer/jquery.hammer.js',
			'~/libraries/js-cookie/src/js.cookie.js',
			'~/libraries/accounting/accounting.min.js',
		    '~/layouts/vlayout/modules/Vtiger/resources/List.js',
		    '~/layouts/vlayout/modules/Vtiger/resources/RelatedList.js',
		    '~/layouts/vlayout/modules/Canvas/resources/PotentialByFase.js',
		    '~/libraries/datacrm/init.js',
		);
		$jsScriptInstances = $this->checkAndConvertJsScripts($jsFileNames);
		$headerScriptInstances = array_merge($headerScriptInstances, $jsScriptInstances);
		return $headerScriptInstances;
	}
        
	public function getHeaderCss(Vtiger_Request $request) {
		$headerCssInstances = parent::getHeaderCss($request);
		$cssFileNames = array(
		    '~/layouts/vlayout/modules/Canvas/resources/Canvas.css',
		    '~/layouts/vlayout/modules/Canvas/resources/PotentialByFase.css'
		);
		$cssInstances = $this->checkAndConvertCssStyles($cssFileNames);
		$headerCssInstances = array_merge($headerCssInstances, $cssInstances);
		return $headerCssInstances;
	}
	
	public function process (Vtiger_Request $request) {
		global $home_module;
		$viewer = $this->getViewer($request);
		$moduleName = $request->getModule();
		$this->viewName = $request->get('viewname');
		$module = Vtiger_Module::getInstance('Potentials');
		$fieldModel = Vtiger_Field_Model::getInstance('sales_stage', $module);
		$sales_stages = $fieldModel->getPicklistValues();
		unset($sales_stages['Closed Won']);
		unset($sales_stages['Closed Lost']);
		$viewer->assign('SALES_STAGE', $sales_stages);
		$viewer->assign('VIEWID', $this->viewName);
		$viewer->assign('CLOSEDWON', $comboFieldArray['sales_stage_dom']['Closed Won']);
		$viewer->assign('CLOSEDLOST', $comboFieldArray['sales_stage_dom']['Closed Lost']);
		$viewer->assign('CUSTOM_VIEWS', CustomView_Record_Model::getAllByGroup('Potentials'));
		$viewer->view('PotentialByFase.tpl', $moduleName);
		if($home_module=='Canvas'){
			echo '<script type="text/javascript"> 
				$("a#menubar_item_Home").addClass("selected");
			</script>';
		}
	}
	
}

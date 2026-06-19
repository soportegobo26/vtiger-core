<?php
/*+***********************************************************************************
 * The contents of this file are subject to the vtiger CRM Public License Version 1.0
 * ("License"); You may not use this file except in compliance with the License
 * The Original Code is:  vtiger CRM Open Source
 * The Initial Developer of the Original Code is vtiger.
 * Portions created by vtiger are Copyright (C) vtiger.
 * All Rights Reserved.
 *************************************************************************************/
 
class Canvas_ReasonLossAjax_View extends Vtiger_QuickCreateAjax_View {
	 
	 public function process(Vtiger_Request $request) {
		$moduleName = $request->getModule();
		$recordModel = Vtiger_Record_Model::getCleanInstance('Potentials');
		$moduleModel = $recordModel->getModule();
		$fieldList = $moduleModel->getFields();
		$fields = array();
		foreach($fieldList as $fieldname=>$field) {
			if($fieldname=='reason_loss') {
				$field->set('typeofdata', 'V~M');
				$fields[$fieldname] = $field;
			}
		}
		$viewer = $this->getViewer($request);
		$viewer->assign('FIELDS', $fields);
		$viewer->assign('MODULE', $moduleName);
		$viewer->assign('CURRENTDATE', date('Y-m-d'));
		$viewer->view('ReasonLoss.tpl', $moduleName);
	 }
	 
	 public function getHeaderScripts(Vtiger_Request $request) {
		$headerScriptInstances = parent::getHeaderScripts($request);
		$moduleName = $request->getModule();
		$jsFileNames = array(
		    '~/layouts/vlayout/modules/Canvas/resources/ReasonLoss.js',
		);
		$jsScriptInstances = $this->checkAndConvertJsScripts($jsFileNames);
		$headerScriptInstances = array_merge($headerScriptInstances, $jsScriptInstances);
		return $headerScriptInstances;
	 }
	
}

?>

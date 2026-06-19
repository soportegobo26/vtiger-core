<?php
/*+**********************************************************************************
 * The contents of this file are subject to the vtiger CRM Public License Version 1.1
 * ("License"); You may not use this file except in compliance with the License
 * The Original Code is:  vtiger CRM Open Source
 * The Initial Developer of the Original Code is vtiger.
 * Portions created by vtiger are Copyright (C) vtiger.
 * All Rights Reserved.
 ************************************************************************************/

require_once('modules/Canvas/actions/CoreByDate.php');

class Canvas_PotentialByDate_View extends Vtiger_Index_View {

	private $settings;
	
	public function getHeaderScripts(Vtiger_Request $request) {
		$headerScriptInstances = parent::getHeaderScripts($request);
		$moduleName = $request->getModule();
		$jsFileNames = array(
			'https://hammerjs.github.io/dist/hammer.min.js',
			'~/libraries/hammer/jquery.hammer.js',
			'~/libraries/accounting/accounting.min.js',
		    '~/layouts/vlayout/modules/Vtiger/resources/List.js',
		    '~/layouts/vlayout/modules/Vtiger/resources/RelatedList.js',
		    '~/layouts/vlayout/modules/Canvas/resources/PotentialByDate.js',
		    '~/libraries/kendoui/js/kendo.all.min.js',
		    '~/libraries/kendoui/js/cultures/kendo.culture.es-ES.min.js',
		    '~/libraries/moment/moment.min.js'
		);
		$jsScriptInstances = $this->checkAndConvertJsScripts($jsFileNames);
		$headerScriptInstances = array_merge($headerScriptInstances, $jsScriptInstances);
		return $headerScriptInstances;
	}
	
	public function getHeaderCss(Vtiger_Request $request) {
		$headerCssInstances = parent::getHeaderCss($request);
		$cssFileNames = array(
		    '~/layouts/vlayout/modules/Canvas/resources/Canvas.css',
		    '~/layouts/vlayout/modules/Canvas/resources/PotentialByDate.css',
		    '~/libraries/kendoui/styles/kendo.common.min.css',
			'~/libraries/kendoui/styles/kendo.metro.min.css'
		);
		$cssInstances = $this->checkAndConvertCssStyles($cssFileNames);
		$headerCssInstances = array_merge($headerCssInstances, $cssInstances);
		return $headerCssInstances;
	}
	
	public function process(Vtiger_Request $request) {
		global $home_module;
		$viewer = $this->getViewer($request);
		$moduleName = $request->getModule();
		$this->viewName = $request->get('viewname');


		$viewId = 100;
		$this->settings = $this->setOptions($viewId, $this->defaultParams());
		$settings = json_decode($this->settings);
		$viewer->assign('DEFAULT_PARAMS', $this->settings);
		$viewer->assign('COLUMNS', $settings->columns);
		$viewer->assign('TIME_FRAMES', $this->getLabelInterval($settings->interval, $moduleName)[0]);
		$viewer->assign('TIME_FRAME', $this->getLabelInterval($settings->interval, $moduleName)[1]);
		$viewer->assign('DATE_FRAMES', $this->getDateFrames());
		$viewer->assign('SALES_STAGE', $this->getSaleStages());


		$viewer->assign('VIEWID', $this->viewName);
		$viewer->assign('CLOSEDWON', $comboFieldArray['sales_stage_dom']['Closed Won']);
		$viewer->assign('CLOSEDLOST', $comboFieldArray['sales_stage_dom']['Closed Lost']);
		$viewer->assign('CUSTOM_VIEWS', CustomView_Record_Model::getAllByGroup('Potentials'));
		$viewer->view('PotentialByDate.tpl', $moduleName);
		if($home_module=='Canvas') {
			echo '<script type="text/javascript"> 
				$("a#menubar_item_Home").addClass("selected");
			</script>';
		}
	}

	private function defaultParams() {
		$defaultParams = array(
			'interval' => 'M',
			'columns' => '4',
			'startdate' => date("Y-m-d")
		);
		return json_encode($defaultParams);
	}

	private function getSaleStages() {
		$module = Vtiger_Module::getInstance('Potentials');
		$fieldModel = Vtiger_Field_Model::getInstance('sales_stage', $module);
		$sales_stages = $fieldModel->getPicklistValues();
		unset($sales_stages['Closed Won']);
		unset($sales_stages['Closed Lost']);
		$sales_stages = array_keys($sales_stages);
		foreach($sales_stages as $index=>$stage)
			$stages_percents[$stage] = (++$index*100)/count($sales_stages);
		return json_encode($stages_percents);
	}

	private function getLabelInterval($interval, $module) {
		switch($interval) {
			case 'W': return [vtranslate('LBL_WEEKS', $module), vtranslate('LBL_WEEK', $module)];
			case 'M': return [vtranslate('LBL_MONTHS', $module), vtranslate('LBL_MONTH', $module)];
			case 'Q': return [vtranslate('LBL_QUARTERS', $module), vtranslate('LBL_QUARTER', $module)];
		}
	}

	private function getDateFrames() {
		$settings = json_decode($this->settings);
		$interval = $settings->interval;
		$columns = $settings->columns;
		$sd = explode('-', $settings->startdate);
		$core = new Canvas_CoreByDate_Action();
		switch($interval) {
			case 'W': return $core->getWeekly($columns, $settings->startdate);
			case 'M': return $core->getMonthly($columns, $sd[0].'-'.$sd[1].'-01');
			case 'Q': return $core->getQuarterly($columns, $sd[0].'-'.$sd[1].'-01');
		}
	}

	private function setOptions($viewId, $options) {
		global $adb, $current_user;
		$query = 'SELECT options FROM vtiger_canvas_setting WHERE userid='.$current_user->id.' AND viewid='.$viewId;
		$params = $adb->getOne($query);
		if(empty($params)){
			$query = "INSERT INTO vtiger_canvas_setting VALUES ('',".$current_user->id.",'".$viewId."','".$options."')";
			$adb->query($query);
			return $options;
		}else{
			return $params;
		}
	}
}

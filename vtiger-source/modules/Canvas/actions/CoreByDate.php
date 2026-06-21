<?php
/*+***********************************************************************************
 * The contents of this file are subject to the vtiger CRM Public License Version 1.0
 * ("License"); You may not use this file except in compliance with the License
 * The Original Code is:  vtiger CRM Open Source
 * The Initial Developer of the Original Code is vtiger.
 * Portions created by vtiger are Copyright (C) vtiger.
 * All Rights Reserved.
 *************************************************************************************/

class Canvas_CoreByDate_Action extends Vtiger_Action_Controller {
	
	private $settings;
	
	public function __construct() {
		$this->exposeMethod('setClosingDate');
		$this->exposeMethod('getDateFrames');
		$this->exposeMethod('getLanguage');
	}
	
	public function checkPermission(Vtiger_Request $request) {
		$moduleName = $request->getModule();
		$moduleModel = Vtiger_Module_Model::getInstance($moduleName);
		$userPrivilegesModel = Users_Privileges_Model::getCurrentUserPrivilegesModel();
		$permission = $userPrivilegesModel->hasModulePermission($moduleModel->getId());
		if(!$permission) throw new AppException('LBL_PERMISSION_DENIED');
	}
	
	public function process(Vtiger_Request $request) {
		$mode = $request->getMode();
		if(!empty($mode) && $this->isMethodExposed($mode)) {
			$result = $this->invokeExposedMethod($mode, $request);
			echo $result;
		}
	}

	public function getLanguage($request) {
		return Vtiger_Language_Handler::getLanguage();
	}

	public function setClosingDate($request) {
	    $record = $request->get('potentialid');
	    $closingdate = $request->get('closingdate');
	    $recordModel = Vtiger_Record_Model::getInstanceById($record, 'Potentials');
	    $recordModel->set('id', $record);
	    $recordModel->set('mode', 'edit');
	    $recordModel->set('closingdate', $closingdate);
	    $recordModel->save();
	    $response = new Vtiger_Response();
	    $response->setResult(array('closingdate'=>$closingdate));
	    $response->emit();
	}
	
	public function getDateFrames(Vtiger_Request $request) {
		$viewId = 100;
		$this->settings->interval = $request->get('interval');
		$this->settings->columns = (int) $request->get('columns');
		$this->settings->startdate = $request->get('startdate');
		$sd = explode('-', $this->settings->startdate);
		$this->setOptions($viewId, $this->settings);
		$frames = array();
		switch($this->settings->interval) {
			case 'W': $frames = $this->getWeekly($this->settings->columns, $this->settings->startdate); break;
			case 'M': $frames = $this->getMonthly($this->settings->columns, $sd[0].'-'.$sd[1].'-01'); break;
			case 'Q': $frames = $this->getQuarterly($this->settings->columns, $sd[0].'-'.$sd[1].'-01');
		}
		return $this->getHtml($frames);
	}

	public function getWeekly($columns, $sd) {
		$date_frames = array();
		$last_week;
		for($i=0; $i<$columns; $i++) {
			$date = $this->getDate(strtotime('+'.$i.' week', strtotime($sd)));
			$last_week = strtotime('-1 week', strtotime($date));
			$last_week = date('Y-m-j', $last_week);
			$day = date('N', strtotime($last_week));
			$start = strtotime('-'.($day-1).' days', strtotime($last_week));
			$end = strtotime('+'.(7-$day).' days', strtotime($last_week));
			$week_start = date('j', $start);
			$month_start = vtranslate(date('M', $start), 'ControlPanel');
			$week_end = date('j', $end);
			$month_end = vtranslate(date('M', $end), 'ControlPanel');
			$range = $week_start.' '.$month_start.' — '.$week_end.' '.$month_end;
			$weeknum = round(date("W", strtotime($last_week)));
			$year = date("Y", strtotime($last_week));
			$weeklabel = $weeknum.'° '.$year.' <small>'.$range.'</small>';
			$date_frames[$weeklabel] = $this->getDate($start).','.$this->getDate($end);
		}
		return $date_frames;
	}

	public function getMonthly($columns, $sd) {
		$date_frames = array();
		$last_month;
		for($i=0; $i<$columns; $i++) {			
			$cmonth = $this->getDate(strtotime('+'.$i.' month', strtotime($sd)));
			$cmonth = strtotime('-1 month', strtotime($cmonth));
			$startdate = $this->getDate(($cmonth));
			$enddate = $this->getDate(($cmonth), true);
			$month = vtranslate(date("F", strtotime($startdate)), 'ControlPanel');
			$year = date("Y", strtotime($startdate));
			$date_frames[$month.' '.$year] = $startdate.','.$enddate;
		}
		return $date_frames;
	}

	public function getQuarterly($columns, $sd) {
		$date_frames = array();
		for($i=0, $j=0; $i<$columns; $i++, $j=$j+3) {
			$date = $this->getDate(strtotime('+'.$j.' month', strtotime($sd)));
			$date = $this->getDate(strtotime('-3 month', strtotime($date)));
			$_date = explode('-', $date);
			$year = $_date[0];
			$month = (int) $_date[1];
			if($month>=1 && $month<=3){
				$quarter = vtranslate('LBL_QUARTER_1', 'Canvas').' '.$year;
				$date = $year.'-01-01,'.$this->getDate(strtotime($year.'-03-01'), true);
			}else if($month>=4 && $month<=6){
				$quarter = vtranslate('LBL_QUARTER_2', 'Canvas').' '.$year;
				$date = $year.'-04-01,'.$this->getDate(strtotime($year.'-06-01'), true);
			}else if($month>=7 && $month<=9){
				$quarter = vtranslate('LBL_QUARTER_3', 'Canvas').' '.$year;
				$date = $year.'-07-01,'.$this->getDate(strtotime($year.'-09-01'), true);
			}else {
				$quarter = vtranslate('LBL_QUARTER_4', 'Canvas').' '.$year;
				$date = $year.'-10-01,'.$this->getDate(strtotime($year.'-12-01'), true);
			}
			$date_frames[$quarter] = $date;
		}
		return $date_frames;
	}

	private function getDate($strtotime, $lastday=false) {
		$d = ($lastday) ? 't' : 'd';
		return date("Y-m-$d", $strtotime);
	}

	private function getHtml($frames) {
		$html = '<ul>';
		$i = 1;
		foreach($frames as $label=>$date) {
			$html .= '<li id="col-'.$i.'" class="dates_stage" data-stage-date="'.$date.'">
					    <span class="title">'.$label.'</span>
					    <div class="summary">
					    	<span class="potothers"></span><br>
					    	<span class="potwon"></span><br>
					    	<span class="pottotal"></span>
					    </div>
					</li>';
			$i++;
		}
		$html .= '</ul>';
		return json_encode($html);
	}

	/**
	 * Funcion para obtener los parametros del Canvas por Fechas para el usuario
	 */
	private function setOptions($viewId, $options) {
		global $adb, $current_user;
		$query = 'SELECT options FROM vtiger_canvas_setting WHERE userid='.$current_user->id.' AND viewid='.$viewId;
		$params = $adb->getOne($query);
		if(empty($params)) {
			$query = "INSERT INTO vtiger_canvas_setting VALUES ('',".$current_user->id.",'".$viewId."','".json_encode($options)."')";
		} else {
			$query = "UPDATE vtiger_canvas_setting SET options='".json_encode($options)."' WHERE userid=".$current_user->id." AND viewid=".$viewId;
		}
		$adb->query($query);
	}
}

?>
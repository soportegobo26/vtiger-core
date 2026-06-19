<?php
/*+***********************************************************************************
 * The contents of this file are subject to the vtiger CRM Public License Version 1.0
 * ("License"); You may not use this file except in compliance with the License
 * The Original Code is:  vtiger CRM Open Source
 * The Initial Developer of the Original Code is vtiger.
 * Portions created by vtiger are Copyright (C) vtiger.
 * All Rights Reserved.
 *************************************************************************************/

require_once('modules/Home/CustomFilterUrl.php');
require_once('modules/Home/ReportDashboard.php');

class Canvas_Core_Action extends Vtiger_Action_Controller {
	
	private $subordinate;
	private $currentUser;
	
	public function __construct() {
		$this->exposeMethod('filter');
		$this->exposeMethod('setStage');
		$this->exposeMethod('getColor');
		$this->exposeMethod('reasonLoss');
		$this->exposeMethod('reasonWon');
		$this->exposeMethod('getActivities');
		$this->exposeMethod('closeActivity');
		$ReportDashboard = new Vtiger_Report_Dashboard();
		$currentUser = Users_Record_Model::getCurrentUserModel();
		$this->subordinate = $ReportDashboard->getUsersRoles($currentUser->id);
		$this->subordinate[] = $currentUser->id;
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
	
	public function filter($request) {
	    global $adb;
		$data = array( red => array(), yellow => array(), blue => array(), green => array() );
	    $cvId = $request->get('viewname');
	    $currentUser = Users_Record_Model::getCurrentUserModel();
	    $filter = new CustomFilterUrl('Potentials', $currentUser, $cvId);
	    if($request->get('flagWL')) $filter->addCondition('sales_stage', array('Closed Won', 'Closed Lost'), 'n', 'AND');
	    $query = $filter->getQuery();
	    $query.= ' ORDER BY vtiger_crmentity.modifiedtime DESC';
	    $result = $adb->query($query);
	    while($row = $result->FetchRow()) {
            $account = $this->getAccount($row['potentialid']);
            $row['color'] = $this->_getColor($row['potentialid']);
			$row['accountid'] = $account['accountid'];
			$row['amount'] *= $this->getConvertionRate($currentUser->id);
			$row['accountname'] = $account['accountname'];
			$row['smowner_user_name'] = getUserFullName($row['smownerid']);
			$data[$row['color']][] = $row;
		}
		return json_encode(array_merge($data['red'], $data['yellow'], $data['blue'], $data['green']));
	}
	
	public function setStage($request) {
	    global $adb;
	    $record = $request->get('potentialid');
	    $recordModel = Vtiger_Record_Model::getInstanceById($record, 'Potentials');
	    $recordModel->set('id', $record);
	    $recordModel->set('mode', 'edit');
	    $recordModel->set('sales_stage', $request->get('sales_stage'));
	    $recordModel->save();
	    $response = new Vtiger_Response();
	    $response->setResult(array('sales_stage'=>$request->get('sales_stage')));
	    $response->emit();
	}
	
	public function getActivities($request) {
	    $parentid = $request->get('parent_id');
	    $data =  $this->_getActivities($parentid);
	    return json_encode($data);
	}
	
	public function closeActivity($request) {
	    global $adb;
	    $query = 'UPDATE vtiger_activity SET eventstatus="Held" WHERE activityid='.$request->get('activity_id');
	    $adb->query($query);
	    $response = new Vtiger_Response();
	    $response->setResult(array('Save' => 'OK'));
	    $response->emit();
	}
	
	public function reasonLoss($request) {
            $record = $request->get('sourceRecord');
	    $recordModel = Vtiger_Record_Model::getInstanceById($record, 'Potentials');
	    $recordModel->set('id', $record);
	    $recordModel->set('mode', 'edit');
            $recordModel->set('closingdate', date('Y-m-d'));
	    $recordModel->set('sales_stage', 'Closed Lost');
	    $recordModel->set('reason_loss', $request->get('reason_loss'));
	    $recordModel->save();
            // @note - Guarda el comentario
            $data = array(
                'commentcontent' => $request->get('commentcontent'),
                'related_to' => $record,
                'module' => 'ModComments',
                'action' => 'SaveAjax',
            );
            $saveAction = new ModComments_Save_Action();
            $saveAction->process(new Vtiger_Request($data, $data));
	}

	public function reasonWon($request) {

        $record = $request->get('sourceRecord');
        $amount = $request->get('amount');
	    $recordModel = Vtiger_Record_Model::getInstanceById($record, 'Potentials');
	    $recordModel->set('id', $record);
	    $recordModel->set('mode', 'edit');
        $recordModel->set('closingdate', date('Y-m-d'));
	    $recordModel->set('sales_stage', 'Closed Won');
	    $recordModel->set('amount', $amount);
	    $recordModel->save();
	    return $amount;
            
	}
	
	public function getColor($request) {
	    $parentid = $request->get('parent_id');
	    $data = array(
			'color' => $this->_getColor($parentid)
	    );
	    return json_encode($data);
	}
	
	public function _getColor($potentialid) {
		
		$data = $this->_getActivities($potentialid, 'LIMIT 1');
		return empty($data) ? 'red' : $data[0]['color'];
	}
	
	public function _getActivities($parentid, $limit='') {
	    global $adb;
	    $data = array();
	    $currentUser = Users_Record_Model::getCurrentUserModel();
	    $query = 'SELECT vtiger_activity.*, vtiger_crmentity.description FROM vtiger_activity
		INNER JOIN vtiger_crmentity ON vtiger_crmentity.crmid=vtiger_activity.activityid
		INNER JOIN vtiger_seactivityrel ON vtiger_seactivityrel.activityid=vtiger_activity.activityid
		WHERE vtiger_crmentity.deleted!=1 AND (vtiger_activity.eventstatus!="Held" OR vtiger_activity.status!="Completed") 
		AND vtiger_seactivityrel.crmid='.$parentid.' AND smownerid IN('.implode(',', $this->subordinate).')
		ORDER BY vtiger_activity.date_start ASC '.$limit;
	    $result = $adb->query($query);
		$dateToday = new DateTime(date('Y-m-d H:i:s'), new DateTimeZone('UTC'));
		$dateToday->setTimezone(new DateTimeZone($currentUser->get('time_zone')));
	    while($row = $adb->fetch_array($result)) {
			$dateStart = new DateTime($row['date_start'].' '.$row['time_start'], new DateTimeZone('UTC'));
			$dateStart->setTimezone(new DateTimeZone($currentUser->get('time_zone')));
			$date_start = strtotime($dateStart->format('Y-m-d'));
			$date_today = strtotime($dateToday->format('Y-m-d'));
			if($date_today===$date_start) {
				$color = 'blue';
			} else if($date_start<$date_today) {
				$color = 'yellow';
			} else {
				$color = 'green';
			}
			$row['color'] = $color;
			$data[] = $row;
	    }
	    return $data;
	}
	
	private function getAccount($potentialid) {
	    global $adb;
	    $query = 'SELECT vtiger_account.* FROM vtiger_potential 
		INNER JOIN vtiger_account ON vtiger_account.accountid=vtiger_potential.related_to AND potentialid=?
		INNER JOIN vtiger_crmentity ON vtiger_crmentity.crmid=vtiger_account.accountid
		WHERE vtiger_crmentity.deleted!=1';
	    $result = $adb->pquery($query, array($potentialid));
	    return $adb->fetch_array($result);
	}

	/**
	 * Funcion para obtener la tasa de conversion de la moneda del usuario actual
	 * @param <String> $userid
	 * @return <Float>
	 */
	private function getConvertionRate($userid) {
		global $adb;
		$query="SELECT ci.conversion_rate FROM vtiger_currency_info AS ci
				INNER JOIN vtiger_users AS u ON u.currency_id=ci.id
				WHERE u.id=?";
		$rst = $adb->pquery($query, array($userid));
		return (float) $adb->query_result($rst, 0, 'conversion_rate');
	}

}

?>

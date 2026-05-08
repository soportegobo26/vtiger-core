{*<!--
/*********************************************************************************
** The contents of this file are subject to the vtiger CRM Public License Version 1.0
* ("License"); You may not use this file except in compliance with the License
* The Original Code is:  vtiger CRM Open Source
* The Initial Developer of the Original Code is vtiger.
* Portions created by vtiger are Copyright (C) vtiger.
* All Rights Reserved.
*
********************************************************************************/
-->*}
{strip}
{foreach key=index item=jsModel from=$SCRIPTS}
    <script type="{$jsModel->getType()}" src="{$jsModel->getSrc()}"></script>
{/foreach}

<form class="form-horizontal recordEditView" name="QuickCreate" method="post" action="index.php">
    <div class="modelContainer" style="margin-top: -40px">
    <div class="modal-header contentsBackground">
        <button class="close close_{$MODULE}" aria-hidden="true" data-dismiss="modal" type="button" title="{vtranslate('LBL_CLOSE')}">&times;</button>
        <h3> {vtranslate('LBL_REASON_LOSS', $MODULE)} </h3>
    </div>
    <input type="hidden" name="module" value="Canvas">
    <input type="hidden" name="action" value="Core">
    <input type="hidden" name="mode" value="reasonLoss">
    <input type="hidden" name="closingdate" value="{$CURRENTDATE}">
    <input type="hidden" name="record" value="{$POTENTIALID}">
    
    <div class="quickCreateContent">
        <div class="modal-body tabbable" style="padding:0px">
			<div class="tab-content overflowVisible">
				<table class="table table-bordered blockContainer showInlineTable">
					{assign var=COUNTER value=0}
					{foreach key=FIELD_NAME item=FIELD_MODEL from=$FIELDS name=blockfields}
						<tr>
							<td class="fieldLabel {$WIDTHTYPE}" style="width: 170px">
								<label class="muted pull-right marginRight10px">{if $FIELD_MODEL->isMandatory() eq true} <span class="redColor">*</span> {/if}{vtranslate($FIELD_MODEL->get('label'), $FIELD_MODEL->get('refmodule'))}</label>
							</td>
							<td class="fieldValue {$WIDTHTYPE}" {if $FIELD_MODEL->get('uitype') eq '19' or $FIELD_MODEL->get('uitype') eq '20'} colspan="3" {assign var=COUNTER value=$COUNTER+1} {/if}>
								<div class="row-fluid">
									<span class="span10">
										{include file=vtemplate_path($FIELD_MODEL->getUITypeModel()->getTemplateName(),$MODULE) BLOCK_FIELDS=$BLOCK_FIELDS}
									</span>
								</div>
							</td>
						</tr>
					{/foreach}
					<tr>
						<td class="fieldLabel {$WIDTHTYPE}">
							<label class="muted pull-right marginRight10px">{vtranslate('comment', $MODULE)}</label>
						</td>
						<td style="padding:5px" class="fieldValue {$WIDTHTYPE}">
							<textarea style="overflow: hidden; word-wrap: break-word; resize: none; height: 69px;" name="commentcontent" class="commentcontent" placeholder="Agrega tu comentario aquí..." rows="2"></textarea>
						</td>
					</tr>
				</table>
			</div>
		</div>
    </div>
    <div class="modal-footer quickCreateActions">
        <a onclick="cancelReasonLoss()" class="cancelLink cancelLinkContainer pull-right cancel_QuickReasonLoss" type="reset" data-dismiss="modal">{vtranslate('LBL_CANCEL', $MODULE)}</a>
        <button class="btn btn-success save_QuickCreateCalendar" type="submit"><strong>{vtranslate('LBL_SAVE', $MODULE)}</strong></button>
    </div>
    <script>
    	jQuery(document).ready(function($) {
    		$('.imageHolder').remove();
    	});
		function cancelReasonLoss() {
			var sales_stage = jQuery('input[name="sales_stage_prev"]').val();
			var sourceRecord = jQuery('input[name="sourceRecord"]').val();
			jQuery('select[name="sales_stage"]').closest('div').find('.summaryViewEdit').click();
			jQuery('select[name="sales_stage"]').val(sales_stage).trigger("liszt:updated");
			AppConnector.request({
				action: 'Core',
				module: 'Canvas',
				mode: 'setStage',
				sales_stage: sales_stage,
				potentialid: sourceRecord,
			});
			$('.imageHolder').remove();
                }
    </script>
</form>
{/strip}

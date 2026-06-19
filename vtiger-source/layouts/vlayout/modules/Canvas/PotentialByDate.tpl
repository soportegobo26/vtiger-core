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
<div class="listViewPageDiv">
    <div class="listViewTopMenuDiv noprint">
		<div class="listViewActionsDiv row-fluid">
		    <span class="btn-toolbar span4"></span>
		    <span class="btn-toolbar span4">
				<span class="customFilterMainSpan btn-group">
				    {if $CUSTOM_VIEWS|@count gt 0}
				    <select id="customFilter" style="width:350px;">
					{foreach key=GROUP_LABEL item=GROUP_CUSTOM_VIEWS from=$CUSTOM_VIEWS}
					    <optgroup label=' {if $GROUP_LABEL eq 'Mine'} &nbsp; {else if} {vtranslate($GROUP_LABEL)} {/if}' >
						{foreach item="CUSTOM_VIEW" from=$GROUP_CUSTOM_VIEWS}
						    <option  data-editurl="{$CUSTOM_VIEW->getEditUrl()}" data-deleteurl="{$CUSTOM_VIEW->getDeleteUrl()}" data-approveurl="{$CUSTOM_VIEW->getApproveUrl()}" data-denyurl="{$CUSTOM_VIEW->getDenyUrl()}" data-editable="{$CUSTOM_VIEW->isEditable()}" data-deletable="{$CUSTOM_VIEW->isDeletable()}" data-pending="{$CUSTOM_VIEW->isPending()}" data-public="{$CUSTOM_VIEW->isPublic() && $CURRENT_USER_MODEL->isAdminUser()}" id="filterOptionId_{$CUSTOM_VIEW->get('cvid')}" value="{$CUSTOM_VIEW->get('cvid')}" data-id="{$CUSTOM_VIEW->get('cvid')}" {if $VIEWID neq '' && $VIEWID neq '0'  && $VIEWID == $CUSTOM_VIEW->getId()} selected="selected" {elseif ($VIEWID == '' or $VIEWID == '0')&& $CUSTOM_VIEW->isDefault() eq 'true'} selected="selected" {/if} class="filterOptionId_{$CUSTOM_VIEW->get('cvid')}">{if $CUSTOM_VIEW->get('viewname') eq 'All'}{vtranslate($CUSTOM_VIEW->get('viewname'), $MODULE)} {vtranslate($MODULE, $MODULE)}{else}{vtranslate($CUSTOM_VIEW->get('viewname'), $MODULE)}{/if}{if $GROUP_LABEL neq 'Mine'} [ {$CUSTOM_VIEW->getOwnerName()} ]  {/if}</option>
						{/foreach}
					    </optgroup>
					{/foreach}
					{if $FOLDERS neq ''}
					    <optgroup id="foldersBlock" label='{vtranslate('LBL_FOLDERS', $MODULE)}' >
						{foreach item=FOLDER from=$FOLDERS}
						    <option data-foldername="{$FOLDER->getName()}" {if decode_html($FOLDER->getName()) eq $FOLDER_NAME} selected=""{/if} data-folderid="{$FOLDER->get('folderid')}" data-deletable="{!($FOLDER->hasDocuments())}" class="filterOptionId_folder{$FOLDER->get('folderid')} folderOption{if $FOLDER->getName() eq 'Default'} defaultFolder {/if}" id="filterOptionId_folder{$FOLDER->get('folderid')}" data-id="{$DEFAULT_CUSTOM_FILTER_ID}">{$FOLDER->getName()}</option>
						{/foreach}
					    </optgroup>
					{/if}
				    </select>
				    <span class="filterActionsDiv hide">
					<hr>
					<ul class="filterActions">
					    <li data-value="create" id="createFilter" data-createurl="{$CUSTOM_VIEW->getCreateUrl()}"><i class="icon-plus-sign"></i> {vtranslate('LBL_CREATE_NEW_FILTER')}</li>
					</ul>
				    </span>
				    <img class="filterImage" src="{'filter.png'|vimage_path}" style="display:none;height:13px;margin-right:2px;vertical-align: middle;">
				    {else}
					<input type="hidden" value="0" id="customFilter" />
				    {/if}
				</span>
		    </span>
		    <span class="span4 btn-toolbar">
				{include file='ListViewSwitch.tpl'|@vtemplate_path:$MODULE LIST=true CANVAS=true SCHEDULE=false TIMELINE_SWITCH=true}
		    </span>
		</div>
    </div>
</div>

<div class="datePicker"></div>
<div class="canvas">
    <input id="defaultParams" type="hidden" value='{$DEFAULT_PARAMS}'>
    <input id="salesStage" type="hidden" value='{$SALES_STAGE}'>
    <input id="columns" type="hidden" value=""/>
    <input id="interval" type="hidden" value=""/>
    <input id="startdate" type="hidden" value=""/>
    <input id="currency_grouping_separator" type="hidden" value="{$CURRENT_USER_MODEL->get('currency_grouping_separator')}"/>
    <input id="currency_decimal_separator" type="hidden" value="{$CURRENT_USER_MODEL->get('currency_decimal_separator')}"/>
    <input id="no_of_currency_decimals" type="hidden" value="{$CURRENT_USER_MODEL->get('no_of_currency_decimals')}"/>
    <div class="potentialbydate">
		<table>
		    <tr>
				<td class="potentialbydate_top">
				    <ul>
				    {counter start=0 skip=1 print=false}
			    	{foreach key=label item=date from=$DATE_FRAMES}
						<li id="col-{counter}" class="dates_stage" data-stage-date="{$date}">
						    <span class="title">{$label}</span>
						    <div class="summary">
						    	<span class="potothers"></span><br>
						    	<span class="potwon"></span><br>
						    	<span class="pottotal"></span>
						    </div>
						</li>
					{/foreach}
				    </ul>
				</td>
		    </tr>
		    <tr>
				<td class="potentialbydate_middle">
				    <div class="test">
					<div class="gridster">
					    <ul>
						<!-- item-template -->
					    </ul>
					</div>
				    </div>
				</td>
		    </tr>
		</table>
    </div>
    <img id="congratulations" src="layouts/vlayout/modules/Canvas/resources/images/congratulations.png" width="250" height="250">
    <div id="dealActions" class="potentialbydate_footer">
		<ul class="closeDeal">
		    <li class="clear">
			&nbsp;
		    </li>
		    <li class="lose customDrop">
				<div class="stage" data-stage="Closed Lost">
				    {vtranslate('Closed Lost', 'Potentials')}
				</div>
		    </li>
		    <li class="win customDrop">
				<div class="stage" data-stage="Closed Won">
				    {vtranslate('Closed Won', 'Potentials')}
				</div>
		    </li>
		    <li class="clear">
			&nbsp;
		    </li>
		</ul>
    </div>
</div>

<div class="ActivityPopup"/>
    <!-- Content Vtiger_RelatedList_Js (No borrar)-->
<div>

<script type="text/x-underscore" id='item-template'>
    <li data-stage-date="<%=date_stage%>" data-closingdate="<%=closingdate%>" data-stage="<%=sales_stage%>" data-related_account="<%=accountid%>" data-contact_id="<%=contact_id%>" data-record="<%=potentialid%>" title="<%=sales_stage%>">
		<div class="block">
			<span class="stage_progress" style="width: <%=stage_progress%>%; background-color: <%=progress_color%>"></span>
		    <div class="core">
		    	<div>
		    	    <a class="front_potentialname" draggable="false" href="index.php?module=Potentials&view=Detail&record=<%=potentialid%>">
		    		<%=potentialname%>
		    	    </a>
		    	</div>
		    	<!-- <div>
		    	    <a class="front" draggable="false" href="index.php?module=Potentials&view=Detail&record=<%=potentialid%>">
		    		<%=smowner_user_name%>
		    	    </a>
		    	</div> -->
		    	<div>
		    	    <!-- <a class="front" draggable="false" href="index.php?module=Accounts&view=Detail&record=<%=accountid%>"> -->
		    	    <span class="front" draggable="false">
		    		<%=accountname%>
		    	    </span>
		    	</div>
		    </div>
		    <div class="labels">
		        <!-- <div id="value_<%=potentialid%>" class="value-<%=color%>"> <%=format%> </div> -->
	        	<table id="right-info-pot">
	        		<tr><td colspan="2"><div id="value_<%=potentialid%>"> <%=format%> </div></td></tr>
	        		<tr>
	        			<td width="90%"><span class="closed-state hide">{vtranslate('LBL_WON', $MODULE)}</span></td>
	        			<td width="10%"><span id="icon_<%=potentialid%>" data-potentialid="<%=potentialid%>" class="row-icon row-icon-<%=color%>"></span></td>
	        		</tr>
	        	</table>
		    </div>
		</div>
    </li>
</script>

<script type="text/x-underscore" id='activities-template'>
    <div class="activities">
	<div class="contentDropMenu">
	    <div class="headerDropMenu">
		<span class="row-sicon row-icon-sblue"> </span>
		<span> {vtranslate('SHEDULE_ACTIVITY_TODAY', $MODULE)} </span>
	    </div>
	    <div id="activity_today" class="activity_content"> <%=blue%> </div>
	    <div class="headerDropMenu">
		<span class="row-sicon row-icon-sgreen"> </span>
		<span> {vtranslate('SHEDULE_ACTIVITY_FUTURE', $MODULE)} </span>
	    </div>
	    <div id="activity_future"  class="activity_content"> <%=green%> </div>
	    <div class="headerDropMenu">
	        <span class="row-sicon row-icon-syellow"> </span>
	        <span> {vtranslate('SHEDULE_ACTIVITY_LATER', $MODULE)} </span>
	    </div>
	    <div id="activity_later" class="activity_content"> <%=yellow%> </div>
	</div>
	<div class="footerDropMenu">
	    <div class="rowDropMenu row_icon_plus" data-url="">
		<span class="row-sicon row-icon-plus"> </span>
		<span class="row_icon_plus"> {vtranslate('SHEDULE_ACTIVITY', $MODULE)} </span>
	    </div>
	</div>
    </div>
</script>

<script type="text/x-underscore" id='activity-template'>
    <div class="row_activity" data-record="<%=activityid%>">
	<span class="markAsDone">
	    <input class="close_activity check_held" type="checkbox"/>
	</span>
	<div class="des_activity">
	    <div id="canvas_activitytype"> <%=activitytype%> </div>
	    <div id="canvas_subject"> <%=subject%> </div>
	</div>
    </div>
</script>





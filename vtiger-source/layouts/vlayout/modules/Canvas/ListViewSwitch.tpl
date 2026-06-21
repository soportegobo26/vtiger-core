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
	{if $LIST}
	<button id="listView" class="btn" type="button" title="{vtranslate('LBL_LIST', $MODULE)}">
	    <span class="fa fa-list"></span>
	</button>
	{/if}
	{if $CANVAS}
	<button id="canvasView" class="btn" type="button" title="{vtranslate('LBL_CANVAS', $MODULE)}">
		<span class="fa fa-th"></span>
	</button>
	{/if}
	{if $SCHEDULE}
	<button id="scheduleView" class="btn" type="button" title="{vtranslate('LBL_SCHEDULE', $MODULE)}">
	    <span class="fa fa-calendar"></span>
	</button>
	{/if}
	{if $TIMELINE_SWITCH}
	<div class="scheduleViewActions pull-right">
        <div class="alignTop margin0px">
			<span class="pull-right">
				<button id="scheduleViewPreviousPage" class="btn" type="button" title="{vtranslate('LBL_JUMP_BACK', $MODULE)} {$COLUMNS} {$TIME_FRAMES}">
					<span class="fa fa-angle-double-left fa-lg"></span>
				</button>
				<button id="scheduleViewPrevious" class="btn" type="button" title="{vtranslate('LBL_PREVIOUS', $MODULE)} {$TIME_FRAME}">
					<span class="fa fa-angle-left fa-lg"></span>
				</button>
				<button id="scheduleViewToday" class="btn" type="button" title="{vtranslate('LBL_JUMP', $MODULE)} {vtranslate('LBL_TODAY', $MODULE)}">
					<span>{vtranslate('LBL_TODAY', $MODULE)}</span>
				</button>
				<button id="scheduleViewNext" class="btn" type="button" title="{vtranslate('LBL_NEXT', $MODULE)} {$TIME_FRAME}">
					<span class="fa fa-angle-right fa-lg"></span>
				</button>
				<button id="scheduleViewNextPage" class="btn" type="button" title="{vtranslate('LBL_JUMP_FROWARD', $MODULE)} {$COLUMNS} {$TIME_FRAMES}">
					<span class="fa fa-angle-double-right fa-lg"></span>
				</button>
				&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
				<span class="pull-right btn-group">
					<button class="btn dropdown-toggle" href="#" data-toggle="dropdown" title="{vtranslate('LBL_SCHEDULE_SETTINGS', $MODULE)}">
						<i class="fa fa-cog fa-lg"></i>&nbsp;<i class="caret"></i>
					</button>
					<ul class="scheduleSetting dropdown-menu">
						<li class="title">{vtranslate('LBL_CHANGE_INTERVAL', $MODULE)}</li>
						<li><a href="#" id="interval-W" class="interval"><i class="check"></i>  {vtranslate('LBL_WEEKLY', $MODULE)}</a></li>
						<li><a href="#" id="interval-M" class="interval"><i class="check"></i>  {vtranslate('LBL_MONTHLY', $MODULE)}</a></li>
						<li><a href="#" id="interval-Q" class="interval"><i class="check"></i>  {vtranslate('LBL_QUARTERLY', $MODULE)}</a></li>
						<li class="title">{vtranslate('LBL_COLUMNS_NUMBER', $MODULE)}</li>
						<li><a href="#" id="columns-3" class="columns"><i class="check"></i>  {vtranslate('LBL_COLUMNS_3', $MODULE)}</a></li>
						<li><a href="#" id="columns-4" class="columns"><i class="check"></i>  {vtranslate('LBL_COLUMNS_4', $MODULE)}</a></li>
						<li><a href="#" id="columns-5" class="columns"><i class="check"></i>  {vtranslate('LBL_COLUMNS_5', $MODULE)}</a></li>
					</ul>
				</span>
			</span>
		</div>
	</div>
	{/if}
{/strip}


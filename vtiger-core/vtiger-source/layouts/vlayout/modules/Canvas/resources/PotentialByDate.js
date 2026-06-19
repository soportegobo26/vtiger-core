/*+***********************************************************************************
 * The contents of this file are subject to the vtiger CRM Public License Version 1.0
 * ("License"); You may not use this file except in compliance with the License
 * The Original Code is:  vtiger CRM Open Source
 * The Initial Developer of the Original Code is vtiger.
 * Portions created by vtiger are Copyright (C) vtiger.
 * All Rights Reserved.
 *************************************************************************************/

jQuery.Class('Canvas_ActivityMenu_Js',{
    record: null,
    params_activity: {
        module: 'Calendar',
        view: 'Edit',
        mode: 'Events',
        sourceModule: 'Potentials',
        sourceRecord: 0,
        relationOperation: true,
        parent_id: 0,
        activityid: 0,
        contact_id: 0,
        related_account: 0
    },
    registerEventForActivityMenu: function() {
        var self = this;
        var template = $("#activities-template").html();
        self.t_activities = _.template(template);
        template = $("#activity-template").html();
        self.t_activity = _.template(template);
        $(document).bind('event.add', function(){ _.delay($.proxy(self, 'getColor'), 700); });
        $('.row-icon').bind('mousedown', $.proxy(self, 'getActivities'));
    },
    getColor: function(event) {
        var self = this;
        var params = {
            action: 'Core',
            module: 'Canvas',
            mode: 'getColor',
            parent_id: self.params_activity.parent_id,
        };
        AppConnector.request(params).then(
            function(data) {
                var icon = $('#icon_'+self.record);
                // var potvalue = $('#value_'+self.record);
                icon.removeClass();
                // potvalue.removeClass();
                icon.addClass('row-icon row-icon-'+data.color);
                // potvalue.addClass('value-'+data.color);
            },
            function(textStatus, errorThrown){
			}
        );
    },
    getActivities: function(event) {
        var self = this;
        var element = $(event.currentTarget);
        event.stopPropagation();
        var parent = element.closest('li');
        self.record = parent.data('record');
        var params = {
            parent_id: self.record,
            action: 'Core',
            module: 'Canvas',
            mode: 'getActivities',
        };
        element.webuiPopover({
            arrow: false,
            type: 'async',
            cache: false,
            animation: 'pop',
            url: 'index.php?'+$.param(params),
            content: function(data) {
                data = JSON.parse(data);
                var categories = {
                    blue: '',
                    yellow: '',
                    green: '',
                    record: self.record,
                };
                _.each(data, function(row) {
                    row.activitytype = app.vtranslate(row.activitytype);
                    categories[row.color] += self.t_activity(row);
                });
                $('.potentialbydate').trigger('getActivitiesClick');
                self.params_activity.parent_id = parent.data('record');
                self.params_activity.sourceRecord = parent.data('record');
                self.params_activity.contact_id = parent.data('contact_id');
                self.params_activity.related_account = parent.data('related_account');
                _.delay(function() {
                    $('.webui-popover .rowDropMenu').bind('click', $.proxy(self, 'add_activity'));
                    $('.webui-popover .close_activity').bind('click', $.proxy(self, 'closeActivity'));
                    $('.webui-popover .row_activity').bind('click', $.proxy(self, 'openActivity'));
                }, 300);
                return self.t_activities(categories);
            }
        });
    },
    add_activity: function(event) {
        var self = this;
        $('.dropMenu').hide();
        self.params_activity.activityid = 0;
        if(event.seguimiento) {
            if(event.related_account) self.params_activity.related_account = event.related_account;
            if(event.contact_id) self.params_activity.contact_id = event.contact_id;
            if(event.sourceModule) self.params_activity.sourceModule = event.sourceModule;
            if(event.parent_id) self.params_activity.parent_id = event.parent_id;
            event.seguimiento = false;
        }
        var data = {
            url: 'index.php?'+$.param(self.params_activity),
            name: self.params_activity.sourceModule
        }
        var relatedController = new Vtiger_RelatedList_Js(self.params_activity.parent_id, self.params_activity.sourceModule, $('.ActivityPopup'), 'Calendar');
        relatedController.addRelatedRecord(data);
    },
    closeActivity: function(event) {
        var self = this;
        $('.potentialbydate').trigger('closeActivitiesClick');
        event.stopPropagation();
        var activity = $(event.currentTarget).closest('div');
        var urlParams = {
            action: 'Core',
            module: 'Canvas',
            mode: 'closeActivity',
            activity_id: activity.data('record')
        };
        AppConnector.request(urlParams).then(
            function(data) {
                activity.remove();
                // var message = app.vtranslate('LBL_HOLD_FOLLOWUP_ON');
                // Vtiger_Helper_Js.showConfirmationBox({'message' : message}).done(function(data) {
                    self.add_activity(event);
                // });
                $('.webui-popover').hide();
                _.delay($.proxy(self, 'getColor'), 700);
            }
        );
    },
    openActivity: function(event) {
        var self = this;
        $('.dropMenu').hide();
        var element = $(event.currentTarget);
        self.params_activity.activityid = element.data('record');
        element.data('url', 'index.php?'+$.param(self.params_activity));
        var relatedController = new Vtiger_RelatedList_Js(self.params_activity.parent_id, self.params_activity.sourceModule, $('.ActivityPopup'), 'Calendar');
        relatedController.addRelatedRecord(element);
    }
});

Vtiger_List_Js('Canvas_PotentialByDate_Js', {}, {
    today: new Date(), // Today date
    W: 'W',
    M: 'M',
    Q: 'Q',
    week: 7, // 7 days
    month: 1, // 1 month
    quarter: 3, // 3 months
    won: 'Closed Won',
    lost: 'Closed Lost',
    scrollBar: $('.test'),
    columns: $('#columns'),
    interval: $('#interval'),
    startdate: $('#startdate'),
    schedulePreviousPage: $('#scheduleViewPreviousPage'),
    schedulePrevious: $('#scheduleViewPrevious'),
    scheduleToday: $('#scheduleViewToday'),
    scheduleNext: $('#scheduleViewNext'),
    scheduleNextPage: $('#scheduleViewNextPage'),
    offsetScroll: 167,
    language: '',
    themecolor: null,
    data: null,
    stage: null,
    gridster: null,
    progress: null,
    dates_stage: {},
    flagME: false, //Flag MouseEnter
    flagClose: true,
    datepicker: null,
    currency_grouping_separator: ',',
    currency_decimal_separator: '.',
    no_of_currency_decimals: 0,
    urlparams: {
        module: 'Potentials',
        parent: '',
        page: 1,
        view: 'List',
        viewname: 247,
        orderby: '',
        sortorder: '',
        search_params: '',
        search_key: 'potentialname',
        search_value: ''
    },

    start: function() {
        this.hideLeftPanel();
        this.setScrollBar();
        this.setGridster();
        this.setDefaultParams();
        this.disabledToday();
        this.getLanguage();
        this.activityMenu = new Canvas_ActivityMenu_Js();
        this.events();
        // @note - configura preferencia del usuario
        accounting.settings = {
			number: {
				precision : parseInt($('#no_of_currency_decimals').val()),
				thousand: $('#currency_grouping_separator').val(),
				decimal : $('#currency_decimal_separator').val()
			}
		};
    },
    events: function() {
        $(window).bind('resize', $.proxy(this, 'resize'));
        $('#listView').bind('click', $.proxy(this, 'listView'));
        $('#canvasView').bind('click', $.proxy(this, 'canvasView'));
        $('ul.scheduleSetting').bind('click', $.proxy(this, 'optionsScheduleSetting'));
        this.schedulePreviousPage.bind('click', $.proxy(this, 'scheduleViewPreviousPage'));
        this.schedulePrevious.bind('click', $.proxy(this, 'scheduleViewPrevious'));
        this.scheduleToday.bind('click', $.proxy(this, 'scheduleViewToday'));
        this.scheduleNext.bind('click', $.proxy(this, 'scheduleViewNext'));
        this.scheduleNextPage.bind('click', $.proxy(this, 'scheduleViewNextPage'));
        $('body').bind('click', $.proxy(this, 'hideCongratulations'));
        this.droppableStage();
    },
    hideLeftPanel: function() {
        var leftPanel = jQuery('#leftPanel');
        var rightPanel = jQuery('#rightPanel');
        var toggleButton = jQuery('#toggleButton');
        toggleButton.addClass('hide');
        leftPanel.addClass('hide');
        rightPanel.removeClass('span10').addClass('span12');
    },
    setDefaultParams: function() {
        var defaultParams = jQuery.parseJSON($('#defaultParams').val());
        if(!this.interval.val()) this.interval.val(defaultParams.interval);
        if(!this.columns.val()) this.columns.val(defaultParams.columns);
        if(!this.startdate.val()) this.startdate.val(defaultParams.startdate);
    },
    colorHeaderCanvas: function() {
    	this.themecolor = $('#nav-inner').css('background-color');
        // $('.potentialbydate_top ul li').css('background-color', this.themecolor);
    },
    setScrollBar: function() {
        var self = this;
        if(!self.isMobile()) {
            $('.canvas').css('height', ($(".bodyContents").height()+$(".potentialbydate_top").height()-self.offsetScroll+29)+'px');
            var scroll = app.showScrollBar(self.scrollBar, {
                height: $(".bodyContents").height()-self.offsetScroll,
                railVisible: true,
                alwaysVisible: true
            });
            var timer;
            $('.test').scroll(function() {
                if(timer) {
                    window.clearTimeout(timer);
                }
                timer = window.setTimeout(function() {
                    window.amountscrolled();
                }, 1000);
            });
            window.amountscrolled = function() {
                var winheight = $('.test').height();
                var docheight = $('.gridster').height();
                var scrollTop = $('.test').scrollTop();
                var trackLength = docheight - winheight;
                var pctScrolled = Math.floor(scrollTop/trackLength * 100); // gets percentage scrolled (ie: 80 NaN if tracklength == 0)
                if(pctScrolled>=40 && pctScrolled<=46) self.render();
            };
            scroll.bind('slimscroll', _.debounce(function(event, position){
                if(position==='bottom') self.render();
            }, 800));
        } else {
            window.onresize = function() {
                self.scrollBar.height($(".bodyContents").height()-self.offsetScroll);
                $('.canvas').css('height', ($(".bodyContents").height()+$(".potentialbydate_top").height()-self.offsetScroll+13)+'px');
                $(".noprint .vtFooter").width($("#rightPanel").width()+1);
            };
            window.onresize();
        }
    },
    setGridster: function() {
        var self = this;
        var elCard = $('.gridster ul');
        self.gridster = elCard.gridster({
            widget_margins: [1, 1],
            widget_base_dimensions: [self.widgetLength(), 60],
            min_cols: _.size(self.dates_stage),
            draggable: {
                start: $.proxy(self, 'dragstart'),
                stop: $.proxy(self, 'dragstop')
            }
        }).data('gridster');
        if(self.isMobile()){
            self.gridster.disable();
            elCard.hammer().on("press", function(e){
                Vtiger_Helper_Js.showConfirmationBox({'message' : 'Deseas mover un Negocio?'}).then(
                    function(){
                        self.gridster.enable();
                    },
                    function(error, err){
                    }
                );
            });
        }
    },
    isMobile: function() {
        try {
            document.createEvent("TouchEvent");
            return true;
        } catch(e) {
            return false;
        }
    },
    mouseenter: function(event) {
        var stage = $(event.target);
        this.stage = stage.attr('data-stage');
        var color = (this.stage=='Closed Lost') ? 'rgba(234, 103, 83, 0.5)' : 'rgba(65, 195, 172, 0.5)';
        stage.addClass('active');
        stage.css('color', color);
        this.flagME = true;
    },
    mouseleave: function(event) {
        var stage = $(event.target);
        this.stage = null;
        stage.removeClass('active');
        stage.css('color', '');
        this.flagME = false;
    },
    hideCongratulations: function() {
        $('#congratulations').hide();
    },
    showCongratulations: function(stage,potential) {
        if(stage=='Closed Won') {
            var record = potential.attr('data-record');
            var data = {
                url: 'index.php?module=Canvas&view=ReasonWonAjax&record='+record,
    
                name: 'Potentials',
            }
            var quickCreateNode = jQuery('#quickCreateModules').find('[data-name="Canvas"]');
            quickCreateNode.data('url', data.url);
            var relatedController = new Vtiger_RelatedList_Js(record, data.name, $('.ReasonLoss'), 'Canvas');
            relatedController.addRelatedRecord(data);
            var congratulations = $("#congratulations");
            congratulations.css('-webkit-animation', 'congratilation 2s');
            congratulations.css('animation', 'congratilation 2s');
            congratulations.css('display', 'block');
        }
    },
    droppableStage: function() {
        var self = this;
        var stages = $('.potentialbydate_footer .stage');

        stages.bind('mouseenter', $.proxy(self, 'mouseenter'));
        stages.bind('mouseleave', $.proxy(self, 'mouseleave'));

        /* @note Esta porcion de codigo fue un avance para la mejora del cierre del negocio (Que la tarjeta se sobreponga) */
        /*
        stages.on("dropover", function(event, ui) {
            var stage = $(this);
            var widget = $(ui.draggable[0]);
            widget.css('transform', 'rotate(0deg)');
            widget.css('opacity', '0.7');
            var color = (stage.data('stage')=='Closed Lost') ? 'rgba(234, 103, 83, 0.5)' : 'rgba(65, 195, 172, 0.5)';
            stage.addClass('active');
            stage.css('border', '5px solid '+color);
            stage.css('color', color);
            self.stage = stage.attr('data-stage');
            self.flagME = true;
        });
        stages.on("dropout", function(event, ui) {
            var stage = $(this);
            var widget = $(ui.draggable[0]);
            widget.css('transform', 'rotate(-4deg)');
            widget.css('opacity', '1');
            stage.removeClass('active');
            stage.css('border', '');
            stage.css('color', '');
            self.stage = null;
            self.flagME = false;
        });
        stages.on("drop", function(event, ui) {
            event.preventDefault();
            var stage = $(this);
            stage.removeClass('active');
            stage.css('border', '');
            stage.css('color', '');
            self.showCongratulations(stage.data('stage'));
        });
        */
    },
    dragstart: function(event, ui) {
        var widget = ui.$player;
        widget.css('transform', 'rotate(-5deg)');
        widget.css('z-index', '4');
        widget.css('cursor', 'grabbing');
        $('.potentialbydate_footer').fadeIn("slow", function() {
            // $(this).find('.stage').droppable({ tolerance: "pointer" });
        });
        $('.k-animation-container').hide();
        this.hideCongratulations();
        this.flagME = false;
        event.preventDefault();
    },
    dragstop: function(event, ui) {
        var widget = ui.$player;
        widget.css('transform', 'rotate(0deg)');
        widget.css('z-index','2');
        widget.css('cursor', 'grab');
        this.showCongratulations(this.stage, this.potential);
        ui.$player.attr('data-stage-prev', ui.$player.attr('data-stage'));
        (this.flagME) ? this.saveSaleStage(widget) : this.setCalendarDate(widget);
        if(this.isMobile()) this.gridster.disable();
        $('.potentialbydate_footer').fadeOut('slow');
    },
    setCalendarDate: function(widget) {
        var self = this;
        var col = widget.attr('data-col');
        var elTop = $('#col-'+col);
        var pos = elTop.position();
        var dateInfo = elTop.attr('data-stage-date').split(',');
        var sdCol = dateInfo[0].split('-');
        var closingdate = widget.attr('data-closingdate');
        var cd = closingdate.split('-');
        var startdatepicker = (self.interval.val()!='W') ? sdCol[0]+'-'+sdCol[1]+'-'+cd[2] : dateInfo[0];
        if(self.language==='es_co') kendo.culture("es-ES"); // Setup Kendo Spanish Language
        kendo.culture().calendar.firstDay = 1; // Calendar start from Monday Column
        var elDatePicker = $('.datePicker');
        elDatePicker.css('display', 'none');
        elDatePicker.kendoDatePicker({
            format: "yyyy-MM-dd",
            value: Date.parse(self.validateDate(startdatepicker)),
            open: $.proxy(self, 'actionOpen', widget),
            change: function(){ widget.attr('data-closingdate', self.getStrDate(this.value())); },
            close: function(){ self.actionClose(widget, this.value(), dateInfo); }
        });
        self.datepicker = elDatePicker.data("kendoDatePicker");
        self.datepicker._inputWrapper.css('display', 'none');
        if(!self.dateCheck(dateInfo[0], dateInfo[1], closingdate)) self.datepicker.open();
        $('.k-animation-container').css({'top':(pos.top+150)+'px', 'left':(pos.left+1)+'px'});
        self.actionRevert();
        self.refreshScrollTop(widget);
    },
    validateDate: function(date) {
        var date = date.split('-');
        var year = date[0];
        var month = date[1];
        var day = date[2];
        var newdate = year+'-'+month+'-';
        switch(true) {
            case ((month==4 || month==6 || month==9 || month==11) && day==31):
                newdate += 30;
                break;
            case (month==2):
                var leapyear = (year % 4 == 0 && (year % 100 != 0 || year % 400 == 0)); // bisiesto
                if(day > 29 || (day==29 && !leapyear)) {
                    newdate += (leapyear) ? 29 : 28;
                }
                break;
            default:
                newdate += day;
        }
        return newdate;
    },
    getLanguage: function() {
        var self = this;
        var urlParams = {};
        urlParams.action = 'CoreByDate';
        urlParams.mode = 'getLanguage';
        urlParams = jQuery.extend(self.getDefaultParams(), urlParams);
        AppConnector.request(urlParams).then(
            function(data) {
                self.language = data;
            },
            function(textStatus, errorThrown){
            }
        );
    },
    actionOpen: function(widget) {
        var self = this;
        widget.addClass('updating font-white');
        _.delay(function(){
            $('.gs-w').bind('mousedown', function(){
                if(widget.attr('data-stage')!==self.won) widget.removeClass('font-white');
                widget.removeClass('updating');
                self.datepicker.close();
            });
        }, 250);
    },
    actionClose: function(widget, value, dateInfo) {
        var self = this;
        if(self.flagClose){
            if(widget.attr('data-stage')!==self.won) widget.removeClass('font-white');
            widget.removeClass('updating');
            widget.attr('data-closingdate', self.getStrDate(value));
            self.plusRow(widget);
            self.refreshData(widget);
            self.cals();
            self.saveClosingDate(widget, dateInfo);
        }else{
            self.flagClose = true;
        }
    },
    plusRow: function(widget) {
        var self = this;
        $('.potentialbydate_top ul li').each(function() {
            var range = $(this).attr('data-stage-date');
            var date = range.split(',');
            if(self.dateCheck(date[0], date[1], widget.attr('data-closingdate'))) {
                self.dates_stage[range].row++;
                return;
            }
        });
    },
    actionRevert: function() {
        var self = this;
        $('.k-footer').html('<a id="revert" href="#">'+app.vtranslate('JS_REVERT')+'</a>');
        $("#revert").on("click", function() {
            self.flagClose = false;
            self.datepicker.close();
            self.getListViewRecords();
        });
    },
    refreshScrollTop: function(element) {
        var self = this;
        _.delay(function(){
            var elPos = element.position().top;
            self.scrollBar.scrollTop(elPos-50);
            var barTop = elPos-200;
            $('.slimScrollBar').css('top', ((barTop<0) ? 0 : barTop)+'px');
        }, 300);
    },
    refreshData: function(widget) {
        var self = this;
        _.each(self.dates_stage, function(new_state, date_stage) {
            var record = widget.attr('data-record');
            var closingdate = widget.attr('data-closingdate');
            var dates = date_stage.split(',');
            if(self.dateCheck(dates[0], dates[1], closingdate)) {
                var old_state = self.dates_stage[widget.attr('data-stage-date')];
                var item = _.findWhere(old_state.data, {potentialid: record});
                old_state.data = _.without(old_state.data, item);
                new_state.data.push(item);
                widget.attr('data-stage-date', date_stage);
            }
        });
    },
    cals: function() {
        var self = this;
        $(".dates_stage").each(function(i, li) {
            var others = 0, wons = 0, losts = 0;
            var xli = $(li);
            var date_stage = xli.data('stage-date');
            var data = self.dates_stage[date_stage].data;
            _.each(data, function(card) {
                switch(card.sales_stage) {
                    case self.won: wons += self.getAmount(card); break;
                    case self.lost: losts += self.getAmount(card); break;
                    default: others += self.getAmount(card)
                }
            });
            xli.find('.potothers').html('$'+self.format(others));
            xli.find('.potwon').html('+ $'+self.format(wons));
            xli.find('.pottotal').html('$'+self.format(others+wons));
        });
    },
    getAmount: function(card) {
        return _.isUndefined(card.amount) ? 0 : card.amount;
    },
    saveClosingDate: function(potential, dateInfo) {
        var self = this;
        var closingdate = potential.attr('data-closingdate');
        var urlParams = {};
        urlParams.action = 'CoreByDate';
        urlParams.mode = 'setClosingDate';
        urlParams.closingdate = closingdate;
        urlParams.potentialid = potential.attr('data-record');
        urlParams = jQuery.extend(self.getDefaultParams(), urlParams);
        AppConnector.request(urlParams).then(
            function(data) {
                self.setScreenHeight();
                if(!self.dateCheck(dateInfo[0], dateInfo[1], closingdate)) {
                    self.notifyMsg(closingdate);
                    self.getListViewRecords();
                }
            },
            function(textStatus, errorThrown){
            }
        );
    },
    saveSaleStage: function(potential) {
        var self = this;
        potential.hide();
        potential.attr('data-stage', self.stage);
        var urlParams = {};
        urlParams.action = 'Core';
        urlParams.mode = 'setStage';
        urlParams.sales_stage = potential.attr('data-stage');
        urlParams.potentialid = potential.attr('data-record');
        urlParams = jQuery.extend(self.getDefaultParams(), urlParams);
        if(urlParams.sales_stage=='Closed Lost') {
            var data = {
                url: 'index.php?module=Canvas&view=ReasonLossAjax&record='+urlParams.potentialid,
                prev: potential.attr('data-stage-prev'),
                name: 'Potentials',
            }
            var quickCreateNode = jQuery('#quickCreateModules').find('[data-name="Canvas"]');
            quickCreateNode.data('url', data.url);
            var relatedController = new Vtiger_RelatedList_Js(urlParams.potentialid, data.name, $('.ReasonLoss'), 'Canvas');
            relatedController.addRelatedRecord(data);
        } else {
            AppConnector.request(urlParams).then(
                function(data) {
                    self.setScreenHeight();
                    self.getListViewRecords();
                },
                function(textStatus, errorThrown){
                }
            );
        }
    },
    notifyMsg: function(closingdate) {
    	var self = this;
        var title = '', str1 = '', str2 = '';
        $('.potentialbydate_top ul li').each(function() {
            var date = $(this).attr('data-stage-date').split(',');
            if(self.dateCheck(date[0], date[1], closingdate)) {
                title = $(this).find('.title').text();
                return;
            }
        });
        str1 = (title) ? (app.vtranslate('JS_NOTIFY_1')+title+"', ") : "";
        str2 = (title) ? (app.vtranslate('JS_NOTIFY_2')+closingdate+".") : (app.vtranslate('JS_NOTIFY_3')+closingdate+".");
        Vtiger_Helper_Js.showPnotify({ text: str1+str2 });
    },
    resize: function(event) {
        this.gridster.resize_widget_dimensions({widget_base_dimensions: [this.widgetLength(), 60]});
    },
    widgetLength: function() {
        var dates_stage_len = _.keys(this.dates_stage).length;
        return ($('.potentialbydate_top ul').width()-this.constantSub()-(2*dates_stage_len)) / dates_stage_len;
    },
    constantSub: function() {
        return ($.browser.mozilla) ? 0 : 2;
    },
    setScreenHeight: function() {
        $('.mainContainer').height($(".bodyContents").height()-this.offsetScroll);
    },
    listView: function() {
        this.urlparams.module = 'Potentials';
        this.urlparams.view = 'List';
        this.urlparams.viewname = this.getCurrentCvId();
        window.location.href = 'index.php?'+$.param(this.urlparams);
    },
    canvasView: function() {
        this.urlparams.module = 'Canvas';
        this.urlparams.view = 'PotentialByFase';
        this.urlparams.viewname = this.getCurrentCvId();
        window.location.href = 'index.php?'+$.param(this.urlparams);
    },
    optionsScheduleSetting: function(e) {
        var elOpt = $(e.target);
        var option = elOpt.context.id.split('-');
        this.removeAllOptSel(option[0]);
        this.addOptSel(elOpt);
        if(option[0]==='interval'){
            this.startdate.val(this.getStrDate(this.today));
            this.disabledToday();
            this.interval.val(option[1]);
        }else{
            this.columns.val(option[1]);
        }
        switch(this.interval.val()) {
            case this.W: this.setTooltipTitles('JS_WEEKS', 'JS_WEEK'); break;
            case this.M: this.setTooltipTitles('JS_MONTHS', 'JS_MONTH'); break;
            case this.Q: this.setTooltipTitles('JS_QUARTERS', 'JS_QUARTER');
        }
        this.ajaxChangeDate();
    },
    removeAllOptSel: function(sel) {
        $('.'+sel).removeClass('active-bkg');
        $('.'+sel+' > i').removeClass('fa fa-check');
    },
    addOptSel: function(sel) {
        sel.addClass('active-bkg');
        sel.find('.check').addClass('fa fa-check');
    },
    setTooltipTitles: function(labelPeriods, labelPeriod) {
        this.schedulePreviousPage.attr('title', app.vtranslate('JS_JUMP_BACK')+' '+this.columns.val()+' '+app.vtranslate(labelPeriods));
        this.schedulePrevious.attr('title', app.vtranslate('JS_PREVIOUS')+' '+app.vtranslate(labelPeriod));
        this.scheduleNext.attr('title', app.vtranslate('JS_NEXT')+' '+app.vtranslate(labelPeriod));
        this.scheduleNextPage.attr('title', app.vtranslate('JS_JUMP_FROWARD')+' '+this.columns.val()+' '+app.vtranslate(labelPeriods));
    },
    scheduleViewPreviousPage: function(e) {
        this.dateSetting(-this.week, -this.month, -this.quarter, this.columns.val()); // Decrement n week (-7*n days), n month or n quarter (-3*n months)
    },
    scheduleViewPrevious: function(e) {
        this.dateSetting(-this.week, -this.month, -this.quarter, 1); // Decrement 1 week (-7 days), 1 month or 1 quarter (-3 months)
    },
    scheduleViewToday: function(e) {
        this.setStartDate(this.today);
        this.disabledToday();
        this.ajaxChangeDate();
    },
    scheduleViewNext: function(e) {
        this.dateSetting(this.week, this.month, this.quarter, 1); // Increment 1 week (+7 days), 1 month or 1 quarter (+3 months)
    },
    scheduleViewNextPage: function(e) {
        this.dateSetting(this.week, this.month, this.quarter, this.columns.val()); // Increment n week (+7*n days), n month or n quarter (+3*n months)
    },
    dateSetting: function(week, month, quarter, mult) {
        var sd = this.getStartDate();
        switch(this.interval.val()) {
            case this.W: sd.setDate(sd.getDate()+(week*mult)); break;
            case this.M: sd.setMonth(sd.getMonth()+(month*mult)); break;
            case this.Q: sd.setMonth(sd.getMonth()+(quarter*mult));
        }
        this.setStartDate(sd);
        this.disabledToday();
        this.ajaxChangeDate();
    },
    disabledToday: function() {
        var frame_today = this.getFrameInfo(this.today);
        var frame_current = this.getFrameInfo(this.getStartDate());
        (frame_today===frame_current) ? this.scheduleToday.attr("disabled", "disabled") : this.scheduleToday.removeAttr("disabled");
    },
    getFrameInfo: function(date) {
        switch(this.interval.val()) {
            case this.W: return date.getWeek()+'-'+date.getFullYear();
            case this.M: return (date.getMonth()+1)+'-'+date.getFullYear();
            case this.Q: return Math.floor((date.getMonth() + 3) / 3)+'-'+date.getFullYear();
        }
    },
    getStartDate: function() {
        return Date.parse(this.startdate.val());
    },
    setStartDate: function(sd) {
        this.startdate.val(this.getStrDate(sd));
    },
    getStrDate: function(date) {
        return date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate();
    },
    ajaxChangeDate: function() {
        var self = this;
        var params = {
            'module': app.getModuleName(),
            'action': 'CoreByDate',
            'mode': 'getDateFrames',
            'interval': self.interval.val(),
            'columns': self.columns.val(),
            'startdate': self.startdate.val()
        }
        AppConnector.request(params).then(
            function(response) {
                $('.potentialbydate_top').html(response);
                self.listSearch();
            }
        );
    },
    /**
    * ENTRY POINT FUNCTION
    */
    listSearch: function() {    
        var self = this;
        self.dates_stage = {};
        self.colorHeaderCanvas();
        $('.potentialbydate_top ul li').each(function(index) {
            self.dates_stage[$(this).attr('data-stage-date')] = {
                col: index+1,
                data: [],
                row: 1,
            };
        });
        self.ncards = Math.round(70/_.keys(self.dates_stage).length);
        if(_.isNull(self.gridster)) self.start();
        self.getListViewRecords();
    },
    getListViewRecords: function() {
        var self = this;
        _.delay(function(){
            self.gridster.remove_all_widgets();
            _.each(self.dates_stage, function(date_stage, key) {
                date_stage.data = [];
                date_stage.row = 1;
            });
            var aDeferred = jQuery.Deferred();
            if(typeof urlParams == 'undefined') urlParams = {};
            urlParams.action = 'Core';
            urlParams.mode = 'filter';
            var urlParams = jQuery.extend(self.getDefaultParams(), urlParams);
            var progressIndicatorElement = jQuery.progressIndicator({mode:'show'});
            AppConnector.request(urlParams).then(
                function(data) {
                    var cards = JSON.parse(data);
                    self.args(cards, [
                        'potentialid',
                        'amount',
                        'potentialname',
                        'accountid',
                        'accountname',
                        'smownerid'
                    ]);
                    self.template = _.template($("#item-template").html());
                    self.addOptSel($('#interval-'+self.interval.val()));
                    self.addOptSel($('#columns-'+self.columns.val()));
                    self.setWidgets2Dates(cards);
                    self.setScreenHeight();
                    self.render();
                    self.cals();
                    progressIndicatorElement.progressIndicator({mode:'hide'});
                },
                function(textStatus, errorThrown){
                    aDeferred.reject(textStatus, errorThrown);
                }
            );
            return aDeferred.promise();
        }, 300);
    },
    args: function(data, mandatories) {
        if(_.isEmpty(data)) return;
        _.each(mandatories, function(mandatory) {
            if(!_.has(data[0], mandatory)) {
                var params = {
                    title: app.vtranslate('JS_MANDATORY_FIELD'),
                    text: mandatory
                };
                Vtiger_Helper_Js.showPnotify(params);
                throw new Error(params.title);
            }
        });
    },
    setWidgets2Dates: function(cards) {
        var self = this;
        var sales_stage = $.parseJSON($('#salesStage').val());
        _.each(cards, function(card) {
            _.each(self.dates_stage, function(date_info, date_stage) {
                var dates = date_stage.split(',');
                if(self.dateCheck(dates[0], dates[1], card['closingdate'])) {
                    card['stage_progress'] = sales_stage[card['sales_stage']];
                    card['progress_color'] = '#52C86B'; //self.themecolor
                    card['date_stage'] = date_stage;
                    card['format'] = self.format(card['amount']);
                    date_info.row = 1;
                    date_info.count = 1;
                    date_info.data.push(card);
                }else{
                    return;
                }
            });
        });
    },
    dateCheck: function(from, to, check) {
        var fDate = Date.parse(from);
        var lDate = Date.parse(to);
        var cDate = Date.parse(check);
        return (cDate<=lDate && cDate>=fDate) ? true : false;
    },
    format: function(nstr) {
        return accounting.formatNumber(nstr);
	},
    render: function() {
        var self = this;
        var progressIndicatorElement = jQuery.progressIndicator({mode:'show'});
        _.delay(function() {
            self.resize();
            self.hideCongratulations();
            self.resize_grid();
            self.activityMenu.registerEventForActivityMenu();
            self.setFlagManual();
            progressIndicatorElement.progressIndicator({mode:'hide'});
        }, 500);
    },
    resize_grid: function() {
        var self = this;
        _.each(self.dates_stage, function(date_stage) {
            if(date_stage.count<=date_stage.data.length) {
                var limit = date_stage.count+self.ncards;
                for(var i=date_stage.count-1; i<limit; i++) {
                    var card = date_stage.data[i];
                    if(!_.isUndefined(card) && (card.sales_stage!==self.lost)) {
                        var template = self.template(card);
                        var templateObj = self.setLook($(template));
                        var widget = self.gridster.add_widget(templateObj, 1, 1, date_stage.col, date_stage.row);
                        widget.css('cursor', 'grab');
                        // widget.draggable({ tolerance: "pointer" });
                        date_stage.row += self.resize_widget(widget);
                        date_stage.count++;
                    }
                }
            }
        });
    },
    setLook: function(widget) {
        switch(widget.data('stage')) {
            case this.won:
                widget.addClass('closed-won font-white font-white:hover');
                widget.find('.closed-state').removeClass('hide');
                break;
            case this.lost:
                widget.addClass('closed-lost font-white font-white:hover');
        }
        return widget;
    },
    resize_widget: function(widget) {
        var height = widget.find('.core').height();
        var sizey = 1;
        switch(true) {
            case (height>54 && height<120): sizey = this.resizeSizeY(widget, 2); break;
            case (height>120 && height<186): sizey = this.resizeSizeY(widget, 3); break;
            case (height>186 && height<252): sizey = this.resizeSizeY(widget, 4); break;
            case (height>252 && height<318): sizey = this.resizeSizeY(widget, 5); break;
            case (height>318): sizey = this.resizeSizeY(widget, 6);
        }
        return sizey;
    },
    resizeSizeY: function(widget, sizey) {
        this.gridster.resize_widget(widget, 1, sizey, false, null);
        return sizey;
    },
    // @note - Envia una bandera al ultimo negocio creado para el manual
    setFlagManual: function() {
        var _red_ = null;
        var _potentialid_ = 0;
        $('.row-icon-red').each(function() {
            var id = $(this).data('potentialid');
            if(_potentialid_<id) _red_ = $(this);
        });
        if(_red_!==null) {
            _red_.addClass('lastred');
            _red_.closest('li').addClass('lastcard');
        }
    },
    activity: function(event) {
        this.activityMenu.show(event);
    },
});

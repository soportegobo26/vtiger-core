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
        var thisInstance = this;
        var template = $("#activities-template").html();
        thisInstance.t_activities = _.template(template);
        template = $("#activity-template").html();
        thisInstance.t_activity = _.template(template);
        $(document).bind('event.add', function() {
            setTimeout($.proxy(thisInstance, 'getColor'), 700);
        });
        $('.row-icon').bind('mousedown', $.proxy(thisInstance, 'getActivities'));
    },
    getColor: function(event) {
        var thisInstance = this;
        var params = {
            action: 'Core',
            module: 'Canvas',
            mode: 'getColor',
            parent_id: thisInstance.params_activity.parent_id,
        };
        AppConnector.request(params).then(
            function(data) {
                var icon = $('#icon_'+thisInstance.record);
                // var potvalue = $('#value_'+thisInstance.record);
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
        var thisInstance = this;
        event.stopPropagation();
        var parent = $(event.currentTarget).closest('li');
        thisInstance.record = parent.data('record');
        var params = {
            parent_id: thisInstance.record,
            action: 'Core',
            module: 'Canvas',
            mode: 'getActivities',
        };
        $(event.currentTarget).webuiPopover({
            arrow: false,
            type:'async',
            cache: false,
            animation: 'pop',
            url:'index.php?'+$.param(params),
            content:function(data) {
                data = JSON.parse(data);
                var categories = {
                    blue: '',
                    yellow: '',
                    green: '',
                    record: thisInstance.record,
                };
                _.each(data, function(row) {
                    console.log(row);
                    row.activitytype = app.vtranslate(row.activitytype);
                    categories[row.color]+= thisInstance.t_activity(row);
                });

                $('.potentialbyfase').trigger('getActivitiesClick');
                
                thisInstance.params_activity.parent_id = parent.data('record');
                thisInstance.params_activity.sourceRecord = parent.data('record');
                thisInstance.params_activity.contact_id = parent.data('contact_id');
                thisInstance.params_activity.related_account = parent.data('related_account');
                
                setTimeout(function() {
                    $('.webui-popover  .rowDropMenu').bind('click', $.proxy(thisInstance, 'add_activity'));
                    $('.webui-popover .close_activity').bind('click', $.proxy(thisInstance, 'closeActivity'));
                    $('.webui-popover .row_activity').bind('click', $.proxy(thisInstance, 'openActivity'));
                }, 300);
                return thisInstance.t_activities(categories);
            }
        });
    },
    openActivity: function(event) {
        var thisInstance = this;
        $('.dropMenu').hide();
        var element = $(event.currentTarget);
        thisInstance.params_activity.activityid = element.data('record');
        element.data('url', 'index.php?'+$.param(thisInstance.params_activity));
        var relatedController = new Vtiger_RelatedList_Js(thisInstance.params_activity.parent_id, thisInstance.params_activity.sourceModule, $('.ActivityPopup'), 'Calendar');
        relatedController.addRelatedRecord(element);
    },
    closeActivity: function(event) {
        var thisInstance = this;
        $('.potentialbyfase').trigger('closeActivitiesClick');
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
                    thisInstance.add_activity(event);
                // });
                $('.webui-popover').hide();
                setTimeout($.proxy(thisInstance, 'getColor'), 700);
            }
        );
    },
    add_activity: function(event) {
        var thisInstance = this;
        $('.dropMenu').hide();
        thisInstance.params_activity.activityid = 0;
		if(event.seguimiento) {
			if(event.related_account) thisInstance.params_activity.related_account = event.related_account;
			if(event.contact_id) thisInstance.params_activity.contact_id = event.contact_id;
			if(event.sourceModule) thisInstance.params_activity.sourceModule = event.sourceModule;
			if(event.parent_id) thisInstance.params_activity.parent_id = event.parent_id;
			event.seguimiento = false;
		}
		var data = {
			url: 'index.php?'+$.param(thisInstance.params_activity),
			name: thisInstance.params_activity.sourceModule
		}
		var relatedController = new Vtiger_RelatedList_Js(thisInstance.params_activity.parent_id, thisInstance.params_activity.sourceModule, $('.ActivityPopup'), 'Calendar');
		relatedController.addRelatedRecord(data);
    }
});

Vtiger_List_Js('Canvas_PotentialByFase_Js', {}, {
    data: null,
    stage: null,
    gridster: null,
    progress: null,
    sales_stage: {},
    currencyformat: null,
    offsetScroll: 154,
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
    lixx: null,
    start: function() {
        var thisInstance = this;
        thisInstance.hideLeftPanel();
        thisInstance.colorHeaderCanvas();
        $('body').bind('click', $.proxy(thisInstance, 'hideCongratulations'));
        if(!thisInstance.isMobile()) {
            $('.canvas').css('height', ($(".bodyContents").height()+$(".potentialbyfase_top").height()-thisInstance.offsetScroll+29)+'px');
            var scroll = app.showScrollBar($('.test'), {
                height: $(".bodyContents").height()-thisInstance.offsetScroll,
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
                if(pctScrolled>=40 && pctScrolled<=46) thisInstance.render();
            };
            scroll.bind('slimscroll', _.debounce(function(event, position){
                if(position==='bottom') thisInstance.render();
            }, 800));
        } else {
            window.onresize = function() {
                $('.test').height($(".bodyContents").height()-thisInstance.offsetScroll);
                $('.canvas').css('height', ($(".bodyContents").height()+$(".potentialbyfase_top").height()-thisInstance.offsetScroll+13)+'px');
                $(".noprint .vtFooter").width($("#rightPanel").width()+1);
			};
			window.onresize();
            var scroll = app.showScrollBar($('.test'), {
                height: $(".bodyContents").height()-thisInstance.offsetScroll,
                railVisible: true,
                alwaysVisible: true
            });
            scroll.bind('slimscroll', _.debounce(function(event, position){
                if(position==='bottom') {thisInstance.render()};
            }, 800));
		}
		var elCard = $('.gridster ul');
		//console.log('>>>>', _.size(thisInstance.sales_stage));
        thisInstance.gridster = elCard.gridster({
            widget_margins: [1, 1],
            widget_base_dimensions: [thisInstance.widgetLength(), 60],
            min_cols: _.size(thisInstance.sales_stage),
            draggable: {
                start: $.proxy(thisInstance, 'dragstart'),
                stop: $.proxy(thisInstance, 'dragstop'),
            }
        }).data('gridster');
		if(thisInstance.isMobile()) {
			$('#help_mobile').html('Para mover las tarjetas has un toque sobre la tarjeta hasta que gire, otro toque para mover la tarjeta a la fase de venta que desees.');
			thisInstance.gridster.disable();
			elCard.hammer().on('press', function(e) {
				thisInstance.gridster.enable();
				thisInstance.lixx.css('transform', 'rotate(-4deg)');
				thisInstance.lixx.css('z-index','4');
			});
			elCard.on('mousedown touchstart', 'li', function(e) {
				thisInstance.lixx = $(this);
			});
		}
        thisInstance.activityMenu = new Canvas_ActivityMenu_Js();
        $(window).bind('resize', $.proxy(thisInstance, 'resize'));
        $('#listView').bind('click', $.proxy(thisInstance, 'listView'));
        $('#scheduleView').bind('click', $.proxy(thisInstance, 'scheduleView'));

        // @note - configura preferencia del usuario
		accounting.settings = {
			number: {
				precision : parseInt($('#no_of_currency_decimals').val()),
				thousand: $('#currency_grouping_separator').val(),
				decimal : $('#currency_decimal_separator').val()
			}
		};
        thisInstance.droppableStage();
    },
    hideLeftPanel: function() {
        var leftPanel = jQuery('#leftPanel');
        var rightPanel = jQuery('#rightPanel');
        var toggleButton = jQuery('#toggleButton');
        toggleButton.addClass('hide');
        leftPanel.addClass('hide');
        rightPanel.removeClass('span10').addClass('span12');
    },
    colorHeaderCanvas: function() {
    	themecolor = $('#nav-inner').css('background-color');
        $('.potentialbyfase_top ul li').css('background-color', themecolor);
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
        var thisInstance = this;
        var stage = $(event.target);
        thisInstance.stage = stage.attr('data-stage');
        var color = (thisInstance.stage=='Closed Lost') ? 'rgba(234, 103, 83, 0.5)' : 'rgba(65, 195, 172, 0.5)';
        stage.addClass('active');
        stage.css('color', color);
    },
    mouseleave: function(event) {
        var thisInstance = this;
        var stage = $(event.target);
        thisInstance.stage = null;
        stage.removeClass('active');
        stage.css('color', '');
    },
    hideCongratulations: function() {
        $('#congratulations').hide();
    },
    showCongratulations: function(stage,potential) {
        var congratulations = $("#congratulations");
        congratulations.css('-webkit-animation', 'congratilation 2s');
        congratulations.css('animation', 'congratilation 2s');
        congratulations.css('display', 'block');
    },
    droppableStage: function() {
        var thisInstance = this;
        var stages = $('.potentialbyfase_footer .stage');

        stages.bind('mouseenter', $.proxy(thisInstance, 'mouseenter'));
        stages.bind('mouseleave', $.proxy(thisInstance, 'mouseleave'));

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
            thisInstance.stage = stage.attr('data-stage');
        });
        stages.on("dropout", function(event, ui) {
            var stage = $(this);
            var widget = $(ui.draggable[0]);
            widget.css('transform', 'rotate(-4deg)');
            widget.css('opacity', '1');
            stage.removeClass('active');
            stage.css('border', '');
            stage.css('color', '');
            thisInstance.stage = null;
        });
        stages.on("drop", function(event, ui) {
            event.preventDefault();
            var stage = $(this);
            stage.removeClass('active');
            stage.css('border', '');
            stage.css('color', '');
            thisInstance.showCongratulations(stage.data('stage'));
        });
        */
    },
    dragstart: function(event, ui) {
        var thisInstance = this;
        ui.$player.css('transform', 'rotate(-4deg)');
        ui.$player.css('z-index','4');
        ui.$player.css('cursor', 'grabbing');
        $('.potentialbyfase_footer').fadeIn("slow", function() {
            // $(this).find('.stage').droppable({ tolerance: "pointer" });
        });
        thisInstance.hideCongratulations();
        event.preventDefault();
    },
    dragstop: function(event, ui) {
        var thisInstance = this;
        ui.$player.css('transform', 'rotate(0deg)');
        ui.$player.css('z-index','2');
        ui.$player.css('cursor', 'grab');
        thisInstance.showCongratulations(thisInstance.stage,ui.$player);
        if(_.isNull(thisInstance.stage)) {
            var col = ui.$player.attr('data-col');
            var record = ui.$player.attr('data-record');
            var sales_stage = _.keys(thisInstance.sales_stage);
             _.each(sales_stage, function(sale_stage) {
                var new_state = thisInstance.sales_stage[sale_stage];
                if(col==new_state.col) {
                    var old_state = thisInstance.sales_stage[ui.$player.attr('data-stage')];
                    var item = _.findWhere(old_state.data, {potentialid: record});
                    old_state.data = _.without(old_state.data, item);
                    new_state.data.push(item);
                    ui.$player.attr('data-stage-prev', ui.$player.attr('data-stage'));
                    ui.$player.attr('data-stage', sale_stage);
                    thisInstance.save(ui.$player);
                }
            });
        } else {
            ui.$player.hide();
            var record = ui.$player.attr('data-record');
            var old_state = thisInstance.sales_stage[ui.$player.attr('data-stage')];
            var item = _.findWhere(old_state.data, {potentialid: record});
            old_state.data = _.without(old_state.data, item);
            ui.$player.attr('data-stage-prev', ui.$player.attr('data-stage'));
            ui.$player.attr('data-stage', thisInstance.stage);
            thisInstance.stage = null;
            thisInstance.save(ui.$player);
            thisInstance.gridster.remove_widget(ui.$player);
        }
        thisInstance.cals();
        if(thisInstance.isMobile()) thisInstance.gridster.disable();
        $('.potentialbyfase_footer').fadeOut('slow');
    },
    save: function(potential) {
    	var thisInstance = this;
        var urlParams = {};
		urlParams.action = 'Core';
		urlParams.mode = 'setStage';
		urlParams.sales_stage = potential.attr('data-stage');
		urlParams.potentialid = potential.attr('data-record');
		var defaultParams = this.getDefaultParams();
		urlParams = jQuery.extend(defaultParams, urlParams);
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
		}else if(urlParams.sales_stage=='Closed Won') {
            var data = {
                url: 'index.php?module=Canvas&view=ReasonWonAjax&record='+urlParams.potentialid,
                prev: potential.attr('data-stage-prev'),
                name: 'Potentials',
            }
            var quickCreateNode = jQuery('#quickCreateModules').find('[data-name="Canvas"]');
            quickCreateNode.data('url', data.url);
            var relatedController = new Vtiger_RelatedList_Js(urlParams.potentialid, data.name, $('.ReasonLoss'), 'Canvas');
            relatedController.addRelatedRecord(data);
            thisInstance.showCongratulations();
        } 
        else {
			AppConnector.request(urlParams).then(
				function(data) {
					thisInstance.setScreenHeight();
				},
				function(textStatus, errorThrown){
					
				}
			);
		}
    },
    resize: function(event) {
        this.gridster.resize_widget_dimensions({widget_base_dimensions: [this.widgetLength(), 60]});
    },
    widgetLength: function() {
        var sales_stage_len = _.keys(this.sales_stage).length;
        return ($('.potentialbyfase_top ul').width()-this.constantSub()-(2*sales_stage_len)) / sales_stage_len;
    },
    constantSub: function() {
        return ($.browser.mozilla) ? 0 : 4;
    },
    setScreenHeight: function() {
        $('.mainContainer').height($(".bodyContents").height()-this.offsetScroll);
    },
    listView: function() {
        var thisInstance = this;
        thisInstance.urlparams.module = 'Potentials';
        thisInstance.urlparams.view = 'List';
        thisInstance.urlparams.viewname = thisInstance.getCurrentCvId();
        window.location.href = 'index.php?'+$.param(thisInstance.urlparams);
    },
    scheduleView: function() {
        var thisInstance = this;
        thisInstance.urlparams.module = 'Canvas';
        thisInstance.urlparams.view = 'PotentialByDate';
        thisInstance.urlparams.viewname = thisInstance.getCurrentCvId();
        window.location.href = 'index.php?'+$.param(thisInstance.urlparams);
    },
    listSearch: function() {
        var thisInstance = this;
        $('.potentialbyfase_top ul li').each(function(index) {
            thisInstance.sales_stage[$(this).attr('data-stage')] = {
                row: 1,
                data: [],
                col: index+1,
            };
        });
		if(_.size(thisInstance.sales_stage)==0) {
			$('.potentialbyfase').addClass('hide');
			$('.emptystate').removeClass('hide');
			return;
		}
        thisInstance.ncards = Math.round(70/_.keys(thisInstance.sales_stage).length);
        if(_.isNull(thisInstance.gridster)) {
            thisInstance.start();
        }
        thisInstance.getListViewRecords();
    },
    getListViewRecords: function() {
        var thisInstance = this;
        thisInstance.gridster.remove_all_widgets();
        _.each(thisInstance.sales_stage, function(sale_stage, key, list) {
            sale_stage.data = [];
            sale_stage.row = 1;
        });
        
        var aDeferred = jQuery.Deferred();
        if(typeof urlParams == 'undefined') {
            urlParams = {};
        }
        
        urlParams.action = 'Core';
        urlParams.mode = 'filter';
        urlParams.flagWL = true;

        var defaultParams = this.getDefaultParams();
        var urlParams = jQuery.extend(defaultParams, urlParams);
        var progressIndicatorElement = jQuery.progressIndicator({mode:'show'});
        AppConnector.request(urlParams).then(
            function(data) {
                var cards = JSON.parse(data);
                thisInstance.args(cards, [
                    'potentialid',
                    'amount',
                    'potentialname',
                    'accountid',
                    'accountname',
                    'smownerid'
                ]);
                var template = $("#item-template").html();
                thisInstance.template = _.template(template);
                _.each(cards, function(card) {
                    try {
                        card['format'] = thisInstance.format(card['amount']);
                        thisInstance.sales_stage[card['sales_stage']].row = 1;
                        thisInstance.sales_stage[card['sales_stage']].count = 1;
                        thisInstance.sales_stage[card['sales_stage']].data.push(card);
                    } catch(err) {
                        
                    }
                });
                thisInstance.setScreenHeight();
                thisInstance.render();
                thisInstance.cals();
                progressIndicatorElement.progressIndicator({mode:'hide'});
            },
            function(textStatus, errorThrown){
                aDeferred.reject(textStatus, errorThrown);
            }
        );
        return aDeferred.promise();
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
	format: function(nstr) {
        return accounting.formatNumber(nstr);
	},
    cals: function() {
        var thisInstance = this;
        $(".sales_stage").each(function(i, li) {
            var total = 0;
            var xli = $(li);
            var stage = xli.data('stage');
            var data = thisInstance.sales_stage[stage].data;
            _.each(data, function(card) {
                total+= parseInt(_.isUndefined(card.amount) ? 0: card.amount);
            });
            var value = thisInstance.format(total);
            xli.find('.stagevalue').html(value);
            xli.find('.stagenumber').html(data.length);
        });        
    },
    render: function() {
        var thisInstance = this;
        var progressIndicatorElement = jQuery.progressIndicator({mode:'show'});
        _.delay(function() {
            thisInstance.resize();
            thisInstance.hideCongratulations();
            thisInstance.resize_grid();
            thisInstance.activityMenu.registerEventForActivityMenu();
            thisInstance.setFlagManual();
            progressIndicatorElement.progressIndicator({mode:'hide'});
        }, 500);
    },
    resize_grid: function() {
        var thisInstance = this;
        _.each(thisInstance.sales_stage, function(stage, index, list) {
            if(stage.count<=stage.data.length) {
                var limit = stage.count+thisInstance.ncards;
                for(var i=stage.count-1; i<limit; i++) {
                    var card = stage.data[i];
                    if(!_.isUndefined(card)) {
                        var template = thisInstance.template(card);
                        var widget = thisInstance.gridster.add_widget(template, 1, 1, stage.col, stage.row);
                        widget.css('cursor', 'grab');
                        // widget.draggable({ tolerance: "pointer" });
                        stage.row += thisInstance.resize_widget(widget);
                        stage.count++;
                    }
                }
            }
        });
    },
    // @note - Envia una bandera al ultimo negocio creado para el manual
    setFlagManual: function() {
        var _red_ = null;
        var _potentialid_ = 0;
        $('.row-icon-red').each(function (index, value) {
            var id = $(this).data('potentialid');
            if(_potentialid_<id) _red_ = $(this);
        });
        if(_red_!==null) {
            _red_.addClass('lastred');
            _red_.closest('li').addClass('lastcard');
        }
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
    activity: function(event) {
        this.activityMenu.show(event);
    },
});

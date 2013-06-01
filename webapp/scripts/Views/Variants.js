define([DQXSCRQ(), DQXSC("Framework"), DQXSC("SQL"), DQXSC("Msg"), DQXSC("Controls"), DQXSC("Model"),
    "CrossesMetaData", "TableCortex", "TableGATK", "VariantFilters",
    "i18n!nls/PfCrossesWebResources.js"],
    function (require, Framework, SQL, Msg, Controls, Model,
              CrossesMetaData, TableCortex, TableGATK, VariantFilters,
              resources) {

        var VariantsModule = {

            Instance: function (iPage, iFrame) {
                var that = Framework.ViewSet(iFrame, 'variants');
                that.myPage = iPage;
                that.myFrame = iFrame;
                that.registerView();

                that.jumpVariantset = function (id) {
                    Msg.send({type: 'ShowPopulation'}, id.split('_')[1]);
                };

                that.createPanels = function () {
                    this.tablecortex = new TableCortex();
                    this.tablecortex.createPanelTable(this.frameTables['cortex']);
                    this.tablegatk = new TableGATK();
                    this.tablegatk.createPanelTable(this.frameTables['gatk']);
                    this.createPanelAdvancedQuery();
                    //Run the change func to load first data
                    this.changeFunction();
                    this.frameMessage.setContentHtml(resources.select_call_set);
                };

                that.createFramework = function () {
                    this.currentQuery = null;
                    //                   this.myFrame.setSeparatorSize(bigSeparatorSize);
                    this.frameLeftGroup = this.getFrame().addMemberFrame(Framework.FrameGroupVert('VariantsQueries', 0.4)).setSeparatorSize(4);
                    this.frameLeftGroup.InsertIntroBox('datagrid2.png', resources.variantsHelp);
                    this.frameQueryAdvanced = this.frameLeftGroup.addMemberFrame(Framework.FrameFinal('VariantsQueryAdvanced', 0.4))
                        .setMargins(0).setDisplayTitle('Query').setMinSize(Framework.dimX, 300).setAllowScrollBars(true, true);
                    this.frameTableGroup = this.getFrame().addMemberFrame(Framework.FrameGroupStack('', 0.6));
                    this.frameMessage = this.frameTableGroup.addMemberFrame(Framework.FrameFinal('VariantsMessage', 0.6));
                    var tables = ['cortex', 'gatk'];
                    this.frameTables = {};
                    $.each(tables, function (idx, tableID) {
                        var aFrameTable = that.frameTableGroup.addMemberFrame(Framework.FrameFinal(tableID, 0.6))
                            .setMargins(0).setFrameClassClient('DQXDarkFrame').setAllowScrollBars(false, false);
                        that.frameTables[tableID] = aFrameTable
                    });
                };

                that.queryComponentToString = function (sq) {
                    return sq.ColName + sq.Tpe + sq.CompValue + ",";
                };

                that.queryToString = function (qry) {
                    var msg = "";
                    if (qry != null) {
                        if (qry.Components) {
                            for (var i = 0, l = qry.Components.length; i < l; i++) {
                                sq = qry.Components[i];
                                msg += that.queryToString(sq);
                            }
                        } else {
                            msg += that.queryComponentToString(qry);
                        }
                    }
                    return (msg);
                };

                //Call this function to set a new query
                that.setCurrentQuery = function (qry) {
                    if ((qry != null) || (this.currentQuery != null)) {
                        this.currentQuery = qry;
//                        _gaq.push(['_trackEvent', 'Variants', 'query', that.queryToString(qry)]);
                        Msg.broadcast({ type: 'ModifyVariantsQuery'}, qry);
                    }
                };

                that.changeFunction = function () {
                    var callSet = that.myPage.current_call_set.get('call_set');
                    if (callSet == "") {
                        that.frameTableGroup.switchTab('VariantsMessage');
                        return;
                    }
                    var opts = callSet.split(":");
                    var cross_name = opts[0];
                    var method = opts[1];
                    that.variant_filter_controls.setCallMethod(method);
                    that.frameTableGroup.switchTab(method);

                    //Build the query
                    var options = [];
                    options.push(SQL.WhereClause.CompareFixed('cross_name', '=', cross_name));
                    options.push(SQL.WhereClause.CompareFixed('method', '=', method));
                    //Region params
                    if (that.region_search.get('chrom') != '')
                        options.push(SQL.WhereClause.CompareFixed('chrom','=',that.region_search.get('chrom')));
                    if (that.region_search.get('start') != '')
                        options.push(SQL.WhereClause.CompareFixed('pos','>',that.region_search.get('start')));
                    if (that.region_search.get('stop') != '')
                        options.push(SQL.WhereClause.CompareFixed('pos','<',that.region_search.get('stop')));
                    //Type params
                    var snp = that.type_search.get('snp');
                    var indel = that.type_search.get('indel');
                    if (snp != indel) {
                        options.push(SQL.WhereClause.CompareFixed('snp','=', snp));
                        options.push(SQL.WhereClause.CompareFixed('indel','=', indel));
                    }

                    //Iterate over the filters model adding those that are checked
                    $.each(that.myPage.variant_filters.get(), function (filter, value) {
                        //We only care about a value if it is checked, unchecked means all are wanted, checked means we don't want!.
                        if (value &&
                            ($.inArray(method, CrossesMetaData.variant_filters[filter].call_methods) != -1)) {
                            options.push(SQL.WhereClause.CompareFixed(filter, '=', false))
                        }
                    });
                    var panelTable = that['table' + method].panelTable.myTable;
                    var thequery = SQL.WhereClause.AND(options);
                    panelTable.setQuery(thequery);
                    panelTable.reLoadTable();
                    that.setCurrentQuery(thequery);
                };

                that.createPanelAdvancedQuery = function () {

                    this.panelPopQuery = Framework.Form(this.frameQueryAdvanced);
                    var theForm = this.panelPopQuery;

                    var groupPop = Controls.CompoundVert();
                    groupPop.setLegend(resources.variantCallSet);
                    this.catVarQueryPopulationFreqType = Controls.Combo('VariantsQuery', { label: '',
                        states: CrossesMetaData.variants,
                        value: that.myPage.current_call_set.get('call_set')});
                    this.catVarQueryPopulationFreqType.variantContainer = this;
                    this.catVarQueryPopulationFreqType.bindToModel(that.myPage.current_call_set, 'call_set');
                    that.myPage.current_call_set.on({change: true}, $.proxy(that.changeFunction, that));


                    groupPop.addControl(this.catVarQueryPopulationFreqType);
                    theForm.addControl(groupPop);

                    //Genome region controls
                    this.region_search = Model({chrom: CrossesMetaData.chromosomes[0].id, start: '', stop: ''});
                    this.region_ctrls = theForm.addControl(Controls.CompoundVert())
                        .setLegend(resources.genomeSearchOptions);
                    this.region_ctrls.addControl(
                        Controls.Combo('SearchRegionChromosome', { label: resources.genomeSearchChromosome, states: CrossesMetaData.chromosomes }))
                        .bindToModel(this.region_search, 'chrom');
                    this.region_ctrls.addControl(
                        Controls.Edit('SearchRegionStart', { label: resources.genomeSearchStart, size: 10 }))
                        .bindToModel(this.region_search, 'start');
                    this.region_ctrls.addControl(
                        Controls.Edit('SearchRegionEnd', { label: resources.genomeSearchEnd, size: 10 }))
                        .bindToModel(this.region_search, 'stop');
                    this.region_ctrls.addControl(
                        Controls.Button('Search', { content: resources.genomeSearch, width: 50 }))
                            .setOnChanged(function (id) {
                                that.changeFunction();
                            });

                    //Variant type controls
                    this.type_search = Model({snp: true, indel: true});
                    this.type_ctrls = theForm.addControl(Controls.CompoundHor())
                        .setLegend(resources.variantTypeOptions);
                    this.type_ctrls.addControl(
                        Controls.Check('SearchSNP', {label: 'Snp', value: true, hint: 'Show all SNPs'}))
                        .bindToModel(this.type_search, 'snp');
                    this.type_ctrls.addControl(
                        Controls.Check('SearchInDel', {label: 'InDel', value: true, hint: 'Show all InDels'}))
                        .bindToModel(this.type_search, 'indel');
                    this.type_search.on({change: true}, this.changeFunction);

                    var pane = Controls.CompoundVert();
                    pane.setLegend(resources.variant_filters);
                    that.variant_filter_controls = VariantFilters(CrossesMetaData.variant_filters, that.myPage.variant_filters);
                    pane.addControl(that.variant_filter_controls.grid);
                    theForm.addControl(pane);
                    that.myPage.variant_filters.on({change: true}, that.changeFunction);
                    theForm.render();
                };


                //Call this function to activate the catalog of variation panel
                that.activateState = function () {
                    enableHomeButton();
                    var tabswitched = that.myPage.frameVariants.makeVisible();
                    setTimeout(function () {
                        that.tablecortex.panelTable.handleResize(); //force immediate calculation of size
                        that.tablegatk.panelTable.handleResize(); //force immediate calculation of size
                    }, 50);
                };

                return that;
            }

        };


        return VariantsModule;
    });


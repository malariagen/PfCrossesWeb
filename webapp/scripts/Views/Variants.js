define(["require", "DQX/Utils", "DQX/Framework", "DQX/SQL", "DQX/Msg", "DQX/Controls", "DQX/Model",
    "CrossesMetaData", "TableCortex", "TableGATK", "VariantFilters",
    "i18n!nls/PfCrossesWebResources"],
    function (require, DQX, Framework, SQL, Msg, Controls, Model,
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
                    this.tablecortex.myView = that;
                    this.tablegatk.myView = that;
                    this.createPanelAdvancedQuery();
                    //Run the change func to load first data
                    this.changeFunction();
                    this.frameMessage.setContentHtml(resources.select_call_set);
                };

                that.createFramework = function () {
                    this.currentQuery = null;
                    //                   this.myFrame.setSeparatorSize(bigSeparatorSize);
                    this.frameLeftGroup = this.getFrame().addMemberFrame(Framework.FrameGroupVert('VariantsQueries', 0.4)).setSeparatorSize(4);
                    this.frameLeftGroup.InsertIntroBox(null/*'datagrid2.png'*/, resources.variantsHelp);
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
                    require("Common").addToolGene("GeneVariantList", "Variants for this gene", "Icons/Medium/VariantCatalogue.png", function(args) {
                        that.jumpGene(args);
                    });
                    require("Common").addToolSNP("SNPVariantList", "Show variant in catalogue", "Icons/Medium/VariantCatalogue.png", function(args) {
                        that.jumpGene({chromid: args.chromoID, start: args.position-1, stop: args.position+1});
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


                that.getMethod = function() {
                    var callSet = that.myPage.current_call_set.get('call_set');
                    if (callSet == "") return '';
                    var opts = callSet.split(":");
                    var cross_name = opts[0];
                    var method = opts[1];
                    return method;
                }

                //Call this function to invalidate the current table content
                that.invalidateQuery = function () {
                    var method = that.getMethod();
                    if (!method) return;
                    var panelTable = that['table' + method].panelTable.myTable;
                    panelTable.invalidate();
                    this.setCurrentQuery(null);
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
                    options.push(SQL.WhereClause.CompareFixed(CrossesMetaData.fieldCrossName, '=', cross_name));
                    options.push(SQL.WhereClause.CompareFixed('method', '=', method));
                    //Region params
                    if ((that.region_search.get('chrom') != '') && (that.region_search.get('chrom') != 'all') ) {
                            options.push(SQL.WhereClause.CompareFixed('chrom','=',that.region_search.get('chrom')));
                        if (that.region_search.get('start') != '')
                            options.push(SQL.WhereClause.CompareFixed('pos','>',that.region_search.get('start')));
                        if (that.region_search.get('stop') != '')
                            options.push(SQL.WhereClause.CompareFixed('pos','<',that.region_search.get('stop')));
                    }
                    //Type params
                    var snp = that.myPage.type_search.get('snp');
                    var indel = that.myPage.type_search.get('indel');
                    if (snp != indel) {
                        if (snp)
                            options.push(SQL.WhereClause.CompareFixed('indel','=', 0));
                        if (indel)
                            options.push(SQL.WhereClause.CompareFixed('indel','=', 1));
                    }
                    if (!snp &&  !indel)
                        options.push(SQL.WhereClause.CompareFixed('indel','=', -1));

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

                    this.panelPopQuery = Framework.Form(this.frameQueryAdvanced).setPadding(6);
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

                    var chromoPickerList = [{id:'all', name:'All'}];
                    $.each(CrossesMetaData.chromosomes, function(idx, chromoInfo) {
                        chromoPickerList.push(chromoInfo);
                    });


                    //Genome region controls
                    this.region_search = Model({chrom: 'all', start: '', stop: ''});
                    this.region_ctrls = theForm.addControl(Controls.CompoundVert())
                        .setLegend(resources.genomeSearchOptions);
                    this.region_ctrls.addControl(
                        Controls.Combo('SearchRegionChromosome', { label: resources.genomeSearchChromosome+':', states: chromoPickerList }))
                        .bindToModel(this.region_search, 'chrom');
                    var ctrl_regionStart =
                        Controls.Edit('SearchRegionStart', { label: resources.genomeSearchStart+':', size: 10 })
                        .bindToModel(this.region_search, 'start');
                    var ctrl_regionEnd =
                        Controls.Edit('SearchRegionEnd', { label: resources.genomeSearchEnd+':', size: 10 })
                        .bindToModel(this.region_search, 'stop');

                    this.region_ctrls.addControl(Controls.CompoundHor([ctrl_regionStart, Controls.HorizontalSeparator(10), ctrl_regionEnd]));

                    var buttons = this.region_ctrls.addControl(Controls.CompoundHor());
                    buttons.addControl(
                        Controls.Button('Search', { content: resources.genomeSearch }))
                            .setOnChanged(function (id) {
                                that.changeFunction();
                            });
                    buttons.addControl(
                        Controls.Button('Clear', { content: resources.genomeSearchClear, width: 50 }))
                            .setOnChanged(function (id) {
                                that.region_search.set({'chrom':'all', 'start': '', 'stop':''});
                                that.changeFunction();
                        });

                    ctrl_regionStart.modifyEnabled(false);
                    ctrl_regionEnd.modifyEnabled(false);
                    this.region_search.on({change: true}, function() {
                        var allChromosomes = that.region_search.get('chrom')=='all';
                        ctrl_regionStart.modifyEnabled(!allChromosomes);
                        ctrl_regionEnd.modifyEnabled(!allChromosomes);
                        that.invalidateQuery();
                    });


                    //Variant type controls
                    this.type_ctrls = theForm.addControl(Controls.CompoundHor())
                        .setLegend(resources.variantTypeOptions);
                    this.type_ctrls.addControl(
                        Controls.Check('SearchSNP', {label: 'SNP', value: true, hint: 'Show all SNPs'}))
                        .bindToModel(that.myPage.type_search, 'snp');
                    this.type_ctrls.addControl(
                        Controls.Check('SearchIndel', {label: 'Indel', value: true, hint: 'Show all Indels'}))
                        .bindToModel(that.myPage.type_search, 'indel');
                    that.myPage.type_search.on({ change: true }, this.changeFunction);

                    var pane = Controls.CompoundVert();
                    pane.setLegend(resources.variant_filters);
                    that.variant_filter_controls = VariantFilters(CrossesMetaData.variant_filters, that.myPage.variant_filters);
                    pane.addControl(that.variant_filter_controls.getControl());
                    theForm.addControl(pane);
                    that.myPage.variant_filters.on({change: true}, that.changeFunction);
                    theForm.render();

                    that.myPage.promptCallSetIfRequired();
                };


                //Call this function to activate the catalog of variation panel
                that.activateState = function () {
                    //enableHomeButton();
                    var tabswitched = that.myPage.frameVariants.makeVisible();
                    setTimeout(function () {
                        that.tablecortex.panelTable.handleResize(); //force immediate calculation of size
                        that.tablegatk.panelTable.handleResize(); //force immediate calculation of size
                    }, 50);
                };

                //Call this function to activate the variant catalog panel, and show SNPs for a specific gene
                that.jumpGene = function(params) {
                    DQX.requireMember(params,"chromid");
                    DQX.requireMember(params,"start");
                    DQX.requireMember(params,"stop");
                    this.activateState();
                    this.frameLeftGroup.makeVisible();
                    this.region_search.set('chrom', params.chromid);
                    this.region_search.set('start', params.start);
                    this.region_search.set('stop', params.stop);
                    this.changeFunction();
                };
                return that;
            }

        };


        return VariantsModule;
    });


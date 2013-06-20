
define(["require", "DQX/Framework", "DQX/Controls", "DQX/PopupFrame", "DQX/Msg", "DQX/DocEl",
"DQX/Utils", "DQX/FrameList", "DQX/ChannelPlot/GenomePlotter", "DQX/ChannelPlot/ChannelSequence",
"DQX/ChannelPlot/ChannelSnps2", "DQX/DataFetcher/DataFetcherFile", "Page", "CrossesMetaData", "VariantFilters", "SnpCallPopup"],
    function (require, Framework, Controls, PopupFrame, Msg, DocEl, DQX, FrameList, GenomePlotter, ChannelSequence,
              ChannelSnps, DataFetcherFile, Page, CrossesMetaData, VariantFilters, SnpCallPopup) {

        var BrowserModule = {

            Instance: function (iPage, iFrame) {
                iFrame._tmp = 123;
                var that = Framework.ViewSet(iFrame, 'genome');
                that.myPage = iPage;
                that.registerView();
                that.refVersion = 3;
                that.dataLocation = "SnpDataCross2";


                that.createFramework = function () {
                    this.frameLeft = that.getFrame().addMemberFrame(Framework.FrameGroupVert('settings', 0.3))
                        .setMargins(0).setMinSize(Framework.dimX, 380);
                    this.frameControls = this.frameLeft.addMemberFrame(Framework.FrameFinal('settings', 0.7))
                        .setMargins(5).setDisplayTitle('Settings').setFixedSize(Framework.dimX, 380);
                    this.frameDetails = this.frameLeft.addMemberFrame(Framework.FrameFinal('details', 0.4))
                        .setMargins(5).setDisplayTitle('Details').setFixedSize(Framework.dimX, 380);
                    this.frameBrowser = that.getFrame().addMemberFrame(Framework.FrameFinal('browserPanel', 0.7))
                        .setMargins(0).setDisplayTitle('Browser');
                    Msg.listen("", { type: 'JumpgenomeRegionGenotypeBrowser' }, $.proxy(this.onJumpGenomeRegion, this));

                    require("Common").addToolGene("GeneOnGenotypes", "Browse genotypes", "Icons/Medium/GenotypeBrowser.png", function (args) {
                        that.jumpGene(args);
                    });

                };
                that.createPanels = function () {

                    this.createControls();

                    var browserConfig = {
                        leftWidth: 230,
                        serverURL: serverUrl,
                        chromnrfield: 'chromid',
                        viewID: 'GenotypeBrowser',
                        database: CrossesMetaData.database
                    };

                    if (this.refVersion == 2)
                        browserConfig.annotTableName = 'pfannot';
                    if (this.refVersion == 3)
                        browserConfig.annotTableName = 'pf3annot';

                    this.panelBrowser = GenomePlotter.Panel(this.frameBrowser, browserConfig);

                    if (this.refVersion == 2)
                        this.panelBrowser.getAnnotationFetcher().setFeatureType('gene', 'exon');
                    if (this.refVersion == 3)
                        this.panelBrowser.getAnnotationFetcher().setFeatureType('gene', 'CDS');

                    this.panelBrowser.getAnnotationChannel().setMinDrawZoomFactX(0.005);

                    this.panelBrowser.MaxZoomFactX = 1.0 / 0.2;
                    this.panelBrowser.getNavigator().setMinScrollSize(0.0001);

                    SeqChannel = ChannelSequence.Channel(serverUrl, 'Tracks-Cross/Sequence', 'Summ01', true);
                    this.panelBrowser.addChannel(SeqChannel, true);


                    //Create snp view channel
                    this.SnpChannel = ChannelSnps.Channel('snps1', serverUrl);
                    this.SnpChannel.setTitle('Snps1');
                    this.SnpChannel.setHeight(400);
                    this.SnpChannel.setAutoFillHeight();
                    this.panelBrowser.addChannel(this.SnpChannel, true);

                    //Initialise some settings
                    that.SnpChannel.filter.showSNPs = that.myPage.type_search.get('snp');
                    that.SnpChannel.filter.showINDELs = that.myPage.type_search.get('indel');


                    //Define the chromosomes
                    $.each(CrossesMetaData.chromosomes, function (idx, chromo) {
                        that.panelBrowser.addChromosome(chromo.id, chromo.id, chromo.len + 0.01);
                    });


                    //Set some default properties
                    that.SnpChannel.fillBlocks = true;
                    that.SnpChannel.colorByParent = true;
                    that.SnpChannel.allowSmallBlocks = true;

                    //details panel
                    var frameDetails = Framework.Form(this.frameDetails);
                    this.details = frameDetails.addControl(Controls.Html('details', ''));
                    frameDetails.render();
                    Msg.listen('', { type: 'SnpInfoChanged', id: this.SnpChannel.getID() }, function (scope, content) {
                        that.details.modifyValue(content);
                    });
                    Msg.listen('', { type: 'SnpClicked', id: this.SnpChannel.getID() }, function (scope, content) {
                        var callSetID = that.myPage.current_call_set.get('call_set');
                        var vcf = CrossesMetaData.variantsMap[callSetID].vcf;
                        if (vcf&&content.seq) {
                            SnpCallPopup.create(callSetID,that.dataLocation,vcf,content.snp,content.seq,content.chrom)
                        }
                    });

                    //Causes the browser to start with a start region
                    this.panelBrowser.setPostInitialiseHandler(function () {
                        that.panelBrowser.showRegion(that.panelBrowser.getChromoID(1), 200000, 100000);
                    });

                };

                that.changeDataSource = function () {
                    var variantSetID = that.myPage.current_call_set.get('call_set');
                    if (variantSetID.length == 0) {
                        this.SnpChannel.setDataSource("");
                        that.panelBrowser.render();
                    }
                    else {
                        var dataSourceID = CrossesMetaData.variantsMap[variantSetID].dataSourceSNP;
                        this.currentCallMethod = dataSourceID.split('_')[0].toLowerCase();
                        that.variant_filter_controls.setCallMethod(that.currentCallMethod);
                        //This callback assures that the correct filters will be (des)activated
                        this.SnpChannel._CallBackFirstDataFetch = function () {
                            $.each(that.myPage.variant_filters.get(), function (filter, value) {
                                if ($.inArray(that.currentCallMethod, CrossesMetaData.variant_filters[filter].call_methods) != -1) {
                                    that.SnpChannel.myDataFetcher.setFilterActive(filter, value);
                                }
                            });
                        };
                        //Switch the data source for the SNP data
                        this.SnpChannel.setDataSource(that.dataLocation + '/' + dataSourceID);
                    }
                }

                that.createControls = function () {
                    this.panelControls = Framework.Form(this.frameControls);

                    var group1 = this.panelControls.addControl(Controls.CompoundVert());

                    this.callSetControl = Controls.Combo('', { label: 'Call set',
                        states: CrossesMetaData.variants,
                        value: that.myPage.current_call_set.get('call_set')
                    });
                    this.callSetControl.bindToModel(that.myPage.current_call_set, 'call_set');
                    that.myPage.current_call_set.on({ change: true }, $.proxy(that.changeDataSource, that));
                    group1.addControl(this.callSetControl);

                    this.groupVariantFilterControls = group1.addControl(Controls.CompoundVert()).setLegend('Variant VCF filters (check to exclude)');
                    this.groupVariantOtherFilterControls = group1.addControl(Controls.CompoundVert()).setLegend('Other Variant filters');
                    this.groupCallFilterControls = group1.addControl(Controls.CompoundVert()).setLegend('Call filters');
                    this.groupDispSettingsControls = group1.addControl(Controls.CompoundVert()).setLegend('Display settings');

                    that.variant_filter_controls = VariantFilters(CrossesMetaData.variant_filters, that.myPage.variant_filters);
                    that.groupVariantFilterControls.addControl(that.variant_filter_controls.grid);

                    that.myPage.variant_filters.on({ change: true }, function () {
                        //Context is new model
                        $.each(this.attributes, function (filter, value) {
                            if ($.inArray(that.currentCallMethod, CrossesMetaData.variant_filters[filter].call_methods) != -1) {
                                that.SnpChannel.myDataFetcher.setFilterActive(filter, value);
                            }
                        });
                        that.panelBrowser.render();
                    });

                    this.groupDispSettingsControls.addControl(Controls.Check('CtrlMagnif', { label: 'Show magnifying glass' })).setOnChanged(function (id, ctrl) {
                        that.SnpChannel.useMagnifyingGlass = ctrl.getValue();
                        that.panelBrowser.render();
                    });
                    this.groupDispSettingsControls.addControl(Controls.Check('CtrlEquiDistant', { label: 'Equidistant blocks', value: true })).setOnChanged(function (id, ctrl) {
                        that.SnpChannel.fillBlocks = ctrl.getValue();
                        that.panelBrowser.render();
                    });
                    this.groupDispSettingsControls.addControl(Controls.Check('CtrlSmallBlocks', { label: 'Allow subsampled SNP display', value: true })).setOnChanged(function (id, ctrl) {
                        that.SnpChannel.allowSmallBlocks = ctrl.getValue();
                        that.panelBrowser.render();
                    });

                    this.groupDispSettingsControls.addControl(Controls.Check('CtrlShowInheritance', { label: 'Show inheritance', value: true })).setOnChanged(function (id, ctrl) {
                        that.SnpChannel.colorByParent = ctrl.getValue();
                        that.panelBrowser.render();
                    });
                    this.groupDispSettingsControls.addControl(Controls.Button('CtrlSortParents', { content: 'Sort by parents' })).setOnChanged(function (id, ctrl) {
                        that.SnpChannel.sortByParents();
                    });

                    //Control inclusion of SNPS and INDELS in view
                    var ctrlShowSNPs = Controls.Check('', { label: 'Show SNPs', value: true });
                    ctrlShowSNPs.bindToModel(that.myPage.type_search, 'snp');
                    var ctrlShowINDELs = Controls.Check('', { label: 'Show INDELs', value: true });
                    ctrlShowINDELs.bindToModel(that.myPage.type_search, 'indel');
                    this.groupVariantOtherFilterControls.addControl(Controls.CompoundHor([ctrlShowSNPs, Controls.HorizontalSeparator(8), ctrlShowINDELs]));

                    var ctrlHideNonSegregating = Controls.Check('', { label: 'Hide non-segregating variants', value: true });
                    ctrlHideNonSegregating.setOnChanged(function () {
                        that.SnpChannel.filter.hideNonSegregating = ctrlHideNonSegregating.getValue();
                        that.panelBrowser.render();
                    });
                    this.groupVariantOtherFilterControls.addControl(ctrlHideNonSegregating);

                    var ctrlHideMissingParentCalls = Controls.Check('', { label: 'Parent calls not missing', value: true });
                    ctrlHideMissingParentCalls.setOnChanged(function () {
                        that.SnpChannel.filter.requireParentsPresent = ctrlHideMissingParentCalls.getValue();
                        that.panelBrowser.render();
                    });
                    this.groupVariantOtherFilterControls.addControl(ctrlHideMissingParentCalls);

                    that.myPage.type_search.on({ change: true }, function () {
                        that.SnpChannel.filter.showSNPs = that.myPage.type_search.get('snp');
                        that.SnpChannel.filter.showINDELs = that.myPage.type_search.get('indel');
                        that.panelBrowser.render();
                    });


                    var sliderWidth = 300;

                    //Some slider-type per-variant filters
                    that.groupVariantOtherFilterControls.addControl(Controls.VerticalSeparator(10));
                    that.groupVariantOtherFilterControls.addControl(Controls.ValueSlider('CtrlPresence', { label: 'Min. % presence on samples', width: sliderWidth, minval: 0, maxval: 100, startval: 0, digits: 0 })).setOnChanged(function (id, ctrl) {
                        that.SnpChannel.setMinPresence(ctrl.getValue());
                    });

                    var modifyVisible_Cortex = function (control) {
                        var callset = that.myPage.current_call_set.get('call_set');
                        control.setVisible(callset.indexOf('cortex') > 0);
                    }

                    var modifyVisible_GATK = function (control) {
                        var callset = that.myPage.current_call_set.get('call_set');
                        control.setVisible(callset.indexOf('gatk') > 0);
                    }

                    //Per-variant value filters specific for Cortex
                    var ctrl_Variant_SITE_CONF = Controls.ValueSlider('CtrlVariantSITE_CONF', { label: 'Min. SITE_CONF', width: sliderWidth, minval: 0, maxval: 2000, value: 0, digits: 0, minIsNone: true }).setOnChanged(function (id, ctrl) {
                        that.SnpChannel.filter.setCustomVariantFilter('SITE_CONF','SITE_CONF', ctrl_Variant_SITE_CONF.getValue(), true, true)
                        that.panelBrowser.render();
                    });
                    var showHide_ctrl_Variant_SITE_CONF = Controls.ShowHide(ctrl_Variant_SITE_CONF);
                    modifyVisible_Cortex(showHide_ctrl_Variant_SITE_CONF);
                    that.myPage.current_call_set.on({ change: true }, function () {
                        modifyVisible_Cortex(showHide_ctrl_Variant_SITE_CONF);
                    });
                    that.groupVariantOtherFilterControls.addControl(showHide_ctrl_Variant_SITE_CONF);



                    //Per-variant value filters specific for GATK
                    var ctrl_Variant_VQSLODSNP = Controls.ValueSlider('CtrlVariantVQSLODSNP', { label: 'Min. VQSLOD (SNPs)', width: sliderWidth, minval: -5, maxval: 20, value: -5, digits: 1, minIsNone: true }).setOnChanged(function (id, ctrl) {
                        that.SnpChannel.filter.setCustomVariantFilter('VQSLOD_SNP','VQSLOD', ctrl_Variant_VQSLODSNP.getValue(), true, false)
                        that.panelBrowser.render();
                    });
                    var showHide_ctrl_Variant_VQSLODSNP = Controls.ShowHide(ctrl_Variant_VQSLODSNP);
                    modifyVisible_GATK(showHide_ctrl_Variant_VQSLODSNP);
                    that.myPage.current_call_set.on({ change: true }, function () {
                        modifyVisible_GATK(showHide_ctrl_Variant_VQSLODSNP);
                    });
                    that.groupVariantOtherFilterControls.addControl(showHide_ctrl_Variant_VQSLODSNP);

                    var ctrl_Variant_VQSLODINDEL = Controls.ValueSlider('CtrlVariantVQSLODINDEL', { label: 'Min. VQSLOD (INDELs)', width: sliderWidth, minval: -5, maxval: 20, value: -5, digits: 1, minIsNone: true }).setOnChanged(function (id, ctrl) {
                        that.SnpChannel.filter.setCustomVariantFilter('VQSLOD_INDEL','VQSLOD', ctrl_Variant_VQSLODINDEL.getValue(), false, true)
                        that.panelBrowser.render();
                    });
                    var showHide_ctrl_Variant_VQSLODINDEL = Controls.ShowHide(ctrl_Variant_VQSLODINDEL);
                    modifyVisible_GATK(showHide_ctrl_Variant_VQSLODINDEL);
                    that.myPage.current_call_set.on({ change: true }, function () {
                        modifyVisible_GATK(showHide_ctrl_Variant_VQSLODINDEL);
                    });
                    that.groupVariantOtherFilterControls.addControl(showHide_ctrl_Variant_VQSLODINDEL);



                    //Per-call filters for both
                    var ctrl_Call_COV = Controls.ValueSlider('CtrlCallCOV', { label: 'Min. Coverage', width: sliderWidth, minval: 0, maxval: 200, value: 0, digits: 0, minIsNone: true }).setOnChanged(function (id, ctrl) {
                        that.SnpChannel.filter.setCustomCallFilter('DP', 'DP', ctrl_Call_COV.getValue(), true, true)
                        that.panelBrowser.render();
                    });
                    var showHide_ctrl_Call_COV = Controls.ShowHide(ctrl_Call_COV);
                    that.groupCallFilterControls.addControl(showHide_ctrl_Call_COV);



                    //Per-call filters specific for GATK
                    var ctrl_Call_GQ = Controls.ValueSlider('CtrlCallGQ', { label: 'Min. GQ', width: sliderWidth, minval: 0, maxval: 101, value: 0, digits: 0, minIsNone: true }).setOnChanged(function (id, ctrl) {
                        that.SnpChannel.filter.setCustomCallFilter('GQ', 'GQ', ctrl_Call_GQ.getValue(), true, true)
                        that.panelBrowser.render();
                    });
                    var showHide_ctrl_Call_GQ = Controls.ShowHide(ctrl_Call_GQ);
                    modifyVisible_GATK(showHide_ctrl_Call_GQ);
                    that.myPage.current_call_set.on({ change: true }, function () {
                        modifyVisible_GATK(showHide_ctrl_Call_GQ);
                    });
                    that.groupCallFilterControls.addControl(showHide_ctrl_Call_GQ);


                    //Per-call filters specific for Cortex
                    var ctrl_Call_GT_CONF = Controls.ValueSlider('CtrlCallGT_CONF', { label: 'Min. GT_CONF', width: sliderWidth, minval: 0, maxval: 1000, value: 0, digits: 0, minIsNone: true }).setOnChanged(function (id, ctrl) {
                        that.SnpChannel.filter.setCustomCallFilter('GT_CONF', 'GT_CONF', ctrl_Call_GT_CONF.getValue(), true, true)
                        that.panelBrowser.render();
                    });
                    var showHide_ctrl_Call_GT_CONF = Controls.ShowHide(ctrl_Call_GT_CONF);
                    modifyVisible_Cortex(showHide_ctrl_Call_GT_CONF);
                    that.myPage.current_call_set.on({ change: true }, function () {
                        modifyVisible_Cortex(showHide_ctrl_Call_GT_CONF);
                    });
                    that.groupCallFilterControls.addControl(showHide_ctrl_Call_GT_CONF);



                    that.groupDispSettingsControls.addControl(Controls.VerticalSeparator(10));
                    this.groupDispSettingsControls.addControl(Controls.ValueSlider('CtrlCoverage', { label: 'Coverage scale', width: sliderWidth, minval: 0, maxval: 200, value: 0, digits: 0 })).setOnChanged(function (id, ctrl) {
                        that.SnpChannel.setCoverageRange(ctrl.getValue());
                    });


                    this.panelControls.render();
                }



                //Call this function to jump to & highlight a specific region on the genome
                that.onJumpGenomeRegion = function (context, args) {
                    if ('chromoID' in args)
                        var chromoID = args.chromoID;
                    else {
                        DQX.assertPresence(args, 'chromNr');
                        var chromoID = that.panelBrowser.getChromoID(args.chromNr);
                    }
                    DQX.assertPresence(args, 'start'); DQX.assertPresence(args, 'end');
                    this.panelBrowser.highlightRegion(chromoID, (args.start + args.end) / 2, args.end - args.start);
                };


                that.activateState = function () {
                    var tabswitched = that.myPage.frameBrowser.makeVisible();
                    /*                    setTimeout(function () {
                    that.panelBrowser.handleResize(); //force immediate calculation of size
                    }, 50);*/
                };

                //Call this function to make the browser jump to a gene
                that.jumpGene = function (args) {
                    DQX.requireMember(args, 'chromid'); DQX.requireMember(args, 'start'); DQX.requireMember(args, 'stop');
                    this.activateState();
                    this.panelBrowser.highlightRegion(args.chromid, (args.start + args.stop) / 2, (args.stop - args.start));
                };


                return that;
            }

        };

        return BrowserModule;
    });
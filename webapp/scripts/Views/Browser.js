
define([DQXSCRQ(), DQXSC("Framework"), DQXSC("Controls"), DQXSC("Msg"), DQXSC("DocEl"), DQXSC("Utils"), DQXSC("FrameList"), DQXSC("ChannelPlot/GenomePlotter"), DQXSC("ChannelPlot/ChannelSequence"), DQXSC("ChannelPlot/ChannelSnps"), DQXSC("DataFetcher/DataFetcherFile")],
    function (require, Framework, Controls, Msg, DocEl, DQX, FrameList, GenomePlotter, ChannelSequence, ChannelSnps, DataFetcherFile) {

        var BrowserModule = {

            Instance: function (iPage, iFrame) {
                iFrame._tmp = 123;
                var that = Framework.ViewSet(iFrame, 'genome');
                that.myPage = iPage;
                that.registerView();
                that.refVersion = 3;
                that.dataLocation = "SnpDataCross";


                that.createFramework = function () {
                    this.frameLeft = that.getFrame().addMemberFrame(Framework.FrameGroupVert('settings', 0.01))
                        .setMargins(5).setDisplayTitle('settings group').setFixedSize(Framework.dimX, 380);
                    this.frameDataSource = this.frameLeft.addMemberFrame(Framework.FrameFinal('datasource', 0.15))
                        .setMargins(5).setDisplayTitle('Data source').setFixedSize(Framework.dimX, 380);
                    this.frameControls = this.frameLeft.addMemberFrame(Framework.FrameFinal('settings', 0.7))
                        .setMargins(5).setDisplayTitle('Settings').setFixedSize(Framework.dimX, 380);
                    this.frameDetails = this.frameLeft.addMemberFrame(Framework.FrameFinal('details', 0.4))
                        .setMargins(5).setDisplayTitle('Details').setFixedSize(Framework.dimX, 380);
                    this.frameBrowser = that.getFrame().addMemberFrame(Framework.FrameFinal('browserPanel', 0.7))
                        .setMargins(0).setDisplayTitle('Browser');
                    Msg.listen("", { type: 'JumpgenomeRegion' }, $.proxy(this.onJumpGenomeRegion, this));
                };

                that.createPanels = function () {
                    var browserConfig = {
                        serverURL: serverUrl,
                        chromnrfield: 'chromid'
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

                    //Create snp view channel
                    this.SnpChannel = ChannelSnps.Channel('snps1', serverUrl);
                    this.SnpChannel.setTitle('Snps1');
                    this.SnpChannel.setHeight(400);
                    this.SnpChannel.setAutoFillHeight();
                    this.panelBrowser.addChannel(this.SnpChannel, true);

                    if (this.refVersion == 2)
                        this.createChromosomesPFV2();
                    if (this.refVersion == 3)
                        this.createChromosomesPFV3();

                    this.createControls();

                    //data source picker
                    this.panelDataSource = FrameList(this.frameDataSource);
                    Msg.listen('', { type: 'SelectItem', id: this.panelDataSource.getID() }, $.proxy(this.changeDataSource, this));
                    this.getDataSources();

                    //details panel
                    var frameDetails = Framework.Form(this.frameDetails);
                    this.details = frameDetails.addControl(Controls.Html('details', ''));
                    frameDetails.render();
                    Msg.listen('', { type: 'SnpInfoChanged', id: this.SnpChannel.getID() }, function (scope, content) {
                        that.details.modifyValue(content);
                    });

                    //Causes the browser to start with a start region
                    this.panelBrowser.setPostInitialiseHandler(function () {
                        that.panelBrowser.showRegion(that.panelBrowser.getChromoID(1), 200000, 10000);
                    });

                    that.SnpChannel.setCallBackFirstDataFetch(function () {
                        $.each(that.SnpChannel.myDataFetcher._filters, function (idx, filter) {
                            that.groupFilterControls.addControl(Controls.Check('', { label: filter })).setOnChanged(function (id, ctrl) {
                                that.SnpChannel.myDataFetcher.setFilterActive(filter, ctrl.getValue());
                                that.panelBrowser.render();
                            });
                        });
                        /*                        setTimeout(function () {
                        that.panelControls.render();
                        }, 50);*/
                    });

                };

                that.getDataSources = function () {
                    DQX.setProcessing("Downloading...");
                    DataFetcherFile.getFile(serverUrl, that.dataLocation + "/SnpSets", $.proxy(this.handleGetDataSources, this));
                };

                that.handleGetDataSources = function (content) {
                    DQX.stopProcessing();
                    var rows = content.split('\n');
                    var it = [];
                    for (var i = 0; i < rows.length; i++)
                        if (rows[i])
                            it.push({
                                id: rows[i],
                                content: rows[i]
                            });
                    this.panelDataSource.setItems(it);
                    this.panelDataSource.render();
                    this.changeDataSource();
                };

                that.changeDataSource = function () {
                    this.SnpChannel.setDataSource(that.dataLocation + '/' + this.panelDataSource.getActiveItem());
                }

                that.createControls = function () {
                    this.panelControls = Framework.Form(this.frameControls);

                    var group1 = this.panelControls.addControl(Controls.CompoundVert());

                    this.groupFilterControls = group1.addControl(Controls.CompoundVert()).setLegend('Assembly quality filters');

                    this.groupDispSettingsControls = group1.addControl(Controls.CompoundVert()).setLegend('Display settings');

                    this.groupClientFilterControls = group1.addControl(Controls.CompoundVert()).setLegend('Threshold filters');


                    this.groupDispSettingsControls.addControl(Controls.Check('CtrlMagnif', { label: 'Show magnifying glass' })).setOnChanged(function (id, ctrl) {
                        that.SnpChannel.useMagnifyingGlass = ctrl.getValue();
                        that.panelBrowser.render();
                    });
                    this.groupDispSettingsControls.addControl(Controls.Check('CtrlEquiDistant', { label: 'Equidistant blocks' })).setOnChanged(function (id, ctrl) {
                        that.SnpChannel.fillBlocks = ctrl.getValue();
                        that.panelBrowser.render();
                    });
                    this.groupDispSettingsControls.addControl(Controls.Check('CtrlSmallBlocks', { label: 'Allow small blocks' })).setOnChanged(function (id, ctrl) {
                        that.SnpChannel.allowSmallBlocks = ctrl.getValue();
                        that.panelBrowser.render();
                    });

                    this.groupDispSettingsControls.addControl(Controls.Check('CtrlFilterVCF', { label: 'Filter by VCF data', value: false })).setOnChanged(function (id, ctrl) {
                        that.SnpChannel.filter.applyVCFFilter = ctrl.getValue();
                        that.panelBrowser.render();
                    });
                    this.groupDispSettingsControls.addControl(Controls.Check('CtrlHideFiltered', { label: 'Hide filtered SNPs', value: true })).setOnChanged(function (id, ctrl) {
                        that.SnpChannel.hideFiltered = ctrl.getValue();
                        that.panelBrowser.render();
                    });
                    this.groupDispSettingsControls.addControl(Controls.Check('CtrlRequireParents', { label: 'Require parents' })).setOnChanged(function (id, ctrl) {
                        that.SnpChannel.filter.requireParentsPresent = ctrl.getValue();
                        that.panelBrowser.render();
                    });
                    this.groupDispSettingsControls.addControl(Controls.Check('CtrlShowInheritance', { label: 'Show inheritance' })).setOnChanged(function (id, ctrl) {
                        that.SnpChannel.colorByParent = ctrl.getValue();
                        that.panelBrowser.render();
                    });
                    this.groupDispSettingsControls.addControl(Controls.Button('CtrlSortParents', { content: 'Sort by parents' })).setOnChanged(function (id, ctrl) {
                        that.SnpChannel.sortByParents();
                    });

                    var sliderWidth = 300;
                    this.groupClientFilterControls.addControl(Controls.ValueSlider('CtrlCoverage', { label: 'Coverage scale', width: sliderWidth, minval: 0, maxval: 200, value: 5, digits: 0 })).setOnChanged(function (id, ctrl) {
                        that.SnpChannel.setCoverageRange(ctrl.getValue());
                    });

                    this.groupClientFilterControls.addControl(Controls.ValueSlider('CtrlMinSNPCov', { label: 'Min. SNP coverage', width: sliderWidth, minval: 0, maxval: 200, startval: 0, digits: 0 })).setOnChanged(function (id, ctrl) {
                        that.SnpChannel.setMinSnpCoverage(ctrl.getValue());
                    });

                    this.groupClientFilterControls.addControl(Controls.ValueSlider('CtrlMinAvgCov', { label: 'Min. avg. coverage', width: sliderWidth, minval: 0, maxval: 200, startval: 0, digits: 0 })).setOnChanged(function (id, ctrl) {
                        that.SnpChannel.setMinAvgCoverage(ctrl.getValue());
                    });

                    this.groupClientFilterControls.addControl(Controls.ValueSlider('CtrlMinSnpPurity', { label: 'Min. SNP purity', width: sliderWidth, minval: 0, maxval: 1, startval: 0, digits: 2 })).setOnChanged(function (id, ctrl) {
                        that.SnpChannel.setMinSnpPurity(ctrl.getValue());
                    });

                    this.groupClientFilterControls.addControl(Controls.ValueSlider('CtrlMinAvgPurity', { label: 'Min. avg. purity', width: sliderWidth, minval: 0, maxval: 1, startval: 0, digits: 2 })).setOnChanged(function (id, ctrl) {
                        that.SnpChannel.setMinAvgPurity(ctrl.getValue());
                    });

                    this.groupClientFilterControls.addControl(Controls.ValueSlider('CtrlPresence', { label: 'Min. % presence on samples', width: sliderWidth, minval: 0, maxval: 100, startval: 0, digits: 0 })).setOnChanged(function (id, ctrl) {
                        that.SnpChannel.setMinPresence(ctrl.getValue());
                    });

                    this.panelControls.render();
                }


                that.createChromosomesPFV2 = function () {
                    //Define chromosomes for version 3 of the reference genome
                    var chromoids = ['Pf3D7_01', 'Pf3D7_02', 'Pf3D7_03', 'Pf3D7_04', 'Pf3D7_05', 'Pf3D7_06', 'Pf3D7_07', 'Pf3D7_08', 'Pf3D7_09', 'Pf3D7_10', 'Pf3D7_11', 'Pf3D7_12', 'Pf3D7_13', 'Pf3D7_14'];
                    var chromosizes = [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 4, 4, 4, 4];
                    for (var chromnr = 0; chromnr < chromoids.length; chromnr++) {
                        this.panelBrowser.addChromosome(chromoids[chromnr], chromoids[chromnr], chromosizes[chromnr]);
                    }
                    //Startup the browser with a start region
                    this.panelBrowser.showRegion("Pf3D7_01", 0, 100000);
                }

                that.createChromosomesPFV3 = function () {
                    //Define chromosomes for version 3 of the reference genome
                    var chromoids = ['Pf3D7_01', 'Pf3D7_02', 'Pf3D7_03', 'Pf3D7_04', 'Pf3D7_05', 'Pf3D7_06', 'Pf3D7_07', 'Pf3D7_08', 'Pf3D7_09', 'Pf3D7_10', 'Pf3D7_11', 'Pf3D7_12', 'Pf3D7_13', 'Pf3D7_14'];
                    var chromosizes = [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 4, 4, 4, 4];
                    for (var chromnr = 0; chromnr < chromoids.length; chromnr++) {
                        chromoids[chromnr] += '_v3';
                        this.panelBrowser.addChromosome(chromoids[chromnr], chromoids[chromnr], chromosizes[chromnr]);
                    }
                }


                //Call this function to jump to & highlight a specific region on the genome
                that.onJumpGenomeRegion = function (context, args) {
                    if ('chromoID' in args)
                        var chromoID = args.chromoID;
                    else {
                        DQX.assertPresence(args, 'chromNr');
                        var chromoID = this.panelBrowser.getChromoID(args.chromNr);
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


                return that;
            }

        };

        return BrowserModule;
    });
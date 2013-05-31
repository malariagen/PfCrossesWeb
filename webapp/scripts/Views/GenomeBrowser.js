﻿
define([DQXSCRQ(), DQXSC("Framework"), DQXSC("Controls"), DQXSC("Msg"), DQXSC("SQL"), DQXSC("DocEl"), DQXSC("Utils"), DQXSC("FrameTree"), DQXSC("FrameList"), DQXSC("ChannelPlot/GenomePlotter"), DQXSC("ChannelPlot/ChannelYVals"), DQXSC("ChannelPlot/ChannelSequence"), DQXSC("ChannelPlot/ChannelSnps"), DQXSC("DataFetcher/DataFetcherFile"), DQXSC("DataFetcher/DataFetchers"), DQXSC("DataFetcher/DataFetcherSummary"), "GenomeBrowserSNPChannel", "CrossesMetaData", "VariantFilters", "i18n!nls/PfCrossesWebResources.js"],
    function (require, Framework, Controls, Msg, SQL, DocEl, DQX, FrameTree, FrameList, GenomePlotter, ChannelYVals, ChannelSequence, ChannelSnps, DataFetcherFile, DataFetchers, DataFetcherSummary, GenomeBrowserSNPChannel, CrossesMetaData, VariantFilters, resources) {

        var GenomeBrowserModule = {

            Instance: function (iPage, iFrame) {
                iFrame._tmp = 123;
                var that = Framework.ViewSet(iFrame, 'genomebrowser');
                that.myPage = iPage;
                that.registerView();
                that.refVersion = 3;
                that.dataLocation = "SnpDataCross";


                that.createFramework = function () {

                    this.frameLeft = that.getFrame().addMemberFrame(Framework.FrameGroupVert('settings', 0.01))
                        .setMargins(0).setDisplayTitle('Visible channels').setMinSize(Framework.dimX, 430);

                    this.frameChannels = this.frameLeft.addMemberFrame(Framework.FrameFinal('channels', 0.7))
                        .setMargins(0).setFixedSize(Framework.dimX, 380);

                    this.frameFilters = this.frameLeft.addMemberFrame(Framework.FrameFinal('filters', 0.7))
                        .setMargins(0).setFixedSize(Framework.dimX, 380);

                    this.frameBrowser = that.getFrame().addMemberFrame(Framework.FrameFinal('browserPanel', 0.7))
                        .setMargins(0).setDisplayTitle('Browser');

                    Msg.listen("", { type: 'JumpgenomeRegionGenomeBrowser' }, $.proxy(this.onJumpGenomeRegion, this));

                    //Create the datafetcher that will obtain the summary profiles over the genome, such as coverage, mapping quality, etc.
                    this.dataFetcherProfiles = new DataFetcherSummary.Fetcher(serverUrl, 1, 600);


                };

                that.createPanels = function () {
                    var browserConfig = {
                        serverURL: serverUrl,
                        chromoIdField: 'chrom',
                        annotTableName: 'pf3annot',
                        viewID: 'GenomeBrowser',
                        database: CrossesMetaData.database
                    };

                    this.panelBrowser = GenomePlotter.Panel(this.frameBrowser, browserConfig);
                    this.panelBrowser.getAnnotationFetcher().setFeatureType('gene', 'CDS');
                    this.panelBrowser.getAnnotationChannel().setMinDrawZoomFactX(0.005);
                    this.panelBrowser.MaxZoomFactX = 1.0 / 0.2;
                    this.panelBrowser.getNavigator().setMinScrollSize(0.0001);

                    SeqChannel = ChannelSequence.Channel(serverUrl, 'Tracks-Cross/Sequence', 'Summ01',true);
                    this.panelBrowser.addChannel(SeqChannel, true);


                    this.createChromosomesPFV3();

                    this.createChannelVisibilityControls();
                    this.createControls();
                    this.createSNPChannels();

                    //Initialise the summary profiles
                    this.panelBrowser.addDataFetcher(this.dataFetcherProfiles);
                    this.createSummaryChannels();

                    this.treeChannels.render();

                    //Causes the browser to start with a start region
                    var firstChromosome = CrossesMetaData.chromosomes[0].id;
                    this.panelBrowser.setChromosome(firstChromosome, true, false);
                    this.panelBrowser.setPostInitialiseHandler(function () {
                        that.panelBrowser.showRegion(that.panelBrowser.getChromoID(1), 200000, 10000);
                    });

                };


                that.createChannelVisibilityControls = function () {
                    this.treeChannels = FrameTree.Tree(this.frameChannels);
                    this.branchChannelsProfiles = this.treeChannels.root;
                }

                that.createControls = function () {

                    this.formFilters = Framework.Form(this.frameFilters);
                    var pane = Controls.CompoundVert();
                    pane.setLegend(resources.variant_filters);
                    that.variant_filter_controls = VariantFilters(CrossesMetaData.variant_filters, that.myPage.variant_filters);
                    pane.addControl(that.variant_filter_controls.grid);
                    this.formFilters.addControl(pane);
                    that.formFilters.render();
                    that.myPage.variant_filters.on({ change: true }, function () {
                        $.each(that.callSetViewers, function (idx, callSetViewer) {
                            that.updateCallSetViewerQuery(callSetViewer);
                        });
                        that.panelBrowser.render();
                    });
                }

                //Create the channels that show information for each individual SNP
                that.createSNPChannels = function () {
                    var channelValues = [];

                    var callsetList = [
                        { Id: '3d7_hb3', callMethod: 'gatk' },
                        { Id: '3d7_hb3', callMethod: 'cortex' },
                        { Id: '7g8_gb4', callMethod: 'gatk' },
                        { Id: '7g8_gb4', callMethod: 'cortex' },
                        { Id: 'hb3_dd2', callMethod: 'gatk' },
                        { Id: 'hb3_dd2', callMethod: 'cortex' }
                        ];

                    this.callSetViewers = [];
                    $.each(callsetList, function (idx, callSet) {
                        var callSetViewer = { Id: callSet.Id, callMethod: callSet.callMethod };
                        callSetViewer.dataFetcherSNPs = new DataFetchers.Curve(serverUrl, CrossesMetaData.database, CrossesMetaData.tableVariants, 'pos');
                        that.updateCallSetViewerQuery(callSetViewer);
                        that.panelBrowser.addDataFetcher(callSetViewer.dataFetcherSNPs);
                        callSetViewer.dataFetcherSNPs.addFetchColumn("id", "Int");
                        callSetViewer.dataFetcherSNPs.activateFetchColumn("id");
                        that.channelSNPs = GenomeBrowserSNPChannel.SNPChannel(callSetViewer.dataFetcherSNPs, callSet.Id + '_' + callSet.callMethod);
                        that.panelBrowser.addChannel(that.channelSNPs, false);
                        that.callSetViewers.push(callSetViewer);
                    });
                };

                //modifies the visibility status of a channel, prodived its id
                that.channelModifyVisibility = function (id, status) {
                    var channel = this.panelBrowser.findChannelRequired(id);
                    for (var compid in channel.myComponents)
                        channel.modifyComponentActiveStatus(compid, status);
                    this.panelBrowser.channelModifyVisibility(id, status);
                };

                //Create the channels that provide summary information about the genome (coverage, %gc, etc...)
                that.createSummaryChannels = function () {

                    //A helper function that creates an individual summary channel
                    function createSummaryChannel(info) {
                        var ID = info.id;
                        var mydatafetcher_loc = that.dataFetcherProfiles;
                        var minval = 0;
                        if ('minval' in info)
                            minval = info.minval;
                        var SummChannel = ChannelYVals.Channel(info.id, { minVal: minval, maxVal: info.maxval });
                        SummChannel.setTitle(info.title);
                        SummChannel.setHeight(120, true);
                        that.panelBrowser.addChannel(SummChannel);
                        if (('alertZoneMin' in info) || ('alertZoneMax' in info)) {//create alert zone
                            SummChannel.addComponent(ChannelYVals.YColorZone(ID + "_alert", info.alertZoneMin, info.alertZoneMax, DQX.Color(1.0, 0.5, 0, 0.15)));
                        }

                        if (info.hasStdev) {
                            var colinfo_min = mydatafetcher_loc.addFetchColumn(info.folder, info.config, ID + "Q05_min", DQX.Color(1, 0, 0));
                            var colinfo_max = mydatafetcher_loc.addFetchColumn(info.folder, info.config, ID + "Q95_max", DQX.Color(1, 0, 0));
                            SummChannel.addComponent(ChannelYVals.YRange(ID + "_minmax2", mydatafetcher_loc, colinfo_min.myID, colinfo_max.myID, DQX.Color(0.3, 0.3, 0.7, 0.25)));

                            var colinfo_min = mydatafetcher_loc.addFetchColumn(info.folder, info.config, ID + "Q25_min", DQX.Color(1, 0, 0));
                            var colinfo_max = mydatafetcher_loc.addFetchColumn(info.folder, info.config, ID + "Q75_max", DQX.Color(1, 0, 0));
                            SummChannel.addComponent(ChannelYVals.YRange(ID + "_minmax", mydatafetcher_loc, colinfo_min.myID, colinfo_max.myID, DQX.Color(0.2, 0.2, 0.5, 0.4)));

                            var IDCentral = ID + "Q50_avg";
                        }
                        else {
                            var colinfo_min = mydatafetcher_loc.addFetchColumn(info.folder, info.config, ID + "_min", DQX.Color(1, 0, 0));
                            var colinfo_max = mydatafetcher_loc.addFetchColumn(info.folder, info.config, ID + "_max", DQX.Color(1, 0, 0));
                            SummChannel.addComponent(ChannelYVals.YRange(ID + "_minmax", mydatafetcher_loc, colinfo_min.myID, colinfo_max.myID, DQX.Color(0.3, 0.3, 0.7, 0.25)));

                            var IDCentral = ID + "_avg";
                        }

                        var colinfo_avg = mydatafetcher_loc.addFetchColumn(info.folder, info.config, IDCentral);
                        var comp = SummChannel.addComponent(ChannelYVals.Comp(ID + "_avg", mydatafetcher_loc, colinfo_avg.myID));
                        comp.setColor(DQX.Color(0, 0, 0.5));
                        comp.myPlotHints.makeDrawLines(3000000.0); //This causes the points to be connected with lines
                        comp.myPlotHints.interruptLineAtAbsent = true;
                        comp.myPlotHints.drawPoints = false;
                        if (info.active) {
                            if (info.hasStdev)
                                SummChannel.modifyComponentActiveStatus(ID + "_minmax2", true, false);
                            SummChannel.modifyComponentActiveStatus(ID + "_minmax", true, false);
                            SummChannel.modifyComponentActiveStatus(ID + "_avg", true, false);
                        }
                        else
                            that.panelBrowser.channelModifyVisibility(SummChannel.getID(), false);
                        //Create the visibility control
                        var chk = Controls.Check('ChannelControl' + info.id, { label: '<b>' + info.title + '</b>', value: info.active });
                        that.branchChannelsProfiles.addItem(FrameTree.Control(Controls.CompoundHor([chk, Controls.Static('&nbsp;&nbsp;')])));
                        chk.setOnChanged(function () {
                            that.channelModifyVisibility(info.id, chk.getValue());
                        });
                        return SummChannel;
                    }

                    //Create the generic summary channels
                    var cha = createSummaryChannel({ config: 'Summ01', folder: 'Tracks-Cross/GC300', id: 'GC300', title: '[@channelPercentGC]', hasStdev: false, maxval: 60, active: true, alertZoneMin: 0, alertZoneMax: 15 });
                    cha.setChangeYScale(true, true);
                    var cha = createSummaryChannel({ config: 'Summ01', folder: 'Tracks-Cross/Uniqueness', id: 'Uniqueness', title: '[@ChannelNonuniqueness]', hasStdev: false, maxval: 75, active: true, alertZoneMin: 26, alertZoneMax: 199 });
                    cha.setChangeYScale(false, true);

                    /*                    createSummaryChannel({ config: 'Summ01', folder: 'Tracks-Cross/MapQuality2', id: 'MapQuality', title: '[@channelMapQuality]', hasStdev: true, maxval: 60, active: true, alertZoneMin: 0, alertZoneMax: 40 });
                    var cha = createSummaryChannel({ config: 'Summ01', folder: 'Tracks-Cross/Coverage2', id: 'Coverage', title: '[@channelCoverage]', hasStdev: true, maxval: 3, active: true });
                    cha.setChangeYScale(false, true);*/

                    /*
                    //Create the repeats channel
                    var repeatConfig = {
                    database: MetaData1.database,
                    serverURL: serverUrl,
                    annotTableName: 'tandemrepeats',
                    chromnrfield: 'chrom'
                    };
                    var DataFetcherAnnotation = require(DQXSC("DataFetcher/DataFetcherAnnotation"));
                    var ChannelAnnotation = require(DQXSC("ChannelPlot/ChannelAnnotation"));
                    var repeatFetcher = new DataFetcherAnnotation.Fetcher(repeatConfig);
                    repeatFetcher.ftype = 'repeat';
                    repeatFetcher.fetchSubFeatures = false;
                    //repeatFetcher.translateChromoId = translateChromoId;
                    that.panelBrowser.addDataFetcher(repeatFetcher);
                    repeatChannel = ChannelAnnotation.Channel("Repeats", repeatFetcher);
                    repeatChannel.setHeight(120);
                    repeatChannel.setTitle('[@channelRepeatRegions]');
                    that.panelBrowser.addChannel(repeatChannel, false);

                    that.addChannelToTree(repeatChannel, '[@channelRepeatRegions]', false, 'Doc/GenomeBrowser/Channels/Repeats.htm');
                    repeatChannel.handleFeatureClicked = function (id) {
                    DQX.setProcessing("Downloading...");
                    repeatFetcher.fetchFullAnnotInfo(id,
                    that._callBackPointInfoFetched_Repeat,
                    DQX.createFailFunction("Failed to download data")
                    );
                    }
                    */
                }


                that.updateCallSetViewerQuery = function (callSetViewer) {
                    var andList = [SQL.WhereClause.CompareFixed('cross_name', '=', callSetViewer.Id), SQL.WhereClause.CompareFixed('method', '=', callSetViewer.callMethod)];
                    $.each(that.myPage.variant_filters.get(), function (filter, value) {
                        //We only care about a value if it is checked, unchecked means all are wanted, checked means we don't want!.
                        if (value &&
                            ($.inArray(callSetViewer.callMethod, CrossesMetaData.variant_filters[filter].call_methods) != -1)) {
                            andList.push(SQL.WhereClause.CompareFixed(filter, '=', false))
                        }
                    });
                    callSetViewer.dataFetcherSNPs.setUserQuery2(SQL.WhereClause.AND(andList));
                };

                that.createChromosomesPFV3 = function () {
                    $.each(CrossesMetaData.chromosomes, function (idx, chromo) {
                        that.panelBrowser.addChromosome(chromo.id, chromo.id, chromo.len);
                    });
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
                    var tabswitched = that.myPage.frameGenomeBrowser.makeVisible();
                    /*                    setTimeout(function () {
                    that.panelBrowser.handleResize(); //force immediate calculation of size
                    }, 50);*/
                };


                return that;
            }

        };

        return GenomeBrowserModule;
    });
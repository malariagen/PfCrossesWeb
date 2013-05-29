
define([DQXSCRQ(), DQXSC("Framework"), DQXSC("Controls"), DQXSC("Msg"), DQXSC("SQL"), DQXSC("DocEl"), DQXSC("Utils"), DQXSC("FrameList"), DQXSC("ChannelPlot/GenomePlotter"), DQXSC("ChannelPlot/ChannelSequence"), DQXSC("ChannelPlot/ChannelSnps"), DQXSC("DataFetcher/DataFetcherFile"), DQXSC("DataFetcher/DataFetchers"), "GenomeBrowserSNPChannel", "CrossesMetaData", "VariantFilters", "i18n!nls/PfCrossesWebResources.js"],
    function (require, Framework, Controls, Msg, SQL, DocEl, DQX, FrameList, GenomePlotter, ChannelSequence, ChannelSnps, DataFetcherFile, DataFetchers, GenomeBrowserSNPChannel, CrossesMetaData, VariantFilters, resources) {

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
                        .setMargins(0).setDisplayTitle('Settings').setMinSize(Framework.dimX, 430);

                    this.frameControls = this.frameLeft.addMemberFrame(Framework.FrameFinal('controls', 0.7))
                        .setMargins(0).setFixedSize(Framework.dimX, 380);

                    this.frameFilters = this.frameLeft.addMemberFrame(Framework.FrameFinal('filters', 0.7))
                        .setMargins(0).setFixedSize(Framework.dimX, 380);

                    this.frameBrowser = that.getFrame().addMemberFrame(Framework.FrameFinal('browserPanel', 0.7))
                        .setMargins(0).setDisplayTitle('Browser');

                    Msg.listen("", { type: 'JumpgenomeRegionGenomeBrowser' }, $.proxy(this.onJumpGenomeRegion, this));

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

                    this.createChromosomesPFV3();

                    this.createControls();
                    this.createSNPChannels();


                    //Causes the browser to start with a start region
                    var firstChromosome = CrossesMetaData.chromosomes[0].id;
                    this.panelBrowser.setChromosome(firstChromosome, true, false);
                    this.panelBrowser.setPostInitialiseHandler(function () {
                        that.panelBrowser.showRegion(that.panelBrowser.getChromoID(1), 200000, 10000);
                    });

                };


                that.createControls = function () {
                    this.panelControls = Framework.Form(this.frameControls);
                    this.panelControls.render();

                    //this.panelControls.addControl(Controls.Check('CtrlMaghhghggnif', { label: 'Show magnifying glass' }));

                    this.formFilters = Framework.Form(this.frameFilters);
                    var pane = Controls.CompoundVert();
                    pane.setLegend(resources.variant_filters);
                    that.variant_filter_controls = VariantFilters(CrossesMetaData.variant_filters, that.myPage.variant_filters);
                    pane.addControl(that.variant_filter_controls.grid);
                    this.formFilters.addControl(pane);
                    that.formFilters.render();
                    that.myPage.variant_filters.on({change: true}, function () {
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
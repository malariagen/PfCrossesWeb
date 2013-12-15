
define(["require", "DQX/Framework", "DQX/Controls", "DQX/Msg", "DQX/SQL", "DQX/DocEl", "DQX/Utils",
    "DQX/Popup", "DQX/FrameTree", "DQX/FrameList", "DQX/ChannelPlot/GenomePlotter",
    "DQX/ChannelPlot/ChannelYVals", "DQX/ChannelPlot/ChannelSequence", "DQX/ChannelPlot/ChannelSnps", "DQX/ChannelPlot/ChannelPositions",
    "DQX/DataFetcher/DataFetcherFile", "DQX/DataFetcher/DataFetchers", "DQX/DataFetcher/DataFetcherSummary",
    "GenomeBrowserSNPChannel", "CrossesMetaData", "VariantFilters", "i18n!nls/PfCrossesWebResources"],
    function (require, Framework, Controls, Msg, SQL, DocEl, DQX,
              Popup, FrameTree, FrameList, GenomePlotter,
              ChannelYVals, ChannelSequence, ChannelSnps, ChannelPositions,
              DataFetcherFile, DataFetchers, DataFetcherSummary,
              GenomeBrowserSNPChannel,
              CrossesMetaData, VariantFilters, resources) {

        var GenomeBrowserModule = {

            Instance: function (iPage, iFrame) {
                iFrame._tmp = 123;
                var that = Framework.ViewSet(iFrame, 'genome');
                that.myPage = iPage;
                that.registerView();
                that.refVersion = 3;


                that.createFramework = function () {

                    this.frameChannels = that.getFrame().addMemberFrame(Framework.FrameFinal('settings', 0.33))
                        .setMargins(0).setMinSize(Framework.dimX, 430);

                    this.frameBrowser = that.getFrame().addMemberFrame(Framework.FrameFinal('browserPanel', 0.67))
                        .setMargins(0);

                    Msg.listen("", { type: 'JumpgenomePositionGenomeBrowser' }, $.proxy(this.onJumpGenomePosition, this));
                    Msg.listen("", { type: 'JumpgenomeRegionGenomeBrowser' }, $.proxy(this.onJumpGenomeRegion, this));

                    //Create the datafetcher that will obtain the summary profiles over the genome, such as coverage, mapping quality, etc.
                    this.dataFetcherProfiles = new DataFetcherSummary.Fetcher(serverUrl, 1, 600);

                    require("Common").addToolGene("GeneOnGenome", "Show position on genome", "Icons/Medium/GenomeAccessibility.png", function (args) {
                        that.jumpGene(args);
                    });
                    require("Common").addToolSNP("SNPOnGenome", "Show position on genome", "Icons/Medium/GenomeAccessibility.png", function (args) {
                        Msg.send({type:'JumpgenomePositionGenomeBrowser'}, args)
                    });


                };

                that.createPanels = function () {
                    var browserConfig = {
                        serverURL: serverUrl,
                        chromoIdField: 'chrom',
                        annotTableName: CrossesMetaData.tableAnnotation,
                        viewID: 'GenomeBrowser',
                        database: CrossesMetaData.database,
                        leftWidth: 187
                    };

                    this.panelBrowser = GenomePlotter.Panel(this.frameBrowser, browserConfig);
                    this.panelBrowser.annotationChannel.handleFeatureClicked = function (geneID) {
                        require("Common").showGenePopup(geneID);
                    }
                    this.panelBrowser.getAnnotationFetcher().setFeatureType('gene,pseudogene', 'CDS');
                    this.panelBrowser.getAnnotationChannel().setMinDrawZoomFactX(0.005);
                    this.panelBrowser.MaxZoomFactX = 1.0 / 0.2;
                    this.panelBrowser.getNavigator().setMinScrollSize(0.0003);

                    SeqChannel = ChannelSequence.Channel(serverUrl, 'Tracks-Cross/Sequence', 'Summ01', true);
                    this.panelBrowser.addChannel(SeqChannel, true);


                    this.createChromosomesPFV3();

                    this.createChannelVisibilityControls();
                    this.createControls();
                    this.createSNPChannels();
                    this.createRecombChannels();
                    this.createHotSpotChannels();

                    this.createSnpDensChannels();

                    //Initialise the summary profiles
                    this.panelBrowser.addDataFetcher(this.dataFetcherProfiles);
                    this.createSummaryChannels();

                    this.formChannels.render();


                    //Part of TEMP solution for browser syncing - need better in DQX
                    Msg.listen('',{ type: 'ChromosomePositionChanged', id: that.panelBrowser.getID() }, function() {
                        if (!that._ignorePositionUpdates) {
                            CrossesMetaData.browser_source = that.panelBrowser.getID();
                            CrossesMetaData.browser_chromid = that.panelBrowser.getCurrentChromoID();
                            CrossesMetaData.browser_pos = that.panelBrowser.getPosition();
                        }
                    });

                    that.updateChromosomePosition();

                    that.updateChannelVisibility();
                };


                that.updateChannelVisibility = function() {
                    $.each(that.controlledVisibilityChannels, function(idx, channelInfo) {
                        var channelid = channelInfo.channel.getID();
                        var isVisible = true;
                        $.each(channelInfo.dependencies, function(depid, depvalue) {
                            if (!that.visibilityStatus[depid][depvalue])
                                isVisible = false;
                        });

                        that.channelModifyVisibility(channelid, isVisible);
                    });

                }

                that.createChannelVisibilityControls = function () {
                    this.formChannels = Framework.Form(this.frameChannels).setPadding(10);

                    that.visibilityStatus={
                        'visibility_crosses': {},
                        'visibility_calls': {},
                        'visibility_properties': {}
                    }

                    that.controlledVisibilityChannels = [];

                    var groupCrosses = Controls.CompoundVert().setLegend('Crosses').setLegendSimple().setTreatAsBlock();
                    $.each(CrossesMetaData.sampleSets, function(idx, cross) {
                        that.visibilityStatus['visibility_crosses'][cross.id] = true;
                        var chk = Controls.Check(null, { label: cross.name, value: true }).setOnChanged(function() {
                            that.visibilityStatus['visibility_crosses'][cross.id] = chk.getValue();
                            that.updateChannelVisibility();
                        });
                        groupCrosses.addControl(chk);

                    });

                    var groupCalls = Controls.CompoundVert().setLegend('Call type').setLegendSimple().setTreatAsBlock();
                    $.each(CrossesMetaData.callMethods, function(idx, callMethod) {
                        that.visibilityStatus['visibility_calls'][callMethod] = true;
                        var chk = Controls.Check(null, { label: CrossesMetaData.getCallMethodDisplayName(callMethod), value: true }).setOnChanged(function() {
                            that.visibilityStatus['visibility_calls'][callMethod] = chk.getValue();
                            that.updateChannelVisibility();
                        });
                        groupCalls.addControl(chk);
                    });

                    var genotypePropertyList = [
                        { id:'VariantPositions', name: "Variant positions", defaultvisible:true },
                        { id:'RecombinationEvents', name: "Recombination", defaultvisible:false },
                        { id:'VariantDensity', name: "Variant density", defaultvisible:false },
                        { id:'Coverage', name: "Coverage", defaultvisible:false },
                        { id:'MapQuality', name: "Mapping quality", defaultvisible:false }
                    ];

                    var groupProperties = Controls.CompoundVert().setLegend('Properties').setLegendSimple().setTreatAsBlock();
                    $.each(genotypePropertyList, function(idx, prop) {
                        that.visibilityStatus['visibility_properties'][prop.id] = prop.defaultvisible;
                        var chk = Controls.Check(null, { label: prop.name, value: prop.defaultvisible }).setOnChanged(function() {
                            that.visibilityStatus['visibility_properties'][prop.id] = chk.getValue();
                            that.updateChannelVisibility();
                        });
                        groupProperties.addControl(chk);
                    });

                    that.chk_GC300 = Controls.Check(null, { label: '% GC', value: true }).setOnChanged(function() {
                        that.channelModifyVisibility('GC300', that.chk_GC300.getValue())
                    });

                    that.chk_Uniqueness = Controls.Check(null, { label: 'Uniqueness', value: true }).setOnChanged(function() {
                        that.channelModifyVisibility('Uniqueness', that.chk_Uniqueness.getValue())
                    });

                    that.chk_Repeats = Controls.Check(null, { label: 'Repeats', value: true }).setOnChanged(function() {
                        that.channelModifyVisibility('Repeats', that.chk_Repeats.getValue())
                    });

                    that.controlsBaseGroup = Controls.CompoundVert([
                        Controls.CompoundHor([groupProperties, Controls.HorizontalSeparator(5), groupCrosses, Controls.HorizontalSeparator(5), groupCalls ])
                            .setLegend('<b>Select tracks</b>'),
                        Controls.CompoundVert([that.chk_GC300,that.chk_Uniqueness,that.chk_Repeats]).setLegend('<b>Reference genome tracks</b>'),
                        Controls.VerticalSeparator(10)
                    ]);

                    this.formChannels.addControl(that.controlsBaseGroup);

                }

                that.createControls = function () {

                    var pane = Controls.CompoundVert();
                    pane.setLegend(resources.variant_filters);
                    that.variant_filter_controls = VariantFilters(CrossesMetaData.variant_filters, that.myPage.variant_filters);
                    pane.addControl(that.variant_filter_controls.getControl());
                    that.controlsBaseGroup.addControl(pane);
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

                    var callsetList = [];
                    $.each(CrossesMetaData.variants, function(i, variant) {
                        if (variant.id)
                            callsetList.push({
                                Id: variant.id.split(':')[0],
                                name: variant.name,
                                callMethod: variant.id.split(':')[1]
                            });
                    });

                    this.callSetViewers = [];
                    $.each(callsetList, function (idx, callSet) {
                        var callSetViewer = { Id: callSet.Id, callMethod: callSet.callMethod };
                        callSetViewer.dataFetcherSNPs = new DataFetchers.Curve(serverUrl, CrossesMetaData.database, CrossesMetaData.tableVariants, 'pos');
                        that.updateCallSetViewerQuery(callSetViewer);
                        that.panelBrowser.addDataFetcher(callSetViewer.dataFetcherSNPs);
                        callSetViewer.dataFetcherSNPs.addFetchColumn("id", "Int");
                        callSetViewer.dataFetcherSNPs.activateFetchColumn("id");
                        that.channelSNPs = GenomeBrowserSNPChannel.SNPChannel(callSetViewer.dataFetcherSNPs, callSet.Id + '_' + callSet.callMethod, callSet.name);
                        that.panelBrowser.addChannel(that.channelSNPs, false);
                        that.callSetViewers.push(callSetViewer);
                        that.controlledVisibilityChannels.push({
                            channel:that.channelSNPs,
                            dependencies:{
                                'visibility_properties':'VariantPositions', 'visibility_crosses':callSet.Id, 'visibility_calls':callSet.callMethod
                            }
                        });
                    });
                };


                that.createRecombChannels = function () {

                    $.each(CrossesMetaData.sampleSets, function(idx,sampleset) {
                        crossid=sampleset.id;
                        if (crossid) {
                            var dataFetcherRecomb = new DataFetchers.Curve(
                                serverUrl,CrossesMetaData.database,
                                'recombinationpositions'
                            );

                            dataFetcherRecomb.setUserQuery2(SQL.WhereClause.CompareFixed('crossid', '=', crossid))

                            var theChannel = ChannelPositions.Channel(null,
                                dataFetcherRecomb,   // The datafetcher containing the positions of the snps
                                'chrom'                 // Name of the column containing a unique identifier for each snp
                            );
                            theChannel
                                .setTitle(sampleset.name+' - Recombination events')        //sets the title of the channel
                                .setMaxViewportSizeX(500.0e5);
                            theChannel.makeCategoricalColors(//Assign a different color to silent/nonsilent snps
                             'samplecount',               // Name of the column containing a categorical string value that determines the color of the snp
                             {
                             '1' :  DQX.Color(0.75,1.0,0.75) ,
                             '2' : DQX.Color(0.0,0.7,0.0),
                             '3' : DQX.Color(0,0.2,0)
                             }
                             );
                             theChannel.setToolTipHandler(function(snpid,positIndex) {
                                return 'Position: '+dataFetcherRecomb.getPosition(positIndex);
                             })
                            /*
                             //Define a function tht will be called when the user clicks a snp
                             theChannel.setClickHandler(function(snpid) {
                             Msg.send({ type: 'SnpPopup' }, snpid);//Send a message that should trigger showing the snp popup
                             })*/
                            that.panelBrowser.addChannel(theChannel, false);//Add the channel to the browser

                            that.controlledVisibilityChannels.push({
                                channel:theChannel,
                                dependencies:{
                                    'visibility_properties':'RecombinationEvents', 'visibility_crosses':crossid
                                }
                            });
                        }
                    });
                }


                that.createHotSpotChannels = function() {
                    var dataFetcherHotSpot = new DataFetchers.Curve(
                        serverUrl,CrossesMetaData.database,
                        'hotspot5000'
                    );


                    //Create the channel in the browser that will contain the frequency values
                    var theChannel = ChannelYVals.Channel(null, { minVal: 0, maxVal: 5 });
                    theChannel
                        .setTitle("Number of recombinations")        //sets the title of the channel
                        .setSubTitle("in 5kb window")        //sets the title of the channel
                        .setHeight(60)                 //sets the height of the channel, in pixels
                        .setMaxViewportSizeX(50.0e5)     //if more than 5e5 bases are in the viewport, this channel is not shown
                        .setChangeYScale(false,true);   //makes the scale adjustable by dragging it
                    that.panelBrowser.addChannel(theChannel, false);//Add the channel to the browser

                    var plotcomp = theChannel.addComponent(ChannelYVals.Comp(null, dataFetcherHotSpot, 'hotspot5000'), true);//Create the component
                    //plotcomp.myPlotHints.color = population.color;//define the color of the component
                    plotcomp.myPlotHints.pointStyle = 1;//chose a sensible way of plotting the points
                    plotcomp.myPlotHints.makeDrawLines(9E99);
                    theChannel.getToolTipContent = function(compID, pointIndex) {
                        return null;
                    }

                    that.controlledVisibilityChannels.push({
                        channel:theChannel,
                        dependencies:{
                            'visibility_properties':'RecombinationEvents'
                        }
                    });


/*
                    //Define the tooltip shown when a user hovers the mouse over a point in the channel
                    theChannel.getToolTipContent = function(compID, pointIndex) {
                        var snpid = that.dataFetcherSNPs.getColumnPoint(pointIndex, "snpid");
                        var value = that.dataFetcherSNPs.getColumnPoint(pointIndex, compID);
                        return snpid+'<br/>'+compID+'= '+value.toFixed(3);
                    }; */

                    //Define the action when a user clicks on a point in the channel
                    theChannel.handlePointClicked = function(compID, pointIndex) {
                        var snpid = that.dataFetcherSNPs.getColumnPoint(pointIndex, "snpid");//Get the snp id from the datafetcher
                        Msg.send({ type: 'ShowSNPPopup' }, snpid);//Send a message that should trigger showing the snp popup
                    };


                }


                that.createSnpDensChannels = function () {

                    $.each(CrossesMetaData.variants, function(idx,callSet) {
                        var dataFetcherDens = new DataFetchers.Curve(
                            serverUrl,CrossesMetaData.database,
                            callSet.dataSourceDnpDensity
                        );


                        //Create the channel in the browser that will contain the frequency values
                        var theChannel = ChannelYVals.Channel(null, { minVal: 0, maxVal: 0.05 });
                        theChannel
                            .setTitle("{cross} Variant dens. ({method})".DQXformat({cross:callSet.crossDispName, method:callSet.callMethod}))        //sets the title of the channel
                            //.setSubTitle("in 1kb window")        //sets the title of the channel
                            .setHeight(80)                 //sets the height of the channel, in pixels
                            .setMaxViewportSizeX(50.0e5)     //if more than 5e5 bases are in the viewport, this channel is not shown
                            .setChangeYScale(false,true);   //makes the scale adjustable by dragging it
                        that.panelBrowser.addChannel(theChannel, false);//Add the channel to the browser

                        var plotcomp = theChannel.addComponent(ChannelYVals.CompFilled(null, dataFetcherDens, 'CntRaw'), true);//Create the component
                        plotcomp.myPlotHints.color = DQX.Color(0.5,0.5,0.5);

                        var plotcomp = theChannel.addComponent(ChannelYVals.CompFilled(null, dataFetcherDens, 'CntFlt'), true);//Create the component
                        plotcomp.myPlotHints.color = DQX.Color(0,0,1);

                        that.controlledVisibilityChannels.push({
                            channel:theChannel,
                            dependencies:{
                                'visibility_properties':'VariantDensity', 'visibility_crosses':callSet.crossName, 'visibility_calls':callSet.callMethod.toLowerCase()
                            }
                        });

                    });


                }


                that.addChannelToTree = function (channel, name, defaultVisible, docID) {
                    var chk = Controls.Check(null, { label: '<b>' + name + '</b>', value: defaultVisible });
                    if (!defaultVisible)
                        that.channelModifyVisibility(channel.getID(), false);
                    that.branchChannelsProfiles.addItem(FrameTree.Control(Controls.CompoundHor([chk, Controls.Static('&nbsp;&nbsp;')/*, infoButton*/])));
                    chk.setOnChanged(function () { that.channelModifyVisibility(channel.getID(), chk.getValue()); });
                }


                //modifies the visibility status of a channel, prodived its id
                that.channelModifyVisibility = function (id, status) {
                    var channel = this.panelBrowser.findChannelRequired(id);
                    for (var compid in channel.myComponents)
                        channel.modifyComponentActiveStatus(compid, status);
                    this.panelBrowser.channelModifyVisibility(id, status);
                };


                //This callback is activated when the ajax data returns after a user has clicked on a repeat in the repeat channel
                that._callBackPointInfoFetched_Repeat = function (data) {
                    DQX.stopProcessing();
                    var subdata = {
                        'Matches': data.percentmatches + '%',
                        'Pattern': '<div style="max-width:500px;word-wrap:break-word;">' + data.pattern + '</div>',
                        'Copies': data.nrcopies,
                        'Length': data.fstop - data.fstart,
                        'Genomic region': data.chromid + ':' + data.fstart + '-' + data.fstop
                    }
                    var content = '<div>' + DQX.CreateKeyValueTable(subdata) + '</div>';
                    var ID = Popup.create("Tandem repeat", content);
                };


                //Create the channels that provide summary information about the genome (coverage, %gc, etc...)
                that.createSummaryChannels = function () {

                    //A helper function that creates an individual summary channel
                    function createSummaryChannel(info) {
                        if (!info.idData) info.idData = info.id;
                        var ID = info.idData;
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

                        return SummChannel;
                    }

                    
                    //Show coverage & mapping quality tracks
                    if (true) {//alternative 1: channel per cross

                        $.each(CrossesMetaData.sampleSets, function (idx, sampleSetObj) {
                            var sampleSet = sampleSetObj.id;
                            if (sampleSet) {
                                var cha = createSummaryChannel({
                                    config: 'Summ01',
                                    folder: 'Tracks-Cross/Coverage/' + sampleSet,
                                    idData: 'Coverage',
                                    id: 'CV' + sampleSet,
                                    title: 'Coverage ' + sampleSetObj.name,
                                    hasStdev: true,
                                    maxval: 3,
                                    active: true });
                                cha.setChangeYScale(false, true);
                                that.controlledVisibilityChannels.push({
                                    channel:cha,
                                    dependencies:{
                                        'visibility_properties':'Coverage', 'visibility_crosses':sampleSet
                                    }
                                });
                            }
                        });

                        $.each(CrossesMetaData.sampleSets, function (idx, sampleSetObj) {
                            var sampleSet = sampleSetObj.id;
                            if (sampleSet) {
                                var theChannel = createSummaryChannel({
                                    config: 'Summ01',
                                    folder: 'Tracks-Cross/MapQuality/' + sampleSet,
                                    idData: 'MapQuality',
                                    id: 'MQ' + sampleSet,
                                    title: 'Mapping quality ' + sampleSetObj.name,
                                    hasStdev: true,
                                    maxval: 60,
                                    active: true,
                                    alertZoneMin: 0,
                                    alertZoneMax: 40 });
                                that.controlledVisibilityChannels.push({
                                    channel:theChannel,
                                    dependencies:{
                                        'visibility_properties':'MapQuality', 'visibility_crosses':sampleSet
                                    }
                                });
                            }
                        });

                    }
                    else {//alternative 2: multi-color in single channel
                        var channelList = [{ ID: 'Coverage', maxVal: 3 }, { ID: 'MapQuality', maxVal: 60}];
                        $.each(channelList, function (idxChannel, channelInfo) {
                            var ID = channelInfo.ID;
                            var SummChannel = ChannelYVals.Channel(ID, { minVal: 0, maxVal: channelInfo.maxVal });
                            SummChannel.setTitle(ID);
                            SummChannel.setHeight(180, true);
                            that.panelBrowser.addChannel(SummChannel);
                            SummChannel.setChangeYScale(false, true);
                            for (var compNr = 0; compNr <= 2; compNr++) {
                                $.each(CrossesMetaData.sampleSets, function (idx, sampleSetObj) {
                                    var sampleSet = sampleSetObj.id;
                                    if (sampleSet) {
                                        var folder = 'Tracks-Cross/' + ID + '/' + sampleSet;
                                        var color = sampleSetObj.color;

                                        if (compNr == 0) {
                                            var colinfo_min = that.dataFetcherProfiles.addFetchColumn(folder, 'Summ01', ID + "Q05_min", DQX.Color(1, 0, 0));
                                            var colinfo_max = that.dataFetcherProfiles.addFetchColumn(folder, 'Summ01', ID + "Q95_max", DQX.Color(1, 0, 0));
                                            SummChannel.addComponent(ChannelYVals.YRange(ID + sampleSet + "_minmax2", that.dataFetcherProfiles, colinfo_min.myID, colinfo_max.myID, color.changeOpacity(0.2)));
                                        }

                                        if (compNr == 1) {
                                            //var colinfo_min = that.dataFetcherProfiles.addFetchColumn(folder, 'Summ01', ID + "Q25_min", DQX.Color(1, 0, 0));
                                            //var colinfo_max = that.dataFetcherProfiles.addFetchColumn(folder, 'Summ01', ID + "Q75_max", DQX.Color(1, 0, 0));
                                            //SummChannel.addComponent(ChannelYVals.YRange(ID + sampleSet + "_minmax", that.dataFetcherProfiles, colinfo_min.myID, colinfo_max.myID, color.changeOpacity(0.2)));
                                        }

                                        if (compNr == 2) {
                                            var colinfo_avg = that.dataFetcherProfiles.addFetchColumn(folder, 'Summ01', ID + "Q50_avg");
                                            var comp = SummChannel.addComponent(ChannelYVals.Comp(ID + sampleSet + "_avg", that.dataFetcherProfiles, colinfo_avg.myID));
                                            comp.setColor(color);
                                            comp.myPlotHints.makeDrawLines(3000000.0); //This causes the points to be connected with lines
                                            comp.myPlotHints.interruptLineAtAbsent = true;
                                            comp.myPlotHints.drawPoints = false;
                                            SummChannel.modifyComponentActiveStatus(ID + sampleSet + "_avg", true, false);
                                            SummChannel.modifyComponentActiveStatus(ID + sampleSet + "_minmax2", true, false);
                                            //SummChannel.modifyComponentActiveStatus(ID + sampleSet + "_minmax", true, false);
                                        }
                                    }
                                });
                            }
                        });
                    }

                    //Create the Reference genome summary channels
                    var cha = createSummaryChannel({ config: 'Summ01', folder: 'Tracks-Cross/GC300', id: 'GC300', title: '[@channelPercentGC]', hasStdev: false, maxval: 60, active: true, alertZoneMin: 0, alertZoneMax: 15 });
                    cha.setChangeYScale(true, true);
                    var cha = createSummaryChannel({ config: 'Summ01', folder: 'Tracks-Cross/Uniqueness', id: 'Uniqueness', title: '[@ChannelNonuniqueness]', hasStdev: false, maxval: 75, active: true, alertZoneMin: 26, alertZoneMax: 199 });
                    cha.setChangeYScale(false, true);


                    //Create the repeats channel
                    var repeatConfig = {
                        database: CrossesMetaData.database,
                        serverURL: serverUrl,
                        annotTableName: 'tandemrepeats',
                        chromnrfield: 'chrom'
                    };
                    var DataFetcherAnnotation = require("DQX/DataFetcher/DataFetcherAnnotation");
                    var ChannelAnnotation = require("DQX/ChannelPlot/ChannelAnnotation");
                    var repeatFetcher = new DataFetcherAnnotation.Fetcher(repeatConfig);
                    repeatFetcher.ftype = 'repeat';
                    repeatFetcher.fetchSubFeatures = false;
                    //repeatFetcher.translateChromoId = translateChromoId;
                    that.panelBrowser.addDataFetcher(repeatFetcher);
                    repeatChannel = ChannelAnnotation.Channel("Repeats", repeatFetcher);
                    repeatChannel.setHeight(120);
                    repeatChannel.setTitle('[@channelRepeatRegions]');
                    that.panelBrowser.addChannel(repeatChannel, false);
                    //that.channelModifyVisibility('Repeats', false);

                    repeatChannel.handleFeatureClicked = function (id) {
                        DQX.setProcessing("Downloading...");
                        repeatFetcher.fetchFullAnnotInfo(id, that._callBackPointInfoFetched_Repeat, DQX.createFailFunction("Failed to download data"));
                    }

                }


                that.updateCallSetViewerQuery = function (callSetViewer) {
                    var andList = [SQL.WhereClause.CompareFixed(CrossesMetaData.fieldCrossName, '=', callSetViewer.Id), SQL.WhereClause.CompareFixed('method', '=', callSetViewer.callMethod)];
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
                        that.panelBrowser.addChromosome(chromo.id, chromo.id, chromo.len+0.01);
                    });
                }


                //Call this function to jump to & highlight a specific position on the genome
                that.onJumpGenomePosition = function (context, args) {
                    CrossesMetaData.browser_chromid = null;
                    if ('chromoID' in args)
                        var chromoID = args.chromoID;
                    else {
                        DQX.assertPresence(args, 'chromNr');
                        var chromoID = this.panelBrowser.getChromoID(args.chromNr);
                    }

                    DQX.assertPresence(args, 'position');
                    this.activateState();
                    this.panelBrowser.highlightRegion(chromoID, parseInt(args.position), 20);
                };


                //Call this function to jump to & highlight a specific region on the genome
                that.onJumpGenomeRegion = function (context, args) {
                    CrossesMetaData.browser_chromid = null;
                    if ('chromoID' in args)
                        var chromoID = args.chromoID;
                    else {
                        DQX.assertPresence(args, 'chromNr');
                        var chromoID = this.panelBrowser.getChromoID(args.chromNr);
                    }
                    DQX.assertPresence(args, 'start'); DQX.assertPresence(args, 'end');
                    this.panelBrowser.highlightRegion(chromoID, (args.start + args.end) / 2, args.end - args.start);
                };


                //Part of TEMP solution for browser syncing - need better in DQX
                that.updateChromosomePosition = function() {
                    if ((CrossesMetaData.browser_chromid)&&(CrossesMetaData.browser_source!=that.panelBrowser.getID()))
                    {
                        var chromid = CrossesMetaData.browser_chromid;
                        var left = CrossesMetaData.browser_pos.left;
                        var right = CrossesMetaData.browser_pos.right;
                        setTimeout(function() {
                            that._ignorePositionUpdates = true;
                            that.panelBrowser.setChromosome(chromid,true,true);
                            var posInfo = CrossesMetaData.browser_pos;
                            that.panelBrowser.setPosition((left+right)/2, right-left);
                            that._ignorePositionUpdates = false;
                        },50);
                    }
                }


                that.activateState = function () {
                    that.updateChromosomePosition();
                    var tabswitched = that.myPage.frameGenomeBrowser.makeVisible();
                    /*                    setTimeout(function () {
                    that.panelBrowser.handleResize(); //force immediate calculation of size
                    }, 50);*/
                };

                //Call this function to make the browser jump to a gene
                that.jumpGene = function (args) {
                    CrossesMetaData.browser_chromid = null;
                    DQX.requireMember(args, 'chromid'); DQX.requireMember(args, 'start'); DQX.requireMember(args, 'stop');
                    this.activateState();
                    this.panelBrowser.highlightRegion(args.chromid, (args.start + args.stop) / 2, (args.stop - args.start));
                };

                return that;
            }

        };

        return GenomeBrowserModule;
    });
﻿
define([DQXSCRQ(), DQXSC("Framework"), DQXSC("Controls"), DQXSC("PopupFrame"), DQXSC("Msg"), DQXSC("DocEl"),
DQXSC("Utils"), DQXSC("FrameList"), DQXSC("ChannelPlot/GenomePlotter"), DQXSC("ChannelPlot/ChannelSequence"),
DQXSC("ChannelPlot/ChannelSnps"), DQXSC("DataFetcher/DataFetcherFile"), "Page", "CrossesMetaData", "VariantFilters"],
    function (require, Framework, Controls, PopupFrame, Msg, DocEl, DQX, FrameList, GenomePlotter, ChannelSequence,
              ChannelSnps, DataFetcherFile, Page, CrossesMetaData, VariantFilters) {

        var BrowserModule = {

            Instance: function (iPage, iFrame) {
                iFrame._tmp = 123;
                var that = Framework.ViewSet(iFrame, 'genome');
                that.myPage = iPage;
                that.registerView();
                that.refVersion = 3;
                that.dataLocation = "SnpDataCross";


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
                };
                that.lookseq_img_url = function (args) {
                    var defaults = {base_url: 'http://panoptes.cggh.org/lookseq',
                     start_pos: 0,
                     end_pos: 0,
                     chrom: '',
                     sample: '',
                     width: 800
                    };
                    $.extend(defaults, args);
                    return Handlebars.compile("{{base_url}}/cgi-bin/index.pl?action=render_image&alg=bwa&from={{start_pos}}&to={{end_pos}}&chr={{chrom}}&sample={{sample}}&width={{width}}&height=0&maxdist=500&view=pileup&output=image&display=|noscale|perfect|snps|single|inversions|pairlinks|faceaway|basequal|&debug=0")(defaults);
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
                        var snp = content.snp;
                        var seq = content.seq;
                        var popup = PopupFrame.PopupFrame('LookseqPopupFrame', Framework.FrameFinal('LookseqPic'), { title: seq.replace(/__/g,'/') + snp.position, sizeX: 830, sizeY: 800 });
                        var frameRoot = popup.getFrameRoot();
                        popup.render();
                        var uid = DQX.getNextUniqueID();
                        frameRoot.setContentHtml("<img id='"+ uid +"' style='position:absolute; top=0px; left=0px;' src='"+that.lookseq_img_url({
                            width:800,
                            start_pos: snp.position - 50,
                            end_pos: snp.position + 50,
                            sample: seq.replace(/__/g,'/'),
                            chrom: content.chrom
                        })+"'>");
                        $('#'+ uid).load(function() {
                            var img = $('#' + uid);
                            var canvas = $("<canvas id='canvas"+uid+"' style='position:absolute; top=0px; left=0px;'></canvas>");
                            canvas.insertAfter(img);
                            canvas.attr('height', img.height());
                            canvas.attr('width', img.width());
                            var c = canvas.get(0).getContext('2d');
                            c.strokeStyle = '#F00';
                            c.beginPath();
                            c.moveTo(395,0);
                            c.lineTo(395,canvas.height());
                            c.lineWidth = 1;
                            c.stroke();
                        })
                    });

                    //Causes the browser to start with a start region
                    this.panelBrowser.setPostInitialiseHandler(function () {
                        that.panelBrowser.showRegion(that.panelBrowser.getChromoID(1), 200000, 100000);
                    });

                    //Act like we just changed the callset so that we load the SNPs when we first open
                    that.changeDataSource();

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
                                                               value: that.myPage.current_call_set.get('call_set')});
                    this.callSetControl.bindToModel(that.myPage.current_call_set, 'call_set');
                    that.myPage.current_call_set.on({change: true}, $.proxy(that.changeDataSource, that));
                    group1.addControl(this.callSetControl);

                    this.groupVariantFilterControls = group1.addControl(Controls.CompoundVert()).setLegend('Variant filters');
                    this.groupCallFilterControls = group1.addControl(Controls.CompoundVert()).setLegend('Call filters');
                    this.groupDispSettingsControls = group1.addControl(Controls.CompoundVert()).setLegend('Display settings');

                    that.variant_filter_controls = VariantFilters(CrossesMetaData.variant_filters, that.myPage.variant_filters);
                    that.groupVariantFilterControls.addControl(that.variant_filter_controls.grid);

                    that.myPage.variant_filters.on({change: true}, function () {
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
                    this.groupDispSettingsControls.addControl(Controls.Check('CtrlSmallBlocks', { label: 'Allow small blocks', value: true })).setOnChanged(function (id, ctrl) {
                        that.SnpChannel.allowSmallBlocks = ctrl.getValue();
                        that.panelBrowser.render();
                    });

                    /*this.groupDispSettingsControls.addControl(Controls.Check('CtrlFilterVCF', { label: 'Filter by VCF data', value: false })).setOnChanged(function (id, ctrl) {
                    that.SnpChannel.filter.applyVCFFilter = ctrl.getValue();
                    that.panelBrowser.render();
                    });*/
                    /*this.groupDispSettingsControls.addControl(Controls.Check('CtrlHideFiltered', { label: 'Hide filtered SNPs', value: true })).setOnChanged(function (id, ctrl) {
                    that.SnpChannel.hideFiltered = ctrl.getValue();
                    that.panelBrowser.render();
                    });*/
                    /*this.groupDispSettingsControls.addControl(Controls.Check('CtrlRequireParents', { label: 'Require parents' })).setOnChanged(function (id, ctrl) {
                    that.SnpChannel.filter.requireParentsPresent = ctrl.getValue();
                    that.panelBrowser.render();
                    });*/
                    this.groupDispSettingsControls.addControl(Controls.Check('CtrlShowInheritance', { label: 'Show inheritance', value: true })).setOnChanged(function (id, ctrl) {
                        that.SnpChannel.colorByParent = ctrl.getValue();
                        that.panelBrowser.render();
                    });
                    this.groupDispSettingsControls.addControl(Controls.Button('CtrlSortParents', { content: 'Sort by parents' })).setOnChanged(function (id, ctrl) {
                        that.SnpChannel.sortByParents();
                    });

                    var sliderWidth = 300;

                    //Some slider-type per-variant filters
                    that.groupVariantFilterControls.addControl(Controls.VerticalSeparator(10));
                    that.groupVariantFilterControls.addControl(Controls.ValueSlider('CtrlPresence', { label: 'Min. % presence on samples', width: sliderWidth, minval: 0, maxval: 100, startval: 0, digits: 0 })).setOnChanged(function (id, ctrl) {
                        that.SnpChannel.setMinPresence(ctrl.getValue());
                    });



                    that.groupCallFilterControls.addControl(Controls.ValueSlider('CtrlMinSNPCov', { label: 'Min. SNP coverage', width: sliderWidth, minval: 1, maxval: 50, startval: 1, digits: 0 })).setOnChanged(function (id, ctrl) {
                        that.SnpChannel.setMinSnpCoverage(ctrl.getValue());
                    });


                    that.groupDispSettingsControls.addControl(Controls.VerticalSeparator(10));
                    this.groupDispSettingsControls.addControl(Controls.ValueSlider('CtrlCoverage', { label: 'Coverage scale', width: sliderWidth, minval: 0, maxval: 200, value: 0, digits: 0 })).setOnChanged(function (id, ctrl) {
                        that.SnpChannel.setCoverageRange(ctrl.getValue());
                    });

                    /*this.groupClientFilterControls.addControl(Controls.ValueSlider('CtrlMinAvgCov', { label: 'Min. avg. coverage', width: sliderWidth, minval: 0, maxval: 200, startval: 0, digits: 0 })).setOnChanged(function (id, ctrl) {
                    that.SnpChannel.setMinAvgCoverage(ctrl.getValue());
                    });*/

                    /*this.groupClientFilterControls.addControl(Controls.ValueSlider('CtrlMinSnpPurity', { label: 'Min. SNP purity', width: sliderWidth, minval: 0, maxval: 1, startval: 0, digits: 2 })).setOnChanged(function (id, ctrl) {
                    that.SnpChannel.setMinSnpPurity(ctrl.getValue());
                    });*/

                    /*this.groupClientFilterControls.addControl(Controls.ValueSlider('CtrlMinAvgPurity', { label: 'Min. avg. purity', width: sliderWidth, minval: 0, maxval: 1, startval: 0, digits: 2 })).setOnChanged(function (id, ctrl) {
                    that.SnpChannel.setMinAvgPurity(ctrl.getValue());
                    });*/


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


                return that;
            }

        };

        return BrowserModule;
    });
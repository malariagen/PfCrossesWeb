define(["require", "DQX/Framework", "DQX/HistoryManager", "DQX/Controls", "DQX/Msg", "DQX/DocEl",
    "DQX/Utils", "Wizards/WizardFindGene", "Common", "i18n!nls/PfCrossesWebResources"],
    function (require, Framework, HistoryManager, Controls, Msg, DocEl,
              DQX, WizardFindGene, Common, resources) {

        var IntroModule = {

            Instance: function (iPage, iFrame, iHeaderFrame) {
                var that = Framework.ViewSet(iFrame, 'start');
                that.myPage = iPage;
                that.myFrame = iFrame;
                that.myHeaderFrame = iHeaderFrame;
                that.registerView();

                that.createPanels = function () {
                    this.myHeaderFrame.setContentStaticDiv('HeaderIntroPanel');
                    this.myFrame.setContentStaticDiv('IntroPanel');

                    this.createNavigationSection();

                    $('#' + this.myFrame.getClientDivID()).append('<div style="clear:both"/><br>');
                    this.createJumpStartButtons();

                    $('#' + this.myFrame.getClientDivID()).append('<div style="clear:both"><br></div>');
                    this.createWizardButtons();

                    DQX.ExecPostCreateHtml();
                };

                that.createFramework = function () {
                    HistoryManager.setCallBackChangeState(function (stateKeys) {
                    });
                };

                that.createNavigationButton = function (id, parentDiv, bitmap, content, styleClass, width, handlerFunction) {
                    var bt = Controls.Button(id, { bitmap: bitmap, content: content, buttonClass: styleClass, width: width, height: 30 });
                    bt.setOnChanged(handlerFunction);
                    parentDiv.addElem(bt.renderHtml());
                };


                that.createNavigationSection = function () {
                    var navSectionDiv = DocEl.Div();
                    navSectionDiv.addStyle("position", "absolute");
                    navSectionDiv.addStyle("right", "0px");
                    navSectionDiv.addStyle("top", "0px");
                    navSectionDiv.addStyle("padding-top", "3px");
                    navSectionDiv.addStyle("padding-right", "3px");
                    this.createNavigationButton("HeaderHome", navSectionDiv, 'Bitmaps/Icons/Small/Home.png',
                        resources.navButtonIntro, "DQXToolButton3", 100,
                        function () { Msg.send({ type: 'Home' }) });
                    this.createNavigationButton("HeaderFindGene", navSectionDiv, 'Bitmaps/Icons/Small/MagGlassG.png',
                        resources.navButtonFindGene, "DQXToolButton1", 100,
                        function () {
                            WizardFindGene.execute(function () {
                                Common.showGenePopup(WizardFindGene.resultGeneID);
                            })
                        });
                    $('#' + this.myHeaderFrame.getClientDivID()).append(navSectionDiv.toString());
                };

                that.createButton = function (id, parentDiv, bitmap, content, style, handlerFunction) {
                    if (true) {
                        var bt = Controls.Button(id, { bitmap: bitmap, content: content, buttonClass: style, width: 270, height: 51 });
                        bt.setOnChanged(handlerFunction);
                        parentDiv.addElem(bt.renderHtml());
                    }
                };

                that.createWizardButtons = function () {
                    var buttondiv = DocEl.Div();
                    buttondiv.addStyle('clear', 'both');
                    $('#' + this.myFrame.getClientDivID()).append('<p/>' + buttondiv.toString());
                };

                that.createJumpStartButtons = function () {
                    var buttondiv1 = DocEl.Div();
                    buttondiv1.addStyle('clear', 'both');
                    buttondiv1.setCssClass('DQXStaticContent');

                    var buttondiv2 = DocEl.Div();
                    buttondiv2.addStyle('clear', 'both');
                    buttondiv2.setCssClass('DQXStaticContent');


                    var buttonFormatter = "<b>{title}</b></br>{description}";

                    var jumpStarts = [
                        {
                            id: 'Samples',
                            name: buttonFormatter.DQXformat({title:resources.samplesPageHeader, description:resources.samplesButton }),
                            location: buttondiv1,
                            bitmap: "Bitmaps/Icons/Medium/Samples.png",
                            handler: function () {
                                DQX.executeProcessing(function () {
                                    that.myPage.frameSamples.makeVisible();
                                });
                            }
                        },
                        {
                            id: 'Variants',
                            name: buttonFormatter.DQXformat({title:resources.variantsPageHeader, description:resources.variantsButton }),
                            location: buttondiv1,
                            bitmap: "Bitmaps/Icons/Medium/VariantCatalogue.png",
                            handler: function () {
                                DQX.executeProcessing(function () {
                                    that.myPage.frameVariants.makeVisible();
                                });
                            }
                        },
                        {
                            id: 'IntroPublicGenotypes',
                            name: buttonFormatter.DQXformat({title:resources.genotypePageHeader, description:resources.genotypeButton }),
                            location: buttondiv1,
                            bitmap: "Bitmaps/Icons/Medium/GenotypeBrowser.png",
                            handler: function () {
                                DQX.executeProcessing(function () {
                                    that.myPage.frameBrowser.makeVisible();
                                });
                            }
                        },
                        {
                            id: 'IntroGenomeBrowser',
                            name: buttonFormatter.DQXformat({title:resources.genomePageHeader, description:resources.genomeButton }),
                            bitmap: 'Bitmaps/Icons/Medium/GenomeAccessibility.png',
                            location: buttondiv2,
                            handler: function () {
                                DQX.executeProcessing(function () {
                                    that.myPage.frameGenomeBrowser.makeVisible();
                                });
                            }
                        },
                        {
                            id: 'IntroLookSeq',
                            name: buttonFormatter.DQXformat({title:resources.lookseqPageHeader, description:resources.lookseqButton }),
                            location: buttondiv2,
                            bitmap: 'Bitmaps/Icons/Medium/Assembly.png',
                            handler: function () {
                                DQX.executeProcessing(function () {
                                    that.myPage.frameLookSeq.makeVisible();
                                });
                            }
                        },
                        {
                            id: 'IntroDownloads',
                            name: buttonFormatter.DQXformat({title:resources.downloadsPageHeader, description:resources.downloadsButton }),
                            location: buttondiv2,
                            bitmap: 'Bitmaps/Icons/Medium/Download.png',
                            handler: function () {
                                DQX.executeProcessing(function () {
                                    that.myPage.frameDownloads.makeVisible();
                                });
                            }
                        }
                    ];

                    for (var i = 0; i < jumpStarts.length; i++) {
                        var jumpStart = jumpStarts[i];
                        this.createButton(jumpStart.id, jumpStart.location, jumpStart.bitmap, jumpStart.name, "DQXToolButton3", jumpStart.handler);
                    }
                    $('#' + this.myFrame.getClientDivID()).append(buttondiv1.toString());
                    $('#' + this.myFrame.getClientDivID()).append(buttondiv2.toString());
                };

                that.activateState = function () {
                    var tabswitched = this.myFrame.makeVisible();
                    //that.panelBrowser.handleResize(); //force immediate calculation of size
                };


                return that;
            }

        };

        return IntroModule;
    });
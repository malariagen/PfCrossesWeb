﻿define([DQXSCRQ(), DQXSC("Framework"), DQXSC("HistoryManager"), DQXSC("Controls"), DQXSC("Msg"), DQXSC("DocEl"), DQXSC("Utils"), "i18n!nls/PfCrossesWebResources.js"],
    function (require, Framework, HistoryManager, Controls, Msg, DocEl, DQX, resources) {

        var IntroModule = {

            Instance: function (iPage, iFrame, iHeaderFrame) {
                var that = Framework.ViewSet(iFrame, 'start');
                that.myPage = iPage;
                that.myFrame = iFrame;
                that.myHeaderFrame = iHeaderFrame;
                that.registerView();

                that.createPanels = function () {
                    this.myHeaderFrame.setContentStaticDiv('HeaderIntroPanel');
                    this.myFrame.setContentHtml(resources.introTitle + resources.introText);

                    this.createNavigationSection();

                    $('#' + this.myFrame.getClientDivID()).append('<div style="clear:both"/><br>');
                    this.createJumpStartButtons();

                    $('#' + this.myFrame.getClientDivID()).append('<div style="clear:both"><br></div>');
                    this.createWizardButtons();

                };

                that.createFramework = function () {
                    HistoryManager.setCallBackChangeState(function (stateKeys) {
                        if ('start' in stateKeys)
                            disableHomeButton();
                        else
                            enableHomeButton();
                    });
                };

                that.createNavigationButton = function (id, parentDiv, bitmap, content, styleClass, width) {
                    var button = DocEl.Div({ id: id, parent: parentDiv });
                    button.setCssClass(styleClass);
                    button.addStyle('display', 'inline-block');
                    button.setHeightPx(30);
                    button.setWidthPx(width);
                    if (bitmap)
                        button.addElem('<IMG style="float:left;margin-right:5px;" SRC="{bmp}" border=0  ALT=""></IMG>'.DQXformat({ bmp: bitmap }));
                    button.addElem(content);
                };


                that.createNavigationSection = function () {
                    var navSectionDiv = DocEl.Div();
                    navSectionDiv.addStyle("position", "absolute");
                    navSectionDiv.addStyle("right", "0px");
                    navSectionDiv.addStyle("top", "0px");
                    this.createNavigationButton("HeaderHome", navSectionDiv, 'Bitmaps/home.png', "Go to<br>Intro page", "DQXToolButton2",110);
                    $('#' + this.myHeaderFrame.getClientDivID()).append(navSectionDiv.toString());
                    $('#HeaderHome').mousedown(function () { Msg.send({ type: 'Home' }) });
                   
                    disableHomeButton();
                };

                disableHomeButton = function () {
                    $('#HeaderHome').css('opacity', 0.3);
                }
                enableHomeButton = function () {
                    $('#HeaderHome').css('opacity', 1.0);
                }


                that.createButton = function (id, parentDiv, bitmap, content, style) {
                    var button = DocEl.Div({ id: id, parent: parentDiv });
                    button.setWidthPx(200);
                    button.addStyle('margin', '10px');
                    button.setWidthPx(550);
                    button.setHeightPx(20);
                    button.setCssClass(style);
                    button.addStyle('float', 'left');
                    if (bitmap)
                        button.addElem('<IMG style="float:left;margin-right:8px;margin-top:3px" SRC="{bmp}" border=0  ALT=""></IMG>'.DQXformat({ bmp: bitmap }));
                    button.addElem(content);
                };

                that.createWizardButtons = function () {
                    var buttondiv = DocEl.Div();
                    buttondiv.addStyle('clear', 'both');
                  
                    $('#' + this.myFrame.getClientDivID()).append('<p/>' + buttondiv.toString());
                  
                };

                that.createJumpStartButtons = function () {
                    var buttondiv = DocEl.Div();
                    $('#' + this.myFrame.getClientDivID()).append(buttondiv.toString());

                    var buttondiv1 = DocEl.Div();
                    buttondiv1.addStyle('clear', 'both');

                    var buttondiv2 = DocEl.Div();
                    buttondiv2.addStyle('clear', 'both');

                    var jumpStarts = [
                        {
                            id: 'Samples',
                            name: resources.samplesPageHeader + resources.samplesButton,
                            location: buttondiv1,
                            handler: function () {
                                DQX.executeProcessing(function () {
                                    that.myPage.frameSamples.makeVisible();
                                });
                            }
                        },
                        {
                            id: 'Variants',
                            name: resources.variantsPageHeader + resources.variantsButton,
                            location: buttondiv1,
                            handler: function () {
                                DQX.executeProcessing(function () {
                                    that.myPage.frameVariants.makeVisible();
                                });
                            }
                        },
                        {
                            id: 'IntroPublicGenotypes',
                            name: resources.genotypePageHeader + resources.genotypeButton,
                            location: buttondiv1,
                            handler: function () {
                                DQX.executeProcessing(function () {
                                    that.myPage.frameBrowser.makeVisible();
                                });
                            }
                        },
                        {
                            id: 'IntroGenomeBrowser',
                            name: resources.genomePageHeader + resources.genomeButton,
                            location: buttondiv1,
                            handler: function () {
                                DQX.executeProcessing(function () {
                                    that.myPage.frameGenomeBrowser.makeVisible();
                                });
                            }
                        },
                        {
                            id: 'IntroLookSeq',
                            name: resources.lookseqPageHeader + resources.lookseqButton,
                            location: buttondiv1,
                            handler: function () {
                                DQX.executeProcessing(function () {
                                    that.myPage.frameLookSeq.makeVisible();
                                });
                            }
                        },
                        {
                            id: 'IntroDownloads',
                            name: resources.downloadsPageHeader + resources.downloadsButton,
                            location: buttondiv1,
                            handler: function () {
                                DQX.executeProcessing(function () {
                                    that.myPage.frameDownloads.makeVisible();
                                });
                            }
                        }
                    ];

                    for (var i = 0; i < jumpStarts.length; i++) {
                        var jumpStart = jumpStarts[i];
                        this.createButton(jumpStart.id, jumpStart.location, jumpStart.bitmap, jumpStart.name, "DQXToolButton3");
                    }
                    $('#' + this.myFrame.getClientDivID()).append(buttondiv1.toString());
                    $('#' + this.myFrame.getClientDivID()).append(buttondiv2.toString());
                    for (var i = 0; i < jumpStarts.length; i++) {
                        var jumpStart = jumpStarts[i];
                        $('#' + jumpStart.id).mousedown(jumpStart.handler);
                    }
                };

                that.activateState = function () {
                    disableHomeButton();
                    var tabswitched = this.myFrame.makeVisible();
                    //that.panelBrowser.handleResize(); //force immediate calculation of size
                };


                return that;
            }

        };

        return IntroModule;
    });
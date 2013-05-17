define([DQXSCRQ(), DQXSC("Framework"), DQXSC("HistoryManager"), DQXSC("Controls"), DQXSC("Msg"), DQXSC("DocEl"), DQXSC("Utils"), "CrossesMetaData", "i18n!nls/PfCrossesWebResources.js"],
    function (require, Framework, HistoryManager, Controls, Msg, DocEl, DQX, CrossesMetaData, resources) {

        var LookSeqModule = {

            Instance: function (iPage, iFrame, iHeaderFrame) {
            	 var that = Framework.ViewSet(iFrame, 'lookseq');
                 that.myPage = iPage;
                 that.myFrame = iFrame;
                 that.registerView();


                that.createPanels = function () {
                    
                    this.frameContent.setContentHtml('<iframe width="100%" height="100%" src="https://lookseq.sanger.ac.uk/lookseq2/index.html"></iframe>');
                   
                };
                that.createFramework = function () {
                	this.frameContent = Framework.FrameFinal('LookSeqContent', 1);
                	frameContent = this.myFrame.addMemberFrame(this.frameContent)
                     .setMargins(0).setFrameClassClient('DQXDarkFrame').setAllowScrollBars(false, false);
                };
                

                that.activateState = function () {
                    enableHomeButton();
                    var tabswitched = this.myFrame.makeVisible();
                    //that.panelBrowser.handleResize(); //force immediate calculation of size
                };


                return that;
            }

        };

        return LookSeqModule;
    });
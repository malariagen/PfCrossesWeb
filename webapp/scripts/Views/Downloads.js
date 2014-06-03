define(["require", "DQX/Framework", "DQX/HistoryManager", "DQX/Controls", "DQX/Msg", "DQX/DocEl", "DQX/Utils", "CrossesMetaData", "i18n!nls/PfCrossesWebResources"],
    function (require, Framework, HistoryManager, Controls, Msg, DocEl, DQX, CrossesMetaData, resources) {

        var IntroModule = {

            Instance: function (iPage, iFrame, iHeaderFrame) {
            	 var that = Framework.ViewSet(iFrame, 'downloads');
                 that.myPage = iPage;
                 that.myFrame = iFrame;
                 that.registerView();


                that.createPanels = function () {
                    this.frameContent.setContentHtml(resources.downloadsText);
                    $('#' + this.frameContent.getClientDivID()).append('<div style="clear:both"/><br>');
                    //this.createDownloadLinks();
                    //$('#' + this.frameContent.getClientDivID()).append(resources.downloadsGenomeText);
                    //$('#' + this.frameContent.getClientDivID()).append('<ul><li><a href="downloads/RegionClassification">Genome region classification</a></li></ul>');
                };

                that.createFramework = function () {
                	this.frameContent = Framework.FrameFinal('DownloadsContent', 1);
                	frameContent = this.myFrame.addMemberFrame(this.frameContent)
                     .setMargins(15).setFrameClassClient('DQXDarkFrame').setAllowScrollBars(false, true);
                };
                
                that.createDownloadLinks = function () {
                    var content = '<ul>';
                    for (var i = 0; i < CrossesMetaData.variants.length; i++) {
                        var variant = CrossesMetaData.variants[i];
                        if (variant.name != '') {
                            variant.download_href = 'downloads/' + variant.id.split(':')[0] + '.' + variant.id.split(':')[1] + '.vcf.gz';
                        	content += '<li><a href="' + variant.download_href + '">'+ variant.name +'</a></li>';
                    	}
                    }
                    content += '</ul>';
                    $('#' + this.frameContent.getClientDivID()).append(content);
                };

                that.activateState = function () {
                    var tabswitched = this.myFrame.makeVisible();
                };


                return that;
            }

        };

        return IntroModule;
    });
define(["DQX/Framework", "DQX/Model", "DQX/HistoryManager", "DQX/DocEl", "DQX/Msg", "DQX/Popup", "DQX/Controls", "Views/Intro", "Views/Browser", "Views/GenomeBrowser", "Views/Samples", "Views/Variants", "Views/LookSeq", "Views/Downloads", "i18n!nls/PfCrossesWebResources", "CrossesMetaData"],
    function (Framework, Model, HistoryManager, DocEl, Msg, Popup, Controls, IntroModule, BrowserModule, GenomeBrowserModule, SamplesModule, VariantsModule, LookSeqModule, DownloadsModule, resources, CrossesMetaData) {
        thePage = {

            createFramework: function () {

                thePage.frameWindow = Framework.FrameFullWindow(Framework.FrameGroupVert(''));
                thePage.frameRoot = thePage.frameWindow.getFrameRoot();
                thePage.frameRoot.setMargins(0).setSeparatorSize(0);

                //The top line of the page
                thePage.frameHeaderIntro = thePage.frameRoot.addMemberFrame(Framework.FrameFinal('HeaderIntro', 1))
                    .setFixedSize(Framework.dimY, 60).setFrameClassClient('DQXPage').setMargins(0).setAllowScrollBars(false,false);

                
                //The body panel of the page
                thePage.frameBody = thePage.frameRoot.addMemberFrame(Framework.FrameGroupStack('info', 1)).setFrameClassClient('DQXDarkFrame').setMargins(0);

                thePage.frameIntro = thePage.frameBody.addMemberFrame(Framework.FrameFinal('intro', 1))
                .setFrameClass('DQXClient').setDisplayTitle(resources.appName + resources.introPageHeader); ;
                
                thePage.frameBrowser = thePage.frameBody.addMemberFrame(Framework.FrameGroupHor('browser', 1))
                .setMarginsIndividual(0,0,0,0).setDisplayTitle(resources.appName + resources.genotypePageHeader); ;

                thePage.frameGenomeBrowser = thePage.frameBody.addMemberFrame(Framework.FrameGroupHor('genomebrowser', 1))
                .setMarginsIndividual(0, 0, 0, 0).setDisplayTitle(resources.appName + resources.genomePageHeader); ;

                thePage.frameVariants = thePage.frameBody.addMemberFrame(Framework.FrameGroupHor('variants', 1))
                .setMarginsIndividual(0, 0, 0, 0).setDisplayTitle(resources.appName + resources.variantsPageHeader); ;
                
                thePage.frameSamples = thePage.frameBody.addMemberFrame(Framework.FrameGroupHor('samples', 1))
                .setMarginsIndividual(0, 0, 0, 0).setDisplayTitle(resources.appName + resources.samplesPageHeader); ;

                thePage.frameLookSeq = thePage.frameBody.addMemberFrame(Framework.FrameGroupHor('lookSeq', 1))
                .setMarginsIndividual(0, 0, 0, 0).setDisplayTitle(resources.appName + resources.lookseqPageHeader); ;
                
                thePage.frameDownloads = thePage.frameBody.addMemberFrame(Framework.FrameGroupHor('downloads', 1))
                .setMarginsIndividual(0, 0, 0, 0).setDisplayTitle(resources.appName + resources.downloadsPageHeader); ;

                //Create some models for app state
                var filters = {};
                $.each(CrossesMetaData.variant_filters, function (id, filter){
                    filters[id] = true;
                });
                thePage.variant_filters = Model(filters);
                thePage.current_call_set = Model({ 'call_set': '' });

                this.type_search = Model({ snp: true, indel: true });


                //Create the views
                
                thePage.IntroView = IntroModule.Instance(thePage, thePage.frameIntro, thePage.frameHeaderIntro);
                thePage.IntroView.createFramework();


                thePage.BrowserView = BrowserModule.Instance(thePage, thePage.frameBrowser);
                thePage.BrowserView.createFramework();

                thePage.GenomeBrowserView = GenomeBrowserModule.Instance(thePage, thePage.frameGenomeBrowser);
                thePage.GenomeBrowserView.createFramework();

                thePage.VariantsView = VariantsModule.Instance(thePage, thePage.frameVariants);
                thePage.VariantsView.createFramework();
                
                thePage.SamplesView = SamplesModule.Instance(thePage, thePage.frameSamples);
                thePage.SamplesView.createFramework();
                
                thePage.LookSeqView = LookSeqModule.Instance(thePage, thePage.frameLookSeq);
                thePage.LookSeqView.createFramework();
                
                thePage.DownloadsView = DownloadsModule.Instance(thePage, thePage.frameDownloads);
                thePage.DownloadsView.createFramework();
                
                //Register some message handlers that can be used to navigate around in the app
                Msg.listen('', { type: 'Home' }, function (context) { if (!thePage.frameIntro.isVisible()) HistoryManager.setState({ start:null }); });
                Msg.listen('', { type: 'Back' }, function (context) { HistoryManager.back(); });

            }

           
        };

        thePage.promptCallSetIfRequired = function() {
            if (!thePage.current_call_set.get('call_set')) {
                var content = '';
                $.each(CrossesMetaData.variants, function(idx, callset) {
                    var bt = Controls.Button(null,{content: callset.name, width:350 });
                    bt.setOnChanged(function() {
                    thePage.current_call_set.set('call_set',callset.id);
                        DQX.ClosePopup(popupid);
                    })
                    content += bt.renderHtml();
                    content += '<br>';
                });
                content += '<br>NOTE: you can change the active call set any time later<br>using the combo box selector in the left panel<br>'
                var popupid = Popup.create('Select call set', content, null, {canClose: false});
            }
        }

        return thePage;
    });

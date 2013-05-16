define([DQXSC("Framework"), DQXSC("HistoryManager"), DQXSC("DocEl"), DQXSC("Msg"), "Views/Intro", "Views/Browser", "Views/GenomeBrowser", "Views/Samples", "Views/Variants", "i18n!nls/PfCrossesWebResources.js"],
    function (Framework, HistoryManager, DocEl, Msg, IntroModule, BrowserModule, GenomeBrowserModule, SamplesModule, VariantsModule, resources) {
        thePage = {

            createFramework: function () {

                thePage.frameWindow = Framework.FrameFullWindow(Framework.FrameGroupVert(''));
                thePage.frameRoot = thePage.frameWindow.getFrameRoot();
                thePage.frameRoot.setMargins(0);

                //The top line of the page
                thePage.frameHeaderIntro = thePage.frameRoot.addMemberFrame(Framework.FrameFinal('HeaderIntro', 1))
                    .setFixedSize(Framework.dimY, 75).setFrameClassClient('DQXPage');

                
                //The body panel of the page
                thePage.frameBody = thePage.frameRoot.addMemberFrame(Framework.FrameGroupStack('info', 1)).setFrameClassClient('DQXDarkFrame').setMargins(0);

                thePage.frameIntro = thePage.frameBody.addMemberFrame(Framework.FrameFinal('intro', 1))
                .setFrameClass('DQXClient').setDisplayTitle(resources.appName + resources.introPageHeader); ;
                
                thePage.frameBrowser = thePage.frameBody.addMemberFrame(Framework.FrameGroupHor('browser', 1))
                .setMarginsIndividual(0,7,0,0).setDisplayTitle(resources.appName + resources.genotypePageHeader); ;

                thePage.frameGenomeBrowser = thePage.frameBody.addMemberFrame(Framework.FrameGroupHor('genomebrowser', 1))
                .setMarginsIndividual(0, 7, 0, 0).setDisplayTitle(resources.appName + resources.genomePageHeader); ;

                thePage.frameVariants = thePage.frameBody.addMemberFrame(Framework.FrameGroupHor('variants', 1))
                .setMarginsIndividual(0, 7, 0, 0).setDisplayTitle(resources.appName + resources.variantsPageHeader); ;
                
                thePage.frameSamples = thePage.frameBody.addMemberFrame(Framework.FrameGroupHor('samples', 1))
                .setMarginsIndividual(0, 7, 0, 0).setDisplayTitle(resources.appName + resources.samplesPageHeader); ;

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
                
                //Register some message handlers that can be used to navigate around in the app
                Msg.listen('', { type: 'Home' }, function (context) { if (!thePage.frameIntro.isVisible()) HistoryManager.setState({ start:null }); });
                //Msg.listen('', { type: 'ShowBrowser' }, function (context, studyid) { thePage.frameBrowser.makeVisible(); });

            }

           
        };

        return thePage;
    });

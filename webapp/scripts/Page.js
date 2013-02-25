define([DQXSC("Framework"), DQXSC("HistoryManager"), DQXSC("DocEl"), DQXSC("Msg"), "Views/Intro", "Views/Browser", "Views/Samples", "Views/Variants"],
    function (Framework, HistoryManager, DocEl, Msg, IntroModule, BrowserModule, SamplesModule, VariantsModule) {
        thePage = {

            createFramework: function () {

                thePage.frameRoot = Framework.FrameGroupVert('');
                thePage.frameRoot.setMargins(0);

                //The top line of the page
                thePage.frameHeaderIntro = thePage.frameRoot.addMemberFrame(Framework.FrameFinal('HeaderIntro', 1))
                    .setFixedSize(Framework.dimY, 75).setFrameClassClient('DQXPage');

                
                //The body panel of the page
                thePage.frameBody = thePage.frameRoot.addMemberFrame(Framework.FrameGroupStack('info', 1)).setFrameClassClient('DQXDarkFrame').setMargins(8);

                thePage.frameIntro = thePage.frameBody.addMemberFrame(Framework.FrameFinal('intro', 1))
                .setFrameClass('DQXClient').setDisplayTitle('Introduction'); ;

                thePage.frameBrowser = thePage.frameBody.addMemberFrame(Framework.FrameGroupHor('browser', 1))
                .setMargins(10).setDisplayTitle('Browser'); ;

                thePage.frameVariants = thePage.frameBody.addMemberFrame(Framework.FrameGroupHor('variants', 1))
                .setMargins(10).setDisplayTitle('Variants'); ;
                
                thePage.frameSamples = thePage.frameBody.addMemberFrame(Framework.FrameGroupHor('samples', 1))
                .setMargins(10).setDisplayTitle('Samples'); ;

                //Create the views
                
                thePage.IntroView = IntroModule.Instance(thePage, thePage.frameIntro, thePage.frameHeaderIntro);
                thePage.IntroView.createFramework();


                thePage.BrowserView = BrowserModule.Instance(thePage, thePage.frameBrowser);
                thePage.BrowserView.createFramework();

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

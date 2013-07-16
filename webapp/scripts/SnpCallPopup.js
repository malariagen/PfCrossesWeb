
define(["require", "DQX/Framework", "DQX/Controls", "DQX/PopupFrame", "DQX/Msg", "DQX/DocEl",
    "DQX/Utils", "DQX/FrameList",
    "DQX/ChannelPlot/ChannelSnps2", "DQX/DataFetcher/DataFetcherFile", "DQX/DataFetcher/DataFetcherSnp2", "Page", "CrossesMetaData", "Common"],
    function (require, Framework, Controls, PopupFrame, Msg, DocEl, DQX, FrameList,
              ChannelSnps, DataFetcherFile, DataFetcherSnp, Page, CrossesMetaData, Common) {

        var SnpCallPopupModule = {

            lookseq_img_url : function (args) {
                var defaults = { base_url: 'http://panoptes.cggh.org/lookseq',
                    start_pos: 0,
                    end_pos: 0,
                    chrom: '',
                    sample: '',
                    width: 800
                };
                $.extend(defaults, args);
                return Handlebars.compile("{{base_url}}/cgi-bin/index.pl?action=render_image&alg=bwa&from={{start_pos}}&to={{end_pos}}&chr={{chrom}}&sample={{sample}}&width={{width}}&height=0&maxdist=500&view=pileup&output=image&display=|noscale|perfect|snps|single|inversions|pairlinks|faceaway|basequal|&debug=0")(defaults);
            },

            create : function(callSetID, dataLocation, vcf ,snpInfo,seqID,chrom) {
                var that={};

                that.snpInfo=snpInfo;
                that.chrom=chrom;
                that.callSetID=callSetID;
                that.dataLocation = dataLocation;
                that.vcf=vcf;
                that.seqID = seqID;
                that.createFramework = function() {
                    that.popup = PopupFrame.PopupFrame('SnpCallPopupFrame', { title: seqID ? seqID.replace(/__/g, ' / ') + snpInfo.position : callSetID + ' ' + snpInfo.position, sizeX: 830, sizeY: 600 });

                    that.popup.createFrames = function(frameRoot) {
                        that.frameRoot = frameRoot;
                        if (seqID)
                            that.frameRoot.makeGroupTab('');
                        else
                            Framework.makeGroupVert('');
                        that.frameRoot.setFrameClass('DQXDarkFrame');
                        that.frameRoot.setFrameClassClient('DQXDarkFrame');
                        that.frameRoot.setMarginsIndividual(0, 7, 0, 0);

                        var frameGeneral = that.frameRoot.addMemberFrame(Framework.FrameGroupVert('', 1)).setDisplayTitle(seqID ? 'General' : '')/*.setFrameClassClient('DQXForm')*/;

                        that.frameButtons = frameGeneral.addMemberFrame(Framework.FrameFinal('', 0.2)).setAutoSize();

                        var frameInfo = frameGeneral.addMemberFrame(Framework.FrameGroupHor('', 1));

                        that.frameInfoVariant = frameInfo.addMemberFrame(Framework.FrameFinal('', 0.5)).setMargins(0).setDisplayTitle('Variant info').setFrameClassClient('DQXForm');
                        if (seqID) {
                            that.frameInfoCall = frameInfo.addMemberFrame(Framework.FrameFinal('', 0.5)).setMargins(0).setDisplayTitle(that.seqID.replace(/__/g, ' / ')+' call info').setFrameClassClient('DQXForm');
                            that.frameLookSeq = that.frameRoot.addMemberFrame(Framework.FrameFinal('', 1)).setMargins(5).setDisplayTitle('Pileup').setFrameClassClient('DQXForm');
                        }
                    }

                    that.popup.createPanels = function() {
                        that.createLinkButtons();
                        that.createInfoPanel();
                        if (seqID)
                            that.createLookseqPanel();
                    }

                    that.popup.create();


                }

                that.createLinkButtons = function() {
                    this.panelButtons = Framework.Form(this.frameButtons);

                    var btList=[];
                    Common._toolsSNP.forEach(function(tool) {
                        btList.push(Common._generateToolButton(tool, function (handler) {
                            that.popup.close();
                            require("Page").current_call_set.set('call_set', that.callSetID);
                            handler({chromoID: that.chrom, position: that.snpInfo.position});
                            }));
                    });

                    this.panelButtons.addControl(Controls.CompoundHor(btList));


                    this.panelButtons.render();
                }

                that.createInfoPanel = function() {
                    that.frameInfoVariant.setContentHtml("<h2>Fetching the information...</h2>");
                    var infoFetcher = DataFetcherSnp.FetcherSnpDetails(serverUrl);
                    infoFetcher.getSnpInfo(that.dataLocation+'/'+that.vcf,that.chrom,that.snpInfo.position,function(header,content) {
                        header= $.trim(header)
                        content= $.trim(content);
                        var headerComps=header.split('\t');
                        var contentComps=content.split('\t');
                        var stVariant='';
                        var stCall='';
                        for (var compNr=0; compNr<headerComps.length; compNr++) {
                            if (headerComps[compNr]=='INFO') {
                                stVariant+='<b>INFO</b><br/><div style="margin-left: 15px">'
                                $.each(contentComps[compNr].split(';'),function(idx,infoComp){
                                    stVariant+=infoComp+'<br/>';
                                })
                                stVariant+='</div>';
                            }
                            else {
                                if (headerComps[compNr]=='FORMAT') break;
                                stVariant+=headerComps[compNr]+' = '+contentComps[compNr]+'<br>';
                            }
                        }
                        that.frameInfoVariant.setContentHtml('<div style="margin:5px">'+stVariant+'</div>');
                        if (seqID)
                        {
                            if (headerComps[compNr]=='FORMAT') {
                                var formatComponents = contentComps[compNr].split(':')
                                for (;compNr<headerComps.length; compNr++) {
                                    if (headerComps[compNr]==that.seqID.replace(/__/g, '/')) {
                                        formatValues = contentComps[compNr].split(':');
                                        $.each(formatComponents,function(idx,comp) {
                                            stCall+=comp+' = '+formatValues[idx]+'<br>';
                                        })
                                    }
                                }
                            }
                            that.frameInfoCall.setContentHtml('<div style="margin:5px">'+stCall+'</div>');
                        }
                    })
                }


                that.createLookseqPanel = function() {
                    var uid = DQX.getNextUniqueID();
                    that.frameLookSeq.setContentHtml("<img id='" + uid + "' style='position:absolute; top=0px; left=0px;' src='" + SnpCallPopupModule.lookseq_img_url({
                        width: 800,
                        start_pos: snpInfo.position - 50,
                        end_pos: snpInfo.position + 50,
                        sample: seqID.replace(/__/g, '/'),
                        chrom: chrom
                    }) + "'>");
                    $('#' + uid).load(function () {
                        var img = $('#' + uid);
                        //The img may be in a hidden tab so we need to get its width, height from a dupe img.
                        var theImage = new Image();
                        theImage.src = img.attr("src");
                        theImage.onload = function() {
                            var canvas = $("<canvas id='canvas" + uid + "' style='position:absolute; top=0px; left=0px;'></canvas>");
                            canvas.insertAfter(img);
                            canvas.attr('height', theImage.height);
                            canvas.attr('width', theImage.width);
                            var c = canvas.get(0).getContext('2d');
                            c.strokeStyle = '#F00';
                            c.beginPath();
                            c.moveTo(395, 0);
                            c.lineTo(395, theImage.height);
                            c.lineWidth = 1;
                            c.stroke();
                        };
                    })
                }

                that.createFramework();

                return that;
            }
        };

        return SnpCallPopupModule;
    });
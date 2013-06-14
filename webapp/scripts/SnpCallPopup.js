
define(["require", "DQX/Framework", "DQX/Controls", "DQX/PopupFrame", "DQX/Msg", "DQX/DocEl",
    "DQX/Utils", "DQX/FrameList",
    "DQX/ChannelPlot/ChannelSnps2", "DQX/DataFetcher/DataFetcherFile", "DQX/DataFetcher/DataFetcherSnp2", "Page", "CrossesMetaData"],
    function (require, Framework, Controls, PopupFrame, Msg, DocEl, DQX, FrameList,
              ChannelSnps, DataFetcherFile, DataFetcherSnp, Page, CrossesMetaData) {

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

                that.callSetID=callSetID;
                that.dataLocation = dataLocation;
                that.vcf=vcf;
                that.createFramework = function() {
                    that.popup = PopupFrame.PopupFrame('SnpCallPopupFrame', Framework.FrameGroupTab(''), { title: seqID.replace(/__/g, '/') + snpInfo.position, sizeX: 830, sizeY: 800 });
                    that.frameRoot = that.popup.getFrameRoot();
                    that.frameRoot.setFrameClass('DQXForm');
                    that.frameRoot.setMarginsIndividual(0, 7, 0, 0);

                    that.frameInfo = that.frameRoot.addMemberFrame(Framework.FrameFinal('', 1)).setMargins(5).setDisplayTitle('SNP info').setFrameClassClient('DQXForm');
                    that.frameLookSeq = that.frameRoot.addMemberFrame(Framework.FrameFinal('', 1)).setMargins(5).setDisplayTitle('Pileup').setFrameClassClient('DQXForm');

                    that.popup.render();
                    that.createInfoPanel();
                    that.createLookseqPanel();
                }

                that.createInfoPanel = function() {
                    that.frameInfo.setContentHtml("<h2>Fetching the information...</h2>");
                    var infoFetcher = DataFetcherSnp.FetcherSnpDetails(serverUrl);
                    infoFetcher.getSnpInfo(that.dataLocation+'/'+that.vcf,chrom,snpInfo.position,function(header,content) {
                        var headerComps=header.split('\t');
                        var contentComps=content.split('\t');
                        var st='';
                        for (i=0; i<headerComps.length; i++) {
                            st+=headerComps[i]+' = '+contentComps[i]+'<br>';
                        }
                        that.frameInfo.setContentHtml(st);
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
                        var canvas = $("<canvas id='canvas" + uid + "' style='position:absolute; top=0px; left=0px;'></canvas>");
                        canvas.insertAfter(img);
                        canvas.attr('height', img.height());
                        canvas.attr('width', img.width());
                        var c = canvas.get(0).getContext('2d');
                        c.strokeStyle = '#F00';
                        c.beginPath();
                        c.moveTo(395, 0);
                        c.lineTo(395, canvas.height());
                        c.lineWidth = 1;
                        c.stroke();
                    })
                }

                that.createFramework();

                return that;
            }
        };

        return SnpCallPopupModule;
    });
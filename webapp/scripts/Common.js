define(["require", "DQX/Framework", "DQX/Msg", "DQX/SQL", "DQX/DocEl", "DQX/Popup",
    "DQX/Controls", "DQX/Wizard", "CrossesMetaData"],
    function (require, Framework, Msg, SQL, DocEl, Popup,
              Controls, Wizard, CrossesMetaData) {


        var Common = {}

        //A utility function that parses a string of the format chromosome:start-stop
        Common.decodeGenomicRegionString = function (region) {
            var chromoid = region.split(':')[0];
            var regionstr = region.split(':')[1];
            if (!regionstr) {
                alert('Invalid region');
                return;
            }
            if (regionstr.indexOf('-') > 0) {//an actual region
                var pos1 = parseInt(regionstr.split('-')[0]);
                var pos2 = parseInt(regionstr.split('-')[1]);
            }
            else {//a single position
                var pos1 = parseInt(regionstr);
                var pos2 = pos1;
            }
            return { chromoID: chromoid, start: pos1, end: pos2 };
        }

        Common._toolsSNP = [];
        Common._toolsSNPMap = {};

        Common.addToolSNP = function (id, name, bitmap, handler) {
            Common._toolsSNP.push({ id: id, name: name, bitmap: bitmap, handler: handler });
            Common._toolsSNPMap[id] = handler;
        }

        Common._handleToolSNP = function (snpid, toolid) {
            Common._toolsSNPMap[toolid](snpid);
        }

        Common._toolsGene = [];
        Common._toolsGeneMap = {};

        Common.addToolGene = function (id, name, bitmap, handler) {
            Common._toolsGene.push({ id: id, name: name, bitmap: bitmap, handler: handler });
            Common._toolsGeneMap[id] = handler;
        }

        Common._handleToolGene = function (geneid, toolid) {
            Common._toolsGeneMap[toolid](geneid);
        }

        //NOTE: when a button is pressed, the handlerEnvelope function is called, with the actual tool handler as an argument.
        //This allows the creator of this button to provide the correct argument for the tool handler, and perform other stuff if necessary
        Common._generateToolButton = function (tool, handlerEnvelope) {
            if (DQX.checkIsFunction(handlerEnvelope))
                DQX.reportError('Invalid handler');
            var args = { buttonClass: 'DQXToolButton2', content: tool.name, width: 150, height: 51 }
            if (tool.bitmap)
                args.bitmap = "Bitmaps/{bmp}".DQXformat({ bmp: tool.bitmap });
            var bt = Controls.Button(null, args);
            bt.setOnChanged(function () {
                handlerEnvelope(tool.handler);
            });
            return bt;
        }

        Common.generateToolButtonsGene = function (excludeToolID, handlerEnvelope) {
            var dv = DocEl.Div();
            for (var i = 0; i < Common._toolsGene.length; i++) {
                var tool = Common._toolsGene[i];
                if (tool.id != excludeToolID)
                    dv.addElem(Common._generateToolButton(tool, handlerEnvelope).renderHtml());
            }
            return dv.toString();
        }



        //Create handlers for various tool buttons
        Common.addToolHandlers = function () {
            /*
            //Tool handler that opens a gene in PlasmoDbhandleShowGenePopup
            Common.addToolGene("Gene2PlasmoDb", "Show in PlasmoDb", "plasmodb_bw.png", function (args) {
                var url = CrossesMetaData.externalGeneLink.DQXformat({ id: args.geneid });
                window.open(url, '_blank');
            });
            */
        }

        Common.showSNPPopup = function(data) {
            data.call_set = data.call_set.replace("_gatk", ":gatk");
            data.call_set = data.call_set.replace("_cortex", ":cortex");
            var vcf = CrossesMetaData.variantsMap[data.call_set].vcf;
            require("SnpCallPopup").create(data.call_set, "SnpDataCross3", vcf, {position: data.snp_pos}, null, data.chrom);
        }

        //Returns html with info about a gene
        Common.GeneData2InfoTable = function (data) {
            tokens = {};
            tokens["ID:"] = decodeURIComponent(data.fid);
            tokens["Names:"] = decodeURIComponent(data.fnames);
            tokens["Description:"] = decodeURIComponent(data.descr);
            tokens["Position:"] = data.chromid + ':' + data.fstart + '-' + data.fstop;
            return DQX.CreateKeyValueTable(tokens);
        }

        function handleShowGenePopup(data) {
            var geneid = data.fid;
            var geneData = { geneid: geneid, chromid: data.chromid, start: parseInt(data.fstart), stop: parseInt(data.fstop) };
            var content = '<div>' + Common.GeneData2InfoTable(data) + "</div>";
            for (var i = 0; i < Common._toolsGene.length; i++) {
                content += Common._generateToolButton(Common._toolsGene[i], function (handler) {
                    Popup.closeIfNeeded(popupID);
                    handler(geneData);
                }).renderHtml();
            }

            content += '<br>';
            $.each(CrossesMetaData.listExternalGeneLinks,function(idx,linkInfo) {
                var bt = Controls.Button(null, { buttonClass: 'DQXToolButton0', content: 'Find in <b>'+linkInfo.name+'</b>'});
                bt.setOnChanged(function() {
                    var url = linkInfo.url.DQXformat({ id: geneid });
                    window.open(url, '_blank');
                })
                content += bt.renderHtml();
            })

            var popupID = Popup.create("Gene " + geneid, content);
        }

        Common.showGenePopup = function (id) {
            require("Wizards/WizardFindGene").addGeneHit(id);
            Common.fetchGeneData(id, handleShowGenePopup);
        }


        //Call this function to fetch gene data in an async way
        Common.fetchGeneData = function (id, handleFunction) {
            var myurl = DQX.Url(serverUrl);
            myurl.addUrlQueryItem("datatype", 'recordinfo');
            myurl.addUrlQueryItem("qry", SQL.WhereClause.encode(SQL.WhereClause.CompareFixed('fid', '=', id)));
            myurl.addUrlQueryItem("database", CrossesMetaData.database);
            myurl.addUrlQueryItem("tbname", CrossesMetaData.tableAnnotation);
            $.ajax({
                url: myurl.toString(),
                success: function (resp) {
                    DQX.stopProcessing();
                    var keylist = DQX.parseResponse(resp);
                    if ("Error" in keylist) {
                        alert(keylist.Error);
                        return;
                    }
                    handleFunction(keylist.Data);
                },
                error: DQX.createMessageFailFunction()
            });
            DQX.setProcessing("Downloading...");
        }


        //Create event listener for actions to open a SNP popup window
        Msg.listen('', { type: 'ShowSNPPopup' }, function (context, data) {
            Common.showSNPPopup(data);
        });

        //Create event listener for actions to open a gene popup window
        Msg.listen('', { type: 'ShowGenePopup' }, function (context, geneid) {
            require("Wizards/WizardFindGene").addGeneHit(geneid);
            Common.showGenePopup(geneid);
        });


        return Common;
    });
define([DQXSC("Utils"), "i18n!nls/PfCrossesWebResources.js"],
    function (DQX, resources) {
        var CrossesMetaData = {};

        CrossesMetaData.database = "pfx";
        CrossesMetaData.tableSamples = "pfx_samples";
        CrossesMetaData.tableVariants = "variants_filtered";

        CrossesMetaData.callMethods = ['gatk', 'cortex'];

        CrossesMetaData.sampleSets = [{ id: '', name: '' },
                                      { id: 'hb3_dd2', name: resources.xhb3_dd2 },
                                      { id: '3d7_hb3', name: resources.x3d7_hb3 },
                                      { id: '7g8_gb4', name: resources.x7g8_gb4}];
        CrossesMetaData.variants = [
                                    { id: '', name: '' },
                                    {
                                        id: 'hb3_dd2:cortex',
                                        name: resources.xhb3_dd2 + ' - ' + resources.variantsDescrip + ' (Cortex)',
                                        download_href: 'downloads/hb3_dd2.cortex.both.final.vcf.gz'
                                    },
                                    {
                                        id: 'hb3_dd2:gatk',
                                        name: resources.xhb3_dd2 + ' - ' + resources.variantsDescrip + ' (GATK)',
                                        download_href: 'downloads/hb3_dd2.gatk.both.final.vcf.gz'
                                    },
                                    {
                                        id: '3d7_hb3:cortex',
                                        name: resources.x3d7_hb3 + ' - ' + resources.variantsDescrip + ' (Cortex)',
                                        download_href: 'downloads/3d7_hb3.cortex.both.final.vcf.gz'
                                    },
                                    {
                                        id: '3d7_hb3:gatk',
                                        name: resources.x3d7_hb3 + ' - ' + resources.variantsDescrip + ' (GATK)',
                                        download_href: 'downloads/3d7_hb3.gatk.both.final.vcf.gz'
                                    },
                                    {
                                        id: '7g8_gb4:cortex',
                                        name: resources.x7g8_gb4 + ' - ' + resources.variantsDescrip + ' (Cortex)',
                                        download_href: 'downloads/7g8_gb4.cortex.both.final.vcf.gz'
                                    },
                                    {
                                        id: '7g8_gb4:gatk',
                                        name: resources.x7g8_gb4 + ' - ' + resources.variantsDescrip + ' (GATK)',
                                        download_href: 'downloads/7g8_gb4.gatk.both.final.vcf.gz'
                                    }
                                    ];


        //generate the SNP datasources
        $.each(CrossesMetaData.variants, function (idx, callSet) {
            callSet.dataSourceSNP = '';
            if (callSet.id.length > 0) {
                var crossName = callSet.id.split(':')[0];
                var callMethod = callSet.id.split(':')[1].toUpperCase();
                callSet.dataSourceSNP = callMethod + '_final_' + crossName;
            }
        });

        //Generate map for variants lookup
        CrossesMetaData.variantsMap = {}
        $.each(CrossesMetaData.variants, function (idx, callSet) {
            if (callSet.id.length > 0) {
                CrossesMetaData.variantsMap[callSet.id] = callSet;
            }
        });

        //////// Information about the chromosomes
        CrossesMetaData.chromosomes = [
            { id: 'Pf3D7_01_v3', len: 0.7 },
            { id: 'Pf3D7_02_v3', len: 1 },
            { id: 'Pf3D7_03_v3', len: 1 },
            { id: 'Pf3D7_04_v3', len: 2 },
            { id: 'Pf3D7_05_v3', len: 2 },
            { id: 'Pf3D7_06_v3', len: 2 },
            { id: 'Pf3D7_07_v3', len: 2 },
            { id: 'Pf3D7_08_v3', len: 2 },
            { id: 'Pf3D7_09_v3', len: 2 },
            { id: 'Pf3D7_10_v3', len: 2 },
            { id: 'Pf3D7_11_v3', len: 4 },
            { id: 'Pf3D7_12_v3', len: 4 },
            { id: 'Pf3D7_13_v3', len: 4 },
            { id: 'Pf3D7_14_v3', len: 4 }
        ];
        $.each(CrossesMetaData.chromosomes, function (idx, chr) { chr.name = chr.id; });


        CrossesMetaData.fillFieldList = function (fieldList) {
            for (var i = 0; i < fieldList.length; i++) {
                var info = fieldList[i];
                if (!(info.name))
                    info.name = info.shortName;
                if (!(info.comment))
                    info.comment = info.name;
            }
        }
        CrossesMetaData.createFieldList = function () {
            CrossesMetaData.fieldList = [];

            CrossesMetaData.fieldList.push({ id: "source_code", shortName: "Clone", name: "Clone name", dataTypeID: "String" });
            CrossesMetaData.fieldList.push({ id: "ox_code", shortName: "Sample", name: "Sample name", dataTypeID: "String" });
            CrossesMetaData.fieldList.push({ id: "run", shortName: "Run", name: "Run", dataTypeID: "String" });
            CrossesMetaData.fieldList.push({ id: "coverage", shortName: "Coverage", name: "Coverage", dataTypeID: "String" });
            CrossesMetaData.fieldList.push({ id: "percent_mapped", shortName: "% Mapped", name: "Percent Mapped", dataTypeID: "Float",
                textConvertFunction: (function (x) { return (parseFloat(x)).toFixed(1); })
            });

            CrossesMetaData.fillFieldList(CrossesMetaData.fieldList);

            //Lookup object to find field info by ID
            CrossesMetaData.fieldMap = {};
            for (var i = 0; i < CrossesMetaData.fieldList.length; i++)
                CrossesMetaData.fieldMap[CrossesMetaData.fieldList[i].id] = CrossesMetaData.fieldList[i];


            CrossesMetaData.variantFieldList = [];

            CrossesMetaData.variantFieldList.push({ id: "chrom_pos", shortName: "position", dataTypeID: "String" });
            CrossesMetaData.variantFieldList.push({ id: "gene", shortName: "gene", dataTypeID: "String" });
            CrossesMetaData.variantFieldList.push({ id: "ref", shortName: "ref", dataTypeID: "String" });
            CrossesMetaData.variantFieldList.push({ id: "alt", shortName: "alt", dataTypeID: "String" });
            CrossesMetaData.variantFieldList.push({ id: "filter", shortName: "filter", dataTypeID: "String" });

            CrossesMetaData.gatkVariantFieldList = CrossesMetaData.variantFieldList.slice(0);

            CrossesMetaData.gatkVariantFieldList.push({ id: "vqslod", shortName: "vqslod", dataTypeID: "Float" });
            CrossesMetaData.gatkVariantFieldList.push({ id: "dp", shortName: "dp", dataTypeID: "Int" });
            CrossesMetaData.gatkVariantFieldList.push({ id: "mq", shortName: "mq", dataTypeID: "Int" });
            CrossesMetaData.gatkVariantFieldList.push({ id: "mq0fraction", shortName: "mq0fraction", dataTypeID: "Float" });
            CrossesMetaData.gatkVariantFieldList.push({ id: "uq", shortName: "uq", dataTypeID: "Int" });

            CrossesMetaData.cortexVariantFieldList = CrossesMetaData.variantFieldList.slice(0);
            CrossesMetaData.cortexVariantFieldList.push({ id: "site_conf", shortName: "site_conf", dataTypeID: "Float" });

            CrossesMetaData.fillFieldList(CrossesMetaData.gatkVariantFieldList);
            CrossesMetaData.fillFieldList(CrossesMetaData.cortexVariantFieldList);


            //Lookup object to find field info by ID
            CrossesMetaData.variantFieldMap = {};
            for (var i = 0; i < CrossesMetaData.variantFieldList.length; i++)
                CrossesMetaData.variantFieldMap[CrossesMetaData.variantFieldList[i].id] = CrossesMetaData.variantFieldList[i];
        }

        //A class providing information about fields in the SNP data set
        CrossesMetaData.MGDataType = function (dataTypeID) {
            var that = {};
            that.dataTypeID = dataTypeID;

            that.getMinValue = function () {
                if (this.isFraction()) return 0;
                DQX.reportError("Data type '{tpe} does not have a minimum value'".DQXformat({ tpe: this.dataTypeID }));
            }

            that.getMaxValue = function () {
                if (this.isFraction()) return 1; //!!!todo: set to 0.5 for MAF
                DQX.reportError("Data type '{tpe} does not have a maximum value'".DQXformat({ tpe: this.dataTypeID }));
            }

            that.isFraction = function () {

                return false;
            }

            that.isFloat = function () {
                if (this.isFraction()) return true;
                if (this.dataTypeID == "Float") return true;
                return false;
            }

            that.isString = function () {
                if (this.dataTypeID == "String") return true;

                return false;
            }

            that.isInteger = function () {
                if (this.dataTypeID == "Int") return true;

                return false;
            }

            that.getDownloadType = function () {
                if (this.isFloat()) return "Float3";
                if (this.isString()) return "String";
                if (this.isInteger()) return "Int";
                DQX.reportError("Unrecognised data type '{tpe}'".DQXformat({ tpe: dataType }));
            }

            that.getQueryBuilderType = function () {

                if (this.isFloat()) return "Float";
                if (this.isString()) return "String";
                if (this.isInteger()) return "Int";
                DQX.reportError("Unrecognised data type '{tpe}'".DQXformat({ tpe: dataType }));
            }

            that.getMultipeChoiceList = function () {

                return [];
            }

            that.getBackColorFunction = function () {
                return function (vl) { return "white"; };
            }

            that.getTextConvertFunction = function () {

                return function (x) { if (x) return x.toString(); else return '-' };
            }

            return that;
        }

        CrossesMetaData.createFieldList();
        return CrossesMetaData;
    });
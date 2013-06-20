define(["DQX/Utils", "i18n!nls/PfCrossesWebResources"],
    function (DQX, resources) {
        var CrossesMetaData = {};

        CrossesMetaData.database = "pfx";
        CrossesMetaData.tableAnnotation = "pf3annot";
        CrossesMetaData.externalGeneLink = "http://old.plasmodb.org/plasmo/showRecord.do?name=GeneRecordClasses.GeneRecordClass&project_id=&primary_key={id}";
        CrossesMetaData.tableSamples = "pfx_samples";
        CrossesMetaData.tableVariants = "variants_filtered";

        CrossesMetaData.callMethods = ['gatk', 'cortex'];

        CrossesMetaData.sampleSets = [{ id: '', name: '' },
                                      { id: '3d7_hb3', name: resources.x3d7_hb3, color:DQX.Color(0.7,  0.3,0.0) },
                                      { id: 'hb3_dd2', name: resources.xhb3_dd2, color: DQX.Color(0.0, 0.6, 0.3) },
                                      { id: '7g8_gb4', name: resources.x7g8_gb4, color: DQX.Color(0.6, 0.2, 0.6) }
                                      ];
        CrossesMetaData.variants = [
                                    { id: '', name: '' },

                                    {
                                        id: '3d7_hb3:gatk',
                                        name: resources.x3d7_hb3 + ' - ' + resources.variantsDescrip + ' (GATK)',
                                        vcf: '3d7_hb3.gatk.both.final',
                                        download_href: 'downloads/3d7_hb3.gatk.both.final.vcf.gz'
                                    },
                                    {
                                        id: '3d7_hb3:cortex',
                                        name: resources.x3d7_hb3 + ' - ' + resources.variantsDescrip + ' (Cortex)',
                                        vcf: '3d7_hb3.cortex.final',
                                        download_href: 'downloads/3d7_hb3.cortex.final.vcf.gz'
                                    },
                                    {
                                        id: 'hb3_dd2:gatk',
                                        name: resources.xhb3_dd2 + ' - ' + resources.variantsDescrip + ' (GATK)',
                                        vcf:'hb3_dd2.gatk.both.final',
                                        download_href: 'downloads/hb3_dd2.gatk.both.final.vcf.gz'
                                    },
                                    {
                                        id: 'hb3_dd2:cortex',
                                        name: resources.xhb3_dd2 + ' - ' + resources.variantsDescrip + ' (Cortex)',
                                        vcf:'hb3_dd2.cortex.final',
                                        download_href: 'downloads/hb3_dd2.cortex.final.vcf.gz'
                                    },
                                    {
                                        id: '7g8_gb4:gatk',
                                        name: resources.x7g8_gb4 + ' - ' + resources.variantsDescrip + ' (GATK)',
                                        vcf:'7g8_gb4.gatk.both.final',
                                        download_href: 'downloads/7g8_gb4.gatk.both.final.vcf.gz'
                                    },
                                    {
                                        id: '7g8_gb4:cortex',
                                        name: resources.x7g8_gb4 + ' - ' + resources.variantsDescrip + ' (Cortex)',
                                        vcf:'7g8_gb4.cortex.final',
                                        download_href: 'downloads/7g8_gb4.cortex.final.vcf.gz'
                                    },
        ];

        CrossesMetaData.variant_filters = {
            ParentCallMissing: {
                label : "ParentCallMissing",
                description : "One or both parents have a missing genotype call.",
                call_methods: ['cortex', 'gatk']
            },
            SubtelomericHypervariable:{
                label : "SubtelomericHypervariable",
                description : "Variant is within a sub-telomeric hypervariable region.",
                call_methods: ['cortex', 'gatk']
            },
            NonMendelian:{
                label : "NonMendelian",
                description : "Variant calls are not consistent with Mendelian segregation because one or more progeny have an allele not found in either parent.",
                call_methods: ['cortex', 'gatk']
            },
            LowQuality:{
                label : "LowQuality",
                description : "Recalibrated variant quality score (VQSLOD) falls below defined threshold.",
                call_methods: ['gatk']
            },
            InternalHypervariable:{
                label : "InternalHypervariable",
                description : "Variant is within a chromosome-internal hypervariable region.",
                call_methods: ['cortex', 'gatk']
            },
            Centromere:{
                label : "Centromere",
                description : "Variant is within a centromere.",
                call_methods: ['cortex', 'gatk']
            },
            SubtelomericRepeat:{
                label : "SubtelomericRepeat",
                description : "Variant is within a sub-telomeric repeat region.",
                call_methods: ['cortex', 'gatk']
            },
            MAPQ:{
                label : "MAPQ",
                description : "5prime flank maps to reference with mapping quality below 40.",
                call_methods: ['cortex']
            },
            MISMAPPED_UNPLACEABLE:{
                id : "",
                label : "MISMAPPED_UNPLACEABLE",
                description : "Stampy mapped the variant (using the 5p-flank) confidently (mapqual> 40) to a place where the ref-allele does not match.",
                call_methods: ['cortex']
            },
            MULTIALLELIC:{
                id : "",
                label : "MULTIALLELIC",
                description : "Variant formed from merged alleles.",
                call_methods: ['cortex']
            },
            OVERLAPPING_SITE:{
                label : "OVERLAPPING_SITE",
                description : "If Stampy (or combining VCFs) has placed two biallelic variants overlapping, they are filtered.",
                call_methods: ['cortex']
            },
            PF_FAIL_REPEAT:{
                label : "PF_FAIL_REPEAT",
                description : "The variant is likely to be an artifact due to repetitive sequence.",
                call_methods: ['cortex']

            },
            PF_FAIL_ERROR:{
                label : "PF_FAIL_ERROR",
                description : "The variant is likely to be a sequencing error.",
                call_methods: ['cortex']
            }
        };

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
            { id: 'Pf3D7_01_v3', len: 0.640851 },
            { id: 'Pf3D7_02_v3', len: 0.947102 },
            { id: 'Pf3D7_03_v3', len: 1.067971 },
            { id: 'Pf3D7_04_v3', len: 1.200490 },
            { id: 'Pf3D7_05_v3', len: 1.343557 },
            { id: 'Pf3D7_06_v3', len: 1.418242 },
            { id: 'Pf3D7_07_v3', len: 1.445207 },
            { id: 'Pf3D7_08_v3', len: 1.472805 },
            { id: 'Pf3D7_09_v3', len: 1.541735 },
            { id: 'Pf3D7_10_v3', len: 1.687656 },
            { id: 'Pf3D7_11_v3', len: 2.038340 },
            { id: 'Pf3D7_12_v3', len: 2.271494 },
            { id: 'Pf3D7_13_v3', len: 2.925236 },
            { id: 'Pf3D7_14_v3', len: 3.291936 }
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
            CrossesMetaData.fieldList.push({ id: "coverage", shortName: "Coverage", name: "Coverage", dataTypeID: "Int" });
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

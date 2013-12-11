define(["DQX/Utils", "i18n!nls/PfCrossesWebResources"],
    function (DQX, resources) {
        var CrossesMetaData = {};

        CrossesMetaData.database = "pfx";
        CrossesMetaData.tableAnnotation = "annotation";

        CrossesMetaData.externalGeneLink = "http://old.plasmodb.org/plasmo/showRecord.do?name=GeneRecordClasses.GeneRecordClass&project_id=&primary_key={id}";

        CrossesMetaData.listExternalGeneLinks = [
            {
                name: "GeneDb",
                url:"http://www.genedb.org/Query/quickSearch?taxons=Pfalciparum&searchText={id}&_pseudogenes=on&allNames=true&_allNames=on&_product=on"
            },
            {
                name: "PlasmoDB",
                url:"http://plasmodb.org/plasmo/showRecord.do?name=GeneRecordClasses.GeneRecordClass&project_id=&primary_key={id}"
            }
        ];

        CrossesMetaData.tableSamples = "pfx_samples";
        CrossesMetaData.tableVariants = "variants3";

        //Some field name in variants table
        CrossesMetaData.fieldCrossName = 'ExpName';

        CrossesMetaData.callMethods = ['gatk', 'cortex'];

        CrossesMetaData.sampleSets = [
                                      //{ id: '', name: '' },
                                      { id: '3d7_hb3', name: resources.x3d7_hb3, color:DQX.Color(0.7,  0.3,0.0) },
                                      { id: 'hb3_dd2', name: resources.xhb3_dd2, color: DQX.Color(0.0, 0.6, 0.3) },
                                      { id: '7g8_gb4', name: resources.x7g8_gb4, color: DQX.Color(0.6, 0.2, 0.6) }
                                      ];
        CrossesMetaData.variants = [
                                    //{ id: '', name: '' },

                                    {
                                        id: '3d7_hb3:gatk',
                                        crossDispName:resources.x3d7_hb3,
                                        name: resources.x3d7_hb3 + ' - ' + resources.variantsDescrip + ' (GATK)',
                                        vcf: '3d7_hb3.gatk.final',
                                        download_href: 'downloads/3d7_hb3.gatk.both.final.vcf.gz'
                                    },
                                    {
                                        id: '3d7_hb3:cortex',
                                        crossDispName:resources.x3d7_hb3,
                                        name: resources.x3d7_hb3 + ' - ' + resources.variantsDescrip + ' (Cortex)',
                                        vcf: '3d7_hb3.cortex.final',
                                        download_href: 'downloads/3d7_hb3.cortex.final.vcf.gz'
                                    },
                                    {
                                        id: 'hb3_dd2:gatk',
                                        crossDispName:resources.xhb3_dd2,
                                        name: resources.xhb3_dd2 + ' - ' + resources.variantsDescrip + ' (GATK)',
                                        vcf:'hb3_dd2.gatk.final',
                                        download_href: 'downloads/hb3_dd2.gatk.both.final.vcf.gz'
                                    },
                                    {
                                        id: 'hb3_dd2:cortex',
                                        crossDispName:resources.xhb3_dd2,
                                        name: resources.xhb3_dd2 + ' - ' + resources.variantsDescrip + ' (Cortex)',
                                        vcf:'hb3_dd2.cortex.final',
                                        download_href: 'downloads/hb3_dd2.cortex.final.vcf.gz'
                                    },
                                    {
                                        id: '7g8_gb4:gatk',
                                        crossDispName:resources.x7g8_gb4,
                                        name: resources.x7g8_gb4 + ' - ' + resources.variantsDescrip + ' (GATK)',
                                        vcf:'7g8_gb4.gatk.final',
                                        download_href: 'downloads/7g8_gb4.gatk.both.final.vcf.gz'
                                    },
                                    {
                                        id: '7g8_gb4:cortex',
                                        crossDispName:resources.x7g8_gb4,
                                        name: resources.x7g8_gb4 + ' - ' + resources.variantsDescrip + ' (Cortex)',
                                        vcf:'7g8_gb4.cortex.final',
                                        download_href: 'downloads/7g8_gb4.cortex.final.vcf.gz'
                                    },
        ];

/*
Common
 ##FILTER=<ID=MISSING_PARENT,Description="One or both parents have a missing genotype call.">
 ##FILTER=<ID=NON_CORE,Description="Variant is not within the core genome.">
 ##FILTER=<ID=NON_MENDELIAN,Description="Variant calls are not consistent with Mendelian segregation because one or more progeny have an allele not found in either parent.">
 ##FILTER=<ID=LOW_CONFIDENCE,Description="Variant confidence is low.">
 ##FILTER=<ID=LOW_CONFIDENCE_PARENT,Description="Genotype confidence for one or both parents is low (GQ < 99).">
 ##FILTER=<ID=CNV,Description="There is evidence for copy number variation at this locus.">
 ##FILTER=<ID=DUP_SITE,Description="Variant position coincides with another.">
 ##FILTER=<ID=NON_SEGREGATING,Description="Variant is fixed within the sample set.">

GATK filters:
 #
Cortex filters:
 ##FILTER=<ID=MAPQ,Description="5prime flank maps to reference with mapping quality below 40">
 ##FILTER=<ID=MISMAPPED_UNPLACEABLE,Description="Stampy mapped the variant (using the 5p-flank) confidently (mapqual> 40) to a place where the ref-allele does not match">
 ##FILTER=<ID=MULTIALLELIC,Description="Cortex does not call multiallelic sites, but combining run_calls VCFs can produce them. Filtered as current genotyper assumes biallelic.">
 ##FILTER=<ID=OVERLAPPING_SITE,Description="If Stampy (or combining VCFs) has placed two biallelic variants overlapping, they are filtered">
 ##FILTER=<ID=PF_FAIL_ERROR,Description="Likely to be a sequencing error">
 ##FILTER=<ID=PF_FAIL_REPEAT,Description="Likely to be an artifact due to repetitive sequence">




 ##FILTER=<ID=DUP_ALLELE,Description="Duplicate allele">
         */

        CrossesMetaData.variant_filters = {
            MISSING_PARENT: {
                label : "MISSING_PARENT",
                description : "One or both parents have a missing genotype call.",
                call_methods: ['cortex', 'gatk']
            },
            NON_CORE:{
                label : "NON_CORE",
                description : "Variant is not within the core genome.",
                call_methods: ['cortex', 'gatk']
            },
            NON_MENDELIAN:{
                label : "NON_MENDELIAN",
                description : "Variant calls are not consistent with Mendelian segregation because one or more progeny have an allele not found in either parent.",
                call_methods: ['cortex', 'gatk']
            },
            LOW_CONFIDENCE:{
                label : "LOW_CONFIDENCE",
                description : "Variant confidence is low.",
                call_methods: ['cortex', 'gatk']
            },
            LOW_CONFIDENCE_PARENT:{
                label : "LOW_CONFIDENCE_PARENT",
                description : "Genotype confidence for one or both parents is low (GQ < 99).",
                call_methods: ['cortex', 'gatk']
            },
            CNV:{
                label : "CNV",
                description : "There is evidence for copy number variation at this locus.",
                call_methods: ['cortex', 'gatk']
            },
            DUP_SITE:{
                label : "DUP_SITE",
                description : "Variant position coincides with another.",
                call_methods: ['cortex', 'gatk']
            },
            NON_SEGREGATING:{
                label : "NON_SEGREGATING",
                description : "Variant is fixed within the sample set.",
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
            },
            DUP_ALLELE:{
                label : "DUP_ALLELE",
                description : "Duplicate allele.",
                call_methods: ['cortex']
            }
        };

        //generate the SNP datasources
        $.each(CrossesMetaData.variants, function (idx, callSet) {
            callSet.dataSourceSNP = '';
            if (callSet.id.length > 0) {
                var crossName = callSet.id.split(':')[0];
                var callMethod = callSet.id.split(':')[1].toUpperCase();
                callSet.crossName = crossName;
                callSet.callMethod = callMethod;
                callSet.dataSourceSNP = callMethod + '_final_' + crossName;
                callSet.dataSourceDnpDensity = 'SNPDENS_F_{cross}_{method}'.DQXformat({cross:crossName, method:callMethod.toLowerCase()});
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
            CrossesMetaData.variantFieldList.push({ id: "GeneId", shortName: "gene", dataTypeID: "String" });
            CrossesMetaData.variantFieldList.push({ id: "REF", shortName: "REF", dataTypeID: "String" });
            CrossesMetaData.variantFieldList.push({ id: "ALT", shortName: "ALT", dataTypeID: "String" });
            CrossesMetaData.variantFieldList.push({ id: "Effect", shortName: "Effect", dataTypeID: "String" });
            CrossesMetaData.variantFieldList.push({ id: "AminoAcidChange", shortName: "Mutation", dataTypeID: "String" });
            CrossesMetaData.variantFieldList.push({ id: "RegionType", shortName: "RegionType", dataTypeID: "String" });
            CrossesMetaData.variantFieldList.push({ id: "GC", shortName: "GC", dataTypeID: "Float" });
            CrossesMetaData.variantFieldList.push({ id: "STR", shortName: "STR", dataTypeID: "String" });
            CrossesMetaData.variantFieldList.push({ id: "RU", shortName: "RU", dataTypeID: "String" });
            CrossesMetaData.variantFieldList.push({ id: "FILTER", shortName: "FILTER", dataTypeID: "String" });

            CrossesMetaData.gatkVariantFieldList = CrossesMetaData.variantFieldList.slice(0);

            CrossesMetaData.gatkVariantFieldList.push({ id: "VQSLOD", shortName: "VQSLOD", dataTypeID: "Float" });
            CrossesMetaData.gatkVariantFieldList.push({ id: "BaseQRankSum", shortName: "BaseQRankSum", dataTypeID: "Float" });
            CrossesMetaData.gatkVariantFieldList.push({ id: "DP", shortName: "DP", dataTypeID: "Int" });
            CrossesMetaData.gatkVariantFieldList.push({ id: "FS", shortName: "FS", dataTypeID: "Float" });
            CrossesMetaData.gatkVariantFieldList.push({ id: "HaplotypeScore", shortName: "HaplotypeScore", dataTypeID: "Float" });
            CrossesMetaData.gatkVariantFieldList.push({ id: "HRun", shortName: "HRun", dataTypeID: "Int" });
            CrossesMetaData.gatkVariantFieldList.push({ id: "MQ", shortName: "MQ", dataTypeID: "Int" });
            CrossesMetaData.gatkVariantFieldList.push({ id: "MQ0Fraction", shortName: "MQ0Fraction", dataTypeID: "Float" });
            CrossesMetaData.gatkVariantFieldList.push({ id: "MQRankSum", shortName: "MQRankSum", dataTypeID: "Float" });
            CrossesMetaData.gatkVariantFieldList.push({ id: "UQ", shortName: "UQ", dataTypeID: "Int" });

            CrossesMetaData.cortexVariantFieldList = CrossesMetaData.variantFieldList.slice(0);
            CrossesMetaData.cortexVariantFieldList.push({ id: "SITE_CONF", shortName: "SITE_CONF", dataTypeID: "Float" });
            CrossesMetaData.cortexVariantFieldList.push({ id: "HRun", shortName: "HRun", dataTypeID: "Int" });
            CrossesMetaData.cortexVariantFieldList.push({ id: "KMER", shortName: "KMER", dataTypeID: "Int" });
            CrossesMetaData.cortexVariantFieldList.push({ id: "SVLEN", shortName: "SVLEN", dataTypeID: "Int" });
            CrossesMetaData.cortexVariantFieldList.push({ id: "SVTYPE", shortName: "SVTYPE", dataTypeID: "String" });
            CrossesMetaData.cortexVariantFieldList.push({ id: "UQ", shortName: "UQ", dataTypeID: "Int" });

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

                return function (x) { if (x) return x.toString(); else return '' };
            }

            return that;
        }

        CrossesMetaData.createFieldList();
        return CrossesMetaData;
    });

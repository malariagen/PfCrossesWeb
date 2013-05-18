define([  "OptionsCommon", "CrossesMetaData", "i18n!nls/PfCrossesWebResources.js" ], 
		function(OptionsCommon, CrossesMetaData, resources) {
	function OptionsCortex() {};
	
	OptionsCortex.prototype = new OptionsCommon();
	
	OptionsCortex.prototype.getLabel = function () {
		return resources.cortexOptionsContainer;
};

    OptionsCortex.prototype.getMethod = function () {
			return "cortex";
		};

	OptionsCortex.prototype.createFilters = function () {
		var cortex_filters = [
		                      /*
				{
					label : "DUP_ALLELE",
					description : "Allele has been merged"
				},
				{
					label : "DUP_CALL",
					description : "Duplicated variant that was not the first seen"
				},
				*/
				{
					label : "MAPQ",
					description : "5prime flank maps to reference with mapping quality below 40"
				},
				{
					label : "MISMAPPED_UNPLACEABLE",
					description : "Stampy mapped the variant (using the 5p-flank) confidently (mapqual> 40) to a place where the ref-allele does not match"
				},
				{
					label : "MULTIALLELIC",
					description : "Variant formed from merged alleles"
				},
				{
					label : "OVERLAPPING_SITE",
					description : "If Stampy (or combining VCFs) has placed two biallelic variants overlapping, they are filtered"
				},
				{
					label : "SubtelomericRepeat",
					description : "Variant is within a sub-telomeric repeat region."
				},
				{
					label : "SubtelomericHypervariable",
					description : "Variant is within a sub-telomeric hypervariable region."
				},
				{
					label : "InternalHypervariable",
					description : "Variant is within a chromosome-internal hypervariable region."
				},
				{
					label : "Centromere",
					description : "Variant is within a centromere."
				},
				{
					label : "ParentCallMissing",
					description : "One or both parents have a missing genotype call."
				},
				{
					label : "NonMendelian",
					description : "Variant calls are not consistent with Mendelian segregation because one or more progeny have an allele not found in either parent."
				},
				{
					label : "PF_FAIL_REPEAT",
					description : "The variant is likely to be an artifact due to repetitive sequence."
				},
				{
					label : "PF_FAIL_ERROR",
					description : "The variant is likely to be a sequencing error."
				} ];
		this.processFilters(cortex_filters);
		
	};
		
	return OptionsCortex;
	
});
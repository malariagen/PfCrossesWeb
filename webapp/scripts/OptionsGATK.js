define([  "OptionsCommon", "CrossesMetaData", "i18n!nls/PfCrossesWebResources.js" ], 
		function(OptionsCommon, CrossesMetaData, resources) {
	function OptionsGATK() {};
	
	OptionsGATK.prototype = new OptionsCommon();
	
	OptionsGATK.prototype.getLabel = function () {
		return resources.gatkOptionsContainer;
	};
	OptionsGATK.prototype.createFilters = function () {
		var gatk_filters = [
							{
								label : "ParentCallMissing",
								description : "One or both parents have a missing genotype call."
							},

							{
								label : "SubtelomericHypervariable",
								description : "Variant is within a sub-telomeric hypervariable region."
							},

							{
								label : "NonMendelian",
								description : "Variant calls are not consistent with Mendelian segregation because one or more progeny have an allele not found in either parent."
							},
							{
								label : "LowQuality",
								description : "Recalibrated variant quality score (VQSLOD) falls below defined threshold."
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
								label : "SubtelomericRepeat",
								description : "Variant is within a sub-telomeric repeat region."
							} ];
			this.processFilters(gatk_filters);
		
	};
		
	return OptionsGATK;
	
});
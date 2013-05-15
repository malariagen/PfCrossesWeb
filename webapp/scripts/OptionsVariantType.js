define([  DQXSC("Controls"), DQXSC("SQL"), "OptionsCommon", "CrossesMetaData", "i18n!nls/PfCrossesWebResources.js" ], 
		function(Controls, SQL, OptionsCommon, CrossesMetaData, resources) {
	function OptionsVariantType() {};
	
	OptionsVariantType.prototype = new OptionsCommon();
	
	OptionsVariantType.prototype.getLabel = function () {
		return resources.variantTypeOptionsContainer;
	};
	OptionsVariantType.prototype.createContainer = function () {
		this.queryPane = Controls.CompoundHor();
		this.queryPane.setLegend(this.getLabel());	
	};
	OptionsVariantType.prototype.createFilters = function () {
				var type_filters = [ {
					label : "snp",
					description : ""
				},

				{
					label : "indel",
					description : ""
				} ];
				this.processFilters(type_filters);
	};
	OptionsVariantType.prototype.setQueryParams = function (filter) {
		var options = this.getOptionsList();
		var numChecked = 0;
		var checked = "";
    	for (var i = 0; i < options.length; i++) {
    		var id = options[i].getFullID('');
    		var value = options[i].getValue();
    		//It's a checked box
    		if (options[i].isChecked) {
    			id = id.substring(this.getIdPrefix().length);
    			if (value == false) {
    				//If the box isn't checked we don't care about the value
    				value = 1;
    			} else {
    				value = 0;
    				checked = id;
    				numChecked++;
    			}
    		} 
    	}
    	//Ignore if both the same
    	if (numChecked == 1) {
    		filter.push(SQL.WhereClause.CompareFixed(checked,'=',1));
    	}
    	
	};
	OptionsVariantType.prototype.setAllFilterOptions = function () {
		
	};
	return OptionsVariantType;
	
});

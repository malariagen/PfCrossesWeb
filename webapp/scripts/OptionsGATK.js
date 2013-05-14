define([ DQXSC("Controls"), DQXSC("SQL"), "i18n!nls/PfCrossesWebResources.js" ], function(Controls, SQL, resources) {
	return  {
		changeFunction : null,
		variantContainer: null,
		queryPane : null,
		optionsList : null,
		widgetNumber: 0,
		statics: {
			widgetCount: 0,
		},
		getLabel : function () {
			return resources.gatkOptionsContainer;
		},
		convertName : function(name) {
			var s1 = name.replace(new RegExp('(.)([A-Z][a-z]+)',"g"), function ($0,$1,$2,$3,$4) { 
					return  $1.toLowerCase() + '_' + $2.toLowerCase();
				});
			var s2 = s1.replace(new RegExp('(.)([A-Z][a-z]+)',"g"), function ($0,$1,$2,$3,$4) { 
					return  $1 + '_' + $2;
				}).toLowerCase();
			//return (s2);
			return (name);
		},
		setAllFilterOptions: function () {
			var self = this;
			this.clear = Controls.Button(self.getIdPrefix() + 'SetNone', { content: resources.filtersSetNone, width: 100 })
            .setOnChanged(function (id) {
            	var options = self.getOptionsList();
            	for (var i = 0; i < options.length; i++) {
            		options[i].modifyValue(false);
            	}	
            });
			this.setAll = Controls.Button(self.getIdPrefix() + 'SetAll', { content: resources.filtersSetAll, width: 100 })
            .setOnChanged(function (id) {
            	var options = self.getOptionsList();
            	for (var i = 0; i < options.length; i++) {
            		options[i].modifyValue(true);
            	}	
            });
			var multiSet = Controls.CompoundHor([ this.clear, this.setAll]);
			self.queryPane.addControl(multiSet);
		},
		processFilters : function(filterList) {
			
			var self = this;
			$.each(filterList, function (idx, filter) {
				var id = self.getIdPrefix() + self.convertName(filter.label);
				var box = Controls.Check(id, {
					name : filter.label,
					value : filter.label,
					id : id,
					checked : true,
					onChange : self.changeFunction,
					variantContainer: self.variantContainer,
					label: filter.label,
					hint: filter.description
					});
                box.setOnChanged(self.changeFunction);
                box.variantContainer = self.variantContainer;
                self.optionsList.push(box);
                self.queryPane.addControl(box);
            });
		},
		constructor : function(_changeFunction, _variantContainer, _grid) {
			
			this.widgetNumber = this.statics.widgetCount++;
			this.optionsList = new Array();
		
			this.changeFunction = _changeFunction;
			this.variantContainer = _variantContainer;
			
			this.queryPane = Controls.CompoundVert();
			this.queryPane.setLegend(this.getLabel());

			this.setAllFilterOptions();
			
			//select distinct filter,method from pfx_variant_filter;
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
			/*
			 * var store = new JsonRest({ target :
			 * "/gPfX/api/pfx_filters/distinct/filter" }); var options = this;
			 * store.query("?method=" + this.getMethod(),
			 * {}).then(function(results) { options.processFilters(results); });
			 */			
		},
		getOptionsPane : function() {
			return this.callsetOptionsPane;
		},
		getOptionsList : function() {
			return this.optionsList;
		},
		getQueryPane : function() {
			return this.queryPane;
		},
		getMethod : function () {
			return "gatk";
		},
		getIdPrefix: function () {
			return this.getMethod() + this.widgetNumber.toString();
		},
		setQueryParams: function (filter) {
			var options = this.getOptionsList();
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
        				filter.push(SQL.WhereClause.CompareFixed(id,'=',value));
        			}
        		} 
        		
        	}
		}
	};
});

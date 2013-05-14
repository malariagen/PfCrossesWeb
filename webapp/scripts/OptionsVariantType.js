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
			return resources.variantTypeOptionsContainer;
		},
		convertName : function(name) {
			var s1 = name.replace(new RegExp('(.)([A-Z][a-z]+)',"g"), function ($0,$1,$2,$3,$4) { 
					return  $1.toLowerCase() + '_' + $2.toLowerCase();
				});
			var s2 = s1.replace(new RegExp('(.)([A-Z][a-z]+)',"g"), function ($0,$1,$2,$3,$4) { 
					return  $1 + '_' + $2;
				}).toLowerCase();
			return (s2);
		},
		processFilters : function(filterList) {
			
			var self = this;
			$.each(filterList, function (idx, filter) {
				var id = self.getIdPrefix() + self.convertName(filter);
				var box = Controls.Check(id, {
					name : filter,
					value : filter,
					id : id,
					checked : true,
					onChange : self.changeFunction,
					variantContainer: self.variantContainer,
					label: filter 
					});
                box.setOnChanged(self.changeFunction);
                box.variantContainer = self.variantContainer;
                self.optionsList.push(box);
                self.queryPane.addControl(box);
            });
             
		},
		constructor : function(_changeFunction, _variantContainer, _grid) {
			
			this.widgetNumber = this.statics.widgetCount++;
			this.optionsList = new Array();;
			
			this.changeFunction = _changeFunction;
			this.variantContainer = _variantContainer;
			
			this.queryPane = Controls.CompoundHor();
			this.queryPane.setLegend(this.getLabel());
			
			var type_filters = ["snp",
			"indel"];
			this.processFilters(type_filters);
			/*
			var store = new JsonRest({
				target : "/gPfX/api/pfx_filters/distinct/filter"
			});
			var options = this;
			store.query("?method=" + this.getMethod(), {}).then(function(results) {
				options.processFilters(results);
			});*/

		},
		getMethod: function() {
			return "type";
		},
		getOptionsList : function() {
			return this.optionsList;
		},
		getQueryPane : function() {
			return this.queryPane;
		},
		getIdPrefix: function () {
			return this.getMethod() + this.widgetNumber.toString();
		},
		//This is different from the other Options classes
		setQueryParams: function (filter) {
			var options = this.getOptionsList();
			var numChecked = 0;
			var checked;
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
        	
		}
	};
});

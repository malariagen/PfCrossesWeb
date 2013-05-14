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
			
			this.queryPane = Controls.CompoundVert();
			this.queryPane.setLegend(resources.genomeSearchOptionsContainer);

			this.chromosomes = [
			                { id: '', len: 0},
			                { id: 'Pf3D7_01_v3', len: 0.7 },
			                { id: 'Pf3D7_02_v3', len: 1 },
			                { id: 'Pf3D7_03_v3', len: 1.2 },
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
			 $.each(this.chromosomes, function (idx, chr) { chr.name = chr.id; });
			this.searchChromosome = Controls.Combo('SearchRegionChromosome', { label: resources.genomeSearchChromosome, value: 'MAL1', states: this.chromosomes }).setHasDefaultFocus();
		    this.searchStart = Controls.Edit('SearchRegionStart', { label: resources.genomeSearchStart, size: 10 });
		    this.searchEnd = Controls.Edit('SearchRegionEnd', { label: resources.genomeSearchEnd, size: 10 });
			
		    var self = this;
		    this.clear = Controls.Button('Clear', { content: resources.genomeSearchClear, width: 50 })
            .setOnChanged(function (id) {
            	self.searchChromosome.modifyValue('');
    		    self.searchStart.modifyValue('');
    		    self.searchEnd.modifyValue('');
            	});
		    this.searchChromosome.setOnChanged(this.changeFunction);
		    this.searchStart.setOnChanged(this.changeFunction);
		    this.searchEnd.setOnChanged(this.changeFunction);
		    
		    this.searchChromosome.variantContainer = this.variantContainer;
		    this.searchStart.variantContainer = this.variantContainer;
		    this.searchEnd.variantContainer = this.variantContainer;
		    
		    this.queryPane.addControl(this.searchChromosome);
		    this.queryPane.addControl(this.searchStart);
		    this.queryPane.addControl(this.searchEnd);
		    this.queryPane.addControl(this.clear);
			/*
			var store = new JsonRest({
				target : "/gPfX/api/pfx_filters/distinct/filter"
			});
			var options = this;
			store.query("?method=" + this.getMethod(), {}).then(function(results) {
				options.processFilters(results);
			});*/

		},
		getQueryPane : function() {
			return this.queryPane;
		},
		getIdPrefix: function () {
			return this.getMethod() + this.widgetNumber.toString();
		},
		//This is different from the other Options classes
		setQueryParams: function (filter) {

			var chrom = this.searchChromosome.getValue();
			var start = this.searchStart.getValue();
            var stop = this.searchEnd.getValue();

            if (chrom != '') {
            	filter.push(SQL.WhereClause.CompareFixed('chrom','=',chrom));
            }
        	if (start != '') {
        		filter.push(SQL.WhereClause.CompareFixed('pos','>',start));
        	}

        	if (stop != '') {
        		filter.push(SQL.WhereClause.CompareFixed('pos','<',stop));
        	}

		}
	};
});

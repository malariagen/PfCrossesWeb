define([ "dojo/_base/declare", "pfx/CallsetOptions" ], 
		function(declare, CallsetOptions) {
	return declare(CallsetOptions, {
		
		
		method: "gatk",
		
		constructor : function(_changeFunction, grid) {
		
		},
		getMethod : function () {
			return this.method;
		},
		setOptionalData : function () {
			var fields = [ 
			              {
			            	  id: "vqslod",
			            	  name: "vqslod"
			              },
			              {
			            	  id: "dp",
			            	  name: "dp"
			              },
			              {
			            	  id: "qd",
			            	  name: "qd"
			              },
			              {
			            	  id: "mq",
			            	  name: "mq"
			              },
			              {
			            	  id: "mq0Fraction",
			            	  name: "mq0Fraction"
			              },
			              {
			            	  id: "haplotype_score",
			            	  name: "haplotype_score"
			              },
			              {
			            	  id: "fs",
			            	  name: "fs"
			              }
			             
			              ];
				
			
			this.optionalData = this.optionalData.concat(fields);
		}
	});
});

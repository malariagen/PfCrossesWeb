define([  "TableCommon", "CrossesMetaData" ], 
		function(TableCommon, CrossesMetaData) {
	function TableCortex() {};
	
	TableCortex.prototype = new TableCommon();
	
	TableCortex.prototype.getFieldList = function() {
		return CrossesMetaData.cortexVariantFieldList;
	}; 
		
	return TableCortex;
	
});

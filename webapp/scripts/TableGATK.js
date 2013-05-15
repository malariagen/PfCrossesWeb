define([  "TableCommon", "CrossesMetaData" ], 
		function(TableCommon, CrossesMetaData) {
	function TableGATK() {};
	
	TableGATK.prototype = new TableCommon();
	
	TableGATK.prototype.getFieldList = function() {
		return CrossesMetaData.gatkVariantFieldList;
	}; 
		
	return TableGATK;
	
});
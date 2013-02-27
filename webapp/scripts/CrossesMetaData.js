define([DQXSC("Utils")],
    function (DQX) {
        var CrossesMetaData = {};

        CrossesMetaData.tableSamples = "pfx_samples";
        CrossesMetaData.tableVariants = "pfx_variants";
        
        CrossesMetaData.sampleSets = [{ id: '', name: '' }, { id: 'hb3_dd2', name: 'hb3_dd2' }, { id: '3d7_hb3', name: '3d7_hb3' }, { id: '7g8_gb4', name: '7g8_gb4'}];
        CrossesMetaData.variants = [
                                    { id: '', name: '' }, 
                                    { id: 'hb3_dd2:cortex', name: 'hb3_dd2 (Cortex)' }, 
                                    { id: 'hb3_dd2:gatk', name: 'hb3_dd2 (GATK)' },
                                    { id: '3d7_hb3:cortex', name: '3d7_hb3 (Cortex)' },
                                    { id: '3d7_hb3:gatk', name: '3d7_hb3 (GATK)' },
                                    { id: '7g8_gb4:cortex', name: '7g8_gb4 (Cortex)'},
                                    { id: '7g8_gb4:gatk', name: '7g8_gb4 (GATK)'}
                                    ];
        
        CrossesMetaData.createFieldList = function () {
        	CrossesMetaData.fieldList = [];

        	CrossesMetaData.fieldList.push({ id: "source_code", shortName: "Clone", name: "Clone name", dataTypeID: "String" });
        	CrossesMetaData.fieldList.push({ id: "ox_code", shortName: "Sample", name: "Sample name", dataTypeID: "String" });
        	CrossesMetaData.fieldList.push({ id: "run", shortName: "Run", name: "Run", dataTypeID: "String" });
        	CrossesMetaData.fieldList.push({ id: "coverage", shortName: "Coverage", name: "Coverage", dataTypeID: "String" });
        	CrossesMetaData.fieldList.push({ id: "percent_mapped", shortName: "% Mapped", name: "Percent Mapped", dataTypeID: "Float" });
          
        	 for (var i = 0; i < CrossesMetaData.fieldList.length; i++) {
                 var info = CrossesMetaData.fieldList[i];
                 if (!(info.name))
                     info.name = info.shortName;
                 if (!(info.comment))
                     info.comment = info.name;
             }

             //Lookup object to find field info by ID
        	 CrossesMetaData.fieldMap = {};
             for (var i = 0; i < CrossesMetaData.fieldList.length; i++)
            	 CrossesMetaData.fieldMap[CrossesMetaData.fieldList[i].id] = CrossesMetaData.fieldList[i];
             
             
             CrossesMetaData.variantFieldList = [];

         	CrossesMetaData.variantFieldList.push({ id: "pos", shortName: "position", name: "position", dataTypeID: "Int" });
         	CrossesMetaData.variantFieldList.push({ id: "ref", shortName: "ref", name: "ref", dataTypeID: "String" });
         	CrossesMetaData.variantFieldList.push({ id: "alt0", shortName: "alt0", name: "alt0", dataTypeID: "String" });
         	CrossesMetaData.variantFieldList.push({ id: "alt1", shortName: "alt1", name: "alt1", dataTypeID: "String" });
         	CrossesMetaData.variantFieldList.push({ id: "alt2", shortName: "alt2", name: "alt2", dataTypeID: "String" });
         	CrossesMetaData.variantFieldList.push({ id: "filter", shortName: "filter", name: "filter", dataTypeID: "String" });
         	CrossesMetaData.variantFieldList.push({ id: "qual", shortName: "qual", name: "qual", dataTypeID: "Float" });
         	CrossesMetaData.variantFieldList.push({ id: "qd", shortName: "qd", name: "qd", dataTypeID: "Float" });
         	CrossesMetaData.variantFieldList.push({ id: "mq", shortName: "mq", name: "mq", dataTypeID: "Float" });
         	
         	 for (var i = 0; i < CrossesMetaData.variantFieldList.length; i++) {
                  var info = CrossesMetaData.variantFieldList[i];
                  if (!(info.name))
                      info.name = info.shortName;
                  if (!(info.comment))
                      info.comment = info.name;
              }

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
               return  function (vl) { return "white"; };
            }

            that.getTextConvertFunction = function () {
                
                return function (x) { if (x) return x.toString(); else return '-' };
            }

            return that;
        }

        CrossesMetaData.createFieldList();
        return CrossesMetaData;
    });
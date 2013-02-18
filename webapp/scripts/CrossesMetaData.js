define([DQXSC("Utils")],
    function (DQX) {
        var CrossesMetaData = {};

        CrossesMetaData.tableSamples = "samples";
        
        CrossesMetaData.sampleSets = [{ id: '', name: '' }, { id: 'hb3_dd2', name: 'hb3_dd2' }, { id: '3d7_hb3', name: '3d7_hb3' }, { id: '7g8_gb4', name: '7g8_gb4'}];
        
        CrossesMetaData.createFieldList = function () {
        	CrossesMetaData.fieldList = [];

        	CrossesMetaData.fieldList.push({ id: "source_code", shortName: "Clone", name: "Clone name", dataTypeID: "String" });
        	CrossesMetaData.fieldList.push({ id: "ox_code", shortName: "Sample", name: "Sample name", dataTypeID: "String" });
        	CrossesMetaData.fieldList.push({ id: "run", shortName: "Run", name: "Run", dataTypeID: "String" });
        	/*
        	CrossesMetaData.fieldList.push({ id: "ox_code", shortName: "Sample", name: "Sample name", dataTypeID: "String" });
        	CrossesMetaData.fieldList.push({ id: "ox_code", shortName: "Sample", name: "Sample name", dataTypeID: "String" });
          */
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

            that.getDownloadType = function () {
                if (this.isFloat()) return "Float3";
                if (this.isString()) return "String";
                DQX.reportError("Unrecognised data type '{tpe}'".DQXformat({ tpe: dataType }));
            }

            that.getQueryBuilderType = function () {
                
                if (this.isFloat()) return "Float";
                if (this.isString()) return "String";
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
define([  DQXSC("DataFetcher/DataFetchers"), DQXSC("QueryTable"), DQXSC("Controls"), DQXSC("Popup"), DQXSC("SQL"), DQXSC("Msg"),"CrossesMetaData" ], 
		function(DataFetcher, QueryTable, Controls, Popup, SQL, Msg, CrossesMetaData) {
	return  {
		
		getFieldList: function () {
			return CrossesMetaData.cortexVariantFieldList;
		},
		getMGDataType: function (dataTypeID) {
			return CrossesMetaData.MGDataType(dataTypeID);
		},
		//Convert data format
		constructor : function(parentFrame) {

            //Fetch from meta data
            var fieldInfo=[];
            var fieldList = this.getFieldList();
            for (var fieldnr=0; fieldnr<fieldList.length; fieldnr++) {
                var field=fieldList[fieldnr];
                var dataType=this.getMGDataType(field.dataTypeID);
                var panelnr=1;
                //if (field.id=="GeneId") panelnr=0;
                var info={
                    panel:panelnr,
                    id:field.id,
                    type:dataType.getDownloadType(),
                    qbuildertype:dataType.getQueryBuilderType(),
                    qbuildermultichoicelist:dataType.getMultipeChoiceList(),
                    shortName:field.shortName,
                    name:field.name,
                    comment:field.comment,
                    colorFunction:dataType.getBackColorFunction(),
                    textFunction:dataType.getTextConvertFunction()
                    };
                fieldInfo.push(info);
            }

            //final cleanup
            for (var i=0; i<fieldInfo.length; i++) {
                var info=fieldInfo[i];
                if (!(info.panel))
                    info.panel=0;
                if (!(info.name))
                    info.name=info.shortName;
                if (!(info.comment))
                    info.comment=info.name;
                if (!(info.qbuildertype))
                    info.qbuildertype=info.type;
            }
            this.fieldInfo=fieldInfo;
            
            this.frameTable = parentFrame;
        },
        createPanelTable : function () {

            this.theTableFetcher = new DataFetcher.Table(serverUrl, CrossesMetaData.database, CrossesMetaData.tableVariants);
            this.theTableFetcher.showDownload=true;
            this.theTableFetcher.positionField = "pos";
            this.panelTable = QueryTable.Panel(this.frameTable, this.theTableFetcher, { leftfraction: 50 });

            var mytable = this.panelTable.myTable;

            //Create the columns of the data fetcher, and the table columns

            //Make sure we listen and react to column header click messages
            var msgIDClickHeader={ type: 'ClickHeader', id: mytable.myBaseID };
            Msg.listen("",msgIDClickHeader,$.proxy(this._onClickHeader,this));

            //add columns for all the fields
            for (var i=0; i<this.fieldInfo.length; i++) {
                var info=this.fieldInfo[i];
                var colinfo = this.theTableFetcher.addFetchColumn(info.id, info.type, "rgb(0,0,0)");
                var comp = mytable.addTableColumn(QueryTable.Column(info.shortName, info.id, info.panel));
                if (info.comment)
                    comp.myComment = info.comment;
                if (info.colorFunction)
                    comp.CellToColor = info.colorFunction;
                if (info.textFunction)
                    comp.CellToText = info.textFunction;
                if (info.linkFunction) {
                    comp.linkFunction=info.linkFunction;
                    comp.linkHint=info.linkHint;
                }
                comp.makeHyperlinkHeader(msgIDClickHeader,'Column information');
               
                if (info.qbuildertype == "Float") {
                    comp.CellToText = function (text) {
                    	return (text.toFixed(2));
                    };
                }
				mytable.addSortOption(info.name, SQL.TableSort([info.id]));
				
            }


            //we start by defining a query that returns nothing
            this.theTableFetcher.setUserQuery1(SQL.WhereClause.None());
            this.panelTable.myTable.render();
        },
        //This function is called when the user clicks on a link in a column header of the SNP query table
        _onClickHeader : function (scope, id) {
            var thecol = this.panelTable.myTable.findColumn(id);
            title = 'Column "{id}"'.DQXformat({ id: thecol.myName.replace('<br>', ' ') });
            content = '<br>' + thecol.myComment + '<br><br>';
            var buttons = [];
            var self = this;
            if (thecol.sortOption) {
                buttons.push(Controls.Button(null, { buttonClass: 'DQXToolButton2', content: "Sort by<br>increasing value" })
                    .setOnChanged(function () {
                        self.panelTable.myTable.sortByColumn(id, false);
                        if (!Popup.isPinned(popupID))
                            DQX.ClosePopup(popupID);
                    }));
                buttons.push(Controls.Button(null, { buttonClass: 'DQXToolButton2', content: "Sort by<br>decreasing value" })
                    .setOnChanged(function () {
                        self.panelTable.myTable.sortByColumn(id, true);
                        if (!Popup.isPinned(popupID))
                            DQX.ClosePopup(popupID);
                    }));
            }
            if (thecol.linkFunction) {
                buttons.push(Controls.Button(null, { buttonClass: 'DQXToolButton2', content: thecol.linkHint, width: 190 })
                    .setOnChanged(function () {
                        thecol.linkFunction(id);
                        if (!Popup.isPinned(popupID))
                            DQX.ClosePopup(popupID);
                    }));
            }

            $.each(buttons, function (idx, bt) { content += bt.renderHtml(); });
            var popupID = Popup.create(title, content);
        },
        //This function is called when the currently highlighted SNP changes
        _onHighlightRowModified : function(scope,obj) {
        },

        

        //Call this function to invalidate the current table content
        invalidateQuery : function () {
            this.panelTable.myTable.invalidate();
            this.setCurrentQuery(null);
        }


	};
});

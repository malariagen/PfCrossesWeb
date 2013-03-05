﻿define([DQXSCRQ(), DQXSC("SVG"), DQXSC("Framework"), DQXSC("DataFetcher/DataFetchers"), DQXSC("QueryTable"), DQXSC("QueryBuilder"), DQXSC("SQL"), DQXSC("Msg"), DQXSC("DocEl"), "Page", DQXSC("Controls"), DQXSC("Popup"), "CrossesMetaData"], 
    function (require, SVG, Framework, DataFetcher, QueryTable, QueryBuilder, SQL, Msg, DocEl, thePage, Controls, Popup, CrossesMetaData) {

        var VariantsModule = {

            Instance: function (iPage, iFrame) {
                var that = Framework.ViewSet(iFrame,'variants');
                that.myPage = iPage;
                that.myFrame = iFrame;
                that.registerView();

                that.jumpVariantset = function(id) {
                    Msg.send({type: 'ShowPopulation'}, id.split('_')[1]);
                };

                //Creates the data structure that defines what fields will be displayed in the table browser
                that.createFieldCatalog = function() {

                    //Fetch from meta data
                    var fieldInfo=[];
                    for (var fieldnr=0; fieldnr<CrossesMetaData.variantFieldList.length; fieldnr++) {
                        var field=CrossesMetaData.variantFieldList[fieldnr];
                        var dataType=CrossesMetaData.MGDataType(field.dataTypeID);
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
                };


                that.createPanels = function () {
                    this.createFieldCatalog();//This function translates the metadata field info to a format that is better suited in this context (todo: remove this conversion step?)
                    this.createPanelTable();
                  
                    this.createPanelAdvancedQuery();

                };

                that.createFramework = function () {
                    this.currentQuery=null;

 //                   this.myFrame.setSeparatorSize(bigSeparatorSize);

                    this.frameLeftGroup = this.getFrame().addMemberFrame(Framework.FrameGroupVert('VariantsQueries', 0.4)).setSeparatorSize(4);

                    this.frameLeftGroup.InsertIntroBox('datagrid2.png',DQX.Text('IntroVariants'), 'HelpVariants');
                    
                    this.frameQueryAdvanced = this.frameLeftGroup.addMemberFrame(Framework.FrameFinal('VariantsQueryAdvanced', 0.4))
                        .setMargins(0).setDisplayTitle('Query').setMinSize(Framework.dimX,300).setAllowScrollBars(true,true);
                
                    this.frameTable = this.getFrame().addMemberFrame(Framework.FrameFinal('VariantsTable', 0.6))
                        .setMargins(0).setFrameClassClient('DQXDarkFrame').setAllowScrollBars(false,false);
          

                };
    

                //This function is called when the user clicks on a link in a column header of the SNP query table
                that._onClickHeader = function(scope,id) {
                    var thecol=this.panelTable.myTable.findColumn(id);
                    title='Column "{id}"'.DQXformat({id:thecol.myName.replace('<br>',' ')});
                    content='<br>'+thecol.myComment+'<br><br>';
                    var buttons=[];
                    if (thecol.sortOption) {
                        buttons.push( Controls.Button(null, { buttonClass: 'DQXToolButton2', content: "Sort by<br>increasing value" })
                            .setOnChanged(function() {
                                that.panelTable.myTable.sortByColumn(id,false);
                                if (!Popup.isPinned(popupID))
                                    DQX.ClosePopup(popupID);
                            }) );
                        buttons.push( Controls.Button(null, { buttonClass: 'DQXToolButton2', content: "Sort by<br>decreasing value" })
                            .setOnChanged(function() {
                                that.panelTable.myTable.sortByColumn(id,true);
                                if (!Popup.isPinned(popupID))
                                    DQX.ClosePopup(popupID);
                            }) );
                    }
                    if (thecol.linkFunction) {
                        buttons.push( Controls.Button(null, { buttonClass: 'DQXToolButton2', content: thecol.linkHint, width:190 })
                            .setOnChanged(function() {
                                thecol.linkFunction(id);
                                if (!Popup.isPinned(popupID))
                                    DQX.ClosePopup(popupID);
                            }) );
                    }

                    $.each(buttons,function(idx,bt) { content+=bt.renderHtml(); });

                };

                //This function is called when the currently highlighted SNP changes
                that._onHighlightRowModified = function(scope,obj) {
                };
    
                that.createPanelTable = function () {

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
                       
						mytable.addSortOption(info.name, SQL.TableSort([info.id]));
						
                    }


                    //we start by defining a query that returns nothing
                    this.theTableFetcher.setUserQuery1(SQL.WhereClause.None());
                    this.panelTable.myTable.render();
                };

                //Call this function to invalidate the current table content
                that.invalidateQuery = function () {
                    this.panelTable.myTable.invalidate();
                    this.setCurrentQuery(null);
                };
                
                that.queryComponentToString = function(sq) {
                    return sq.ColName + sq.Tpe + sq.CompValue + ",";
                };
                
                that.queryToString = function(qry) {
                    var msg = "";
                    if (qry != null) {
                        if (qry.Components) {
                            for (var i=0, l=qry.Components.length; i<l; i++){
                                sq = qry.Components[i];
                                msg += that.queryToString(sq);
                            }
                        } else {
                            msg +=  that.queryComponentToString(qry);
                        }
                    }
                    return (msg);
                };
                
                //Call this function to set a new query
                that.setCurrentQuery = function(qry) {
                    if ((qry!=null)||(this.currentQuery!=null)) {
                        this.currentQuery=qry;                        
//                        _gaq.push(['_trackEvent', 'Variants', 'query', that.queryToString(qry)]);
                        Msg.broadcast({ type: 'ModifyVariantsQuery'},qry);
                    }
                };
    
                //This function is called when the user runs an advanced query
                that.updateAdvancedQuery = function () {
                    var thequery = this.panelAdvancedQueryBuilder.getQuery();
                    this.panelTable.myTable.setQuery(thequery);
                    this.panelTable.myTable.reLoadTable();            
                    this.setCurrentQuery(thequery);
                };

                that.updatePopQuery = function () {
                	
                    var callSet=this.catVarQueryPopulationFreqType.getValue();
                    var opts = callSet.split(":");
                    var thequery=SQL.WhereClause.AND([
                               SQL.WhereClause.CompareFixed('cross_name','=',opts[0]),
                               SQL.WhereClause.CompareFixed('method','=',opts[1])
                    ]);
                    
                    this.panelTable.myTable.setQuery(thequery);
                    this.panelTable.myTable.reLoadTable();

                    this.setCurrentQuery(thequery);
                };

                //This function returns an 'update query' button control, with a specified id
                that.createUpdateQueryButton = function(buttonID) {
                    return Controls.Button(buttonID, {buttonClass: 'DQXToolButton1', content: '<IMG style="float:left" SRC="Bitmaps/update1.png" border=0  ALT="Update"></IMG><span style="line-height:30px">Update query results</span>' });
                };
    
                that.createPanelAdvancedQuery = function () {
                    
                    this.panelPopQuery = Framework.Form(this.frameQueryAdvanced);
                    var theForm=this.panelPopQuery;

                    var groupPop=Controls.CompoundVert();
                    groupPop.setLegend('Sample Set');
                    this.catVarQueryPopulationFreqType=Controls.Combo('VariantsQuery', { label: 'Sample set:', states: CrossesMetaData.variants }).setOnChanged($.proxy(this.updatePopQuery, this));
                    groupPop.addControl(this.catVarQueryPopulationFreqType);
                    //invalidatingList.push(this.catVarQueryPopulationFreqType);
                    theForm.addControl(groupPop);
                    
                    theForm.render();
                };

    
                //Call this function to activate the catalog of variation panel
                that.activateState = function () {
                    enableHomeButton();
                    var tabswitched = that.myPage.frameVariants.makeVisible();
                    setTimeout(function() {
                        that.panelTable.handleResize(); //force immediate calculation of size
                    },50);
                };

                return that;
            }

        };


    return VariantsModule;
    });


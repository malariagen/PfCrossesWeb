define([DQXSCRQ(), DQXSC("Framework"), DQXSC("SQL"), DQXSC("Msg"), DQXSC("Controls"), "CrossesMetaData", "OptionsCortex", "OptionsGATK", "OptionsVariantType", "OptionsGenomeSearch", "TableCortex", "TableGATK", "i18n!nls/PfCrossesWebResources.js"], 
    function (require, Framework, SQL, Msg, Controls, CrossesMetaData, CortexOptions, GATKOptions, TypeOptions, SearchOptions, TableCortex, TableGATK, resources) {

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
                

                that.createPanels = function () {
                	
                	
 					this.tableCortex = new TableCortex();
 					
 					this.tableCortex.createPanelTable(this.frameTables['cortex']);
                  
 					this.tableGATK = new TableGATK();
 					
 					this.tableGATK.createPanelTable(this.frameTables['gatk']);
 					
                    this.createPanelAdvancedQuery();

                };

                that.createFramework = function () {
                    this.currentQuery=null;

 //                   this.myFrame.setSeparatorSize(bigSeparatorSize);

                    this.frameLeftGroup = this.getFrame().addMemberFrame(Framework.FrameGroupVert('VariantsQueries', 0.4)).setSeparatorSize(4);

                    this.frameLeftGroup.InsertIntroBox('datagrid2.png',resources.variantsHelp);
                    
                    this.frameQueryAdvanced = this.frameLeftGroup.addMemberFrame(Framework.FrameFinal('VariantsQueryAdvanced', 0.4))
                        .setMargins(0).setDisplayTitle('Query').setMinSize(Framework.dimX,300).setAllowScrollBars(true,true);
                
                    this.frameTableGroup = this.getFrame().addMemberFrame(Framework.FrameGroupStack('', 0.6));
                    
                    var tables=['cortex','gatk'];
                    
                    this.frameTables= {};
                    
                    $.each(tables,function(idx,tableID) {
                    	var aFrameTable= that.frameTableGroup.addMemberFrame(Framework.FrameFinal(tableID, 0.6))
                       		.setMargins(0).setFrameClassClient('DQXDarkFrame').setAllowScrollBars(false,false);
                        that.frameTables[tableID]=aFrameTable
                    });

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
    
				that.changeFunction = function(b) {

					var variantContainer = this.variantContainer;
					
					var callSet=variantContainer.catVarQueryPopulationFreqType.getValue();
                    var opts = callSet.split(":");
                    var cross_name = opts[0];
                    var method = opts[1];
                    
					var gatk = true;
					var cortex = true;

					if (method == 'cortex') {
							gatk = false;
							cortex = true;
					//		variantContainer.optionsStack.selectChild(variantContainer.cOpts.getOptionsPane());
					}
					if (method == 'gatk') {
							gatk = true;
							cortex = false;
					//		variantContainer.optionsStack.selectChild(variantContainer.gOpts.getOptionsPane());
					}
					//variantContainer.gOpts.getOptionsPane().set('open', gatk);
					//variantContainer.cOpts.getOptionsPane().set('open', cortex);

					
					var options = [];
		            options.push(SQL.WhereClause.CompareFixed('cross_name','=',cross_name));
                    options.push(SQL.WhereClause.CompareFixed('method','=',method));
                    
					variantContainer.sOpts.setQueryParams(options);
                    variantContainer.tOpts.setQueryParams(options);
                    
                    var panelTable = {};
                    
                	if (gatk) {
						variantContainer.gOpts.setQueryParams(options);
						variantContainer.frameTableGroup.switchTab('gatk');
						variantContainer.gatkShowHide.setVisible(true);
						variantContainer.cortexShowHide.setVisible(false);
						panelTable = variantContainer.tableGATK.panelTable.myTable;
					} else if (cortex) {
						variantContainer.cOpts.setQueryParams(options);
						variantContainer.frameTableGroup.switchTab('cortex');
						variantContainer.gatkShowHide.setVisible(false);
						variantContainer.cortexShowHide.setVisible(true);
						panelTable = variantContainer.tableCortex.panelTable.myTable;
					} else {
						//error
					}
                    				
					var thequery=SQL.WhereClause.AND(options);

					panelTable.setQuery(thequery);
					panelTable.reLoadTable();

					variantContainer.setCurrentQuery(thequery);

				};
				
                that.createPanelAdvancedQuery = function () {
                    
                    this.panelPopQuery = Framework.Form(this.frameQueryAdvanced);
                    var theForm=this.panelPopQuery;

                    var groupPop=Controls.CompoundVert();
                    groupPop.setLegend(resources.variantCallSet);
                    this.catVarQueryPopulationFreqType=Controls.Combo('VariantsQuery', { label: '', states: CrossesMetaData.variants });
                    this.catVarQueryPopulationFreqType.variantContainer=this;
                    this.catVarQueryPopulationFreqType.setOnChanged(this.changeFunction);
                    groupPop.addControl(this.catVarQueryPopulationFreqType);
                    //invalidatingList.push(this.catVarQueryPopulationFreqType);
                    theForm.addControl(groupPop);    
                    
                    this.sOpts = SearchOptions.constructor(this.changeFunction, this, this.panelTable);
					this.sOpts = SearchOptions;
                    
					this.tOpts = new TypeOptions();
					this.tOpts.setup(this.changeFunction, this);
					this.gOpts = new GATKOptions();
					this.gOpts.setup(this.changeFunction, this, { showHeader: true });
					this.cOpts = new CortexOptions();
					this.cOpts.setup(this.changeFunction, this, { showHeader: true });
					theForm.addControl(this.sOpts.getQueryPane());
					theForm.addControl(this.tOpts.getQueryPane());
					
					this.cortexShowHide = Controls.ShowHide(this.cOpts.getQueryPane()).setVisible(false);
					this.gatkShowHide = Controls.ShowHide(this.gOpts.getQueryPane()).setVisible(false);
					theForm.addControl(this.cortexShowHide);
					theForm.addControl(this.gatkShowHide);
                    theForm.render();
                };

    
                //Call this function to activate the catalog of variation panel
                that.activateState = function () {
                    enableHomeButton();
                    var tabswitched = that.myPage.frameVariants.makeVisible();
                    setTimeout(function() {
                        that.tableCortex.panelTable.handleResize(); //force immediate calculation of size
                    },50);
                };

                return that;
            }

        };


    return VariantsModule;
    });


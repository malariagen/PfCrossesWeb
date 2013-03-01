define([DQXSCRQ(), DQXSC("Framework"), DQXSC("Controls"), DQXSC("Msg"), DQXSC("Utils"), DQXSC("ChannelPlot/ChannelCanvas"), DQXSC("ChannelPlot/GenomePlotter"), DQXSC("DataFetcher/DataFetchers")],
    function (require, Framework, Controls, Msg, DQX, ChannelCanvas, GenomePlotter, DataFetchers) {

        var GenomeBrowserSNPChannel = {

            SNPChannel: function (iFetcher, callSetID) {
                var that = ChannelCanvas.Base("PositionsSNPs_"+callSetID);
                that.myFetcher = iFetcher;
                that.setTitle('SNPs '+callSetID);
                that._height = 20;
                that._pointsX = [];
                that._pointsIndex = [];
                that._SNPIDColumn = "id";

                that.draw = function (drawInfo, args) {
                    var PosMin = Math.round((-50 + drawInfo.offsetX) / drawInfo.zoomFactX);
                    var PosMax = Math.round((drawInfo.sizeCenterX + 50 + drawInfo.offsetX) / drawInfo.zoomFactX);

                    this.drawStandardGradientCenter(drawInfo, 1);
                    this.drawStandardGradientLeft(drawInfo, 1);
                    this.drawStandardGradientRight(drawInfo, 1);

                    //Draw SNPs
                    this.myFetcher.IsDataReady(PosMin, PosMax, false);
                    var points = this.myFetcher.getColumnPoints(PosMin, PosMax, this._SNPIDColumn);
                    var xvals = points.xVals;
                    drawInfo.centerContext.fillStyle = DQX.Color(1.0, 0.75, 0.0).toString();
                    drawInfo.centerContext.strokeStyle = DQX.Color(0.0, 0.0, 0.0).toString();
                    this._pointsX = [];
                    var pointsX = this._pointsX;
                    this._pointsIndex = [];
                    var pointsIndex = this._pointsIndex;
                    this.startIndex = points.startIndex;

                    for (var i = 0; i < xvals.length; i++) {
                        var x = xvals[i];
                        var psx = Math.round(x * drawInfo.zoomFactX - drawInfo.offsetX) + 0.5;
                        pointsX.push(psx); pointsIndex.push(i + points.startIndex);
                        var psy = 5.5;
                        drawInfo.centerContext.beginPath();
                        drawInfo.centerContext.moveTo(psx, psy);
                        drawInfo.centerContext.lineTo(psx + 3, psy + 6);
                        drawInfo.centerContext.lineTo(psx - 3, psy + 6);
                        drawInfo.centerContext.lineTo(psx, psy);
                        drawInfo.centerContext.fill();
                        drawInfo.centerContext.stroke();
                    }

                    this.drawMark(drawInfo);
                    this.drawXScale(drawInfo);
                    this.drawTitle(drawInfo);
                }


                that.getToolTipInfo = function (px, py) {
                    if ((py >= 0) && (py <= 20)) {
                        var pointsX = this._pointsX;
                        var pointsIndex = this._pointsIndex;
                        var mindst = 12;
                        var bestpt = -1;
                        for (var i = 0; i < pointsX.length; i++)
                            if (Math.abs(px - pointsX[i]) <= mindst) {
                                mindst = Math.abs(px - pointsX[i]);
                                bestpt = i;
                            }
                        if (bestpt >= 0) {
                            var info = { ID: 'SNP' + bestpt };
                            info.tpe = 'SNP';
                            info.px = pointsX[bestpt];
                            info.py = 13;
                            info.snpid = this.myFetcher.getColumnPoint(this.startIndex + bestpt, this._SNPIDColumn);
                            info.content = info.snpid;
                            info.showPointer = true;
                            return info;
                        }
                    }
                    return null;
                }

                that.handleMouseClicked = function (px, py) {
                    var tooltipInfo = that.getToolTipInfo(px, py);
//                    if (tooltipInfo) {
//                        if (tooltipInfo.tpe == 'SNP')
//                            Msg.send({ type: 'ShowSNPPopup' }, tooltipInfo.snpid);
//                    }
                }

                return that;
            },

        }




        return GenomeBrowserSNPChannel;
    });
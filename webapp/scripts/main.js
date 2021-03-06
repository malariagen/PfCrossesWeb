﻿
if (typeof versionString == 'undefined')
    alert('Fatal error: versionString is missing');
require.config({
    baseUrl: "scripts",
    paths: {
        jquery: "DQX/Externals/jquery",
        d3: "DQX/Externals/d3",
        handlebars: "DQX/Externals/handlebars",
        markdown: "DQX/Externals/markdown",
        DQX: "DQX",
        _:"DQX/Externals/lodash"
    },
    shim: {
        d3: {
            exports: 'd3'
        },
        handlebars: {
            exports: 'Handlebars'
        }
    },
    waitSeconds: 15,
    urlArgs: "version="+versionString
});

require(["jquery", "DQX/Framework", "DQX/Msg", "DQX/HistoryManager", "DQX/Utils", "Page", "Common"],
    function ($, Framework, Msg, HistoryManager, DQX, thePage, Common) {
        $(function () {

            //Global initialisation of utilities
            DQX.Init();

            setTimeout(function () {

                //Create the frames
                thePage.createFramework();

                //Render frames
                thePage.frameWindow.render('Div1');

                Common.addToolHandlers();

                //Some generic stuff after creation of the html
                DQX.initPostCreate();

                //trigger the initial synchronisation
                HistoryManager.init();
            }, 10);

        });
    });

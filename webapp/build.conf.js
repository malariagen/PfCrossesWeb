//noinspection BadExpressionStatementJS
({
   baseUrl:'scripts',
   name:'main',
   out:'scripts/main-built.js',
   paths:{
       jquery: "DQX/Externals/jquery",
       d3: "DQX/Externals/d3",
       handlebars: "DQX/Externals/handlebars",
       markdown: "DQX/Externals/markdown",
       DQX: "DQX"
   },
    shim: {
        d3: {
            exports: 'd3'
        },
        handlebars: {
            exports: 'Handlebars'
        }
    }
})



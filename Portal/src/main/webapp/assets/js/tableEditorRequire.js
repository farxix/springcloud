requirejs.config({
    baseUrl: "../",//入口html的位置
    paths: {
        "jquery": "./assets/js/lib/jquery.min",
        "jqueryTmpl":"./assets/js/lib/jquery.tmpl.min",
        "apiConfig":'./assets/js/apiConfig',
        "bootstrap":"./assets/js/lib/bootstrap/bootstrap.min",
        "bootstrap-modal": "./assets/js/lib/bootstrap/bootstrap-modal",
        "bootstrap-table":"./assets/js/lib/bootstrap/Bootstrap-table/bootstrap-table",
        "datetimepicker": "./assets/js/lib/bootstrap/bootstrap-datetimepicker/bootstrap-datetimepicker",
        "datetimepicker-zh": "./assets/js/lib/bootstrap/bootstrap-datetimepicker/bootstrap-datetimepicker.zh-CN",
        "bootstrap-dialog":"./assets/js/lib/bootstrap/bootstrap-dialog/js/bootstrap-dialog",
        "bootstrap-treeview": "./assets/js/lib/bootstrap/bootstrap-treeview",
        "bootstrap-table-treegrid":"./assets/js/lib/bootstrap/Bootstrap-table/treegrid/bootstrap-table-treegrid",
        "treegrid":"./assets/js/lib/jquery-treegrid/jquery.treegrid.min",
        "bootstrap-table-zh":"./assets/js/lib/bootstrap/Bootstrap-table/bootstrap-table-zh-CN",
        "bootstrap-table-editable":"./assets/js/lib/bootstrap/Bootstrap-table/bootstrap-table-editable-new",
        "bootstrap-select-editor":"./assets/js/lib/bootstrap/bootstrap-select-editor",
        "bootstrap-select":"./assets/js/lib/bootstrap/bootstrap-select",
        "layui": "./assets/js/lib/layui/layui",
        "iCheck":'./assets/js/lib/iCheck/icheck.min',
        "commonModule":'./assets/js/commonModule',
        "toastr":'./assets/js/lib/toastr/toastr.min',
        "commonUtils":'./assets/js/commonUtils',
        // "itsmGroup":'./assets/js/itsmGroup',
        "spin":'./assets/js/lib/ladda/spin.min',
        "ladda":'./assets/js/lib/ladda/ladda.min',
    },
    waitSeconds: 0,
    shim: {
        'bootstrap':{
            deps: ['jquery'],
            exports: 'bootstrap'
        },
        'jqueryTmpl': {
            deps: ['jquery'],
            exports: 'jqueryTmpl'
        },
        'datetimepicker':{
            deps: ['jquery','bootstrap'],
            exports: 'bootstrap-table'
        },
        'datetimepicker-zh':{
            deps: ['jquery','bootstrap'],
            exports: 'bootstrap-table'
        },
        'bootstrap-table':{
            deps: ['jquery','bootstrap'],
            exports: 'bootstrap-table'
        },
        'bootstrap-table-zh':{
            deps: ['jquery','bootstrap','bootstrap-table'],
            exports: 'bootstrap-table-zh'
        },
        'bootstrap-table-editable':{
            deps: ['jquery','bootstrap','bootstrap-table'],
            exports:'bootstrap-table-editable'
        },
        'bootstrap-select-editor':{
            deps: ['jquery','bootstrap'],
            exports: "bootstrap-select-editor"
        },
        'bootstrap-select':{
            deps: ['jquery','bootstrap'],
            exports: "bootstrap-select"
        },
        'iCheck':{
            deps:['jquery'],
            exports:'iCheck'
        },
        'bootstrap-table-treegrid':{
            deps: ['jquery','bootstrap','bootstrap-table','bootstrap-table-zh'],
            exports: "bootstrap-table-treegrid"
        },
        'treegrid':{
            deps: ['jquery','bootstrap','bootstrap-table','bootstrap-table-zh','bootstrap-table-treegrid'],
            exports: "treegrid"
        },
        'bootstrap-treeview':{
            deps: ['jquery','bootstrap','bootstrap-table','bootstrap-table-zh'],
            exports: 'bootstrap-treeview'
        },
        'bootstrap-dialog':{
            deps: ['jquery','bootstrap','jqueryTmpl'],
            exports: 'bootstrap-dialog'
        },



    }
});

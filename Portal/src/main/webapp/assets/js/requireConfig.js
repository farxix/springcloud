requirejs.config({
    // baseUrl: "",//入口html的位置
    paths: {
        "jquery": "./assets/js/lib/jquery.min",
        "jquery.tablednd.min":"./assets/js/lib/bootstrap/jquery.tablednd.min",
        "jqueryTmpl":"./assets/js/lib/jquery.tmpl.min",
        "bootstrap":"./assets/js/lib/bootstrap/bootstrap.min",
        "bootstrap-table":"./assets/js/lib/bootstrap/Bootstrap-table/bootstrap-table",
        "bootstrap-table-zh":"./assets/js/lib/bootstrap/Bootstrap-table/bootstrap-table-zh-CN",
        "bootstrap-table-reorder-rows":"./assets/js/lib/bootstrap/Bootstrap-table/bootstrap-table-reorder-rows",
        "bootstrap-dialog":"./assets/js/lib/bootstrap/bootstrap-dialog/js/bootstrap-dialog",
        "bootstrap-treeview": "./assets/js/lib/bootstrap/bootstrap-treeview",
        "bootstrap-modal": "./assets/js/lib/bootstrap/bootstrap-modal",
        "bootstrap-table-treegrid":"./assets/js/lib/bootstrap/Bootstrap-table/treegrid/bootstrap-table-treegrid",
        "treegrid":"./assets/js/lib/jquery-treegrid/jquery.treegrid.min",
        "commonUtils":'./assets/js/commonUtils',
        "commonModule":'./assets/js/commonModule',
        "toastr":'./assets/js/lib/toastr/toastr.min',
        // "itsmGroup":'./assets/js/itsmGroup',
        "apiConfig":'./assets/js/apiConfig',
        "bootstrap-editable":"./assets/js/lib/bootstrap/Bootstrap-table/bootstrap-editable",
         "bootstrap-select":"./assets/js/lib/bootstrap/bootstrap-select",
         "bootstrap-table-editable":"./assets/js/lib/bootstrap/Bootstrap-table/bootstrap-table-editable",
         "bootstrap-table-editable-new":"./assets/js/lib/bootstrap/Bootstrap-table/bootstrap-table-editable-new",
        // "iCheck":'./assets/js/lib/iCheck/icheck.min',
         "spin":'./assets/js/lib/ladda/spin.min',
         "ladda":'./assets/js/lib/ladda/ladda.min',
        "ladda-jquery":'./assets/js/lib/ladda/ladda.jquery.min',
        "moment":'./assets/js/lib/moment/moment',
        "fullcalendar":'./assets/js/lib/calendar/fullcalendar.min',
        "bootstrap-datetimepicker":'./assets/js/lib/bootstrap/bootstrap-datetimepicker/bootstrap-datetimepicker',
        "bootstrap-datetimepicker.zh-CN":'./assets/js/lib/bootstrap/bootstrap-datetimepicker/bootstrap-datetimepicker.zh-CN',
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
        'bootstrap-table':{
            deps: ['jquery','bootstrap'],
            exports: 'bootstrap-table'
        },
        'bootstrap-table-zh':{
            deps: ['jquery','bootstrap','bootstrap-table'],
            exports: 'bootstrap-table-zh'
        },
        'bootstrap-treeview':{
            deps: ['jquery','bootstrap','bootstrap-table','bootstrap-table-zh'],
            exports: 'bootstrap-treeview'
        },
        'bootstrap-dialog':{
            deps: ['jquery','bootstrap','jqueryTmpl'],
            exports: 'bootstrap-dialog'
        },

        'bootstrap-table-treegrid':{
            deps: ['jquery','bootstrap','bootstrap-table','bootstrap-table-zh'],
            exports: "bootstrap-table-treegrid"
        },
        'treegrid':{
            deps: ['jquery','bootstrap','bootstrap-table','bootstrap-table-zh','bootstrap-table-treegrid'],
            exports: "treegrid"
        },
        'bootstrap-table-editable':{
            deps: ['jquery','bootstrap','bootstrap-table'],
            exports: "bootstrap-table-editable"
        },
        'bootstrap-editable':{
            deps: ['jquery','bootstrap','bootstrap-table'],
            exports: "bootstrap-editable"
        },

        'bootstrap-select':{
            deps: ['jquery','bootstrap'],
            exports: "bootstrap-select"
        },
        // 'iCheck':{
        //     deps:['jquery'],
        //     exports:'iCheck'
        // },
        'spin':{
            exports:"spin"
        },
        'ladda':{
            deps:['spin'],
            exports:"ladda"
        },
        'moment':{
            deps:['jquery'],
            exports:'moment'
        },
        'fullcalendar':{
            deps:['jquery'],
            exports:'fullcalendar'
        },

         'bootstrap-table-editable-new':{
            deps: ['jquery','bootstrap','bootstrap-table'],
             exports: "bootstrap-table-editable-new"
         },
    }
});

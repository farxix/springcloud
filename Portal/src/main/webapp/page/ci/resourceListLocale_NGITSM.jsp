<%@page contentType="text/html; charset=GBK" language="java" %>
<%@ page import="java.text.*" %>
<%@ page import="java.util.*" %>
<%@ page import="com.ailk.toptea.resm.service.*" %>
<%@ page import="com.ailk.toptea.resm.model.*" %>
<%@ page import="com.ailk.toptea.resm.resource.*" %>
<%@ page import="com.ailk.toptea.resm.util.*" %>
<%@ page import="com.ailk.toptea.resm.ui.*" %>

<%
    response.setHeader("Pragma", "no-cache");
    response.setHeader("Cache-Control", "no-cache");
    response.setHeader("Expires", "0");
    int pageCount = 20;

    String id = request.getParameter("id");
    boolean mutiModel = "1".equals(request.getParameter("muti"));

    if (id == null)
        id = "";
    String modelId = request.getParameter("model");
    if (StringUtil.isBlank(modelId))
        modelId = "host";
    Model model = ServiceManager.getModelService().getModelById(modelId);
    List<ModelAttribute> attrs = model.getAttributes();
%>

<html>
<head>
    <title></title>
    <meta http-equiv="Content-Type" content="text/html; charset=gbk">
    <%@ include file="../extjs.jsp" %>
</head>
<body>
<script type="text/javascript">
    var store = new Ext.data.GroupingStore({
        proxy: new Ext.data.HttpProxy({
            url: '/resm/interface/resQueryLocale.jsp'
        }),
        baseParams: {includeChilds: "true", "modelId": "<%=modelId%>", limit: <%=pageCount%>},
        reader: new Ext.data.JsonReader({
            root: 'items',
            totalProperty: 'totalCount',
            id: 'id'
        }, [
            {name: "searchcode"},
            {name: "name"},
            {name: "status"},
            {name: "serialno"},
            {name: "id"}
        ]),
        sortInfo: {field: 'name', direction: 'ASC'},
        remoteSort: true
    });


    Ext.tree.TreeLoaderExtend = function (config) {
        Ext.tree.TreeLoaderExtend.superclass.constructor.call(this, config);
    }

    Ext.extend(Ext.tree.TreeLoaderExtend, Ext.tree.TreeLoader, {
        createNode: function (attr) {
            var ret = Ext.tree.FilterTreeLoader.superclass.createNode.call(this, attr);
            ret._click = attr._click;
            return ret;
        }
    });
    var modelPanel = new Ext.tree.TreePanel({
        region: 'west',
        stripeRows: true,
        title: 'ģ��',
        split: true,
        width: 200,
        minSize: 150,
        autoScroll: true,
        margins: '1 0 1 1',
        rootVisible: false,
        lines: true,
        useArrows: false,
        loadMask: true,
        root: new Ext.tree.TreeNode({id: '-1'})
    });

    modelPanel.loader = new Ext.tree.TreeLoaderExtend({
        baseParams: {includeAll: false},
        dataUrl: 'model.jsp'
    });
    modelPanel.loader.load(modelPanel.root);
    modelPanel.on("click", function (node, e) {
        store.baseParams.modelId = node.id;
        store.reload();
    })

    var mainPanel = new Ext.grid.GridPanel({
        region: 'center',
        store: store,
        margins: '1 1 1 1',
        columns: [
            {header: "��������", dataIndex: 'searchcode'},
            {header: "����", dataIndex: 'name'},
            {header: "״̬", dataIndex: 'status'},
            {header: "���к�", dataIndex: 'serialno'},
            {header: "ID", dataIndex: 'id', hidden: true}
        ],
        sm: new Ext.grid.RowSelectionModel({
            singleSelect: true
        }),
        tbar: ['ģ������: ',
            new Ext.form.SearchField({
                paramName: 'filter',
                store: store,
                emptyText: '�������롢���ƣ�ģ��ƥ��',
                width: 560
            })
        ],
        bbar: new Ext.PagingToolbar({
            items: ['-', new Ext.Toolbar.Button({
                text: '�鿴��Դ��Ϣ',
                handler: function () {
                    var cell = mainPanel.getSelectionModel().getSelected();
                    if (cell == null) {
                        Ext.MessageBox.alert("��ʾ", "��ѡ����Դ����");
                        return;
                    }
                    var id = cell.get("searchcode");
                    if (!id || id == '') {
                        Ext.MessageBox.alert("��ʾ", "��ѡ����Դ������������Ϊ��");
                        return;
                    }
                    var height = 480;
                    var width = 840;
                    var ua = navigator.userAgent;
                    if (ua.lastIndexOf("MSIE 6.0") != -1) {
                        if (ua.lastIndexOf("Windows NT 5.1") != -1) {
                            height += 49;
                        } else if (ua.lastIndexOf("Windows NT 5.0") != -1) {
                            height += 49;
                        }
                    }
                    var xposition = (screen.width - width) / 2;
                    var yposition = (screen.height - height) / 2;

                    window.showModalDialog('/resm/view/view.jsp?id=' + cell.get("id"), '', 'dialogWidth=' + width + 'px;dialogHeight=' + height + 'px;dialogLeft=' + xposition + 'px;dialogTop=' + yposition + 'px;center=yes;status=no;help=no;resizable=no;scroll=no');
                }
            })],
            pageSize: <%=pageCount%>,
            store: store,
            displayInfo: true,
            displayMsg: '�� {0} - {1} ������ {2} ����¼',
            emptyMsg: "�޼�¼"
        }),
        viewConfig: {
            forceFit: true
        },
        <%if (!mutiModel) { %>
        buttons: [
            {
                text: 'ȷ��',
                handler: function () {
					onOk();
                    parent.Ext.getCmp("dialogWin").close();
                }
            }, {
                text: 'ȡ��',
                handler: function () {
                    onCancel();
                    parent.Ext.getCmp("dialogWin").close();
                }
            }
        ],
        <%}%>
        width: '100%',
        split: true,
        height: 200,
        loadMask: true,
        view: new Ext.grid.GroupingView({
            forceFit: true,
            groupTextTpl: '{text} ({[values.rs.length]} {[values.rs.length > 1 ? "Items" : "Item"]})'
        })
    });

    <%if (mutiModel) { %>
    var store2 = new Ext.data.GroupingStore({
        proxy: new Ext.data.HttpProxy({
            url: '/resm/interface/resQueryLocale2.jsp'
        }),
        baseParams: {"modelId": "<%=modelId%>", id: "<%=id%>"},
        reader: new Ext.data.JsonReader({
            root: 'items',
            totalProperty: 'totalCount',
            id: 'id'
        }, [
            {name: "searchcode"},
            {name: "name"},
            {name: "status"},
            {name: "serialno"}
        ]),
        sortInfo: {field: 'name', direction: 'ASC'},
        remoteSort: true
    });

    var selectedPanel = new Ext.grid.GridPanel({
        region: 'south',
        store: store2,
        margins: '1 1 1 1',
        title: '��ѡ����Դ����',
        columns: [
            {header: "��������", dataIndex: 'searchcode'},
            {header: "����", dataIndex: 'name'},
            {header: "״̬", dataIndex: 'status'},
            {header: "���к�", dataIndex: 'serialno'}
        ],
        sm: new Ext.grid.RowSelectionModel({
            singleSelect: true
        }),
        viewConfig: {
            forceFit: true
        },
        width: '100%',
        split: true,
        height: 200,
        buttons: [{
            text: 'ȷ��',
            handler: function () {
                onOk();
                parent.Ext.getCmp("dialogWin").close();
            }
        }, {
            text: 'ȡ��',
            handler: function () {
                onCancel();
                parent.Ext.getCmp("dialogWin").close();
            }
        }],
        loadMask: true,
        view: new Ext.grid.GroupingView({
            forceFit: true,
            groupTextTpl: '{text} ({[values.rs.length]} {[values.rs.length > 1 ? "Items" : "Item"]})'
        })
    });
    <%}%>


    <%if (mutiModel) { %>
    mainPanel.on("rowdblclick", function (g, rowIndex, e) {
        var cell = g.getStore().getAt(rowIndex);
        if (store2.indexOf(cell) == -1)
            store2.add([cell]);
        selectedPanel.getSelectionModel().selectRecords([cell]);
    });
    selectedPanel.on("rowdblclick", function (g, rowIndex, e) {
        store2.removeAt(rowIndex);
    });
    <% } else { %>
    mainPanel.on("rowdblclick", function (g, rowIndex, e) {
        onOk();
        parent.Ext.getCmp("dialogWin").close();
    });
    <% } %>

    Ext.onReady(function () {
        var centerPanel = {
            region: 'center',
            layout: 'border',
            bodyBorder: false,
            border: false,
            split: true,
            items: [mainPanel
                <%if (mutiModel) { %>
                , selectedPanel
                <%}%>
            ]
        };

        var viewport = new Ext.Viewport({
            layout: 'border',
            items: [modelPanel, centerPanel]
        });
        <%if (mutiModel) { %>
        store2.load();
        <% } %>
    });


    function GetData() {
        var count = selectedPanel.getStore().getCount();
        if (count == 0) {
            Ext.MessageBox.alert("��ʾ", "��ѡ����Դ����");
            return;
        }
        var i;
        var ids = "";
        var names = "";
        for (i = 0; i < count; i++) {
            var r = selectedPanel.getStore().getAt(i);
            if (i > 0)
                ids += ",";
            var id = r.get("searchcode");
            var name = r.get("name");
            if (!name || name == '')
                name = id;
            ids += id;
            names += name;
        }

        var resObj = {};
        resObj.id = ids;
        resObj.name = names;
        return resObj;
    }

    function SetData(param) {
        var hiddenName = param;
    }


    function closeWindow(action) {
        if (window.CloseOwnerWindow)
            return window.CloseOwnerWindow(action);
        else
            window.close();
    }

    function onOk() {
        closeWindow("ok");
    }

    function onCancel() {
        closeWindow("cancel");
    }

</script>
</body>
</html>

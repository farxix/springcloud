<%@page contentType="text/html; charset=GBK" language="java"%>
<%@ page pageEncoding="GBK"%>
<%@ page import="java.text.*"%>
<%@ page import="java.util.*"%>
<%@ page import="com.ailk.toptea.resm.service.*"%>
<%@ page import="com.ailk.toptea.resm.model.*"%>
<%@ page import="com.ailk.toptea.resm.resource.*"%>
<%@ page import="com.ailk.toptea.resm.util.*"%>
<%@ page import="com.ailk.toptea.resm.ui.*"%>



<%
response.setHeader("Pragma", "no-cache");
response.setHeader("Cache-Control","no-cache");
response.setHeader("Expires","0");
int pageCount = 20;

//String id = request.getParameter("id");
//String includeChilds = request.getParameter("includeChilds");
/*
if (StringUtil.isBlank(includeChilds))
	includeChilds = "true";
if (id == null)
	id = "";
String modelId = "contract_rm";

Model model = ServiceManager.getModelService().getModelById(modelId);

List<AttributeDefine> headers = model.getHeader();
*/
%>

<html>
<head>
  <title></title>
	<meta http-equiv="Content-Type" content="text/html; charset=gbk">
<%@ include file="../extjs.jsp"%>
</head>
<body>
<script type="text/javascript">
var store = new Ext.data.GroupingStore({
	proxy: new Ext.data.HttpProxy({
		url: '/resm/interface/resQuery_room.jsp'
	}),
	baseParams: { includeChilds: "true", "modelId": "contract_rm", limit: 20 },
	reader: new Ext.data.JsonReader({
		root: 'items',
		totalProperty: 'totalCount',
		id: 'id'
	}, [
		{name:"searchcode"},
		{name:"id"},
		{name:"name"},
		{name:"status"},

		{name:"supervisor"},

		{name:"project_manager"},

		{name:"companys"}
	]),
	sortInfo:{field: 'name', direction: 'ASC'},
	remoteSort: true
});

var pt = new Ext.PagingToolbar({
	pageSize: <%=pageCount%>,
	store: store,
	displayInfo: true,
	displayMsg: '�� {0} - {1} ������ {2} ����¼',
	emptyMsg: "�޼�¼",
	//plugins: filters,
	items: ['-']
});

var mainPanel;
var sf = new Ext.form.SearchField({
	paramName:'filter',
	store: store,
	emptyText : 'test',
	width: 560
});
	
mainPanel = new Ext.grid.GridPanel({
	region:'center',
	store: store,
	margins:'1 1 1 1',
	columns: [
		{header: "��������", dataIndex: 'searchcode'},
		{header: "ID", dataIndex: 'id'},
		{header: "����", dataIndex: 'name'},
		{header: "״̬", dataIndex: 'status'},
		{header: "������Ŀ������", dataIndex: 'project_manager'},
	
		{header: "���̼�����", dataIndex: 'supervisor'},
		{header: "��Ҫʩ����λ", dataIndex: 'companys'}
	],
	sm: new Ext.grid.RowSelectionModel({
		singleSelect: true
	}),
	tbar: ['ģ������: ', sf],
	bbar: pt,
	viewConfig: {
		forceFit: true
	},
	buttons: [{
		text: 'ȷ��',
		handler : function() {
			var cell = mainPanel.getSelectionModel().getSelected();
			if (cell == null) {
				Ext.MessageBox.alert("��ʾ", "��ѡ����Դ����");
				return;
			}
			var id = cell.get("id");
				if(id == ''){
					id="$";
				}
	        var hiddenName="<%=request.getParameter("hiddenName")%>";
			var comboxObj= parent.Ext.getCmp(hiddenName);	
			comboxObj.setValue(id);	
			parent.Ext.getCmp("dialogWin").close();
		}
	},{ text: 'ȡ��',
		handler: function() { parent.Ext.getCmp("dialogWin").close(); }
	}],
	width:'100%',
	split:true,
	height: 200,
	loadMask: true,
   	view: new Ext.grid.GroupingView({
		forceFit:true,
		groupTextTpl: '{text} ({[values.rs.length]} {[values.rs.length > 1 ? "Items" : "Item"]})'
	})
});


mainPanel.on("rowdblclick", function(g, rowIndex, e) {
	var cell = g.getStore().getAt(rowIndex);
	
	var id = cell.get("id");
	if(id == ''){
					id="$";
				}
	        var hiddenName="<%=request.getParameter("hiddenName")%>";
			var comboxObj= parent.Ext.getCmp(hiddenName);	
			comboxObj.setValue(id);	
			parent.Ext.getCmp("dialogWin").close();
});

Ext.onReady(function(){
	var viewport = new Ext.Viewport({
		layout:'border',
		items:[mainPanel]
	});
	sf.setValue('');
	sf.onTrigger2Click();
});

function getData(){
    var cell = mainPanel.getSelectionModel().getSelected();
    if (cell == null) {
        Ext.MessageBox.alert("��ʾ", "��ѡ����Դ����");
        return;
    }
    var id = cell.get("id");
    if(id == ''){
        id="$";
    }
    var name = cell.get("name");

    var resObj = {};
    resObj.id = id;
    resObj.name = name;
    return resObj;
}

function setData(param){
    var hiddenName=param;
}

</script>
 </body>
</html>

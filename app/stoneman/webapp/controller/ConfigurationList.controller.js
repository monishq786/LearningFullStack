sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "../service/WebService",
    "sap/ui/core/UIComponent",
    "sap/ui/core/Fragment",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/format/DateFormat",
    "sap/ui/core/BusyIndicator",
    "sap/m/MessageToast",
  ], function (Controller, JSONModel, WebService, UIComponent, Fragment,
    Filter, FilterOperator, DateFormat, BusyIndicator, MessageToast) {
    var merchantVal = '';
    var that;
    var inputId = "";
     'use strict';
  
    return Controller.extend("stoneman.controller.ConfigurationList", {
      onRouteMatched: function (oEvent) {
        var lstorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
        role_Info = lstorage.get('role_details');
        loginInfo = lstorage.get('login_info');
        role = loginInfo['role'];
        this.myName = loginInfo['username'];
        var oViewModel = new JSONModel({ myName: this.myName });
        this.getView().setModel(oViewModel, "view");
        var username = this.byId("userName");
        var deptname = this.byId("dept");
        var rolename = this.byId("userRole");       
        username.setValue(null);
        deptname.setValue(null);
        rolename.setValue(null);
        this.getListData();
  
      },
      onInit: function () {
        that = this;
        var oRouter = UIComponent.getRouterFor(this);
        oRouter.getRoute("RouterNameConfigurationForm").attachMatched(this.onRouteMatched, this)
        var oPath = jQuery.sap.getModulePath(
          "stoneman",
          "/model/buyer.json"
        );
        var oModel1 = new sap.ui.model.json.JSONModel(oPath);
        this.getView().setModel(oModel1, "cadBuyer");
  
  
        var oPath3 = jQuery.sap.getModulePath(
          "stoneman",
          "/model/CADSearchModel.json"
        );
        var oModel3 = new sap.ui.model.json.JSONModel(oPath3);
        this.getView().setModel(oModel3, "cadSearchModel");

        var oPath6 = jQuery.sap.getModulePath(
          "stoneman",
          "/model/MDepartment.json"
        );
        var oModel6 = new sap.ui.model.json.JSONModel(oPath6);
        this.getView().setModel(oModel6, "cadDepartment");
  
        var oPath4 = jQuery.sap.getModulePath(
          "stoneman",
          "/model/Configuration.json"
        );
        var oModel4 = new sap.ui.model.json.JSONModel(oPath4);
        this.getView().setModel(oModel4, "configurationModel");
        var oRolePath = jQuery.sap.getModulePath(
          "stoneman",
          "/model/MRole.json"
        );
        var oRolePath = new sap.ui.model.json.JSONModel(oRolePath);
        this.getView().setModel(oRolePath, "roleModel");
        this.getListData();
        var username = this.byId("userName");
        var deptname = this.byId("dept");
        var rolename = this.byId("userRole");       
        username.setValue(null);
        deptname.setValue(null);
        rolename.setValue(null);

        this.setPropertyManually();
      },
      setPropertyManually:function(){
        var userName = this.getView().byId("userName")
        userName.setValueHelpOnly(true);
        var dept = this.getView().byId("dept")
        dept.setValueHelpOnly(true);
        var userRole = this.getView().byId("userRole")
        userRole.setValueHelpOnly(true);
      },
      getListData:function(){
        WebService.getMUserAPI().then(function (response) {
          if (response.code == 200) {
            var oModel = that.getView().getModel("configurationModel");
            if (response.data.value.length > 0) {
              oModel.setData(response.data);
             
  
            }
            that.getView().setModel(oModel, "configurationModel");
          }
  
        });
        


      },      
      setButtonVisibility: function () {
        var oView = this.getView();
        var oButton = oView.byId("addMarchant");
        oButton.setVisible(true);
      },
      navBack: function () {
        const oRouter = this.getOwnerComponent().getRouter();
        oRouter.navTo("RouteNameLanding", {}, true);
      },
  
      onPressLogout: function () {
        var oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
        oStorage.put(null);
        sap.ui.getCore().getEventBus().publish("Logout", "rowSelectEvent", '');
        const oRouter = this.getOwnerComponent().getRouter();
        oRouter.navTo("RouteNameLogin", {}, true);
        objGlobalThis.onClearSearchButtonAction();
      },
     
      
      onAction: function (oEvent) {
        var sPath = oEvent.getSource().getBindingContext("configurationModel").getPath();
        var iIndex = parseInt(sPath.split("/")[2]);
        var oModel = that.getView().getModel("configurationModel");
        var aData = oModel.getData();
        var oRouter = UIComponent.getRouterFor(this);
        var sData = aData.value[iIndex].UserID;
        oRouter.navTo("RouterNameConfigurationAddViewForm", {
          data: encodeURIComponent(sData),
          type: 'edit'
        });
      },
  
      getRouter: function () {
        return sap.ui.core.UIComponent.getRouterFor(this);
      },
  
      onRouterClick: function () {
        this.getRouter().navTo("RouterNameConfigurationAddViewForm", {
          data: encodeURIComponent(0),
          type: 'add'
        });
      },
  
      getUserValue: function () {
        var oText = this.byId('userType').getValue()
        console.log(oText)
      },
  
      onChange: function () {
        var oModel = this.getView().getModel("configurationModel");
        var oData = oModel.getData();
        oModel.setData(oData);
        merchantVal = oData.MerchantType;
        console.log(merchantVal);
      },
      
      onValueHelpRequest: function (inputId) {
  
        // Publish an event to open the dialog and add dynamic fields
        var oEventBus = this.getOwnerComponent().getEventBus();
  
        // Re-subscribe if necessary
        oEventBus.subscribe("stoneman", "openDynamicDialog", this.openDynamicDialog, this);
  
        this.getOwnerComponent().getEventBus().publish("stoneman", "openDynamicDialog", {
          dialogTitle: inputId
        });
  
  
  
      }, onCloseDialog: function () {
        BusyIndicator.hide();
        // Close the dialog when the close button is pressed
        this.byId("dept").setValue("");
        // this.byId("merchant").setValue("");
        this._pDynamicDialog.then(function (oDialog) {
          var oTable = that.byId("dynamicTable");
  
          oTable.removeAllColumns();
  
          oDialog.close();
        });
        this.getOwnerComponent().getEventBus().unsubscribe("stoneman", "openDynamicDialog", this.openDynamicDialog, this);
  
      },
  
      openDynamicDialog: function (sChannel, sEvent, oData) {
  
        // Check if the dialog is already created
        var inputId = oData.dialogTitle;
        var title = "";
        var i18nModel = this.getView().getModel("i18n");
        if (i18nModel) {
  
  
          if (inputId === "buyer") {
            inputKey = "buyerTitle";
          } else if (inputId === "merchant") {
            inputKey = "merchantTitle";
          } else if (inputId === "cadNo") {
            inputKey = "cadNoTitle";
          }
          else if(inputId=="deptSearch"){
            inputKey="departmentTitle";
          }
          else if (inputId === "role") {
            inputKey = "roleTitle";
          }else if (inputId === "userLookup") {
            inputKey = "userTitle";
          }
  
          title = this.getView().getModel("i18n").getResourceBundle().getText(inputKey);
        }
  
        if (!this._pDynamicDialog) {
          BusyIndicator.show(0);
          this._pDynamicDialog = Fragment.load({
            id: this.getView().getId(),
            name: "stoneman.view.ValueHelpFragment",
            controller: this
          }).then(function (oDialog) {
            this.getView().addDependent(oDialog);
            oDialog.setTitle(title);
            // BusyIndicator.hide();
            return oDialog;
          }.bind(this));
        }
  
        // Open the dialog and add dynamic fields
        this._pDynamicDialog.then(function (oDialog) {
          this.oBusyIndicator = Fragment.byId(this.getView().getId(), "busyIndicator");
  
          // Show the busy indicator
          this.oBusyIndicator.setVisible(true);
          this._createTableColumnsAndRows(inputId);
          oDialog.setTitle(title);
          oDialog.open();
          //BusyIndicator.hide();
        }.bind(this));
      },
  
      camelCaseToSpaces: function (str) {
        return str.replace(/([a-z])([A-Z])/g, '$1 $2');
      },
      _createTableColumnsAndRows: function (inputId) {
        // Sample data
        // Clear search field value on fragment initialization
        this.byId("idSearchField").setValue("");
  
        WebService.getAPIForFragment(inputId).then(function (response) {
          if (response) {
            BusyIndicator.hide();
            if (that.oBusyIndicator) {
              that.oBusyIndicator.setVisible(false); // Hide busy indicator
            }
          }
          if (response.code == 200) {
  
            var oTable = that.byId("dynamicTable");
  
            oTable.removeAllColumns();
            var oData = {
              columnHeaders: [],
              rows: []
            };
            if (inputId == "buyer") {
              var aData;
              var oModel = that.getView().getModel("cadBuyer");
              aData = oModel.getData();
              for (var i = 0; i <= aData.d.results.length; i++) { aData.d.results.pop(); }
              aData.d.results = [];
              for (var i = 0; i <= response.data.d.results.length; i++) {
                aData.d.results.push(response.data.d.results[i]);
              }
              oModel.setData(aData);
              that.getView().setModel(oModel, "cadBuyer");
              //oModel.setData(response.data.value);
  
              oData.rows = aData.d.results;
            }
            else if (inputId == "role") {
              var oModel = that.getView().getModel("roleModel");
              var aData = oModel.getData();
              aData.value = [];
              for (var i = 0; i < response.data.value.length; i++) {
                aData.value.push(response.data.value[i]);
              }
              that.getView().setModel(oModel, "roleModel");
              oModel.setData(response.data.value);

              oModel.setData(aData);
              oData.rows = aData.value;
              
            }
            else if (inputId == "cadNo") {
              var oModel = that.getView().getModel("configurationModel");
              var aData = oModel.getData();
              aData.value = [];
              for (var i = 0; i < response.data.value.length; i++) {
                aData.value.push(response.data.value[i]);
              }
              that.getView().setModel(oModel, "configurationModel");
              oModel.setData(response.data.value);
  
              oModel.setData(aData);
              oData.rows = aData.value;
            }
            else if(inputId == "deptSearch"){
              var oModel = that.getView().getModel("cadDepartment");
              var aData = oModel.getData();
              aData.value = [];
              for (var i = 0; i < response.data.value.length; i++) {
                aData.value.push(response.data.value[i]);
              }
              that.getView().setModel(oModel, "cadDepartment");
              oModel.setData(response.data.value);
  
              oModel.setData(aData);
              oData.rows = aData.value;
            }
            else if (inputId == "userLookup") {
              var oModel = that.getView().getModel("cadBuyer");
              aData = oModel.getData();
              for (var i = 0; i <= aData.d.results.length; i++) { aData.d.results.pop(); }
              aData.d.results = [];
              for (var i = 0; i <= response.data.d.results.length; i++) {
                aData.d.results.push(response.data.d.results[i]
                );
              } oModel.setData(aData);
              that.getView().setModel(oModel, "cadBuyer");
              oData.rows = aData.d.results;
            }
            if (inputId == 'buyer') {
              oData.columnHeaders = Object.keys(aData.d.results[0]).slice(1, 4);
              oData.columnHeaders.push("BusinessPartnerName");
            }
            else if (inputId == 'merchant') {
              // oData.columnHeaders = Object.keys(aData.d.results[0]).slice(1, 4);
              oData.columnHeaders = ["PersonFullName"];
            }
            else if (inputId == 'cadNo') {
              oData.columnHeaders =
                [{ label: "CrfReqNo", template: "CrfReqNo" },
                { label: "CrfReqUUID", template: "CrfReqUUID", visible: false }];
            }
            else if (inputId=="deptSearch"){
             // oData.columnHeaders = ["CostCenter", "CostCenterName", "CostCenterDescription"];
              oData.columnHeaders =
              [{ label: "Dept Code", template: "CostCenter" },
              { label: "Dept Name", template: "CostCenterName", visible: true },
              { label: "Dept Description", template: "CostCenterDescription", visible: true }
            ];
            }
            else if (inputId == 'role') {
              oData.columnHeaders = ["RoleName"]
            }
            else if (inputId == 'userLookup') {
              oData.columnHeaders = ["BusinessPartner", "BusinessPartnerUUID", "BusinessPartnerFullName"]
            }
  
            var oModel = new JSONModel(oData);
            oModel.setData(oData);
            that.getView().setModel(oModel);
            if (inputId == "buyer"  || inputId=="role" || inputId=="userLookup") {
              oData.columnHeaders.forEach(function (headerText) {
                {
                  var headerText2 = that.camelCaseToSpaces(headerText);
                  oTable.addColumn(new sap.m.Column({
                    header: new sap.m.Text({ text: headerText2 }).addStyleClass("columnHeaderStyle")
                  }));
                }
              });
            }
            if (inputId == "cadNo"  || inputId=="deptSearch") {
              oData.columnHeaders.forEach(function (column) {
                var headerText2 = that.camelCaseToSpaces(column.label);
                oTable.addColumn(new sap.m.Column({
                  header: new sap.m.Label({ text: headerText2 }),
                  template: new sap.m.Text({ text: column.template }),
                  visible: column.visible !== false
                }));
              });
              // template: new sap.m.Text({ text: "{" + column.template + "}" }),   
            }
  
  
  
  
            if (inputId == "buyer"  || inputId=="role" || inputId=="userLookup") {
              var aCells = oData.columnHeaders.map(function (propertyName) {
                return new sap.m.Text({ text: "{" + propertyName + "}" });
              });
            }
            if (inputId == "cadNo" || inputId=="deptSearch") {
              var aCells = oData.columnHeaders.map(function (propertyName) {
                return new sap.m.Text({ text: "{" + propertyName.template + "}" });
              });
            }
            var oTemplate = new sap.m.ColumnListItem({
              type: "Active",
              press:
                // Call the actual handler with the event and the captured inputId parameter
                that.onRowPress.bind(that),
  
              cells: aCells
            });
            oTable.bindItems({
              path: "/rows",
              template: oTemplate
            });
  
          }
        });
  
        // oData.rows[0].col1=aData.value[0].BusinessPartnerName;
  
      },
      formatDialogTitle: function (inputId) {
        var i18nModel = this.getView().getModel("i18n");
        if (i18nModel) {
          var inputKey = inputId == "buyer" ? "buyerTitle" : "merchantTitle";
          return i18nModel.getProperty("i18n>" + inputKey);
        }
        console.log("title", inputKey);
        return "";
      },
      onValueHelpBuyer: function () {
        this.onValueHelpRequest("buyer");
        this.inputId = "buyer";
      },
  
      onValueHelpMerchant: function () {
        this.onValueHelpRequest("merchant");
        this.inputId = "merchant";
      },
      onValueHelpCADNo: function () {
        this.onValueHelpRequest("cadNo");
        this.inputId = "cadNo";
      },
      onValueHelpDepartmentSearch(){
        this.onValueHelpRequest("deptSearch");
        this.inputId = "deptSearch";
      },
      onValueHelpRoleLookup: function (oEvent) {
        this.onValueHelpRequest("role", oEvent);
        this.inputId = "role";
      },
      onValueHelpUserLookup: function (oEvent) {
        this.onValueHelpRequest("userLookup", oEvent);
        this.inputId = "userLookup";
      },
      onRowPress: function (oEvent) {
        // Get the selected row context
        var oSelectedItem = oEvent.getParameter("listItem");
        var oBindingContext = oSelectedItem.getBindingContext();
  
        // Get the data of the selected row
        var oSelectedRowData = oBindingContext.getObject();
  
        // Pass the selected row data to the main controller
        this._handleSelectedRow(oSelectedRowData);
      },
      _handleSelectedRow: function (oData) {
         // Adjust 'field1' to the specific field you need
  
        // Set the data to the input field
  
        if (this.inputId == "merchant")
          this.byId("merchant").setValue(sSelectedData);
        else if (this.inputId == "userLookup"){
       var   sSelectedData = oData.BusinessPartnerName;
          this.byId("userName").setValue(sSelectedData);}
        else if (this.inputId == "cadNo") {
          var sSelectedData = oData.CrfReqNo;
          this.byId("cadNo").setValue(sSelectedData);
          var uuid = oData.CrfReqUUID;
          var oModel = this.getView().getModel("cadSearchModel");
  
          oModel.setProperty("/cadRequuid", uuid);
  
        }
        else if (this.inputId == "deptSearch") {
         var sSelectedData = oData.CostCenterName;
          this.byId("dept").setValue(sSelectedData);
        }else if (this.inputId=="role"){
          var oModel = this.getView().getModel("configurationModel");
          sSelectedRoleCode = oData.RoleCode_RoleConstant;
          sSelectedRoleName = oData.RoleName;
          this.byId("userRole").setValue(sSelectedRoleName);
          oModel.setProperty("/RoleCode_RoleConstant", sSelectedRoleCode);
          oModel.setProperty("/RoleName", sSelectedRoleName);

        }
        this._pDynamicDialog.then(function (oDialog) {
          var oTable = that.byId("dynamicTable");
  
          oTable.removeAllColumns();
          oDialog.close();
        });
        this.getOwnerComponent().getEventBus().unsubscribe("stoneman", "openDynamicDialog", this.openDynamicDialog, this);
  
      },
      onSearchTable: function (oEvent, oData) {
        // Get the search query
        var sQuery = oEvent.getParameter("query");
        if (sQuery == "" || sQuery == null || sQuery == undefined) {
          return;
        }
        console.log("query", sQuery);
        // Create a filter array
        var aFilters = [];
  
        if (sQuery && sQuery.length > 0) {
          // Add filters for the fields to be searched
          var oTable = that.byId("dynamicTable");
          var oModel = that.getView().getModel();
          var oData = oModel.getData();
          var sDynamicFieldName = this._getDynamicFieldName(oData);
  
          sDynamicFieldName.forEach(function (fieldName) {
            var fieldType = typeof oData.rows[0][fieldName]; // Assuming first row's field type is indicative
  
            if (fieldType === 'string') {
              // For string fields, use FilterOperator.Contains
              aFilters.push(new Filter(fieldName, FilterOperator.Contains, sQuery));
            } else if (fieldType === 'number') {
              // For number fields, convert the query to a number and use FilterOperator.EQ
              var queryNumber = parseFloat(sQuery);
              if (!isNaN(queryNumber)) {
                aFilters.push(new Filter(fieldName, FilterOperator.EQ, queryNumber));
              }
            }
          });
        }
        // Get the binding of the table items
        var oTable = this.byId("dynamicTable");
        var oBinding = oTable.getBinding("items");
        // Combine filters using OR operator
        var oCombinedFilter = new Filter({
          filters: aFilters,
          and: false // Use 'and: false' for OR operator
        });
  
        // Apply the filter
        oBinding.filter(oCombinedFilter, "Application");
      },
      clearValue: function () {
        
        var username = this.byId("userName");
        var deptname = this.byId("dept");
        var rolename = this.byId("userRole");       
        username.setValue(null);
        deptname.setValue(null);
        rolename.setValue(null);
        
        this.getListData();
      },
      onSearch: function () {
        // Get the input field values
        var sUrl = undefined;
        var username = this.byId("userName").getValue();
        var deptname = this.byId("dept").getValue();
        var rolename = this.byId("userRole").getValue();
       
       
        if ((username == "" || username == null) && (deptname == "" || deptname == null) && (rolename == "" || rolename == null) ) {
  
          MessageToast.show("Please select a filter criteria.");
          return;
        }
        var sUrl = undefined;
        if (username != undefined && username != null && username != "") {//So No
          if (sUrl == undefined) {
            sUrl = "Username eq " + "'" + username + "'";
  
          } else {
            sUrl = sUrl + " and Username eq " + "'" + username + "'";
          }
        }
        if (deptname != undefined && deptname != null && deptname != "") {//So No
          if (sUrl == undefined) {
            sUrl = "DepartmentName eq " + "'"+deptname + "'";
  
          } else {
            sUrl = sUrl + " and DepartmentName eq "+ "'" + deptname + "'";
          }
        }
        if (rolename != undefined && rolename != null && rolename != "") {//So No
          if (sUrl == undefined) {
            sUrl = "UserRoleCode_RoleCode_RoleConstant eq " + "'" + rolename + "'";
  
          } else {
            sUrl = sUrl + " and UserRoleCode_RoleCode_RoleConstant eq " + "'" + rolename + "'";
          }
        }
       
        this.fetchFilteredData(sUrl);
      },
      _getDynamicFieldName: function (oData) {
  
        var aKeys = [];
        if (this.inputId != "cadNo" && this.inputId !="deptSearch") {
          aKeys = oData.columnHeaders;
  
        }
        else {
          aKeys = oData.columnHeaders
            .filter(function (header) {
              return header.visible !== false;
            })
            .map(function (header) {
              return header.template;
            });
  
        }
        return aKeys;
      },
      fetchFilteredData: function (sUrl) {
        var oModel = this.getView().getModel("filteredData");
  
        if (sUrl != undefined) {
          WebService.getFilteredMuserListAPI(sUrl).then(function (response) {
            if (response.code == 200) {
              console.log("response", response);
  
              var aData;
              var oModel = that.getView().getModel("configurationModel");
              aData = oModel.getData();
  
              aData.value = [];
              for (var i = 0; i <= response.data.value.length; i++) {
                aData.value.push(response.data.value[i]);
              }
              oModel.setData(aData);
              that.getView().setModel(oModel, "configurationModel");
            }
          });
        }
      },
  
    })
  });
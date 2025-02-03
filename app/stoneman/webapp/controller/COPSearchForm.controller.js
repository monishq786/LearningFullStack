sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "../model/Constants",
  "sap/ui/model/json/JSONModel",
  "../service/WebService",
  "sap/ui/core/UIComponent",
  "sap/ui/model/odata/v2/ODataModel",
  "sap/ui/core/Fragment",
  "./ValueHelpFragment.controller",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/ui/core/format/DateFormat",
  "sap/ui/core/BusyIndicator",
  "sap/m/MessageToast",
], function (Controller, Constants, JSONModel, WebService, UIComponent, ODataModel, Fragment, ValueHelpFragment,
  Filter, FilterOperator, DateFormat, BusyIndicator, MessageToast) {
  var merchantVal = '';
  var that;
  var userId;
  const buyerColoms =
    [{ label: "BusinessPartner", template: "BusinessPartner" },
    { label: "Customer", template: "Customer" },
    { label: "Supplier", template: "Supplier" },
    { label: "BusinessPartnerName", template: "BusinessPartnerName" }];
  'use strict';

  return Controller.extend("stoneman.controller.COPSearchForm", {
    onRouteMatched: function (oEvent) {
      var lstorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
      userId = lstorage.get('login_info')?.UserID;
      console.log('userId    ', userId)
      this.getCOPListData();

    },
    navBack: function () {
      const oRouter = this.getOwnerComponent().getRouter();
      oRouter.navTo("RouteLanding", {}, true);

    },


    onPressLogout: function () {
      var oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
      oStorage.put(null);
      sap.ui.getCore().getEventBus().publish("Logout", "rowSelectEvent", '');
      const oRouter = this.getOwnerComponent().getRouter();
      oRouter.navTo("RouteNameLogin", {}, true);
      objGlobalThis.onClearSearchButtonAction();
    },


    onInit: function () {
      var oRouter = UIComponent.getRouterFor(this);
      oRouter.getRoute("RouterNameCOPSearchForm").attachMatched(this.onRouteMatched, this)
      var oPath = jQuery.sap.getModulePath(
        "stoneman",
        "/model/buyer.json"
      );
      that = this;
      var oModel1 = new sap.ui.model.json.JSONModel(oPath);
      this.getView().setModel(oModel1, "cadBuyer");
      var oPath3 = jQuery.sap.getModulePath(
        "stoneman",
        "/model/CADSearchModel.json"
      );
      var oModel3 = new sap.ui.model.json.JSONModel(oPath3);
      this.getView().setModel(oModel3, "cadSearchModel");

      var oPath4 = jQuery.sap.getModulePath(
        "stoneman",
        "/model/COPRequestForm.json"
      );
      var oModel4 = new sap.ui.model.json.JSONModel(oPath4);
      this.getView().setModel(oModel4, "copRequestModel");

      var oPathMUser = jQuery.sap.getModulePath(
        "stoneman",
        "/model/MUser.json"
      );
      var oPathMUser = new sap.ui.model.json.JSONModel(oPathMUser);
      this.getView().setModel(oPathMUser, "MUserModel");
    },



    onAction: function (oEvent) {
      // Get the selected item
      var sPath = oEvent.getSource().getBindingContext("copRequestModel").getPath();

      // Extract the index from the path (e.g., "/items/0" => 0)
      var iIndex = parseInt(sPath.split("/")[2]);

      var oModel = that.getView().getModel("copRequestModel");
      var aData = oModel.getData();
      var oRouter = UIComponent.getRouterFor(this);
      var sData = aData.value[iIndex].CrfReqUUID;
      oRouter.navTo("", {
        data: encodeURIComponent(sData),
        type: 'edit'
      });
    },

    getRouter: function () {
      return sap.ui.core.UIComponent.getRouterFor(this);
    },

    onRouterClick: function () {
      // this.getOwnerComponent().getEventBus().unsubscribe("stoneman", "openDynamicDialog", this.openDynamicDialog, this);
      this.getRouter().navTo("RouteCOPRequestForm", {
        data: encodeURIComponent(0),
        type: 'add'
      });
    },



    getUserValue: function () {
      var oText = this.byId('userType').getValue()
      console.log(oText)
    },

    onChange: function () {
      var oModel = this.getView().getModel("copRequestModel");
      var oData = oModel.getData();
      oModel.setData(oData);
      merchantVal = oData.MerchantType;
      console.log(merchantVal);
    },



    formatReqTyp: function (sReqTyp) {
      return sReqTyp == "N" ? "New" : sReqTyp == "R" ? "Repeat" : null
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
        } else if (inputId === "tech") {
          inputKey = "techTitle";
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
            that.oBusyIndicator.setVisible(false);
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
          else if (inputId == "cadNo") {
            var oModel = that.getView().getModel("MUserModel");
            var aData = oModel.getData();
            aData.value = [];
            for (var i = 0; i < response.data.value.length; i++) {
              aData.value.push(response.data.value[i]);
            }
            that.getView().setModel(oModel, "MUserModel");
            oModel.setData(response.data.value);

            oModel.setData(aData);
            oData.rows = aData.value;
          }
          else if (inputId == "tech") {
            var oModel = that.getView().getModel("MUserModel");
            var aData = oModel.getData();
            aData.value = [];
            for (var i = 0; i < response.data.value.length; i++) {
              aData.value.push(response.data.value[i]);
            }
            that.getView().setModel(oModel, "MUserModel");
            oModel.setData(response.data.value);

            oModel.setData(aData);
            oData.rows = aData.value;
          }
          if (inputId == 'buyer') {
            oData.columnHeaders = buyerColoms
          }
          else if (inputId == 'tech') {
            oData.columnHeaders =
              [{ label: "DepartmentName", template: "DepartmentName" },
              { label: "UserRoleCode_RoleCode_RoleConstant", template: "UserRoleCode_RoleCode_RoleConstant" },
              { label: "Username", template: "Username" }
              ];
          }
          else if (inputId == 'cadNo') {
            oData.columnHeaders =
              [{ label: "CrfReqNo", template: "CrfReqNo" },
              { label: "CrfReqUUID", template: "CrfReqUUID   ", visible: false }];
          }

          var oModel = new JSONModel(oData);
          oModel.setData(oData);
          that.getView().setModel(oModel);
          if (inputId == "buyer") {
            oData.columnHeaders.forEach(function (headerText) {
              {
                var headerText2 = that.camelCaseToSpaces(headerText.label);
                oTable.addColumn(new sap.m.Column({
                  header: new sap.m.Text({ text: headerText2 }).addStyleClass("columnHeaderStyle"),
                  template: new sap.m.Text({ text: headerText.template }),
                  visible: true
                }));
              }
            });
          }
          if (inputId == "cadNo") {
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
          if (inputId == "tech") {
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

          if (inputId == "buyer") {
            var aCells = oData.columnHeaders.map(function (propertyName) {
              return new sap.m.Text({ text: "{" + propertyName.label + "}" });
            });
          }
          if (inputId == "cadNo") {
            var aCells = oData.columnHeaders.map(function (propertyName) {
              return new sap.m.Text({ text: "{" + propertyName.label + "}" });
            });
          }
          if (inputId == "tech") {
            var aCells = oData.columnHeaders.map(function (propertyName) {
              return new sap.m.Text({ text: "{" + propertyName.label + "}" });
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
    onValueHelpTech: function () {
      this.onValueHelpRequest("tech");
      this.inputId = "tech";
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
      var sSelectedData = oData.BusinessPartnerName; // Adjust 'field1' to the specific field you need

      // Set the data to the input field

      if (this.inputId == "merchant")
        this.byId("merchant").setValue(sSelectedData);
      else if (this.inputId == "buyer")
        this.byId("cop_buyer").setValue(sSelectedData);
      else if (this.inputId == "cadNo") {
        var sSelectedData = oData.CrfReqNo;
        this.byId("cop_cadNo").setValue(sSelectedData);
        var uuid = oData.CrfReqUUID;
        var oModel = this.getView().getModel("cadSearchModel");
        oModel.setProperty("/cadRequuid", uuid);
      }
      else if (this.inputId == "tech") {
        var sSelectedRoleCode = oData.UserRoleCode_RoleCode_RoleConstant;
        this.byId("cop_tech").setValue(sSelectedRoleCode);
        var uuid = oData.UserID;
        var oModel = this.getView().getModel("cadSearchModel");
        oModel.setProperty("/TechnoUserId_UserID", uuid);
      }

      this._pDynamicDialog.then(function (oDialog) {
        var oTable = that.byId("dynamicTable");

        oTable.removeAllColumns();
        oDialog.close();
      });
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
        var sDynamicFieldName = [];
        sDynamicFieldName = this._getDynamicFieldName(oData);
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
      var oBuyer = this.byId("cop_buyer");
      var ocadNo = this.byId("cop_cadNo");
      var oPDNo = this.byId("cop_pdNo");
      var oTechNo = this.byId("cop_tech");
      var oStatus = this.byId("cop_status");
      var odate = this.byId("cop_date");
      oBuyer.setSelectedKey(null);
      ocadNo.setSelectedKey(null);
      oPDNo.setSelectedKey(null);
      oTechNo.setSelectedKey(null);
      oStatus.setSelectedKey(null);
      odate.setValue(null);
      this.getData();
    },
    onSearch: function () {
      // Get the input field values
      var buyer = this.byId("cop_buyer").getValue();
      var date = this.byId("cop_date").getDateValue();
      var oDateFormat = DateFormat.getDateInstance({ pattern: "yyyy-MM-dd" });
      date = oDateFormat.format(date);
      var status = this.byId("cop_status").getSelectedKey();
      if ((buyer == "" || buyer == null) && (date == "" || date == null) && (status == "" || status == null)) {

        MessageToast.show("Please select a filter criteria.");
        return;
      }
      // Build the filter criteria object dynamically
      if ((buyer != "" && buyer != null) && (date != "" && date != null) && (status != "" && status != null)) { sUrl = `?$filter=BuyerName eq '${buyer}' and CrfReqDate eq ${date} and CrfStatus eq '${status}'`; }

      else if ((buyer != "" && buyer != null) && (date == "" || date == null) && (status == "" || status == null)) {
        sUrl = `?$filter=BuyerName eq '${buyer}'`;
      }
      else if ((buyer == "" || buyer == null) && (date != "" && date != null) && (status == "" || status == null)) {
        sUrl = `?$filter=CrfReqDate eq ${date}`;
      }
      else if ((buyer != "" && buyer != null) && (date != "" && date != null) && (status == "" || status == null)) {
        sUrl = `?$filter=BuyerName eq '${buyer}' and CrfReqDate eq ${date}`;
      }
      else if ((buyer != "" && buyer != null) && (date == "" || date == null) && (status != "" && status != null)) {
        sUrl = `?$filter=BuyerName eq '${buyer}' and CrfStatus eq '${status}'`;
      }
      else if ((buyer == "" || buyer == null) && (date != "" && date != null) && (status != "" && status != null)) {
        sUrl = `?$filter=CrfReqDate eq ${date} and CrfStatus eq '${status}'`;
      }
      else if ((buyer == "" || buyer == null) && (date == "" || date == null) && (status != "" && status != null)) {
        sUrl = `?$filter=CrfStatus eq '${status}'`;
      }
      //var sUrl = `?$filter=BuyerName eq '${buyer}' and CrfReqDate eq '${date}' and CrfStatus eq '${status}'`;
      // Fetch data with the constructed filter criteria
      this.fetchFilteredData(sUrl);
      //  this.getBuyer();

    },
    _getDynamicFieldName: function (oData) {
      return oData?.columnHeaders?.map(v => v.label)
    },

    getCOPListData: function () {
      const body = { guid: userId };
      WebService.getCOPCostingAPI(body)
        .then((response) => {
          const { code, data } = response || {};
          const { value = [] } = data || {};
          if (code !== 200) return;
          const oModel = this.getView().getModel("copRequestModel");
          oModel.setData({ COPData: value });
        })
        .catch((error) => {
          console.error('Error fetching COP data:', error);
        });
    }
  })
});
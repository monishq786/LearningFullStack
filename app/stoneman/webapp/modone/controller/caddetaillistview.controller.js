sap.ui.define([
    "core/generic/genericlistview"
],
    function (genericlistview) {
        "use strict";
         let role;
         let loginInfo;
        return genericlistview.extend("moduleonecontroller.caddetaillistview", {

            onInit: function () {
                genericlistview.prototype.onInit.apply(this, arguments);
            },

            onBeforeShow: function (oEvent) {
                // this.validateAccess();
                this.initialize();
            },

            initialize: async function () {
                this.setPageId("caddetaillv");
                this.setFormTitle("CAD Detail Form");
                this.setFormSubTitle("Search Result");
                loginInfo=this.getLoginInfo();
                role=this.getRoleDetails();
                let body = {
                    guid: loginInfo.UserID,
                    CADDETAILNO: 0,
                    CRFSTATUS: null,
                    BUYERCODE: null,
                    CRFREQDATE: null,
                    Techno_Guid: null
                    // Techno: null
                };
                this.setListViewDataSourceProperties("POST","/odata/v4/stoneman-crf/MyCADDetailDocuments",body,"value");
                // this.setListViewDataSourceURL("/odata/v4/stoneman-crf/MyCADDetailDocuments");
                // this.setListViewDataSourceURLType("POST");
                // this.setListViewDataSourceURLReqData(body);
                // this.setListViewDataSourceURLType("GET");
                // this.setListViewDataSourceURL("/odata/v4/stoneman-crf/TCostingHeader"); 
                //await this.createNewModelUsingAPI("POST","/odata/v4/stoneman-crf/MyCADDetailDocuments",body,this.getListViewDataSourceModelName());
                // this.setListViewDisplayColumns(["caddetailno", "cadReqNo", "reqType", "inputTypeSearch", "createdBy", "buyerName","status","Edit"]);
                // this.setListViewDataColumns(["CadDetailNo", "CrfReqNo", "ReqTyp", "InputType", "createdBy", "BuyerName","CrfStatus","Edit"]);
                this.setListViewDisplayColumns(["caddetailno", "cadReqNo", "reqType", "inputTypeSearch", "createdBy", "buyerName", "status", "Edit"]);
                this.setListViewDataColumns(["CADDETAILNO", "CRFREQNO", "REQTYP", "INPUTTYPE", "USERNAME", "BUYERNAME", "CRFSTATUS", "Edit"]);

                this.setListViewFilterColumn("caddetaillvInpBuyer", "Buyer Name", "Cfl", "eq", "String", "BUYERCODE", "cflForBuyer");
             //   this.setListViewFilterColumn("caddetaillvInpMerchant", "Merchant Name", "Cfl", "eq", "String", "MerchantName", "cflForMerchant");

              //  this.setListViewFilterColumn("caddetaillvInpPDNo", "PD No", "Cfl", "eq", "String", "PDNo", "cflForPDNO");
                this.setListViewFilterColumn("caddetaillvInpTech", "Technologist", "Cfl", "eq", "String", "Techno_Guid", "cflForTech");

                this.setListViewFilterColumn("caddetaillvInpCadDetailNo", "CAD Detail No.", "Cfl", "eq", "Int", "CADDETAILNO", "cflForCADDetailNo");
                this.setListViewFilterColumn("caddetaillvDate", "Created Date", "DatePicker", "eq", "Date", "CRFREQDATE", "dataPickerForDate");
                this.setListViewFilterColumn("caddetaillvSelCrfStatus", "Status", "Select", "eq", "String", "CRFSTATUS", "selectForStatus");

                //this.setListViewFilterColumn("coplvSelect", "Status", "Select", "eq", "String", "CrfStatus","selectForStatus");
                this.setListViewEditProperty("CADDETAILUUID");

                var sampleData = {
                    value: [
                        { key: "", text: "Select" },
                        { key: "New", text: "New" },
                        { key: "WIP", text: "In Progress" },
                        { key: "CLS", text: "Closed" },
                        { key: "C", text: "Cancelled" }
                    ]
                };
                this.createNewModelUsingArray("statusModel", sampleData);

                this.setForwardRoute("RouterNameCADDetailEntryForm_new");
                this.setBackwardRoute("RouteLanding");
               await this.showListView("caddetaillv");
                this.populateSelect("caddetaillvSelCrfStatus", "statusModel", "value", "key", "text");
                 let   oTable = this.getListViewTable();
                const headerToolbar = oTable.getHeaderToolbar();
                const aContent = headerToolbar.getContent(); 
                if (role['RoleCode'] === 'DTP_HEAD') {
                    aContent.forEach(function (oControl) {
                      if (oControl.isA('sap.m.Button') && oControl.getText() === 'Add New') {
                        oControl.setVisible(false); // Hide the button
                      }
                    });
                }
            },

            cflForMerchant: async function () {

            },

            cflForPDNO: async function () {

            },

            cflForBuyer: async function () {
                //this.createNewModelUsingArray("pg1lvmyCflModel",sampleData);
                this.setCflTitle("Buyer List");
                await this.createNewModelUsingAPI("GET", "/sap/opu/odata/sap/API_BUSINESS_PARTNER/A_BusinessPartner", "", this.getCflListViewDataSourceModelName());
                this.setCflDisplayColumns(["BusinessPartner", "Customer", "Supplier", "BusinessPartnerName"]);
                this.setCflDataColumns(["BusinessPartner", "Customer", "Supplier", "BusinessPartnerName"]);
                this.setCflValueAndDisplay("", "", "caddetaillvInpBuyer", "BusinessPartnerName","BusinessPartner");
                this.setCflSearchProperty("BusinessPartnerName");
                this.showCfl("caddetaillvInpBuyer", this.getCflListViewDataSourceModelName(), "d/results", this.onClosecflForBuyer.bind(this));
            },

            cflForTech: async function () {
                //this.createNewModelUsingArray("pg1lvmyCflModel",sampleData);
                this.setCflTitle("Tech List");
                await this.createNewModelUsingAPI("GET", "/odata/v4/stoneman-crf/MUser?$expand=UserRoleCode&$filter=UserRoleCode_RoleCode_RoleConstant eq 'TECHNOLOGIST'", "", this.getCflListViewDataSourceModelName());
                this.setCflDisplayColumns(["DepartmentName", "UserRoleCode_RoleCode_RoleConstant", "Username"]);
                this.setCflDataColumns(["DepartmentName", "UserRoleCode_RoleCode_RoleConstant", "Username"]);
                this.setCflValueAndDisplay("", "", "caddetaillvInpTech", "Username","UserID");
                this.setCflSearchProperty("Username");
                this.showCfl("caddetaillvInpTech", this.getCflListViewDataSourceModelName(), "value", this.onClosecflForTech.bind(this));
            },

            onClosecflForBuyer: function () {
                let x = this.getCflObject();
                let y = this.getView().getModel(this.getListViewDataSourceModelName());
                y.setProperty("/BuyerCode",x.BusinessPartner);
               
           
            },
            onClosecflForCADDetailNo: function () {
                let x = this.getCflObject();
            },
            onClosecflForTech: function () {
                let x = this.getCflObject();
            },
            cflForCADDetailNo: async function () {
                this.setCflTitle("CAD Detail No List");
                await this.createNewModelUsingAPI("GET", "/odata/v4/stoneman-crf/TCadDetail?$orderby=CadDetailNo desc", "", this.getCflListViewDataSourceModelName());
                this.setCflDisplayColumns(["CadDetailNo", "CadDetailUUID"]);
                this.setCflDataColumns(["CadDetailNo", "CadDetailUUID"]);
                this.setCflValueAndDisplay("", "", "caddetaillvInpCadDetailNo", "CadDetailNo");
                this.setCflSearchProperty("CadDetailNo");
                this.showCfl("caddetaillvInpCadDetailNo", this.getCflListViewDataSourceModelName(), "value", this.onClosecflForCADDetailNo.bind(this));
            },
            dataPickerForDate: function () {

            },
            selectForStatus: function () {

            }
        })
    }
);
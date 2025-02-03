sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "../service/WebService",
  "sap/ui/core/UIComponent",
],
  function (Controller, JSONModel, WebService,UIComponent) {
    "use strict";
    var that;
    var getGUID;

    return Controller.extend("stoneman.controller.Print", {

      onRouteMatched: function (oEvent) {
        var lstorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
        var loginInfo = lstorage.get('role_details');
        var login = lstorage.get('login_info');
        this.myName = login && login['Username'] ? login['Username'] : "";
        var oViewModel = new JSONModel({ myName: this.myName });
        this.getView().setModel(oViewModel, "view");
        var sData = decodeURIComponent(oEvent.getParameter("arguments").data);
        this.screenType = decodeURIComponent(oEvent.getParameter("arguments").type);
        this.getGUID = sData;
        this.getPrintViewData(this.getGUID);
      },
      onInit: function () {
       // this._initializeViewModel();
        //this.getViewData(this.getGUID);
        that = this;
        var oRouter = UIComponent.getRouterFor(this);
        oRouter.getRoute("RouterNamePrintForm").attachMatched(this.onRouteMatched, this)
        var oPath = jQuery.sap.getModulePath(
          "stoneman",
          "/model/CADRequestAddView.json"
        );

        var oModel = new sap.ui.model.json.JSONModel(oPath);

        this.getView().setModel(oModel, "cadRequestModel_New");

        // var oModel = new sap.ui.model.odata.v2.ODataModel("/path/to/service");
        // this.getView().setModel(oModel, "cadRequestModel_New");

        //var oModel = new sap.ui.model.json.JSONModel(oPath);
        //this.getView().setModel(oModel, "cadRequestModel_New");
        var oPath9 = jQuery.sap.getModulePath(
          "stoneman",
          "/model/CADRequestCrf.json",
        );
       // that.getViewData();

      },


      //   _initializeViewModel: function () {
      //     var oPath = jQuery.sap.getModulePath("stoneman", "/model/CADRequestAddView.json");
      //     if (oPath) {  // Check if oPath is defined
      //         var oModel = new JSONModel(oPath);
      //         this.getView().setModel(oModel, "cadRequestModel_New");
      //     } else {
      //         console.error("Module path could not be retrieved.");
      //     }
      // },

      getPrintViewData: function (guid) {
        var oPath = jQuery.sap.getModulePath(
          "stoneman",
          "/model/CADRequestAddView.json",
        );
        var oModel = new sap.ui.model.json.JSONModel(oPath);
        this.getView().setModel(oModel, "cadRequestModel_New");

        WebService.getViewDataAPI(guid).then(function (response) {
          if (response.code == 200) {
            var oModel = that.getView().getModel("cadRequestModel_New");
            var aData = oModel.getData();
            response.data.InspDraw.forEach(function (item, index = 0) {
              item.srNo = index + 1;
            })
            response.data.Material.forEach(function (item, index = 0) {
              item.srNo = index + 1;
            })
            aData = response.data;
            // buyerCode = aData.BuyerCode;
            // stageId = aData.CrfStage_StageID;
            oModel.setData(aData);
            that.getView().setModel(oModel, "cadRequestModel_New");
            that.getAllExpendData(aData)
          }
          
        });
      },
      getAllExpendData: function (aData) {
        var oModel = this.getView().getModel("cadRequestModel_New");
        var oData = oModel.getData();
        oModel.setProperty("/MerchantHead", aData.MerTeamHead.Username);
        oModel.setProperty("/MerchantTL", aData.MerTL.Username);
        oModel.setProperty("/MerchantATL", aData.MerATL.Username);
        oModel.setProperty("/technouser", aData.TechnoUserId.Username);
        oModel.setProperty("/qualityTL", aData.QualityTLUserId.Username);
        oModel.setProperty("/qualityATL", aData.QualityATLUserId.Username);
        oModel.setProperty("/PDCoordinator", aData.PDCUserId.Username);
        oModel.setProperty("/StageCode_StageConstant", aData.CrfStageCode_StageCode_StageConstant);
        oData.UserAssign.forEach(function (item) {
          if (item.UserID != null) {
            item.pddrraUser = item.UserID.Username;
          }
        })
        oData.SeekAdvice.forEach(function (item) {
          if (item.UserID != null) {
            item.userName = item.UserID.Username;
            item.roleName = item.RoleCode.RoleName;
          }
        })
        oData.InspDraw.forEach(function (item) {
          if (item.DraftUserID != null) {
            item.AssignProd = item.DraftUserID.Username;
          }
        })
        oModel.setData(oData);
        that.getView().setModel(oModel, "cadRequestModel_New");
      },
      getCurrentDate: function () {
        var oDateFormat = DateFormat.getDateInstance({ pattern: "yyyy-MM-dd" });
        oDatePicker = this.byId("mercReqDate");
        oDatePicker.setValue(oDateFormat.format(oCurrentDate));
      },



    });




  });
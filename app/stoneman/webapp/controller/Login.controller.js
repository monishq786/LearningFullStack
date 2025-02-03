sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "../service/WebService",
    "sap/ui/core/Component"
  ],
  function (Controller, MessageToast, WebService, Component) {
    "use strict";
    var objGlobalThis;

    return Controller.extend("stoneman.controller.Login", {
      onInit: function () {
        sap.ui.getCore().getEventBus().subscribe("Logout", "rowSelectEvent", this.onLogOut, this);
        // if (sap.ushell.Container.getRenderer("fiori2")) {
        //   sap.ushell.Container.getRenderer("fiori2").setHeaderVisibility(false, true);
        // }
        objGlobalThis = this;

        this.setModel();
      },

      setModel: function () {
        var sPathHList = jQuery.sap.getModulePath(
          "stoneman",
          "/model/user.json"
        );
        var uModel = new sap.ui.model.json.JSONModel(sPathHList);
        objGlobalThis.getView().setModel(uModel, "userListModel");
      },
      onExit: function () {
        sap.ui.getCore().getEventBus().unsubscribe("Logout", "rowSelectEvent", this.onLogOut, this);
      },
      onLogOut: function (event) {
        this.byId('usernameId').setValue(null);
        this.byId('passwordId').setValue(null);
      },
      getRouter: function () {
        return sap.ui.core.UIComponent.getRouterFor(this);
      },
      validateFields: function () {
        var isValid = true;
        var uModel = this.getView().getModel('userListModel');
        var uData = uModel.getData();
        uData.displayname = this.byId('usernameId').getValue();
        uModel.setData(uData);
        this.getView().setModel(uModel, "userListModel");

        if (this.byId('usernameId').getValue() == undefined || this.byId('usernameId').getValue() == "") {
          isValid = false;
          MessageToast.show('Please enter username');
        } else if (this.byId('passwordId').getValue() == undefined || this.byId('passwordId').getValue() == "") {
          isValid = false;
          MessageToast.show('Please enter password');
        } else {
          var oEmailInput = this.byId("usernameId");
          if (oEmailInput.getValueState() === "Error") {
            isValid = false;
            MessageToast.show("Please enter a valid email address.");
          }
        }
        return isValid;
      },
      onEmailChange: function (oEvent) {
        var oInput = oEvent.getSource();
        var sEmail = oInput.getValue();

        // Regular expression for validating an email
        var emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (!emailRegex.test(sEmail)) {
          oInput.setValueState("Error");
          oInput.setValueStateText("Please enter a valid email address.");
        } else {
          oInput.setValueState("None");  // Clear the error state
        }
      },
      onPressLogin: function () {
        if (this.validateFields()) {
          this.PostLoginDetail(objGlobalThis.byId('usernameId').getValue(), objGlobalThis.byId('passwordId').getValue());
        }
      },
      PostLoginDetail: function (username, password) {
        WebService.callLoginAPI(username, password).then(function (response) {
          if (response.code == 200 || response.code == 201) {

            if (response.data['value'].length > 0) {
              var lstorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
              lstorage.put('login_info', response.data['value'][0]);
              var dict = {
                "RoleCode": response.data.value[0].UserRoleCode.RoleCode_RoleConstant,
                "RoleName": response.data.value[0].UserRoleCode.RoleName,
                "UserID": response.data.value[0].UserID
              }
              lstorage.put('role_details', dict);

              //as per new framework below two lines
              //  objGlobalThis.setLoginUserDetails("1","Ali");
              objGlobalThis.setSecurityDetails("saljsad9721i", "jsaiudt87e627dhq");
              //
              objGlobalThis.getRouter().navTo("RouteNameLanding");
            } else {
              MessageToast.show('Invalid Credentials');
            }
          }
        });
      },

      setSecurityDetails: function (sSessionId, sAccessToken) {
        let oModel;

        oModel = this.getView().getModel("sysModel");
        //alert(JSON.stringify(oModel));
        oModel.setProperty("/security/sessionId", sSessionId);
        oModel.setProperty("/security/accessToken", sAccessToken);

        this.getView().setModel(oModel, "sysModel");

      },
    });
  }
)
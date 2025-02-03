sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Core",
    "../model/Constants",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "sap/ui/core/UIComponent",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",
  ],
  function (Controller, Core, Constants, JSONModel, History, UIComponent, Fragment,MessageToast) {
    "use strict";
    var that = this;
    var loginInfo;
    var roleInfo;
    return Controller.extend("stoneman.controller.Landing", {
      onInit: function () {
        // if (sap.ushell.Container.getRenderer("fiori2")) {
        //   sap.ushell.Container.getRenderer("fiori2").setHeaderVisibility(false, true);
        // }
        var oPath = jQuery.sap.getModulePath(
          "stoneman",
          "/model/notifications.json"
        );
        var oModel = new sap.ui.model.json.JSONModel(oPath);
        this.getView().setModel(oModel, "notificationsModel");
        var oRouter = UIComponent.getRouterFor(this);
        oRouter.getRoute("RouteNameLanding").attachMatched(this.onRouteMatched, this);
      },
      onRouteMatched: function () {
        var lstorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
        roleInfo = lstorage.get('role_details');
        loginInfo = lstorage.get('login_info');

        this.myName = loginInfo['Username'];
        var oViewModel = new JSONModel({ myName: this.myName });
        this.getView().setModel(oViewModel, "view");
      },
      getRouter: function () {
        return sap.ui.core.UIComponent.getRouterFor(this);
      },
      onPressTileTimeAndAction: function () {
        console.log("FROM LANDING SCREEN");
        this.getRouter().navTo("RouteNameSearchTimeAndAction");
      },
      onPressCADRequestFormAction: function () {
        this.getRouter().navTo("RouterNameCADSearchForm");
      },

      onPressCADDetailFormAction: function () {
        this.getRouter().navTo("RouterNameCADDetailSearchForm");
      },
      onPressCADDetailListView: function () {
        this.getRouter().navTo("RouterNameCADDetailListView_new");
      },
      onPressUserListView: function () {
        this.getRouter().navTo("RouterNameUserListView");
      },

      onPressCOPPagerFormAction: function () {
        this.getRouter().navTo("RouterNameCOPSearchForm");
      },
      onPressConfig: function () {
        this.getRouter().navTo("RouterNameConfigurationForm");
      },
      onPressLogout: function () {
        var oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
        oStorage.put(null);

        sap.ui.getCore().getEventBus().publish("Logout", "rowSelectEvent", '');
        const oRouter = this.getOwnerComponent().getRouter();
        oRouter.navTo("RouteNameLogin", {}, true);
      },

      handlePopoverPress: function (oEvent) {
        var oButton = oEvent.getSource(),
          oView = this.getView();

        // create popover
        if (!this._pPopover) {
          this._pPopover = Fragment.load({
            id: oView.getId(),
            name: "stoneman.view.Notification", // Ensure this path is correct
            controller: this // Ensure the controller reference is correctly set
          }).then(function (oPopover) {
            oView.addDependent(oPopover);
            return oPopover;
          });
        }
        this._pPopover.then(function (oPopover) {
          oPopover.openBy(oButton);
        });
      },

      onPressNewTimeAndActionListView:function(){
        const oRouter = this.getOwnerComponent().getRouter();
        oRouter.navTo("RouteTimeAndActionListView");
      },
     
      onListItemPress: function (oEvent) {
        MessageToast.show("Item Pressed: " + oEvent.getSource().getTitle());
      },

      onItemClose: function (oEvent) {
        var oItem = oEvent.getSource(),
          oList = oItem.getParent();

        oList.removeItem(oItem);
        MessageToast.show("Item Closed: " + oItem.getTitle());
      },

      onRejectPress: function () {
        MessageToast.show("Reject Button Pressed");
      },

      onAcceptPress: function () {
        MessageToast.show("Accept Button Pressed");
      },

      onAcceptErrors: function (oEvent) {
        var oMessageStrip = new MessageStrip({
          type: MessageType.Error,
          showIcon: true,
          showCloseButton: true,
          text: "Error: Something went wrong.",
          link: new Link({
            text: "SAP CE",
            href: "http://www.sap.com/",
            target: "_blank"
          })
        });

        var oNotificationListGroup = oEvent.getSource().getParent().getParent();
        var aNotifications = oNotificationListGroup.getItems();

        aNotifications.forEach(function (oNotification) {
          oNotification.removeAllAggregation("processingMessage");
        });

        var iErrorIndex = Math.floor(Math.random() * 3);
        aNotifications[iErrorIndex].setProcessingMessage(oMessageStrip);
      },
      onPressCOPPagerFormActionNew:function(){
        this.getRouter().navTo("RouterNameCOPListViewNew");
      },
      onPressCADRequestFormActionNew:function(){
        console.log("gghjgjgj");
        this.getRouter().navTo("RouteCadRequestListView");
      }

    });
  }
)
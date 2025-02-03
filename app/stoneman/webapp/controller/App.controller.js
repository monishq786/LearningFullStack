sap.ui.define(['core/generic/genericentryform', 'stoneman/modone/model/JSONLoader'], function (genericentryform, JSONLoader) {
  'use strict';

  return genericentryform.extend('stoneman.controller.App', {
    onInit: function () {
      this._loadSysModel();
      let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
      oRouter.attachRouteMatched(this.onRouteMatched, this);
      this.loadStaticDropdownModel();
    },

    _loadSysModel: function () {
      let oModel = new sap.ui.model.json.JSONModel();
      oModel.loadData('model/sysmodel.json');
      this.getView().setModel(oModel, 'sysModel');
    },

    _subscribeToEventBus: function () {
      let oEventBus = sap.ui.getCore().getEventBus();
      const subscriptions = [
        { channel: 'ToolPage', event: 'Press', handler: this.setToolPageReference },
        { channel: 'Notification', event: 'Press', handler: this.setNotificationReference },
        { channel: 'Avatar', event: 'Press', handler: this.setAvatarReference }
      ];

      subscriptions.forEach((sub) => {
        oEventBus.subscribe(sub.channel, sub.event, sub.handler, this);
      });
    },

    setToolPageReference: function (channelId, eventId, data) {
      this._oToolPage = data.toolPage;
    },

    onMenuButtonPress: function () {
      const viewModel = this.getView().getModel('shellBarModel');
      const { sideExpanded } = viewModel.getData();
      viewModel.setProperty(`/sideExpanded`, !sideExpanded);
    },

    setNotificationReference: function (channelId, eventId, data) {
      this._oNotificationDialog = data.notificationDialog;
    },

    onNotificationsPress: function () {
      this._oNotificationDialog?.open();
    },

    setAvatarReference: function (channelId, eventId, data) {
      this._oAvatarMenu = data.avatarMenu;
    },

    onAvatarPress: function (oEvent) {
      this.handleLogOut();
    },

    getUserModel: function () {
      const loginInfo = this.getLoginInfo();
      const oModel = new sap.ui.model.json.JSONModel({
        username: loginInfo?.Username
      });
      this.getView().setModel(oModel, 'userModel');
    },
    //loadStaticDropdownModel: function () {
    //  var oViewModel = new sap.ui.model.json.JSONModel({ menu: false, notification: false, logout: false, sideExpanded: false });
    //  this.getView().setModel(oViewModel, 'shellBarModel');
    //},

    // loadStaticDropdownModel: function () {
    //   try {
    //     Promise.resolve().then(() => {
    //       var oViewModel = new sap.ui.model.json.JSONModel({
    //         menu: false,
    //         notification: false,
    //         logout: false,
    //         sideExpanded: false
    //       });
    //       this.getView().setModel(oViewModel, 'shellBarModel');
    //     });
    //   } catch (error) {
    //     console.log('loadStaticDropdownModel Error :', error);
    //   }

    // },

    loadStaticDropdownModel: function () {
      try {
        const oViewModel = new sap.ui.model.json.JSONModel({
          menu: false,
          notification: false,
          logout: false,
          sideExpanded: false,
          badge:"2"
        });
        this.getView().setModel(oViewModel, 'shellBarModel');
        console.log("Static Dropdown Model initialized:", oViewModel.getData());
      } catch (error) {
        console.error("Error initializing dropdown model:", error);
      }
    },


    onRouteMatched: function (oEvent) {
      try {
        this.getUserModel();
        const sRouteName = oEvent.getParameter('name');
        const sHash = window.location.hash;
        console.log({ sHash, sRouteName });
        if (sRouteName === 'RouteLogin') {
          this.handleRouteLoginMenu();
        } else if (sRouteName === 'RouteLanding') {
          this.handleRouteLandingMenu();
        } else {
          this.handleNotificationAndLogout();
        }

        //const viewModel = this.getView().getModel('shellBarModel');
        // console.log('Model menu:', viewModel.getProperty('/menu'));
        // console.log('Model notification:', viewModel.getProperty('/notification'));
        // console.log('Model logout:', viewModel.getProperty('/logout'));
      } catch (error) {
        console.log('onRouteMatched Error :', error);
      }
    },

    handleRouteLoginMenu: function () {
      try {
        const viewModel = this.getView().getModel('shellBarModel');
        viewModel.setProperty(`/menu`, false);
        viewModel.setProperty(`/notification`, false);
        viewModel.setProperty(`/logout`, false);
        viewModel.setProperty(`/badge`,"0");
        viewModel.refresh();
      } catch (error) {
        console.log('handleRouteLoginMenu Error :', error);
      }
    },


    getNotificationCount: async function () {
      let loginInfo = this.getLoginInfo();
      let userid = loginInfo.UserID;
      let beforeModelName = 'BeforeNotificationModel';
      await this.createNewModelUsingAPI(
        'GET',
        `/odata/v4/stoneman-crf/TNotification?$filter=User_UserGuid eq ${userid} and Clear eq false`,
        '',
        beforeModelName
      );
    },
    handleRouteLandingMenu: async function () {
      await this.getNotificationCount();
      let oData = this.getView().getModel("BeforeNotificationModel").getData();
      let filterData = [];
      if (oData !== undefined) {
        filterData = oData.value.filter(function (result) {
          return result.Read === true;
        });
      }
      
      try {
        let viewModel = this.getView().getModel('shellBarModel');
        viewModel.setProperty('/menu', true);
        viewModel.setProperty('/notification', true);
        viewModel.setProperty('/logout', true);
        viewModel.setProperty(`/badge`,"0");
        viewModel.refresh();
      } catch (error) {
        console.log('handleRouteLandingMenu Error :', error);
      }
    },

    handleNotificationAndLogout: function () {
      try {
        const viewModel = this.getView().getModel('shellBarModel');
        viewModel.setProperty(`/menu`, false);
        viewModel.setProperty(`/notification`, true);
        viewModel.setProperty(`/logout`, true);
        viewModel.setProperty(`/badge`,"0");
        viewModel.refresh();
      } catch (error) {
        console.log('handleNotificationAndLogout Error :', error);
      }
    }
  });
});

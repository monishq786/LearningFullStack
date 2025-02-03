sap.ui.define(['core/generic/genericentryform', 'sap/ui/model/json/JSONModel'], function (genericentryform, JSONModel) {
  'use strict';
  return genericentryform.extend('landingcontroller.landing', {
    onInit: function () {
      genericentryform.prototype.onInit.apply(this, arguments);

      // let oEventBus = sap.ui.getCore().getEventBus();
      // oEventBus.publish('ToolPage', 'Press', { toolPage: this.byId('toolPage') });
      // oEventBus.publish('Avatar', 'Press', { avatarMenu: this.byId('avatarMenu') });
      // oEventBus.publish('Notification', 'Press', { notificationDialog: this.byId('notificationDialog') });
    },

    initialize: async function () {
      // this.getUserModel();
      await this.getMenuModel();
    },

    onBeforeShow: async function () {
      await this.initialize();
      await this.getNavigationModel();


      console.log(this.getView().getModel("shellBarModel").getData());
    },

    getMenuModel: function () {
      let oMenuModel = new sap.ui.model.json.JSONModel();
      oMenuModel.loadData('model/menuData.json', null, false);
      this.getView().setModel(oMenuModel, 'menuModel');
    },

    onAvatarPress: function (oEvent) {
      this.handleLogOut();
      //let oAvatar = oEvent.getSource();
      //let oMenu = this.getView().byId('avatarMenu');
      //oMenu.openBy(oAvatar);
    },

    getNavigationModel: async function () {
      const role = this.getRoleDetails();
      const roleCode = role?.RoleCode;
      const { RoleGuid } = this.getLoginInfo();
      console.log('RoleGuid    ', RoleGuid);

      await this.createNewModelUsingAPI(
        'GET',
        `/odata/v4/stoneman-crf/MMenuRoleAccess?$expand=Role($filter=DelMark eq 0),Detail($expand=Menu($filter=DelMark eq 0;$expand=ParentMenuGuid))&$filter=Role_RoleGuid eq '` + RoleGuid + `' and DelMark eq '0'`,
        //`/odata/v4/stoneman-crf/MenuRole?$expand=MenuCode,RoleCode&$filter=RoleCode_RoleConstant eq ('${roleCode}') and IsActive eq 'Y'`,
        null,
        'menuresponsemodel'
      );

      const menuResponse = this.getView().getModel('menuresponsemodel');
      const apiModel = menuResponse.oData.value;

      if (!menuResponse) {
        console.error('Menu model not found');
        return;
      }

      const data = this.transformMenuData(apiModel);
      this.createNewModelUsingArray('navigationModel', data);
    },

    transformMenuData2: function (data) {
      const sections = {};
      data.forEach((item) => {
        const menu = item.MenuCode;
        if (menu) {
          const parentKey = menu?.ParentMenuCode?.toLowerCase();
          if (!sections[parentKey]) {
            sections[parentKey] = {
              key: parentKey,
              title: menu.ParentMenuCode,
              icon: parentKey === 'configuration' ? 'sap-icon://customize' : 'sap-icon://form',
              child: []
            };
          }

          sections[parentKey].child.push({
            key: menu.MenuCode.trim().toLowerCase(),
            title: menu.MenuName,
            menuIcon: menu.MenuIcon || null,
            menuPath: menu.MenuPath,
            OrderBy: menu.OrderBy,
            Add: item.Add,
            Update: item.Update,
            View: item.View
          });
        }
      });
      Object.keys(sections).forEach((key) => {
        sections[key].child.sort((a, b) => a.OrderBy - b.OrderBy); // Ascending order
        //sections[key].child.sort((a, b) => b.OrderBy - a.OrderBy); // descending order:
      });
      return { sections: Object.values(sections) };
    },

    transformMenuData: function (data) {
      const sections = {};
      data.forEach((item) => {
        if (item.Detail && Array.isArray(item.Detail)) {
          item.Detail.forEach((detail) => {
            const menu = detail.Menu;
            const parentMenu = menu?.ParentMenuGuid;

            if (menu && parentMenu) {
              const parentKey = parentMenu.Description.trim().toLowerCase();
              if (!sections[parentKey]) {
                sections[parentKey] = {
                  key: parentKey,
                  title: parentMenu.Description.trim(),
                  icon: parentKey === 'configuration' ? 'sap-icon://customize' : 'sap-icon://form',
                  child: []
                };
              }

              sections[parentKey].child.push({
                key: menu.MenuCode.trim().toLowerCase(),
                title: menu.Description.trim(),
                menuIcon: menu.MenuIcon || null,
                menuPath: menu.MenuPath,
                OrderBy: parseFloat(menu.OrderBy) || 0,
                Add: detail.Add,
                Update: detail.Update,
                View: detail.View
              });
            }
          });
        }
      });

      // Sort the child items by OrderBy
      Object.keys(sections).forEach((key) => {
        sections[key].child.sort((a, b) => a.OrderBy - b.OrderBy); // Ascending order
      });

      return { sections: Object.values(sections) };
    },


    onMenuButtonPress: function () {
      const toolPage = this.byId('toolPage');
      toolPage.setSideExpanded(!toolPage.getSideExpanded());
    },

    onMenuItemSelect: function (oEvent) {
      const oSelectedItem = oEvent.getParameter('item');
      const sText = oSelectedItem.getText();
      const sKey = oSelectedItem.getKey();

      switch (sText) {
        case 'Logout':
          this._handleLogout();
          break;
        case 'Profile':
          this._showProfile();
          break;
        default:
          sap.m.MessageToast.show('No action for this item');
      }
    },

    _handleLogout: function () {
      sap.m.MessageToast.show('Logging out...');
      this.deleteRoleDetails();
      this.deleteLoginInfo();
      this.deleteSecurityDetails();
      this.deleteLoginUserDetails();
      // this.clearUserModel();

      sap.ui.getCore().getEventBus().publish('Logout', 'rowSelectEvent', '');
      this.router.navTo('RouteLogin');
    },

    _showProfile: function () {
      sap.m.MessageToast.show('Opening profile...');
    },

    onNavItemSelect: function (oEvent) {
      const oSelectedItem = oEvent.getParameter('item');
      const sKey = oSelectedItem.getKey();
      const sText = oSelectedItem.getText();
      const oModel = this.getView().getModel('navigationModel').getData();
      if (!oModel) {
        console.error('Navigation model not found');
        return;
      }
      const aSections = oModel.sections;
      if (sKey.includes('tile')) {
        aSections.forEach(
          function (section) {
            section.child.forEach(
              function (child) {
                if (sKey.includes(child.key) && child.menuPath) {
                  this.router.navTo(child.menuPath);
                }
              }.bind(this)
            );
          }.bind(this)
        );
      }
    },

    // onNotificationsPress: function () {
    //   this.byId('notificationDialog').open();
    // },

    onNotificationsPress: function () {
      this.showNotification();
    },

    onDialogClose: function () {
      this.byId('notificationDialog').close();
    },

    callTnAautomationAPI: async function () {
      await this.createNewModelUsingAPI(
        'POST',
        `/odata/v4/automation/TimeActionAutomation`,
        '{"TaskType": "TimeActionAutomation"}',
        'timeandactionautomation'
      );
    },

    onTilePress: function (oEvent) {
      const oSource = oEvent.getSource();
      const sTitle = oSource.getHeader();

      if (sTitle === 'T&A Auto Sync') {
        this.callTnAautomationAPI();
      } else {
        const oModel = this.getView().getModel('navigationModel').getData();
        if (!oModel) {
          console.error('Navigation model not found');
          return;
        }
        let aMenu = oModel.sections;

        aMenu.forEach(
          function (item) {
            if (item.child && item.child.length > 0) {
              item.child.forEach(
                function (child) {
                  if (child.title === sTitle) {
                    let sChildPath = child.menuPath;
                    const oViewModel = new sap.ui.model.json.JSONModel(child);
                    this.getOwnerComponent().setModel(oViewModel, 'configuralModel');
                    this.router.navTo(sChildPath);
                  }
                }.bind(this)
              );
            }
          }.bind(this)
        );
      }
    },

    _scrollToSection: function (sKey) {
      const oObjectPageLayout = this.byId('ObjectPageLayout');
      const oSection = this.byId(sKey + 'Section');

      if (oSection) {
        oObjectPageLayout.scrollToSection(oSection.getId());
      }
    },

    getNotificationsModel: async function () {
      const loginInfo = this.getLoginInfo();
      const userid = loginInfo.UserID;

      await this.createNewModelUsingAPI(
        'GET',
        `/odata/v4/stoneman-crf/TNotification?$filter=User_UserGuid eq ${userid} and Clear eq false`,
        '',
        'notificationresponsemodel'
      );

      const notificationResponse = this.getView().getModel('notificationresponsemodel');
      if (!notificationResponse) {
        console.error('Notification model not found');
        return;
      }
      const apiResponse = notificationResponse.oData.value;

      const oNotificationsModel = {
        notifications: apiResponse.map((notification) => ({
          NotificationID: notification.NotificationID,
          DateTime: notification.DateTime,
          DateTimeAgo: this.timeAgo(notification.DateTime),
          Task: notification.Task,
          DocumentNo: notification.DocumentNo,
          DocumentGUID: notification.DocumentGUID,
          FormType: notification.FormType,
          Read: notification.Read,
          Status: notification.Status
        }))
      };

      this.createNewModelUsingArray('notificationModel', oNotificationsModel);
    },

    timeAgo: function (date) {
      const now = new Date();
      const notificationDate = new Date(date);
      const diffInSeconds = Math.floor((now - notificationDate) / 1000);

      const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60,
        second: 1
      };

      for (const [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(diffInSeconds / secondsInUnit);
        if (interval >= 1) {
          return `${interval} ${unit}${interval !== 1 ? 's' : ''} ago`;
        }
      }

      return 'just now';
    },

    onNotificationPress: async function (oEvent) {
      let oContext = oEvent.getSource().getBindingContext('notificationModel');
      let sNotificationId = oContext.getProperty('NotificationID');
      let oModel = this.getView().getModel('notificationModel');
      if (!oModel) {
        console.error('Notification model not found');
        return;
      }
      let aNotifications = oModel.getProperty('/notifications');

      let readNotification = aNotifications.find((notification) => notification.NotificationID === sNotificationId);

      if (readNotification && !readNotification.Read) {
        aNotifications.forEach((notification) => {
          if (notification.NotificationID === sNotificationId) {
            notification.Read = true;
            notification.Clear = false;
          }
        });

        oModel.setProperty('/notifications', aNotifications);

        let readNotification = aNotifications.find((notification) => notification.NotificationID === sNotificationId);
        if (readNotification) {
          let oRequestData = {
            NotificationData: [
              {
                NotificationID: sNotificationId,
                Read: true,
                Clear: false
              }
            ]
          };

          await this.onClearNotification(oRequestData);
        }
      }
    },

    onReadNotification: async function (readNotification, sNotificationId) {
      await this.createNewModelUsingAPI(
        'PATCH',
        `/odata/v4/stoneman-crf/TNotification(${sNotificationId})`,
        readNotification,
        'readnotificationresponsemodel'
      );
    },

    onReadAllPress: async function () {
      let oModel = this.getView().getModel('notificationModel');
      if (!oModel) {
        console.error('Notification model not found');
        return;
      }
      let aNotifications = oModel.getProperty('/notifications');

      aNotifications.forEach((notification) => {
        notification.Read = true;
      });

      oModel.setProperty('/notifications', aNotifications);

      const oRequestData = this.getNotificationRequestObj(aNotifications, true, false);

      await this.onClearNotification(oRequestData);
    },

    getNotificationRequestObj: function (aNotifications, isRead, isClear) {
      return {
        NotificationData: aNotifications.map((notification) => ({
          NotificationID: notification?.NotificationID,
          Read: isRead,
          Clear: isClear
        }))
      };
    },

    onClearAllPress: function () {
      let oModel = this.getView().getModel('notificationModel');
      if (!oModel) {
        console.error('Notification model not found');
        return;
      }
      let aNotifications = oModel.getProperty('/notifications');

      const oRequestData = this.getNotificationRequestObj(aNotifications, true, true);
      oModel.setProperty('/notifications', []);

      this.onClearNotification(oRequestData);
      sap.m.MessageToast.show('All notifications have been cleared.');
    },

    onClearNotificationPress: async function (oEvent) {
      let oContext = oEvent.getSource().getBindingContext('notificationModel');
      let sPath = oContext.getPath();
      let oModel = this.getView().getModel('notificationModel');
      if (!oModel) {
        console.error('Notification model not found');
        return;
      }
      let aNotifications = oModel.getProperty('/notifications');
      let iIndex = parseInt(sPath.split('/')[2], 10);

      let notificationId = aNotifications[iIndex].NotificationID;
      aNotifications.splice(iIndex, 1);
      oModel.setProperty('/notifications', aNotifications);

      let oRequestData = this.getNotificationRequestObj(
        [
          {
            NotificationID: notificationId
          }
        ],
        true,
        true
      );

      this.onClearNotification(oRequestData);
      sap.m.MessageToast.show('Notification removed.');
    },

    onClearNotification: async function (oNotificationData) {
      await this.createNewModelUsingAPI(
        'POST',
        `/odata/v4/stoneman-crf/AlterNotificationClear`,
        oNotificationData,
        'alternotificationresponsemodel'
      );
    }
  });
});

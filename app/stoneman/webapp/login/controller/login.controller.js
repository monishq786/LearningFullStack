sap.ui.define(['core/generic/genericentryform', 'sap/ui/core/mvc/Controller'], function (genericentryform) {
  'use strict';

  return genericentryform.extend('logincontroller.login', {
    onInit: function () {
      genericentryform.prototype.onInit.apply(this, arguments);
    },

    onBeforeShow: function (oEvent) {
      this.initialize();
    },

    initialize: function () {
      this.deleteRoleDetails();
      this.deleteLoginInfo();
      this.deleteSecurityDetails();
      this.deleteLoginUserDetails();
      this.clearUserModel();
      let oModelData = {
        username: '',
        password: ''
      };

      this.createNewModelUsingArray(this.getEntryFormDataSourceModelName(), oModelData);
      this.forceHardReload();
    },

    onUsernameChange: function (oEvent) {
      const oModel = this.getEntryFormModel();
      const newUsername = oEvent.getParameter('value');
      oModel.setProperty('/username', newUsername);
    },

    onPasswordChange: function (oEvent) {
      const oModel = this.getEntryFormModel();
      const newPassword = oEvent.getParameter('value');
      oModel.setProperty('/password', newPassword);
    },

    validateFields: function () {
      let isValid = true;

      const oModel = this.getEntryFormModel();
      const username = oModel.getProperty('/username');
      const password = oModel.getProperty('/password');

      if (!username || username.trim() === '') {
        isValid = false;
        sap.m.MessageToast.show('Please enter username');
      } else if (!password || password.trim() === '') {
        isValid = false;
        sap.m.MessageToast.show('Please enter password');
      }

      return isValid;
    },

    onPressLogin: async function () {
      if (this.validateFields()) {
        const oModel = this.getEntryFormModel();

        const username = oModel.getProperty('/username');
        const password = oModel.getProperty('/password');

        await this.createNewModelUsingAPI(
          'GET',
          `/odata/v4/stoneman-crf/MUser?$expand=Role&$filter=EmailId eq '${username}' and Password eq '${password}'`,
          null,
          'loginresponsemodel'
        );

        const loginResponseModel = this.getView().getModel('loginresponsemodel');
        const loginData = loginResponseModel.getData();

        if (loginData && loginData.value && loginData.value.length > 0) {
          const userData = loginData.value[0];
          this.setLoginInfo(
            userData.UserGuid,
            userData.UserName,
            userData.UserCode,
            userData.DepartmentCode,
            userData.DepartmentName,
            userData.DelMark,
            userData.FirstName,
            userData.LastName,
            userData.EmailId,
            undefined,//userData.EmployeeCode,
            userData.Role_RoleGuid//userData.UserGroupID_UserGroupId
          );

          this.setRoleDetails(userData.Role.RoleCode, userData.Role.Description, userData.UserGuid);

          this.setLoginUserDetails(username, password);
          this.setSecurityDetails('saljsad9721i', 'jsaiudt87e627dhq');
          this.router.navTo('RouteLanding');
        } else {
          sap.m.MessageToast.show('Invalid login credentials');
        }
      }
    },

    forceHardReload: function () {
      // Unregister service workers to force hard reload for updates
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(function (registrations) {
          registrations.forEach(function (registration) {
            registration.unregister();
          });
        });
      }

      // Selectively clear cache if necessary (avoid essential UI cache)
      if ('caches' in window) {
        caches.keys().then((cacheNames) => {
          cacheNames.forEach((cacheName) => {
            // Customize to delete only specific caches if needed
            if (cacheName !== 'essential-cache') {
              caches.delete(cacheName);
            }
          });
        });
      }
    }
  });
});

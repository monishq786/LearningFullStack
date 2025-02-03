sap.ui.define(
  [
    'core/generic/genericentryform',
    'sap/m/MessageToast',
    'sap/ui/core/routing/History',
    'sap/m/MessageBox',
    'stoneman/modone/constants/FormMode',
    'sap/ui/model/json/JSONModel'
  ],
  function (genericentryform, MessageToast, History, MessageBox, FormMode, JSONModel) {
    'use strict';
    let irowIndex;
    let _RoleInfo = null;
    return genericentryform.extend('modconfcontroller.userentryform', {
      onInit: async function () {
        genericentryform.prototype.onInit.apply(this, arguments);
        this.getView().getModel(this.getEntryFormDataSourceModelName()).refresh(true);
      },

      onBeforeShow: async function (oEvent) {
        this.identifyFormMode(oEvent);
        this.initialize();
        this.setEntryFormDataSourceURLForEditMode(
          '/odata/v4/stoneman-crf/MUser(' +
          this.getListViewEditPropertyValue() +
          ')?$expand=Buyer,Manager,Role,MaterialCategory,ProductCategory'
        );

        await this.showEntryForm();

        if (this.formMode !== FormMode.CREATE) {
          const backUpViewData = this.getView().getModel(this.getEntryFormDataSourceModelName()).getData();
          backUpViewData['RoleName'] = backUpViewData['Role']['Description'];
          this.getView().getModel(this.getEntryFormDataSourceModelName()).setData(backUpViewData);
          const oBackupModel = new JSONModel(backUpViewData);
          this.getView().setModel(JSON.parse(JSON.stringify(oBackupModel.oData)), 'backup');
        }

        this.setRowMNumber();
      },

      initialize: async function () {
        _RoleInfo = this.getRoleDetails();
        this.formMode = this.getFormMode();
        this.setPageId('useref');
        this.setFormTitle('User Entry Form');
        this.setBackwardRoute('RouterNameUserListView');
        this.setEntryFormDataSourceURLForNewMode('');
        this.setEntryFormDataSourceURLToAddData('/odata/v4/stoneman-crf/MUser');
        this.setEntryFormDataSourceURLToUpdateData('/odata/v4/stoneman-crf/MUser(' + this.getListViewEditPropertyValue() + ')');
        this.setListViewFilterColumn('cadreqlvInpCrfTech', 'Tech', 'Cfl', 'eq', 'String', 'DepartmentName', 'cflForTech');

        const oPathSaveReq = jQuery.sap.getModulePath(
          'stoneman',
          '/modone/model/ConfigurationSaveRequest.json' //Save Request Model
        );
        const oModelSaveRequest = new sap.ui.model.json.JSONModel(oPathSaveReq);
        this.getView().setModel(oModelSaveRequest, 'ConfigurationSaveModel');

        if (this.formMode === '3') {
          const oPath = jQuery.sap.getModulePath('stoneman', '/modone/model/ConfigurationAddView.json');
          const oModel = new sap.ui.model.json.JSONModel(oPath);
          this.getView().setModel(oModel, this.getEntryFormDataSourceModelName());
        }

        await this.ButtonDiable();
      },

      ButtonDiable: async function () {
        const Ourl = `/odata/v4/stoneman-crf/MMenuRoleAccess?$filter=Role_RoleGuid eq '${_RoleInfo.RoleCode}' and DelMark eq 0 &$expand=Role,Detail($expand=Menu)`;
        await this.createNewModelUsingAPI('GET', Ourl, '', 'myModel');
        const myModel = this.getView().getModel('myModel').getData();
        const filteredData = myModel.value.filter((item) => item.MenuCode);
        for (const Data of filteredData) {
          if (Data.Update === false && Data.MenuCode.MenuName === 'User Configuration') {
            const oView = this.getView();
            oView.byId('user_btnSubmit').setEnabled(false);
          }
        }
      },
      onLiveChange: function (oEvent) {
        // Prevent user from typing into the input field
        const oInput = oEvent.getSource();
        oInput.setValue(oInput.getBinding('value').getValue()); // Reset to the bound value
      },
      onCancel: async function () {
        this.router.navTo(this.getBackwardRoute());
      },

      setRowMNumber: function () {
        const oModel = this.getView().getModel(this.getEntryFormDataSourceModelName());
        const aData = oModel.getData();

        //buyer
        aData.Buyer = aData.Buyer.map((item, i) => ({
          ...item,
          RowNumber: i + 1 // Recalculate RowNumber for remaining items
        }));
        oModel.setData(aData);
        oModel.setProperty('/Buyer', aData.Buyer);

        //material category
        aData.MaterialCategory = aData.MaterialCategory.map((item, i) => ({
          ...item,
          RowNumber: i + 1 // Recalculate RowNumber for remaining items
        }));
        oModel.setData(aData);
        oModel.setProperty('/MaterialCategory', aData.MaterialCategory);

        //product category
        aData.ProductCategory = aData.ProductCategory.map((item, i) => ({
          ...item,
          RowNumber: i + 1 // Recalculate RowNumber for remaining items
        }));
        oModel.setData(aData);
        oModel.setProperty('/ProductCategory', aData.ProductCategory);
      },

      onValidateMobileNumber: function (oEvent) {
        const oInput = oEvent.getSource();
        const sValue = oInput.getValue();
        const oRegex = /^[6-9]\d{9}$/; // Example regex for Indian mobile numbers (10 digits, starting with 6-9)

        if (oRegex.test(sValue)) {
          oInput.setValueState('None');
          oInput.setValueStateText(''); // Reset value state text if valid
        } else {
          oInput.setValueState('Error');
          oInput.setValueStateText('Enter a valid 10-digit mobile number starting with 6-9');
        }
      },

      cflForUser: async function () {
        await this.createNewModelUsingAPI(
          'GET',
          '/sap/opu/odata/sap/YY1_WORKFORCEPERSON_CDS/YY1_WorkforcePerson',
          null,
          this.getCflListViewDataSourceModelName()
        );
        this.setCflTitle('User List');
        this.setCflDisplayColumns(['Business Partner', 'Business Partner Full Name', 'BusinessPartnerUUID']);
        this.setCflDataColumns(['BusinessPartner', 'BusinessPartnerFullName', 'BusinessPartnerUUID']);
        this.setCflValueAndDisplay('/UserName', 'BusinessPartnerName', '', '');
        this.setCflSearchProperty('BusinessPartnerName');
        this.showCfl('user', this.getCflListViewDataSourceModelName(), 'd/results', this.onClosecflForUser.bind(this));
      },

      onClosecflForUser: async function () {
        const oUserRes = this.getCflObject();
        await this.createNewModelUsingAPI(
          'GET',
          `/sap/opu/odata4/sap/api_cost_center/srvd_a2x/sap/costcenter/0001/A_CostCenterText_2?$filter=CostCenter eq '${oUserRes.CostCenter}'`,
          null,
          'DepartmentModel'
        );
        const oUserSetData = this.getView().getModel(this.getEntryFormDataSourceModelName());
        const oUserSetDept = this.getView().getModel('DepartmentModel').getData();

        if (oUserSetDept.value.length > 0) {
          oUserSetData.setProperty('/DepartmentName', oUserSetDept.value[0].CostCenterName);
          oUserSetData.setProperty('/DepartmentCode', oUserSetDept.value[0].CostCenter);
        }
        oUserSetData.setProperty('/UserCode', oUserRes.BusinessPartner);
        oUserSetData.setProperty('/UserName', oUserRes.BusinessPartnerFullName);
        oUserSetData.setProperty('/UserGuid', oUserRes.BusinessPartnerUUID);
        oUserSetData.setProperty('/FirstName', oUserRes.FirstName);
        oUserSetData.setProperty('/LastName', oUserRes.LastName);
        oUserSetData.setProperty('/SubDepartmentCode', oUserRes.CostCenter);
        oUserSetData.setProperty('/SubDepartmentName', oUserRes.CostCenterDescription);
      },

      cflForUserRoleCode: async function () {
        await this.createNewModelUsingAPI('GET', '/odata/v4/stoneman-crf/MRole', null, this.getCflListViewDataSourceModelName());
        this.setCflTitle('Role List');
        this.setCflDisplayColumns(['Role Name']);
        this.setCflDataColumns(['Description']);
        this.setCflValueAndDisplay('/RoleName', 'Description', '', '');
        this.setCflSearchProperty('Description');
        this.showCfl(
          'userlvInpUserRoleCode',
          this.getCflListViewDataSourceModelName(),
          'value',
          this.onClosecflForRoleCode.bind(this)
        );
      },

      onClosecflForRoleCode: function () {
        const x = this.getCflObject();
        const oUserSetData = this.getView().getModel(this.getEntryFormDataSourceModelName());
        oUserSetData.setProperty('/Role_RoleGuid', x.RoleGuid);
      },

      cflForReportingManager: async function () {
        await this.createNewModelUsingAPI(
          'GET',
          '/odata/v4/stoneman-crf/MUser?$expand=Role',
          null,
          this.getCflListViewDataSourceModelName()
        );
        this.setCflTitle('Reporting Manager List');
        this.setCflDisplayColumns(['User Name', 'Designation', 'Department Name', 'Role Name']);
        this.setCflDataColumns(['UserName', 'Designation', 'DepartmentName', 'Role/Description']);
        this.setCflValueAndDisplay('/ManagerName', 'UserName', '', '');
        this.setCflSearchProperty('UserName');
        this.showCfl(
          'userlvInpUserRoleCode',
          this.getCflListViewDataSourceModelName(),
          'value',
          this.onClosecflForReportingManager.bind(this)
        );
      },

      onClosecflForReportingManager: function () {
        const x = this.getCflObject();
        const oUserSetData = this.getView().getModel(this.getEntryFormDataSourceModelName());
        oUserSetData.setProperty('/Manager_UserGuid', x.UserGuid);
      },

      cflForMaterialCategory: async function (oEvent) {
        const oSource = oEvent.getSource();
        const oContext = oSource.getBindingContext(this.getEntryFormDataSourceModelName());
        // Retrieve the row index from the context
        const rowIndex = oContext.getPath().split('/').pop();
        irowIndex = rowIndex;
        this.setCflTitle('Material Category List');
        await this.createNewModelUsingAPI(
          'GET',
          '/sap/opu/odata/sap/ZUI_MAT_GRP_DT_API/ZC_MAT_GRP_DT',
          null,
          this.getCflListViewDataSourceModelName()
        );
        this.setCflTitle('Material Category List');
        this.setCflDisplayColumns(['Material Category Code', 'Material Category Name']);
        this.setCflDataColumns(['MatGroup', 'MatGroupName']);
        this.setCflValueAndDisplay(`/MaterialCategory/${irowIndex}/MaterialCategoryCode`, 'MatGroup', '', '');
        this.setCflSearchProperty('MatGroup');
        this.showCfl(
          'material_category_code',
          this.getCflListViewDataSourceModelName(),
          'd/results',
          this.onConfirmforMaterial.bind(this),
          this.onCancelforMaterial.bind(this)
        );
      },

      onConfirmforMaterial: function () {
        const x = this.getCflObject();
        const y = this.getView().getModel(this.getEntryFormDataSourceModelName());
        y.setProperty(`/MaterialCategory/${irowIndex}/MaterialCategoryName`, x.MatGroupName);
        const srcObject = this.getView().getModel(this.getEntryFormDataSourceModelName()).getData();
        if (srcObject.MaterialCategory !== undefined && srcObject.MaterialCategory !== null) {
          const duplicates = this.findDuplicateEntries(srcObject.MaterialCategory, ['MaterialCategoryName']);
          if (duplicates.length > 0) {
            MessageToast.show('Duplicate entries found in Material Category! Please Add Unique Row', duplicates);
          }
        }
      },

      onCancelforMaterial: function () { },

      cflForProductCategory: async function (oEvent) {
        const oSource = oEvent.getSource();
        const oContext = oSource.getBindingContext(this.getEntryFormDataSourceModelName());
        // Retrieve the row index from the context
        const rowIndex = oContext.getPath().split('/').pop();
        irowIndex = rowIndex;
        this.setCflTitle('Product Category List');
        await this.createNewModelUsingAPI(
          'GET',
          '/odata/v4/stoneman-crf/MProductCategory?$filter=DelMark eq 0',
          null,
          this.getCflListViewDataSourceModelName()
        );
        this.setCflTitle('Product Category List');
        this.setCflDisplayColumns(['Product Category Code', 'Product Category Name']);
        this.setCflDataColumns(['ProductCategoryCode', 'ProductCategoryName']);
        this.setCflValueAndDisplay(`/ProductCategory/${irowIndex}/ProductCategoryCode`, 'ProductCategoryCode', '', '');
        this.setCflSearchProperty('ProductCategoryCode');
        this.showCfl(
          'product_category_code',
          this.getCflListViewDataSourceModelName(),
          'value',
          this.onConfirmforProduct.bind(this),
          this.onCancelforProduct.bind(this)
        );
      },

      onConfirmforProduct: function () {
        const x = this.getCflObject();
        const y = this.getView().getModel(this.getEntryFormDataSourceModelName());
        y.setProperty(`/ProductCategory/${irowIndex}/ProductCategoryName`, x.ProductCategoryName);
        y.setProperty(`/ProductCategory/${irowIndex}/ProductCategoryGuid_ProductCategoryGuid`, x.ProductCategoryGuid);
        const srcObject = this.getView().getModel(this.getEntryFormDataSourceModelName()).getData();
        if (srcObject.ProductCategory !== undefined && srcObject.ProductCategory !== null) {
          const duplicates = this.findDuplicateEntries(srcObject.ProductCategory, ['ProductCategoryName', 'ProductCategoryGuid_ProductCategoryGuid']);
          if (duplicates.length > 0) {
            MessageToast.show('Duplicate entries found in ProductCategory! Please Add Unique Row', duplicates);
          }
        }
      },

      onCancelforProduct: function () { },

      cflForBuyer: async function (oEvent) {
        const oSource = oEvent.getSource();
        const oContext = oSource.getBindingContext(this.getEntryFormDataSourceModelName());
        // Retrieve the row index from the context
        const rowIndex = oContext.getPath().split('/').pop();
        irowIndex = rowIndex;
        this.setCflTitle('Buyer List');
        await this.createNewModelUsingAPI(
          'GET',
          '/sap/opu/odata/sap/API_BUSINESS_PARTNER/A_BusinessPartner',
          '',
          this.getCflListViewDataSourceModelName()
        );
        this.setCflDisplayColumns(['Business Partner', 'Business Partner Full Name', 'BusinessPartnerUUID']);
        this.setCflDataColumns(['BusinessPartner', 'BusinessPartnerFullName', 'BusinessPartnerUUID']);
        this.setCflValueAndDisplay(`/Buyer/${irowIndex}/BuyerCode`, 'BusinessPartner', '', '');
        this.setCflSearchProperty('BusinessPartnerFullName');
        this.showCfl(
          'buyercode',
          this.getCflListViewDataSourceModelName(),
          'd/results',
          this.onConfirmforBuyer.bind(this),
          this.onCancelforBuyer.bind(this)
        );
      },

      onConfirmforBuyer: function () {
        const x = this.getCflObject();
        const y = this.getView().getModel(this.getEntryFormDataSourceModelName());
        y.setProperty(`/Buyer/${irowIndex}/BuyerName`, x.BusinessPartnerFullName);
        const srcObject = this.getView().getModel(this.getEntryFormDataSourceModelName()).getData();
        if (srcObject.Buyer !== undefined && srcObject.Buyer !== null) {
          const duplicates = this.findDuplicateEntries(srcObject.Buyer, ['BuyerCode', 'MCatCode']);
          if (duplicates.length > 0) {
            MessageToast.show('Duplicate entries found in Buyer! Please Add Unique Row', duplicates);
          }
        }
      },

      onCancelforBuyer: function () { },

      onSelect: function (oEvent) {
        const bSelected = oEvent.getParameter('selected');
        const y = this.getView().getModel(this.getEntryFormDataSourceModelName());

        if (bSelected === true) {
          y.setProperty(`/IsActive`, 'Y');
        } else {
          y.setProperty(`/IsActive`, 'N');
        }
      },

      validate: function () {
        return true;
      },

      // findDuplicateEntries: function (arr) {
      //   const seen = {}; // To track unique combinations of MCatCode and MCatName
      //   const duplicates = []; // To store duplicates

      //   arr.forEach(function (item) {
      //     const key1 = item.MCatCode + '_' + item.MCatName;
      //     const key2 = item.BuyerCode + '_' + item.BuyerName;
      //     if (seen[key1]) {
      //       duplicates.push(item);
      //     } else {
      //       seen[key1] = true;
      //     }
      //     if (seen[key2]) {
      //       duplicates.push(item);
      //     } else {
      //       seen[key2] = true;
      //     }
      //   });
      //   return duplicates;
      // },

      findDuplicateEntries: function (arr, keys) {
        const seen = {}; // To track unique combinations of the keys
        const duplicates = []; // To store duplicates

        arr.forEach(function (item) {
          // Generate a composite key from the provided keys
          const key = keys.map(function (key) {
            return item[key];
          }).join('_'); // Combine values using underscore as separator

          if (seen[key]) {
            duplicates.push(item); // Add item to duplicates if it's already seen
          } else {
            seen[key] = true; // Otherwise, mark this combination as seen
          }
        });

        return duplicates;
      },



      addRow: function () {
        const newRow = {
          BuyerCode: null,
          BuyerName: null, //User guid
          DelMark: 0, // be default 0
          Remarks: null,
          MCatCode: null,
          MCatName: null,
          RowNumber: 0
        };
        this.addRowInObj('Buyer', newRow, 'RowNumber');
      },

      addRowMeterialCategory: function () {
        const oUserSetData = this.getView().getModel(this.getEntryFormDataSourceModelName()).getData();
        const userGuid = oUserSetData['UserGuid'];
        const newRow = {
          UserMaterialCategoryGuid: null,
          Parent_UserGuid: userGuid,
          MaterialCategoryCode: null,
          MaterialCategoryName: null,
          DelMark: 0,
          Remarks: null,
          RowNumber: 0
        };
        this.addRowInObj('MaterialCategory', newRow, 'RowNumber');
      },

      addRowProductCategory: function () {
        const oUserSetData = this.getView().getModel(this.getEntryFormDataSourceModelName()).getData();
        const userGuid = oUserSetData['UserGuid'];
        const newRow = {
          Parent_UserGuid: userGuid,
          ProductCategoryCode: null,
          ProductCategoryName: null,
          DelMark: 0,
          Remarks: null,
          RowNumber: 0
        };
        this.addRowInObj('ProductCategory', newRow, 'RowNumber');
      },

      onNavBack: function () {
        const oHistory = History.getInstance();
        const sPreviousHash = oHistory.getPreviousHash();

        if (sPreviousHash !== undefined) {
          window.history.go(-1);
        } else {
          const oRouter = this.getOwnerComponent().getRouter();
          oRouter.navTo('RouterNameUserListView', {}, true);
        }
      },
      validateFields: function () {
        let isValid = true;
        const userName = this.getView().byId('userN').getValue();
        const password = this.getView().byId('pswd').getValue();
        const email = this.getView().byId('emailId').getValue();
        const userRoleCode = this.getView().byId('userRCode').getValue();
        const reportingManager = this.getView().byId('reportingManager').getValue();

        const oModel = this.getView().getModel(this.getEntryFormDataSourceModelName());
        const oData = oModel.getData();
        if (userName === '' || userName === undefined || userName === null) {
          isValid = false;
          MessageToast.show('Please select User Name');
        } else if (password === '' || password === undefined || password === null) {
          isValid = false;
          MessageToast.show('Please enter Password');
        } else if (email === '' || email === undefined || email === null) {
          isValid = false;
          MessageToast.show('Please enter Email');
        } else if (userRoleCode === '' || userRoleCode === undefined || userRoleCode === null) {
          isValid = false;
          MessageToast.show('Please select User Role Code');
        } /*else if (reportingManager === '' || reportingManager === undefined || reportingManager === null) {
          isValid = false;
          MessageToast.show('Please select Reporting Manager');
        }*/ else if (oData.Buyer.length === 0) {
          isValid = false;
          MessageToast.show('Please select atleast one Buyer');
        } else if (oData.ProductCategory.length === 0) {
          isValid = false;
          MessageToast.show('Please select atleast one Product');
        } else if (oData.MaterialCategory.length === 0) {
          isValid = false;
          MessageToast.show('Please select atleast one Material');
        }
        return isValid;
      },
      onSave: async function () {
        // const oModel = this.getView().getModel(this.getEntryFormDataSourceModelName());
        // const oData = oModel.getData();
        const srcObject = this.getView().getModel(this.getEntryFormDataSourceModelName()).getData();
        const trgObject = this.getView().getModel('ConfigurationSaveModel').getData();

        if (srcObject.Buyer !== undefined && srcObject.Buyer !== null && srcObject.Buyer !== '') {
          const duplicates = this.findDuplicateEntries(srcObject.Buyer, ['BuyerCode', 'MCatCode']);
          if (duplicates.length > 0) {
            MessageToast.show('Duplicate entries found in Buyer! Please Add Unique Row', duplicates);
            return;
          }
        } else if (srcObject.ProductCategory !== undefined && srcObject.ProductCategory !== null && srcObject.ProductCategory !== '') {
          const duplicates = this.findDuplicateEntries(srcObject.ProductCategory, ['ProductCategoryName', 'ProductCategoryGuid_ProductCategoryGuid']);
          if (duplicates.length > 0) {
            MessageToast.show('Duplicate entries found in ProductCategory! Please Add Unique Row', duplicates);
          }
        } else if (srcObject.MaterialCategory !== undefined && srcObject.MaterialCategory !== null && srcObject.MaterialCategory !== '') {
          const duplicates = this.findDuplicateEntries(srcObject.MaterialCategory, ['MaterialCategoryName']);
          if (duplicates.length > 0) {
            MessageToast.show('Duplicate entries found in Material Category! Please Add Unique Row', duplicates);
          }
        }

        if (this.validateFields()) {
          if (this.formMode !== FormMode.CREATE) {
            //const mainBrandList = srcObject.Buyer;
            const backupList = this.getView().getModel('backup');

            const buyerList = backupList.Buyer;
            const buyer = this.setDelMark(srcObject.Buyer, buyerList, 'BuyerCode', 'BuyerName', 'BuyerGuid');
            srcObject.Buyer = buyer;

            const productCategoryList = backupList.ProductCategory;
            const product = this.setDelMark(
              srcObject.ProductCategory,
              productCategoryList,
              'ProductCategoryCode',
              'ProductCategoryName',
              'ProductCategoryGuid'
            );
            srcObject.ProductCategory = product;

            const materialCategoryList = backupList.MaterialCategory;
            const material = this.setDelMark(
              srcObject.MaterialCategory,
              materialCategoryList,
              'MaterialCategoryCode',
              'MaterialCategoryName',
              'MaterialCategoryGuid'
            );
            srcObject.MaterialCategory = material;
          }

          this.transferObjectValues(srcObject, trgObject);
          await this.onPressOfEntryFormSaveButton(trgObject);
          const res = this.getApiResponseObject();
          if (res.success === true && this.formMode === '3') {
            MessageToast.show('User Configuration created successfully');
            setTimeout(
              function () {
                this.router.navTo(this.getBackwardRoute());
              }.bind(this),
              1000
            );
          } else if (res.success === true && this.formMode === '2') {
            MessageToast.show('User Configuration Updated successfully');
            setTimeout(
              function () {
                this.router.navTo(this.getBackwardRoute());
              }.bind(this),
              1000
            );
          } else {
            MessageToast.show(res.object.responseJSON.error.message);
            setTimeout(
              function () {
                this.router.navTo(this.getBackwardRoute());
              }.bind(this),
              1000
            );
          }
        }
      },

      setDelMark: function (mainBrandList, tblList, code, name, guid) {
        const backupMap = new Map(tblList.map((item) => [item[code], item]));
        mainBrandList.forEach((item) => {
          const backupItem = backupMap.get(item[code]);
          if (backupItem) {
            backupItem.BuyerName = item[name];
            backupItem.BuyerGuid = item[guid];
            backupItem.DelMark = 0;
          } else {
            backupMap.set(item[code], { ...item, DelMark: 0 });
          }
        });

        tblList.forEach((item) => {
          if (!mainBrandList.some((mainItem) => mainItem[code] === item[code])) {
            // Mark the item as deleted
            item.DelMark = 1;
          }
        });

        const finalList = Array.from(backupMap.values());
        return finalList;
      },

      onDeleteBuyer: function (oEvent) {
        const modelName = this.getEntryFormDataSourceModelName();
        const oModel = this.getView().getModel(modelName);
        const aData = oModel.getData();

        if (aData.Buyer.length === 1) {
          MessageToast.show('Atleast one buyer should be there.');
        } else {
          const iIndex = oEvent.getSource().getParent().getParent().indexOfItem(oEvent.getSource().getParent());
          this.deleteRow(modelName, 'Buyer', iIndex);
        }
      },

      onDeleteMaterialCategory: function (oEvent) {
        const modelName = this.getEntryFormDataSourceModelName();
        const oModel = this.getView().getModel(modelName);
        const aData = oModel.getData();

        if (aData.MaterialCategory.length === 1) {
          MessageToast.show('Atleast one material category should be there.');
        } else {
          const iIndex = oEvent.getSource().getParent().getParent().indexOfItem(oEvent.getSource().getParent());
          this.deleteRow(modelName, 'MaterialCategory', iIndex);
        }
      },

      onDeleteProductCategory: function (oEvent) {
        const modelName = this.getEntryFormDataSourceModelName();
        const oModel = this.getView().getModel(modelName);
        const aData = oModel.getData();

        if (aData.ProductCategory.length === 1) {
          MessageToast.show('Atleast one productcategory should be there.');
        } else {
          const iIndex = oEvent.getSource().getParent().getParent().indexOfItem(oEvent.getSource().getParent());
          this.deleteRow(modelName, 'ProductCategory', iIndex);
        }
      }
    });
  }
);

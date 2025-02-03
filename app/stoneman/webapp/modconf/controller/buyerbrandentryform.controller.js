sap.ui.define(
  [
    'core/generic/genericentryform',
    'stoneman/modone/model/JSONLoader',
    'sap/m/MessageToast',
    'stoneman/modone/constants/FormMode',
    'sap/m/MessageBox',
    'sap/ui/model/json/JSONModel'
  ],
  function (genericentryform, JSONLoader, MessageToast, FormMode, MessageBox, JSONModel) {
    'use strict';
    let irowIndex;
    return genericentryform.extend('modconfcontroller.buyerbrandentryform', {
      onInit: function () {
        genericentryform.prototype.onInit.apply(this, arguments);
      },

      onBeforeShow: async function (oEvent) {
        this.identifyFormMode(oEvent);
        this.initialize();
        this.setEntryFormDataSourceURLForEditMode(
          '/odata/v4/stoneman-crf/MBuyer(' +
          this.getListViewEditPropertyValue() +
          ')?$expand=Brand($filter=DelMark eq 0)&$filter=DelMark eq 0'
        );
        await this.showEntryForm();

        if (this.formMode !== FormMode.CREATE) {
          const backUpViewData = this.getView().getModel(this.getEntryFormDataSourceModelName()).getData();
          const oBackupModel = new JSONModel(backUpViewData);
          this.getView().setModel(JSON.parse(JSON.stringify(oBackupModel.oData.Brand)), 'backup');
        }

        const oScrollContainer = this.getView().byId('scrollContainerBB');
        const oDomRef = oScrollContainer.getDomRef();

        if (oDomRef) {
          // Apply min and max height dynamically
          oDomRef.style.minHeight = 'auto';
          oDomRef.style.maxHeight = '450px';
          oDomRef.style.overflow = 'auto'; // Ensure scrolling
        }

        this.setRowMNumber();
      },

      initialize: async function () {
        this.setPageId('bbef');
        this.setFormTitle('Buyer Brand Entry Form');
        this.setBackwardRoute('RouteNameBuyerBrandListView');

        this.roleInfo = this.getRoleDetails();
        this.loginInfo = this.getLoginInfo();
        this.formMode = this.getFormMode();

        const oPath = jQuery.sap.getModulePath(
          'stoneman',
          '/modconf/model/BuyerBrandSaveForm.json' //Save Request Model
        );
        const oModel = new sap.ui.model.json.JSONModel(oPath);
        this.getView().setModel(oModel, 'BuyerBrandSaveModel');

        if (this.formMode === FormMode.CREATE) {
          const oPathReq = jQuery.sap.getModulePath(
            'stoneman',
            '/modconf/model/BuyerBrandAddViewForm.json' //add Request Model
          );
          const oModelRequest = new sap.ui.model.json.JSONModel(oPathReq);
          this.getView().setModel(oModelRequest, this.getEntryFormDataSourceModelName());
          this.getView().byId("bb_buyercode_EntryForm").setEnabled(true);
        }
        this.setEntryFormDataSourceURLToAddData('/odata/v4/stoneman-crf/MBuyer');
        this.setEntryFormDataSourceURLToUpdateData('/odata/v4/stoneman-crf/MBuyer(' + this.getListViewEditPropertyValue() + ')');

        if (this.formMode == "2") {
          this.getView().byId("bb_buyercode_EntryForm").setEnabled(false);
        }
      },

      setRowMNumber: function () {
        const oModel = this.getView().getModel(this.getEntryFormDataSourceModelName());
        const aData = oModel.getData();
        aData.Brand = aData.Brand.map((item, i) => ({
          ...item,
          RowNumber: i + 1 // Recalculate RowNumber for remaining items
        }));
        oModel.setData(aData);
        oModel.setProperty('/Brand', aData.Brand);
      },

      cflForBuyerCode: async function () {
        this.setCflTitle('Buyer List');
        await this.createNewModelUsingAPI(
          'GET',
          '/sap/opu/odata/sap/API_BUSINESS_PARTNER/A_BusinessPartner',
          '',
          this.getCflListViewDataSourceModelName()
        );
        this.setCflDisplayColumns(['Buyer Code', 'Buyer Name']);
        this.setCflDataColumns(['BusinessPartner', 'BusinessPartnerName']);
        this.setCflValueAndDisplay('/BuyerCode', 'BusinessPartner', '', '');
        this.setCflSearchProperty('BusinessPartner');
        this.showCfl(
          'bb_buyercode_EntryForm',
          this.getCflListViewDataSourceModelName(),
          'd/results',
          this.onClosecflForcflForBuyerCode.bind(this)
        );
      },

      onClosecflForcflForBuyerCode: function () {
        const x = this.getCflObject();
        const BuyerBrandData = this.getView().getModel(this.getEntryFormDataSourceModelName());
        BuyerBrandData.setProperty('/BuyerName', x.BusinessPartnerName);
        BuyerBrandData.setProperty('/BuyerGuid', x.BusinessPartnerUUID);
      },
      onLiveChangeBuyerCode: function (oEvent) {
        var value = oEvent.getParameter("newValue");
        if (value) {
          value = '';
          var newValue = value
          oEvent.getSource().setValue(newValue);
        }
      },
      addRow: function () {
        //Brand
        const newRow = {
          BrandCode: null,
          BrandName: null,
          BuyerBrandGuid: null,
          DelMark: 0,
          Parent_BuyerGuid: null,
          Remarks: null,
          RowNumber: 0
        };
        this.addRowInObj('Brand', newRow, 'RowNumber');
      },

      onDelete: function (oEvent) {
        const modelName = this.getEntryFormDataSourceModelName();
        const oModel = this.getView().getModel(modelName);
        const aData = oModel.getData();

        if (aData.Brand.length === 1) {
          MessageToast.show('Atleast one brand should be there.');
        } else {
          const iIndex = oEvent.getSource().getParent().getParent().indexOfItem(oEvent.getSource().getParent());
          this.deleteRow(modelName, 'Brand', iIndex);
        }
      },
      cflForBrandCode: async function (oEvent) {
        const oSource = oEvent.getSource();
        const oContext = oSource.getBindingContext(this.getEntryFormDataSourceModelName());
        // Retrieve the row index from the context
        irowIndex = oContext.getPath().split('/').pop();

        this.setCflTitle('Brand List');
        await this.createNewModelUsingAPI(
          'GET',
          '/sap/opu/odata/sap/YY1_BRAND_CDS/YY1_BRAND',
          '',
          this.getCflListViewDataSourceModelName()
        );
        this.setCflDisplayColumns(['Brand Code', 'Brand Name']);
        this.setCflDataColumns(['Code', 'Name']);
        this.setCflValueAndDisplay(`/Brand/${irowIndex}/BrandCode`, 'Code', '', '');
        this.setCflSearchProperty('Code');
        this.showCfl(
          'brandCode_EntryForm',
          this.getCflListViewDataSourceModelName(),
          'd/results',
          this.onClosecflForcflForBrandCode.bind(this)
        );
      },

      onClosecflForcflForBrandCode: function () {
        const x = this.getCflObject();
        const BuyerBrandData = this.getView().getModel(this.getEntryFormDataSourceModelName());
        BuyerBrandData.setProperty(`/Brand/${irowIndex}/BrandName`, x.Name);
      },

      onLiveChange: function () { },

      //Save Time And Action***************************************************
      isFormValid: function () {
        const isValid = true;

        const y = this.getView().getModel(this.getEntryFormDataSourceModelName());

        return isValid;
      },

      createObjectTarget: function () {
        const x = {
          BuyerGuid: null,
          BuyerCode: null,
          BuyerName: null,
          DelMark: 0,
          Remarks: null,
          Brand: [
            {
              BrandCode: null,
              BrandName: null,
              BuyerBrandGuid: null,
              DelMark: 0,
              Parent_BuyerGuid: null,
              Remarks: null
            }
          ]
        };

        return x;
      },

      onSave: async function () {
        if (this.isFormValid()) {
          const modelData = this.getView().getModel(this.getEntryFormDataSourceModelName()).getData();

          if (this.formMode !== FormMode.CREATE) {
            const mainBrandList = modelData.Brand;
            const backupBrandList = this.getView().getModel('backup');
            const backupMap = new Map(backupBrandList.map((item) => [item.BrandCode, item]));

            mainBrandList.forEach((item) => {
              const backupItem = backupMap.get(item.BrandCode);
              if (backupItem) {
                backupItem.BrandName = item.BrandName;
                backupItem.BuyerBrandGuid = item.BuyerBrandGuid;
                backupItem.DelMark = 0;
              } else {
                backupMap.set(item.BrandCode, { ...item, DelMark: 0 });
              }
            });

            backupBrandList.forEach((item) => {
              if (!mainBrandList.some((mainItem) => mainItem.BrandCode === item.BrandCode)) {
                // Mark the item as deleted
                item.DelMark = 1;
              }
            });

            const finalList = Array.from(backupMap.values());

            console.log(finalList);

            modelData.Brand = finalList;
          }

          const y = this.createObjectTarget();

          this.transferObjectValues(modelData, y);

          await this.onPressOfEntryFormSaveButton(y);

          const res = this.getApiResponseObject();
          if (res.success === true) {
            if (this.formMode === FormMode.CREATE) {
              MessageToast.show('Buyer and brand added successfully');
            } else {
              MessageToast.show('Buyer and brand updated successfully');
            }
            setTimeout(
              function () {
                this.router.navTo(this.getBackwardRoute());
              }.bind(this),
              3000
            );
          } else {
            MessageToast.show(res.object.responseJSON.error.message);
          }
        }
      },

      onCancel: async function () {
        this.router.navTo(this.getBackwardRoute());

      },
    });
  }
);

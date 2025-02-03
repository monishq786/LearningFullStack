sap.ui.define(['core/generic/genericlistview', 'stoneman/modone/constants/Constant'], function (genericlistview, Constant) {
  'use strict';

  return genericlistview.extend('modonecontroller.coplistview', {
    onInit: function () {
      genericlistview.prototype.onInit.apply(this, arguments);
    },

    onBeforeShow: function (oEvent) {
      //this.validateAccess();
      this.initialize();
    },

    initialize: async function () {
      this.setPageId('coplv'); // XML page ID // page title
      this.setFormTitle('COP Search Form');
      const loginInfo = this.getLoginInfo();
      let body = {
        LOGINUSERID: loginInfo?.UserID,
        CADNO: null,
        ITEMCODE: null,
        SCIPLCODE: null,
        ITEMDES: null,
        BUYERNAME: null,
        COSTINGCATEGORY: null,
        PRODUCTSUBCATEGORY: null,
        RAWMATERIAL: null,
        CostingNo: null
      };

      this.setListViewDataSourceProperties('POST', '/odata/v4/stoneman-crf/COP_Search', body, 'value');
      this.setListViewDisplayColumns([
        'CAD No.',
        'Costing No.',
        'SKU No.(Item code)',
        'SCIPL Code',
        'Description',
        'Buyer Name',
        'Category',
        'Sub Category',
        'Raw Material',
        'Status',
        'Created By',
        'Date',
        'action'
      ]);
      this.setListViewDataColumns([
        'CADNO',
        'COSTINGNO',
        'ITEMCODE',
        'SCIPLCODE',
        'ITEMDESC',
        'BUYERNAME',
        'COSTINGCATEGORY',
        'PRODUCTSUBCATEGORY',
        'RAWMATERIAL',
        'FORMSTATUS',
        'CREATEDBY',
        'COSTINGDATE',
        'Edit'
      ]);

      this.setListViewFilterColumn('coplvCAD', 'CAD No.', 'Cfl', 'eq', 'Int', 'CADNO', 'cflForCADNo');
      this.setListViewFilterColumn('coplvSKUNo', 'SKU No.', 'Cfl', 'eq', 'String', 'ITEMCODE', 'cflForSKUNo');
      this.setListViewFilterColumn('coplvSCIPLCode', 'SCIPL Code', 'Cfl', 'eq', 'Int', 'CostingNo', 'cflForSCIPLCode');
      this.setListViewFilterColumn('coplvDescription', 'Description', 'Cfl', 'eq', 'String', 'ITEMDES', 'cflForDescription');
      this.setListViewFilterColumn('coplvBuyerName', 'Buyer Name', 'Cfl', 'eq', 'String', 'BUYERNAME', 'cflForBuyerName');
      this.setListViewFilterColumn('coplvCategory', 'Category', 'Cfl', 'eq', 'String', 'FormStatus', 'cflForCategory');
      this.setListViewFilterColumn('coplvSubCategory', 'Sub Category', 'Cfl', 'eq', 'String', 'FormStatus', 'cflForSubCategory');
      this.setListViewFilterColumn('coplvRawMaterial', 'Raw Material', 'Cfl', 'eq', 'String', 'RAWMATERIAL', 'cflForRawMaterial');

      this.setListViewEditProperty('COSTINGHEADERUUID'); // TODO to be change based on requirments
      this.setForwardRoute('RouterNameCOPEntryForm');
      this.setBackwardRoute('RouteLanding');
      this.setFormSubTitle('');
      await this.showListView(this.getPageId());
      this.pageValidatations();
    },
    pageValidatations: function () {
      const oView = this.getView();
      console.log(oView);
      const configuralModel = this.getOwnerComponent().getModel('configuralModel');
      if (configuralModel) {
        const roledata = configuralModel?.getData()
        console.log('roledata    ', roledata);
        const oTable = this.getListViewTable();
        const sCreateText = this.getView().getModel('i18n').getResourceBundle().getText('CREATE');
        for (const oControl of oTable.getHeaderToolbar().getContent()) {
          if (oControl.isA('sap.m.Button') && oControl.getText() === sCreateText) {
            oControl.setEnabled(roledata?.Add);
            break;
          }
        }
        this.disableAllEditButtons(roledata?.View);
      } else {
        

        const roledata = JSON.parse(localStorage.getItem('roledata'));
        console.log("Afshans   " + JSON.stringify(roledata));
        const oTable = this.getListViewTable();
        const sCreateText = this.getView().getModel('i18n').getResourceBundle().getText('CREATE');
        for (const oControl of oTable.getHeaderToolbar().getContent()) {
          console.log("Controll   " + JSON.stringify(oControl.isA('sap.m.Button') && oControl.getText()));
          if (oControl.isA('sap.m.Button') && oControl.getText() == sCreateText) {
            oControl.setEnabled(roledata?.Add);
            break;
          }
        }
        this.disableAllEditButtons(roledata?.View);
      }
    },

    disableAllEditButtons: function (isView) {
      const oTable = this.getListViewTable();
      var aItems = oTable.getItems();
      // Iterate over each item (row)
      aItems.forEach(function (oItem) {
        // Get the cells of the current row (ColumnListItem)
        var aCells = oItem.getCells();
        aCells.forEach(function (oCell) {
          if (oCell instanceof sap.m.HBox) {
            var aItems = oCell.getItems(); // Get the items inside the HBox
            aItems.forEach(function (oItem) {
              if (oItem instanceof sap.m.Button) {
                if (oItem.getIcon() === "sap-icon://navigation-right-arrow") {
                  oItem.setEnabled(isView);
                }
              }
            });
          }
        });
      });
    },

    cflForCADNo: async function () {
      await this.createNewModelUsingAPI('GET', '/odata/v4/stoneman-crf/TCadDetail', '', this.getCflListViewDataSourceModelName());
      this.setCflDisplayColumns(['CAD No.']);
      this.setCflDataColumns(['CadDetailNo']);
      this.setCflValueAndDisplay('', '', 'coplvCAD', 'CadDetailNo');
      this.showCfl('coplvCAD', this.getCflListViewDataSourceModelName(), 'value', this.onClosecflForCADNo.bind(this));
    },

    cflForSKUNo: async function () {
      await this.createNewModelUsingAPI(
        'GET',
        '/sap/opu/odata/sap/YY1_PRODUCT_API_CDS/YY1_Product_API',
        '',
        this.getCflListViewDataSourceModelName()
      );
      this.setCflDisplayColumns(['Product', 'ProductDescription']);
      this.setCflDataColumns(['Product', 'ProductDescription']);
      this.setCflValueAndDisplay('', '', 'coplvSKUNo', 'Product');
      this.showCfl('coplvSKUNo', this.getCflListViewDataSourceModelName(), 'd/results', this.onClosecflForSKUNo.bind(this));
    },

    cflForSCIPLCode: async function () { },

    cflForDescription: async function () {
      await this.createNewModelUsingAPI(
        'GET',
        '/sap/opu/odata/sap/YY1_PRODUCT_API_CDS/YY1_Product_API',
        '',
        this.getCflListViewDataSourceModelName()
      );
      this.setCflDisplayColumns(['Product', 'ProductDescription']);
      this.setCflDataColumns(['Product', 'ProductDescription']);
      this.setCflValueAndDisplay('', '', 'coplvDescription', 'ProductDescription');
      this.showCfl('coplvDescription', this.getCflListViewDataSourceModelName(), 'd/results', this.onCloseDescription.bind(this));
    },

    cflForBuyerName: async function () {
      await this.createNewModelUsingAPI(
        'GET',
        '/sap/opu/odata/sap/API_BUSINESS_PARTNER/A_BusinessPartner',
        '',
        this.getCflListViewDataSourceModelName()
      );
      this.setCflDisplayColumns(['BusinessPartner', 'Customer', 'Supplier', 'BusinessPartnerName']);
      this.setCflDataColumns(['BusinessPartner', 'Customer', 'Supplier', 'BusinessPartnerName']);
      this.setCflValueAndDisplay('', '', 'coplvBuyerName', 'BusinessPartnerName');
      this.showCfl('coplvBuyerName', this.getCflListViewDataSourceModelName(), 'd/results', this.onClosecflForBuyer.bind(this));
    },

    cflForCategory: async function () { },

    cflForSubCategory: async function () { },

    cflForRawMaterial: async function () {
      await this.createNewModelUsingAPI(
        'GET',
        '/sap/opu/odata/sap/YY1_PRODUCT_API_CDS/YY1_Product_API',
        '',
        this.getCflListViewDataSourceModelName()
      );
      this.setCflDisplayColumns(['Product', 'ProductDescription']);
      this.setCflDataColumns(['Product', 'ProductDescription']);
      this.setCflValueAndDisplay('', '', 'coplvRawMaterial', 'ProductDescription');
      this.showCfl('coplvRawMaterial', this.getCflListViewDataSourceModelName(), 'd/results', this.onCloseRawMaterial.bind(this));
    },

    onClosecflForSKUNo: function () {
      let x = this.getCflObject();
    },

    onCloseDescription: function () {
      let x = this.getCflObject();
    },

    onCloseRawMaterial: function () {
      let x = this.getCflObject();
    },

    onClosecflForBuyer: function () {
      let x = this.getCflObject();
    },

    onClosecflForCADNo: function () {
      let x = this.getCflObject();
    }
  });
});

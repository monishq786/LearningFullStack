sap.ui.define(['core/generic/genericlistview'], function (genericlistview) {
  'use strict';

  return genericlistview.extend('modconfcontroller.productcategorylistview', {
    onInit: function () {
      genericlistview.prototype.onInit.apply(this, arguments);
    },

    onBeforeShow: function () {
      this.initialize();
    },

    initialize: async function () {
      this.setPageId('pgnumberserieslv');
      this.setFormTitle('Product Category List View');
      this.setFormSubTitle('Search Result');
      this.setListViewDataSourceProperties('GET', '/odata/v4/stoneman-crf/MProductCategory?$filter=DelMark eq 0', '', 'value');

      //header
      this.setListViewFilterColumn(
        'pg1lvCflProductCategoryName',
        'Product Category Name',
        'Cfl',
        'eq',
        'String',
        'ProductCategoryName',
        'cflForProductCategoryName'
      );

      //Table list
      this.setListViewDisplayColumns([
        'Product Category Code',
        'Product Category Name',
        'Series First No.',
        'Series Last No.',
        'String Prefix',
        'Status',
        'EDIT'
      ]);
      this.setListViewDataColumns([
        'ProductCategoryCode',
        'ProductCategoryName',
        'FirstNum',
        'LastNum',
        'Prefix',
        'Status',
        'Edit'
      ]);

      await this.showListView(this.getPageId());

      this.setStatusActiveInActive();

      this.setListViewEditProperty('ProductCategoryGuid');
      this.setForwardRoute('RouteNameProductCategoryEntryForm');
      this.setBackwardRoute('RouteLanding');
    },

    setStatusActiveInActive: function () {
      const oModel = this.getView().getModel(this.getListViewDataSourceModelName());
      const oData = oModel.getData();
      oData.value.forEach((element) => {
        if (element.IsActive === 'Y') {
          element['Status'] = 'Active';
        } else {
          element['Status'] = 'InActive';
        }
      });
      oModel.setData(oData);
      this.getView().setModel(oModel, this.getListViewDataSourceModelName());
    },

    cflForProductCategoryName: async function () {
      this.setCflTitle('Product Category List');
      await this.createNewModelUsingAPI(
        'GET',
        '/odata/v4/stoneman-crf/MProductCategory?$filter=DelMark eq 0',
        '',
        this.getCflListViewDataSourceModelName()
      );
      this.setCflDisplayColumns(['Product Category Name']);
      this.setCflDataColumns(['ProductCategoryName']);
      this.setCflValueAndDisplay('', '', 'pg1lvCflProductCategoryName', 'ProductCategoryName');
      this.setCflSearchProperty('ProductCategoryName');
      this.showCfl(
        'pg1lvCflProductCategoryName',
        this.getCflListViewDataSourceModelName(),
        'value',
        this.onClosecflForcflForProductCategory.bind(this)
      );
    },

    onClosecflForcflForProductCategory: function () {
      // const x = this.getCflObject();
      // const BuyerBrandData = this.getView().getModel(this.getEntryFormDataSourceModelName());
      // BuyerBrandData.setProperty('/BuyerName', x.BusinessPartnerName);
    }
  });
});

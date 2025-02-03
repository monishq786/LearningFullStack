sap.ui.define(['core/generic/genericlistview'], function (genericlistview) {
  'use strict';

  return genericlistview.extend('modconfcontroller.buyerbrandlistview', {
    onInit: function () {
      genericlistview.prototype.onInit.apply(this, arguments);
    },

    onBeforeShow: function () {
      this.initialize();
    },

    initialize: async function () {
      this.setPageId('pgbuyerbrandlv');
      this.setFormTitle('Buyer Brand List View');
      this.setFormSubTitle('Search Result');
      this.setListViewDataSourceProperties(
        'GET',
        '/odata/v4/stoneman-crf/MBuyer?$expand=Brand($filter=DelMark eq 0)&$filter=DelMark eq 0',
        '',
        'value'
      );
      //header
      this.setListViewFilterColumn('pg1lvCflBuyerName', 'buyerName', 'Cfl', 'eq', 'String', 'BuyerName', 'cflForBuyer');

      //Table list
      this.setListViewDisplayColumns(['Buyer Code', 'Buyer Name', 'EDIT']);
      this.setListViewDataColumns(['BuyerCode', 'BuyerName', 'Edit']);

      await this.showListView(this.getPageId());

      this.setListViewEditProperty('BuyerGuid');
      this.setForwardRoute('RouteNameBuyerBrandEntryForm');
      this.setBackwardRoute('RouteLanding');
      await this.showListView(this.getPageId());
    },

    cflForBuyer: async function () {
      this.setCflTitle('Buyer List');
      await this.createNewModelUsingAPI(
        'GET',
        '/odata/v4/stoneman-crf/MBuyer?$filter=DelMark eq 0',
        '',
        this.getCflListViewDataSourceModelName()
      );
      this.setCflDisplayColumns(['Buyer Name']);
      this.setCflDataColumns(['BuyerName']);
      this.setCflValueAndDisplay('', '', 'pg1lvCflBuyerName', 'BuyerName');
      this.setCflSearchProperty('BuyerName');
      this.showCfl(
        'pg1lvCflBuyerName',
        this.getCflListViewDataSourceModelName(),
        'value',
        this.onClosecflForcflForBuyer.bind(this)
      );
    },

    onClosecflForcflForBuyer: function () {
      // const x = this.getCflObject();
      // const BuyerBrandData = this.getView().getModel(this.getEntryFormDataSourceModelName());
      // BuyerBrandData.setProperty('/BuyerName', x.BusinessPartnerName);
    }
  });
});

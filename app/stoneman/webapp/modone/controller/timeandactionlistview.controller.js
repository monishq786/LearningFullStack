sap.ui.define(
  ['core/generic/genericlistview', 'sap/ui/export/Spreadsheet', 'sap/ui/export/library', 'stoneman/modone/model/formatter'],
  function (genericlistview, Spreadsheet, exportLibrary, formatter) {
    'use strict';
    let that;
    return genericlistview.extend('modonecontroller.timeandactionlistview', {
      onInit: function () {
        genericlistview.prototype.onInit.apply(this, arguments);
        that = this;
      },
      onBeforeShow: function () {
        //this.validateAccess();
        this.roleInfo = this.getRoleDetails();
        this.loginInfo = this.getLoginInfo();
        this.initialize();
      },
      initialize: async function () {
        this.setPageId('pg1lv');
        this.setFormTitle('Search Time And Action');
        this.setFormSubTitle('');

        this.EdmType = exportLibrary.EdmType;

        //this url call this first time for initial url without any filter for search all filters
        this.setListViewDataSourceProperties(
          'GET',
          `/odata/v4/stoneman-ta/Tactionheader?$expand=tactiondetail($filter=emp_id_UserID eq ${this.loginInfo.UserID})`,
          '',
          'value'
        );

        //do not change this - this is writted intentionally for initial show open data only
        this.setListViewDataSourceProperties(
          'GET',
          `/odata/v4/stoneman-ta/Tactionheader?$expand=tactiondetail($filter=emp_id_UserID eq ${this.loginInfo.UserID})&$filter=tah_prjstatuscode eq 'O'&$orderby=tah_no desc`,
          '',
          'value'
        );

        // this.setListViewDataSourceURL(
        //   `/odata/v4/stoneman-ta/Tactionheader?$expand=tactiondetail($filter=emp_id_UserID eq ${this.loginInfo.UserID})&$filter=tah_prjstatuscode eq 'O'&$orderby=tah_no desc`
        // );

        //table
        this.setListViewDisplayColumns([
          'TANO',
          'SONO',
          'SOITEMCODE',
          'SOITEMDESC',
          'PROJECTTEMPLATETITLE',
          'CUSTOMERNAME',
          'DELIVERYDATE',
          'EDIT'
        ]);
        this.setListViewDataColumns([
          'tah_no',
          'tah_sono',
          'tah_itemcode',
          'tah_itemdesc',
          'tah_prjtemplnme',
          'tah_customername',
          new sap.m.Text({
            text: { path: this.getListViewDataSourceModelName() + '>tah_sodeldate', formatter: this.returnNormalDateFormat }
          }),
          'Edit'
        ]);

        //create header filter fields
        this.setListViewFilterColumn('pg1lvCflTahNo', 'TANO', 'Cfl', 'eq', 'Int', 'tah_no', 'cflForTahno');
        this.setListViewFilterColumn('pg1lvCflSono', 'SONO', 'Cfl', 'eq', 'String', 'tah_sono', 'cflForSoNo');
        this.setListViewFilterColumn(
          'pg1lvCflProjTemp',
          'PROJECTTEMPLATETITLE',
          'Cfl',
          'eq',
          'String',
          'tah_prjtemplno',
          'cflForProjTemp'
        );

        this.setListViewFilterColumn(
          'pg1lvDtStartDate',
          'THSTARTDATE',
          'DatePicker',
          'eq',
          'Date',
          'tah_startdate',
          'dateForStartDate'
        );
        this.setListViewFilterColumn(
          'pg1lvSelectProjStatus',
          'PROJECTSTATUS',
          'Select',
          'eq',
          'String',
          'tah_prjstatuscode',
          'selectForProjStatus'
        );

        //show table list view
        await this.showListView(this.getPageId(), 'value');
        // await this.createNewModelUsingAPI(
        //   'GET',
        //   `/odata/v4/stoneman-ta/Tactionheader?$expand=tactiondetail($filter=emp_id_UserID eq ${this.loginInfo.UserID})&$filter=tah_prjstatuscode eq 'O'&$orderby=tah_no desc`,
        //   '',
        //   this.getListViewDataSourceModelName()
        // );

        // //api for combobox
        // await this.createNewModelUsingAPI(
        //   'GET',
        //   '/sap/opu/odata/sap/API_ENTERPRISE_PROJECT_SRV/A_EnterpriseProject',
        //   '',
        //   'pg1lvSelectProjTemplateModel'
        // );
        // this.populateSelect(
        //   'pg1lvCflProjTemp',
        //   'pg1lvSelectProjTemplateModel',
        //   'd/results',
        //   'ProjectUUID',
        //   'ProjectDescription,Project,YY1_Category1_PPH,YY1_NoofDays_PPH'
        // );

        //this.handelProjectTemplate(); // for preoject template dropdown
        this.handelStatusModel();

        // //api for combobox
        // await this.createNewModelUsingAPI('GET', '/odata/v4/stoneman-ta/PrjStatusMaster', '', 'pg1lvSelectProjStatusModel');
        // this.populateSelect('pg1lvSelectProjStatus', 'pg1lvSelectProjStatusModel', 'value', 'prjstatus_code', 'prjstatus_name');

        //set default selected value in combobox
        const projStatus = sap.ui.getCore().byId('pg1lvSelectProjStatus');
        projStatus.setSelectedKey('O');

        this.setListViewEditProperty('tah_id');
        this.setForwardRoute('RouteTimeAndActionEntryForm');
        this.setBackwardRoute('RouteLanding');

        //insert export to excel button inside generic table header toolbar
        this.oTable = this.getListViewTable();
        const headerToolbar = this.oTable.getHeaderToolbar();
        headerToolbar.addContent(
          new sap.m.Button({
            text: '{i18n>EXPORTTOEXCEL}',
            icon: 'sap-icon://excel-attachment',
            press: this.onPressOfListViewExportToExcelButton.bind(this)
          })
        );

        //hide create button when User
        const aContent = headerToolbar.getContent(); // Get all controls inside the toolbar
        aContent.forEach(function (oControl) {
          if (oControl.isA('sap.m.Button') && oControl.getText() === 'setting') {
            oControl.setVisible(false); // Hide the button
          }
        });

        //call filtered api for default selected project status
        if (this.roleInfo['RoleCode'] === 'TAUser') {
          aContent.forEach(function (oControl) {
            if (oControl.isA('sap.m.Button') && oControl.getText() === 'Add New') {
              oControl.setVisible(false); // Hide the button
            }
          });

          const data = that.getView().getModel(this.getListViewDataSourceModelName()).getData();
          const filteredArr = [];
          if (data && data.value) {
            data.value.forEach((element) => {
              const filteredData = element.tactiondetail.filter((ele) => {
                return ele.emp_id_UserID !== null;
              });
              if (filteredData.length > 0) {
                filteredArr.push(element);
              }
            });
          }

          that.getView().getModel(this.getListViewDataSourceModelName()).setData({ value: filteredArr });
        }
      },

      handelStatusModel: async function () {
        await this.createNewModelUsingAPI('GET', '/odata/v4/stoneman-ta/PrjStatusMaster', '', 'pg1lvSelectProjStatusModel');
        let myModel = this.getView().getModel('pg1lvSelectProjStatusModel').getData();
        const blankItem = {
          prj_id: '',
          prjstatus_code: '',
          prjstatus_name: 'Select'
        };
        myModel.value.unshift(blankItem);
        this.getView().getModel('pg1lvSelectProjStatusModel').setData(myModel);
        this.populateSelect('pg1lvSelectProjStatus', 'pg1lvSelectProjStatusModel', 'value', 'prjstatus_code', 'prjstatus_name');
      },

      handelProjectTemplate: async function () {
        await this.createNewModelUsingAPI(
          'GET',
          '/sap/opu/odata/sap/API_ENTERPRISE_PROJECT_SRV/A_EnterpriseProject',
          '',
          'pg1lvSelectProjTemplateModel'
        );
        let myModel = this.getView().getModel('pg1lvSelectProjTemplateModel').getData();
        const blankObject = {
          __metadata: {
            id: '',
            uri: '',
            type: '',
            etag: ''
          },
          ProjectUUID: '',
          ProjectInternalID: '',
          Project: '',
          ProjectDescription: '',
          EnterpriseProjectType: '',
          PriorityCode: '',
          ProjectStartDate: '',
          ProjectEndDate: '',
          ProcessingStatus: '',
          ResponsibleCostCenter: '',
          ProfitCenter: '',
          ProjectManagerUUID: '',
          ProjectProfileCode: '',
          FunctionalArea: '',
          CompanyCode: '',
          ControllingArea: '',
          Plant: '',
          Location: '',
          TaxJurisdiction: '',
          ProjectCurrency: '',
          AvailabilityControlProfile: '',
          AvailabilityControlIsActive: false,
          FunctionalLocation: '',
          IsBillingRelevant: false,
          EntProjIsMultiSlsOrdItmsEnbld: false,
          LastChangeDateTime: '',
          InvestmentProfile: '',
          YY1_Category1_PPH: '',
          YY1_NoofDays_PPH: '',
          to_EnterpriseProjectElement: {
            __deferred: {
              uri: ''
            }
          },
          to_EntProjBlkFunc: {
            __deferred: {
              uri: ''
            }
          },
          to_EntProjectPublicSector: {
            __deferred: {
              uri: ''
            }
          }
        };
        myModel.d.results.unshift(blankObject);
        this.getView().getModel('pg1lvSelectProjTemplateModel').setData(myModel);
        this.populateSelect(
          'pg1lvCflProjTemp',
          'pg1lvSelectProjTemplateModel',
          'd/results',
          'ProjectUUID',
          'ProjectDescription,Project,YY1_Category1_PPH,YY1_NoofDays_PPH'
        );
      },

      cflForTahno: async function () {
        this.setCflTitle('Time And Action List');
        //  this.setCflDataSourceURL("/odata/v4/stoneman-ta/Tactionheader");
        await this.createNewModelUsingAPI(
          'GET',
          '/odata/v4/stoneman-ta/Tactionheader',
          '',
          this.getCflListViewDataSourceModelName()
        );
        this.setCflDisplayColumns(['T&A No.']);
        this.setCflDataColumns(['tah_no']);
        this.setCflValueAndDisplay('', '', 'pg1lvCflTahNo', 'tah_no');
        this.setCflSearchProperty('tah_no');
        this.showCfl('pg1lvCflTahNo', this.getCflListViewDataSourceModelName(), 'value');
      },

      cflForSoNo: async function () {
        this.setCflTitle('Sales Order List');
        //  this.setCflDataSourceURL("/odata/v4/stoneman-ta/Tactionheader");
        // await this.createNewModelUsingAPI(
        //   'GET',
        //   '/sap/opu/odata/sap/YY1_SALESORDER_BYCUSTOMER_CDS/YY1_SALESORDER_BYCUSTOMER',
        //   '',
        //   this.getCflListViewDataSourceModelName()
        // );
        await this.createNewModelUsingAPI(
          'GET',
          `/sap/opu/odata/sap/YY1_SALESORDER_BYCUSTOMER_CDS/YY1_SALESORDER_BYCUSTOMER?$filter=OverallSDProcessStatus eq 'A'`,
          '',
          this.getCflListViewDataSourceModelName()
        );
        this.setCflDisplayColumns(['SO No.', 'Customer Code', 'Customer Name', 'Sales Order Date', 'SO Delivey Date']);
        this.setCflDataColumns([
          'SalesOrder',
          'SoldToParty',
          'CustomerName',
          new sap.m.Text({
            text: { path: this.getCflListViewDataSourceModelName() + '>SalesOrderDate', formatter: this.formatDate }
          }),
          new sap.m.Text({
            text: { path: this.getCflListViewDataSourceModelName() + '>RequestedDeliveryDate', formatter: this.formatDate }
          })
        ]);
        this.setCflValueAndDisplay('', '', 'pg1lvCflSono', 'SalesOrder');
        this.setCflSearchProperty('SalesOrder');
        this.showCfl('pg1lvCflSono', this.getCflListViewDataSourceModelName(), 'd/results');
      },

      cflForProjTemp: async function () {
        this.setCflTitle('Project Template List');
        //  this.setCflDataSourceURL("/odata/v4/stoneman-ta/Tactionheader");
        await this.createNewModelUsingAPI(
          'GET',
          '/sap/opu/odata/sap/API_ENTERPRISE_PROJECT_SRV/A_EnterpriseProject',
          '',
          this.getCflListViewDataSourceModelName()
        );
        this.setCflDisplayColumns(['Project Template Code', 'Project Template Description', 'Category', 'No. of Days']);
        this.setCflDataColumns(['Project', 'ProjectDescription', 'YY1_Category1_PPH', 'YY1_NoofDays_PPH']);
        this.setCflValueAndDisplay('', '', 'pg1lvCflProjTemp', 'ProjectDescription', 'ProjectUUID');
        this.setCflSearchProperty('Project');
        this.showCfl(
          'pg1lvCflProjTemp',
          this.getCflListViewDataSourceModelName(),
          'd/results',
          this.onConfirmForProjTemplate.bind(this),
          this.onCancelForProjTemplate.bind(this)
        );
      },

      onConfirmForProjTemplate: function () {
        // let x = this.getCflObject();
        // let y = this.getView().getModel(this.getEntryFormDataSourceModelName());
      },

      onCancelForProjTemplate: function () { },

      dateForStartDate: function () { },

      selectForProjStatus: function () { },

      onPressOfListViewExportToExcelButton: async function () {
        await this.createNewModelUsingAPI(
          'GET',
          `/odata/v4/stoneman-ta/Tactionheader?$expand=tactiondetail($filter=emp_id_UserID eq ${this.loginInfo.UserID})`,
          '',
          'pg1lvListExportToExcelModel'
        );
        //this.oTable = that.byId('TASearchTable');
        // oRowBinding = this.oTable.getBinding('items');
        //var aData = oRowBinding.getModel().getProperty(oRowBinding.getPath());

        const data = that.getView().getModel('pg1lvListExportToExcelModel').getData();
        data.value.forEach((element) => {
          element.tah_sodeldate = formatter.getDateFromatIn_ddMMyyyy(element.tah_sodeldate);
        });
        data.value.sort(function (a, b) {
          return b.tah_no - a.tah_no; // For descending order
        });
        const aData = data['value'];

        const aCols = that.createColumnConfig();

        const oSettings = {
          workbook: {
            columns: aCols,
            hierarchyLevel: 'Level'
          },
          dataSource: aData,
          fileName: 'Time And Action List Sheet.xlsx',
          worker: false // We need to disable worker because we are using a MockServer as OData Service
        };

        const oSheet = new Spreadsheet(oSettings);
        oSheet.build().finally(function () {
          oSheet.destroy();
        });
      },

      createColumnConfig: function () {
        const aCols = [];

        aCols.push({
          label: 'T&A No.',
          property: 'tah_no',
          type: this.EdmType.String
        });

        aCols.push({
          label: 'SO No',
          property: 'tah_sono',
          type: this.EdmType.String,
          width: 20,
          wrap: true
        });

        aCols.push({
          label: 'Item Code',
          property: 'tah_itemcode',
          type: this.EdmType.String
        });

        aCols.push({
          label: 'Item Description',
          property: 'tah_itemdesc',
          type: this.EdmType.String,
          width: 20,
          wrap: true
        });

        aCols.push({
          label: 'Project Template Name',
          property: 'tah_prjtemplnme',
          type: this.EdmType.String,
          width: 20,
          wrap: true
        });

        aCols.push({
          label: 'Customer Name',
          property: 'tah_customername',
          type: this.EdmType.String,
          wrap: true
        });

        aCols.push({
          label: 'Delivery Date',
          property: 'tah_sodeldate',
          type: this.EdmType.String,
          width: 15
        });

        return aCols;
      }
    });
  }
);

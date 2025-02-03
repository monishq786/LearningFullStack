sap.ui.define(
  [
    'core/generic/genericentryform',
    'stoneman/modone/model/formatter',
    'stoneman/modone/model/JSONLoader',
    'sap/m/MessageToast',
    'stoneman/modone/constants/Constant',
    'stoneman/modone/constants/FormMode'
  ],
  function (genericentryform, formatter, JSONLoader, MessageToast, Constant, FormMode) {
    'use strict';
    let that;
    return genericentryform.extend('modonecontroller.timeandactionentryform', {
      onInit: function () {
        genericentryform.prototype.onInit.apply(this, arguments);
        that = this;
      },

      onBeforeShow: async function (oEvent) {
        //if (!oEvent.isBack) {
        // This block will only execute except backward navigation.
        this.identifyFormMode(oEvent);
        //this.validateAccess();
        this.initialize();
        this.setEntryFormDataSourceURLForEditMode(
          '/odata/v4/stoneman-ta/Tactionheader(' + this.getListViewEditPropertyValue() + ')?$expand=tactiondetail'
        );
        await this.showEntryForm();

        await this.populateProjectStatus();
        await this.populateTaskStatus();
        await this.populateProjectTemplate();
        await this.populateFactoryCalendar();
        await this.populateTaskStatus();
        this.setInitialData();
        this.setDatePickerInputNonEditable();

        const oScrollContainer = this.getView().byId('scrollContainerTnA');
        const oDomRef = oScrollContainer.getDomRef();

        if (oDomRef) {
          // Apply min and max height dynamically
          oDomRef.style.minHeight = 'auto';
          oDomRef.style.maxHeight = '450px';
          oDomRef.style.overflow = 'auto'; // Ensure scrolling
        }
      },

      initialize: async function () {
        this.setPageId('taef');
        this.setFormTitle('Time And Action Entry Form');
        this.setBackwardRoute('RouteTimeAndActionListView');

        this.roleInfo = this.getRoleDetails();
        this.loginInfo = this.getLoginInfo();
        this.formMode = this.getFormMode();
        this.screen = this.formMode === FormMode.CREATE ? 'add' : 'edit';

        let urlToSaveUpdate;
        if (this.roleInfo['RoleCode'] === Constant.TNA_ROLE.TAADMIN) {
          if (this.screen === 'add') {
            urlToSaveUpdate = '/odata/v4/stoneman-ta/Tactionheader';
          } else {
            urlToSaveUpdate = '/odata/v4/stoneman-ta/Tactionheader(' + this.getListViewEditPropertyValue() + ')';
          }
        } else {
          urlToSaveUpdate = '/odata/v4/stoneman-ta/Tactiondetail';
        }
        this.setEntryFormDataSourceURLToAddData(urlToSaveUpdate);
        this.setEntryFormDataSourceURLToUpdateData(urlToSaveUpdate);
      },

      setInitialData: function () {
        this.filterTAUserDataBasedOnEmpUserId();
        if (this.screen === 'edit') {
          this.setDataOnEdit();
        } else {
          const oPath = jQuery.sap.getModulePath('stoneman', '/model/TA_SearchHeaderModelGen.json');
          const oModel = new sap.ui.model.json.JSONModel(oPath);
          this.getView().setModel(oModel, this.getEntryFormDataSourceModelName());
        }
        this.disableHeaderFields();
      },

      filterTAUserDataBasedOnEmpUserId: function () {
        if (this.roleInfo['RoleCode'] === Constant.TNA_ROLE.TAUSER) {
          const data = this.getView().getModel(this.getEntryFormDataSourceModelName()).getData();
          const filteredDetailData = data.tactiondetail.filter((ele) => {
            return ele.emp_id_UserID !== null && ele.emp_id_UserID === this.loginInfo['UserID'];
          });
          data['tactiondetail'] = filteredDetailData;
          that.getView().getModel(this.getEntryFormDataSourceModelName()).setData(data);
        }
      },

      growingAccess: function () {
        // Flag to detect if the "More" button was clicked
        this.bMoreButtonClicked = false;

        // Get reference to the growing table
        const oTable = this.byId('TATable_EntryForm');

        // Attach handler to growingStarted (optional)
        oTable.attachGrowingStarted(function () {
          this.bMoreButtonClicked = true; // "More" button was clicked
        });
        // Attach to the growingFinished event
        // oTable.attachGrowingFinished(fnGrowingFinishedHandler);
        // var fnGrowingFinishedHandler = function(oEvent) {
        //     // Your existing growingFinished event logic here
        //     that.onMoreButtonPress(oEvent);
        // };
        oTable.attachGrowingFinished(function (oEvent) {
          // attachGrowingFinished
          // Check if this was triggered by user interaction with the "More" button
          if (this.bMoreButtonClicked) {
            if (oTable.getGrowing()) {
              // Your growing finished logic

              that.onMoreButtonPress(oEvent);
            }
            // Reset flag after handling
            this.bMoreButtonClicked = false;
          }
        });

        // Add press event for "More" button if you have access to it
        // var oMoreButton = oTable.getAggregation("_growerButton");
        // if (oMoreButton) {
        //     oMoreButton.attachPress(function (oEvent) {
        //         console.log("More button clicked!");
        //         // Handle the logic for "More" button press here
        //         that.onMoreButtonPress(oEvent);
        //     });
        // }
      },

      setDatePickerInputNonEditable: function () {
        const oDatePicker = this.getView().byId('START_DATE_EntryForm');
        // Disable keyboard input
        oDatePicker.addEventDelegate({
          onAfterRendering: function () {
            const $input = oDatePicker.$().find('input');
            $input.attr('readonly', 'readonly');
          }
        });

        //Actual Start Date
        const oDatePickerASDT = this.getView().byId('ACT_START_DATE_EntryForm');
        oDatePickerASDT.addEventDelegate(
          {
            onAfterRendering: function () {
              const oDateInner = this.$().find('.sapMInputBaseInner');
              const oID = oDateInner[0].id;
              $('#' + oID).attr('disabled', 'disabled');
            }
          },
          oDatePickerASDT
        );

        //Actual End Date
        const oDatePickerAEDT = this.getView().byId('ACT_END_DATE_EntryForm');
        oDatePickerAEDT.addEventDelegate(
          {
            onAfterRendering: function () {
              const oDateInner = this.$().find('.sapMInputBaseInner');
              const oID = oDateInner[0].id;
              $('#' + oID).attr('disabled', 'disabled');
            }
          },
          oDatePickerAEDT
        );
      },

      onLiveChange: function (oEvent) {
        // Prevent user from typing into the input field
        const oInput = oEvent.getSource();
        oInput.setValue(oInput.getBinding('value').getValue()); // Reset to the bound value
      },

      setDataOnEdit: async function () {
        if (this.screen === 'edit') {
          const y = this.getView().getModel(this.getEntryFormDataSourceModelName()).getData();
          const tah_sodeldate = this.getDateFromString(y.tah_sodeldate);
          const tah_sodate = this.getDateFromString(y.tah_sodate);
          const datesDiff = this.getDiffBetweenTwoDatesInDays(tah_sodeldate, tah_sodate);
          y.sodatediff = datesDiff;

          const sortedChildList = this.sortLineLevelDataDayWise(y.tactiondetail);
          const indexedChildList = this.setIndexSrnoInList(sortedChildList);

          this.getEmployeesForCostCenter(indexedChildList).then(async (empResponsible) => {
            const finalListWithEmplList = await this.setEmployeesForSelection(indexedChildList, empResponsible);
            y.tactiondetail = finalListWithEmplList;

            this.getView().getModel(this.getEntryFormDataSourceModelName()).setData(y);

            this.enableDisableLineLevelControls();
            if (this.roleInfo['RoleCode'] === Constant.TNA_ROLE.TAUSER) {
              //  let y = this.getView().getModel(this.getEntryFormDataSourceModelName()).getData();
              this._determineEditableRow(y);
            }
          });
        }
      },

      _determineEditableRow: function (aData) {
        // var oModel = this.getView().getModel();
        // var aData = oModel.getProperty("/data");

        // Loop through data to find the editable row based on date sequence logic
        let lastEditableIndex = -1;
        for (let i = 0; i < aData.tactiondetail.length; i++) {
          if (aData.tactiondetail[i].tahd_tskstatuscode !== 'CL') {
            // Set the first row that is not closed as editable
            lastEditableIndex = i;
            break;
          }
        }

        // Update the model to mark the editable row
        for (let j = 0; j < aData.tactiondetail.length; j++) {
          if (j === lastEditableIndex) {
            aData.tactiondetail[j].editable = true;
          } else {
            aData.tactiondetail[j].editable = false;
          }
        }

        const oTable = this.byId('TATable_EntryForm');

        // Get the items (rows) in the table
        const aItems = oTable.getItems();
        for (let k = 0; k < aData.tactiondetail.length; k++) {
          if (k < aItems.length) {
            const aCells = aItems[k].getCells();
            // Loop through each cell
            aCells.forEach(function (oCell) {
              // Check if the cell is an input control or any control that has an 'editable' property
              const sControlId = oCell.getId();
              if (sControlId.includes('TaskStatus_EntryForm') && typeof oCell.setEditable === 'function') {
                // Check if the control has the setEnabled method and is in the response
                if (aData.tactiondetail[k].editable) {
                  oCell.setEditable(true); // Set the enabled state based on the API response
                } else {
                  oCell.setEditable(false); // Set the enabled state based on the API response
                }
              }
              if (sControlId.includes('UserComment') && typeof oCell.setEditable === 'function') {
                // Check if the control has the setEnabled method and is in the response
                if (aData.tactiondetail[k].editable) {
                  oCell.setEditable(true); // Set the enabled state based on the API response
                } else {
                  oCell.setEditable(false); // Set the enabled state based on the API response
                }
              }
              if (sControlId.includes('ACT_START_DATE_EntryForm') && typeof oCell.setEditable === 'function') {
                // Check if the control has the setEnabled method and is in the response
                if (aData.tactiondetail[k].editable) {
                  oCell.setEditable(true); // Set the enabled state based on the API response
                } else {
                  oCell.setEditable(false); // Set the enabled state based on the API response
                }
              }
              if (sControlId.includes('ACT_END_DATE_EntryForm') && typeof oCell.setEditable === 'function') {
                // Check if the control has the setEnabled method and is in the response
                if (aData.tactiondetail[k].editable) {
                  oCell.setEditable(true); // Set the enabled state based on the API response
                } else {
                  oCell.setEditable(false); // Set the enabled state based on the API response
                }
              }
            });
          }
        }

        this.getView().getModel(this.getEntryFormDataSourceModelName()).setData(aData);
      },

      disableHeaderFields: function () {
        this.byId('SO_LINEITEM_NO_EntryForm').setEditable(false);
        this.byId('PROJECT_TEMPLATE_EntryForm').setEditable(false);
        this.byId('START_DATE_EntryForm').setEditable(false);

        if (this.screen === 'edit') {
          if (that.roleInfo['RoleCode'] === Constant.TNA_ROLE.TAUSER) {
            this.byId('PROJECT_STATUS_EntryForm').setEditable(false);
          }
          this.byId('SO_NO_EntryForm').setEditable(false);
        } else {
          this.byId('PROJECT_STATUS_EntryForm').setEditable(true);
          this.byId('SO_NO_EntryForm').setEditable(true);
        }
      },

      onMoreButtonPress: function () {
        // Handle the growing (More button) click event here
        this.enableDisableLineLevelControls();
        if (this.roleInfo['RoleCode'] === Constant.TNA_ROLE.TAUSER) {
          const y = this.getView().getModel(this.getEntryFormDataSourceModelName()).getData();
          this._determineEditableRow(y);
        }
      },

      enableDisableLineLevelControls: function () {
        // Get the table by its ID
        const oTable = this.byId('TATable_EntryForm');

        // Get the items (rows) in the table
        const aItems = oTable.getItems();

        // Loop through each row
        aItems.forEach(function (oItem) {
          // Get all cells in the current row
          const aCells = oItem.getCells();

          // Loop through each cell
          aCells.forEach(function (oCell) {
            // Check if the cell is an input control or any control that has an 'editable' property
            const sControlId = oCell.getId();
            let value;

            if (sControlId.includes('TaskStatus_EntryForm')) {
              if (that.screen === 'edit') {
                value = that.getView().byId(sControlId).getSelectedKey();
                if (value === 'CL') {
                  if (typeof aCells[11].setEditable === 'function') {
                    //emp repsonsible
                    aCells[11].setEditable(false);
                  }
                  if (typeof aCells[8].setEditable === 'function') {
                    //act start
                    aCells[8].setEditable(false);
                  }
                  if (typeof aCells[9].setEditable === 'function') {
                    //act end
                    aCells[9].setEditable(false);
                  }
                  if (typeof aCells[12].setEditable === 'function') {
                    //status
                    aCells[12].setEditable(false);
                  }
                  if (typeof aCells[13].setEditable === 'function') {
                    //user comment
                    aCells[13].setEditable(false);
                  }
                  if (that.roleInfo['RoleCode'] === Constant.TNA_ROLE.TAADMIN && typeof aCells[14].setEditable === 'function') {
                    //act user comment
                    aCells[14].setEditable(false);
                  }
                }
              }
              if (that.roleInfo['RoleCode'] === Constant.TNA_ROLE.TAADMIN && typeof oCell.setEditable === 'function') {
                // Check if the control has the setEnabled method and is in the response
                oCell.setEditable(false); // Set the enabled state based on the API response
              }
            }

            if (that.roleInfo['RoleCode'] === Constant.TNA_ROLE.TAADMIN) {
              if (sControlId.includes('UserComment') && typeof oCell.setEditable === 'function') {
                // Check if the control has the setEnabled method and is in the response
                oCell.setEditable(false); // Set the enabled state based on the API response
              }
            } else {
              //user
              if (sControlId.includes('EmprResp_EntryForm') && typeof oCell.setEditable === 'function') {
                // Check if the control has the setEnabled method and is in the response
                oCell.setEditable(false); // Set the enabled state based on the API response
              }

              if (sControlId.includes('AdminComment') && typeof oCell.setEditable === 'function') {
                // Check if the control has the setEnabled method and is in the response
                oCell.setEditable(false); // Set the enabled state based on the API response
              }
            }
          });
        });
      },

      populateProjectStatus: async function () {
        await this.createNewModelUsingAPI('GET', '/odata/v4/stoneman-ta/PrjStatusMaster', '', 'taefSelectProjStatusModel');
        this.populateSelect('PROJECT_STATUS_EntryForm', 'taefSelectProjStatusModel', 'value', 'prjstatus_code', 'prjstatus_name');
      },

      populateTaskStatus: async function () {
        await this.createNewModelUsingAPI('GET', '/odata/v4/stoneman-ta/TaskStatusMaster', '', 'taefTaskStatusModel');
        this.populateSelect('TaskStatus_EntryForm', 'taefTaskStatusModel', 'value', 'tskstatus_code', 'tskstatus_name');
      },

      populateProjectTemplate: async function () {
        await this.createNewModelUsingAPI(
          'GET',
          '/sap/opu/odata/sap/API_ENTERPRISE_PROJECT_SRV/A_EnterpriseProject',
          '',
          'taefEnterpriseProjectModel'
        );
      },

      populateFactoryCalendar: async function () {
        await this.createNewModelUsingAPI(
          'GET',
          "/sap/opu/odata/sap/YY1_FACTORYCALENDAR_CDS/YY1_FactoryCalendar('IN')",
          '',
          'taefFactoryCalendarModel'
        );
      },

      cflForSoNo: async function () {
        this.setCflTitle('Sales Order List');
        // /sap/opu/odata/sap/API_SALES_ORDER_SRV/A_SalesOrder
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

        this.setCflDisplayColumns(['SO. No.', 'Customer Code', 'Customer Name', 'Sales Order Date', 'SO Delivey Date']);
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

        this.setCflValueAndDisplay('/tah_sono', 'SalesOrder', '', '');
        this.setCflSearchProperty('SalesOrder');
        this.showCfl(
          'taefCflSono',
          this.getCflListViewDataSourceModelName(),
          'd/results',
          this.onConfirmForSoNo.bind(this),
          this.onCancelForSoNo.bind(this)
        );
      },

      onConfirmForSoNo: function () {
        const x = this.getCflObject();
        const y = this.getView().getModel(this.getEntryFormDataSourceModelName());

        //get dates diff
        const soDate = this.convertS4DateToRegularDate(x.SalesOrderDate);
        const soDelDate = this.convertS4DateToRegularDate(x.RequestedDeliveryDate);
        const datesDiff = this.getDiffBetweenTwoDatesInDays(soDelDate, soDate);

        const oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({ pattern: 'dd-MM-yyyy' });
        y.setProperty('/tah_sodate', oDateFormat.format(soDate));
        y.setProperty('/tah_sodeldate', oDateFormat.format(soDelDate));
        y.setProperty('/sodatediff', datesDiff);
        y.setProperty('/tah_customercode', x.SoldToParty);
        y.setProperty('/tah_customername', x.CustomerName);

        that.byId('SO_LINEITEM_NO_EntryForm').setEditable(true);
      },

      onCancelForSoNo: function () {},

      cflForSoLineNo: async function () {
        this.setCflTitle('Sales Order Item List');
        const x = this.getView().getModel(this.getEntryFormDataSourceModelName()).getProperty('/tah_sono');
        // /sap/opu/odata/sap/API_SALES_ORDER_SRV/A_SalesOrderItem?$filter=SalesOrder eq 'EXP0000018' and SDProcessStatus eq 'A'
        await this.createNewModelUsingAPI(
          'GET',
          `/sap/opu/odata/sap/API_SALES_ORDER_SRV/A_SalesOrderItem?$filter=SalesOrder eq '${x}' and SDProcessStatus eq 'A'`,
          '',
          this.getCflListViewDataSourceModelName()
        );
        // await this.createNewModelUsingAPI(
        //   'GET',
        //   "/sap/opu/odata/sap/API_SALES_ORDER_SRV/A_SalesOrder('" +
        //     x +
        //     "')?$expand=to_Item&$select=to_Item/SalesOrder,to_Item/SalesOrderItem,to_Item/Material,to_Item/AdditionalMaterialGroup1,to_Item/RequestedQuantity,to_Item/RequestedQuantityUnit,to_Item/SalesOrderItemText,SalesOrder,SoldToParty",
        //   '',
        //   this.getCflListViewDataSourceModelName()
        // );
        // await this.createNewModelUsingAPI(
        //   'GET',
        //   `/sap/opu/odata4/sap/api_salesorder/srvd_a2x/sap/salesorder/0001/SalesOrder('` +
        //     x +
        //     `')?$expand=_Item($filter=SDProcessStatus  eq 'A')`,
        //   '',
        //   this.getCflListViewDataSourceModelName()
        // );
        this.setCflDisplayColumns(['SO. Line Item No', 'SO. LINE ITEM NAME', 'SO. NO.', 'Category']);
        this.setCflDataColumns(['SalesOrderItem', 'SalesOrderItemText', 'SalesOrder', 'AdditionalMaterialGroup1']);
        this.setCflValueAndDisplay('/tah_itemdesc', 'SalesOrderItemText', '', '');
        this.setCflSearchProperty('SalesOrderItem');
        this.showCfl(
          'taefCflSoLineNo',
          this.getCflListViewDataSourceModelName(),
          'd/results',
          this.onConfirmForSoLineNo.bind(this),
          this.onCancelForSoLineNo.bind(this)
        );
      },

      onConfirmForSoLineNo: function () {
        const x = this.getCflObject();
        const y = this.getView().getModel(this.getEntryFormDataSourceModelName());
        y.setProperty('/tah_soitemcategory', x.AdditionalMaterialGroup1);
        y.setProperty('/tah_lineno', x.SalesOrderItem);
        y.setProperty('/tah_itemcode', x.SalesOrderItem);
        y.setProperty('/tah_itemdesc', x.SalesOrderItemText);
        y.setProperty('/tah_plant', x.ProductionPlant);
        that.byId('PROJECT_TEMPLATE_EntryForm').setEditable(true);

        this.findClosestTemplate();
      },

      onCancelForSoLineNo: function () {},

      cflForProjectTemplate: async function () {
        this.setCflTitle('Project Template');
        this.setCflDisplayColumns(['Project Template Code', 'Project Template Description', 'Category', 'No. of Days']);
        this.setCflDataColumns(['Project', 'ProjectDescription', 'YY1_Category1_PPH', 'YY1_NoofDays_PPH']);
        this.setCflValueAndDisplay('/tah_prjtemplname', 'ProjectDescription', '', '');
        this.setCflSearchProperty('ProjectDescription');
        this.showCfl(
          'taefCflProjTemp',
          'taefEnterpriseProjectModel',
          'd/results',
          this.onConfirmForProjectTemplate.bind(this),
          this.onCancelForProjectTemplate.bind(this)
        );
      },

      onConfirmForProjectTemplate: async function () {
        const x = this.getCflObject();
        const y = this.getView().getModel(this.getEntryFormDataSourceModelName());
        y.setProperty('/tah_prjtemplno', x.ProjectUUID);
        y.setProperty('/tah_prjtemplnme', x.ProjectDescription);
        that.byId('START_DATE_EntryForm').setEditable(true);

        this.populateChildDataInTable(x.ProjectUUID, x.ProjectManagerUUID);
      },

      onCancelForProjectTemplate: function () {},

      cflForEmployeResponsible: async function () {
        this.setCflTitle('Project Template');
        this.setCflDisplayColumns(['Project Template Code', 'Project Template Description', 'Category', 'No. of Days']);
        this.setCflDataColumns(['Project', 'ProjectDescription', 'YY1_Category1_PPH', 'YY1_NoofDays_PPH']);
        this.setCflValueAndDisplay('/tah_prjtemplname', 'ProjectDescription', '', '');
        this.setCflSearchProperty('ProjectDescription');
        this.showCfl(
          'taefCflProjTemp',
          'taefEnterpriseProjectModel',
          'd/results',
          this.onConfirmForProjectTemplate.bind(this),
          this.onCancelForProjectTemplate.bind(this)
        );
      },

      onConfirmForEmployeResponsible: async function () {
        const x = this.getCflObject();
        const y = this.getView().getModel(this.getEntryFormDataSourceModelName());
        y.setProperty('/tah_prjtemplno', x.ProjectUUID);
        y.setProperty('/tah_prjtemplnme', x.ProjectDescription);
        that.byId('START_DATE_EntryForm').setEditable(true);

        this.populateChildDataInTable(x.ProjectUUID, x.ProjectManagerUUID);
      },

      onCancelForEmployeResponsible: function () {},

      cflForEmpResponsible: async function (oEvent) {
        this.Index = oEvent.oSource.oParent.oParent.indexOfItem(oEvent.oSource.oParent);

        this.setCflTitle('Employee Responsible List');
        const data = this.getView().getModel(this.getEntryFormDataSourceModelName()).getData();
        this.getView()
          .getModel(this.getCflListViewDataSourceModelName())
          .setData(data.tactiondetail[this.Index]['tactiondetailEmpAssign']);
        this.setCflDisplayColumns(['Employee Code', 'Employee Name']);
        this.setCflDataColumns(['emp_code', 'emp_name']);

        this.setCflValueAndDisplay('/emp_name', 'emp_name', '', '');
        this.setCflSearchProperty('emp_name');

        this.showCfl(
          'EmprResp_EntryForm',
          this.getCflListViewDataSourceModelName(),
          '',
          this.onConfirmForEmpResp.bind(this),
          this.onCancelForEmpResp.bind(this)
        );
      },

      onConfirmForEmpResp: function () {
        const x = this.getCflObject();
        const y = this.getView().getModel(this.getEntryFormDataSourceModelName());
        y.setProperty(`/tactiondetail/${this.Index}/emp_id_UserID`, x.emp_id);
        y.setProperty(`/tactiondetail/${this.Index}/emp_code`, x.emp_code);
        y.setProperty(`/tactiondetail/${this.Index}/emp_name`, x.emp_name);
      },

      onCancelForEmpResp: function () {},

      filterData: function (arr, filterMainField, valueToCompare) {
        const filteredData = arr.filter((ele) => {
          return ele[filterMainField] === valueToCompare;
        });
        return filteredData;
      },

      //Find Closest Template as per the logic**********************************************************
      findClosestTemplate: function () {
        const y = this.getView().getModel(this.getEntryFormDataSourceModelName());
        const dateDiffInDays = y.getProperty('/sodatediff');
        const category = y.getProperty('/tah_soitemcategory');

        //get template data
        const projTempData = this.getView().getModel('taefEnterpriseProjectModel').getData();
        let filteredTemplateData = this.filterTemplateBasedOnCategory(projTempData, category);
        filteredTemplateData = this.filterTemplateBasedOnDayDiff(filteredTemplateData, dateDiffInDays);

        if (filteredTemplateData.length === 1) {
          y.setProperty('/tah_prjtemplno', filteredTemplateData[0].ProjectUUID);
          y.setProperty('/tah_prjtemplnme', filteredTemplateData[0].ProjectDescription);
          that.byId('START_DATE_EntryForm').setEditable(true);

          this.populateChildDataInTable(filteredTemplateData[0].ProjectUUID, filteredTemplateData[0].ProjectManagerUUID);
        }
        // this.getView().getModel(this.getEntryFormDataSourceModelName()).setData(y.getData());
        this.getView()
          .getModel('taefEnterpriseProjectModel')
          .setData({ d: { results: filteredTemplateData } });
      },

      //Populate Child Data**********************************************************
      populateChildDataInTable: async function (ProjectUUID, ProjectManagerUUID) {
        await this.createNewModelUsingAPI(
          'GET',
          "/sap/opu/odata/sap/API_ENTERPRISE_PROJECT_SRV/A_EnterpriseProject(guid'" +
            ProjectUUID +
            "')?$expand=to_EnterpriseProjectElement",
          '',
          'childListModel'
        );

        const data = this.getView().getModel('childListModel').getData();

        const arrMain = data['d']['to_EnterpriseProjectElement']['results'];

        const filteredDays = this.filterData(arrMain, 'ParentObjectUUID', ProjectManagerUUID);
        const finalArr = [];

        filteredDays.forEach((elementDays) => {
          const filteredDept = this.filterData(arrMain, 'ParentObjectUUID', elementDays.ProjectElementUUID);

          filteredDept.forEach((elementDept) => {
            const filteredTask = this.filterData(arrMain, 'ParentObjectUUID', elementDept.ProjectElementUUID);

            filteredTask.forEach((elementTask) => {
              const plStartDate =
                elementTask.PlannedStartDate !== null ? this.convertS4DateToRegularDate(elementTask.PlannedStartDate) : null;
              const plEndDate =
                elementTask.PlannedEndDate !== null ? this.convertS4DateToRegularDate(elementTask.PlannedEndDate) : null;
              const datesDiffInDays =
                plEndDate !== null && plEndDate !== null ? this.getDiffBetweenTwoDatesInDays(plEndDate, plStartDate) : null;

              const dict = {
                srno: null,
                tahd_id: null,
                tah_id: null,
                tahd_depcode: elementDept.ProjectElementUUID,
                tahd_depname: elementDept.ProjectElementDescription.replace('"', '').replace('"', ''),
                tahd_prjtaskid: elementTask.ProjectElementUUID,
                tahd_prjtaskname: elementTask.ProjectElementDescription.replace('"', '').replace('"', ''),
                tahd_noofdays: datesDiffInDays !== null ? Number(datesDiffInDays) + 1 : null,
                tahd_days: elementDays.ProjectElementDescription,
                tahd_plnstdate: null,
                tahd_plneddate: null,
                tahd_actstdate: null,
                tahd_acteddate: null,
                tahd_dldays: '0',
                tahd_addbyUserCode: null,
                tahd_addbyUsername: null,
                tahd_tskstatuscode: 'O',
                tahd_tskstatusdesc: 'Open',
                tahd_comments: null,
                tahd_rescostcentercode: elementTask.ResponsibleCostCenter,
                tahd_rescostcentername: elementTask.ResponsibleCostCenter,
                tactionheader_tah_id: ProjectUUID,
                emp_id_UserID: null,
                emp_code: null,
                emp_name: null,
                TaskType: elementTask.YY1_TaskType1_PTD === '' ? null : elementTask.YY1_TaskType1_PTD,
                DocumentType: elementTask.YY1_DocumentType1_PTD === '' ? null : elementTask.YY1_DocumentType1_PTD,
                APICode: elementTask.YY1_APICode1_PTD === '' ? null : elementTask.YY1_APICode1_PTD,
                tactiondetailEmpAssign: []
              };
              finalArr.push(dict);
            });
          });
        });

        //sort child list data day wise in ascending order
        const sortedChildList = this.sortLineLevelDataDayWise(finalArr);
        const indexedChildList = this.setIndexSrnoInList(sortedChildList);

        this.getEmployeesForCostCenter(indexedChildList).then(async (empResponsible) => {
          const finalListWithEmplList = await this.setEmployeesForSelection(finalArr, empResponsible);
          that.getView().getModel(this.getEntryFormDataSourceModelName()).setProperty('/tactiondetail', finalListWithEmplList);

          that.enableDisableLineLevelControls();
        });
      },

      getEmployeesForCostCenter: async function (finalArr) {
        //fetch unique cost centers
        const uniqueCostCenterList = this.filterDuplicateListDataToUniqueValues('tahd_rescostcentername', finalArr);

        if (uniqueCostCenterList !== undefined) {
          const empResponsible = [];
          const promises = [];
          uniqueCostCenterList.forEach((element) => {
            const promise = new Promise((resolve, reject) => {
              this.createNewModelUsingAPI(
                'GET',
                "/sap/opu/odata/sap/YY1_WORKFORCEPERSON_CDS/YY1_WorkforcePerson?$filter=CostCenter eq '" +
                  element.tahd_rescostcentername +
                  "'",
                '',
                'taefEmployeeResponsibleModel'
              )
                .then(() => {
                  const data = that.getView().getModel('taefEmployeeResponsibleModel').getData();
                  const arr = data['d']['results'];
                  empResponsible.push(...arr);
                  resolve(empResponsible); // Resolve the promise
                })
                .catch((error) => {
                  reject(error); // Reject the promise on error
                });
            });

            // Add the promise to the array
            promises.push(promise);
            /*const promise = new Promise(async (resolve, reject) => {
              await this.createNewModelUsingAPI(
                'GET',
                "/sap/opu/odata/sap/YY1_WORKFORCEPERSON_CDS/YY1_WorkforcePerson?$filter=CostCenter eq '" +
                  element.tahd_rescostcentername +
                  "'",
                '',
                'taefEmployeeResponsibleModel'
              );
              const data = that.getView().getModel('taefEmployeeResponsibleModel').getData();
              const arr = data['d']['results'];
              empResponsible.push(...arr);
              resolve(empResponsible); // Resolve the promise
            });*/

            // Add the promise to the array
            //promises.push(promise);
          });
          // Wait for all promises to resolve
          return Promise.all(promises).then(() => {
            // All API calls complete
            return empResponsible; // Return the collected data
          });
        }
      },

      setEmployeesForSelection: function (finalArr, empResponsible) {
        finalArr.forEach((element) => {
          const arrEmp = [];
          const filteredEmp = this.filterData(empResponsible, 'CostCenter', element.tahd_rescostcentername);
          filteredEmp.forEach((ele) => {
            const dict = {
              emp_id: ele.BusinessPartnerUUID,
              tah_id: null,
              tahdtl_id: null,
              emp_code: ele.BusinessPartner,
              emp_name: ele.BusinessPartnerFullName,
              tactiondetail_tahd_id: null
            };
            arrEmp.push(dict);
          });

          //for single employee, it should auto populate
          if (arrEmp.length === 1) {
            element.emp_id_UserID = arrEmp[0]['emp_id'];
            element.emp_code = arrEmp[0]['emp_code'];
            element.emp_name = arrEmp[0]['emp_name'];
          }
          // else {
          //     let objectToInsert = {
          //         emp_id: null,
          //         tah_id: null,
          //         tahdtl_id: null,
          //         emp_code: null,
          //         emp_name: "Select",
          //         tactiondetail_tahd_id: null
          //     }
          //     arrEmp.splice(0, 0, objectToInsert);
          // }

          element.tactiondetailEmpAssign = arrEmp;
        });

        return finalArr;
      },

      sortLineLevelDataDayWise: function (arr) {
        if (arr) {
          arr.sort(function (a, b) {
            const dayA = parseInt(a.tahd_days.replace('Day ', ''));
            const dayB = parseInt(b.tahd_days.replace('Day ', ''));
            return dayA - dayB;
          });

          arr.sort((a, b) => new Date(a.tahd_plnstdate) - new Date(b.tahd_plnstdate));
        }
        return arr;
      },

      setIndexSrnoInList: function (arr) {
        if (arr !== undefined) {
          arr.map(function (currentValue, Index) {
            currentValue.srno = Index + 1;
          });
          return arr;
        }
      },

      filterDuplicateListDataToUniqueValues: function (filterKey, arrToFilter) {
        const key = filterKey;
        if (arrToFilter !== undefined) {
          const arrayUniqueByKey = [...new Map(arrToFilter.map((item) => [item[key], item])).values()];
          return arrayUniqueByKey;
        }
      },

      filterTemplateBasedOnCategory: function (arr, category) {
        const filteredTemplate = this.filterData(arr['d']['results'], 'YY1_Category1_PPH', category);
        return filteredTemplate;
      },

      filterTemplateBasedOnDayDiff: function (arr, target) {
        const arrPosDiffBetweenNums = [];
        arr.forEach((element) => {
          const diffDays = target - element['YY1_NoofDays_PPH'];
          element['tempDiff'] = diffDays;
          if (diffDays >= 0) {
            arrPosDiffBetweenNums.push(diffDays);
          }
        });
        const smallestPositiveNumberTemp = this.getSmallestPositiveNumber(arr, arrPosDiffBetweenNums);
        return smallestPositiveNumberTemp;
      },

      getSmallestPositiveNumber: function (array, arrDiffBetweenNums) {
        // Extract the 'value' property from the objects and filter positive numbers
        const positiveNumbers = array
          .map(function (obj) {
            return obj;
          })
          .filter(function (value) {
            return value.tempDiff > 0;
          });

        // Return the smallest number from the filtered array
        const min = Math.min.apply(null, arrDiffBetweenNums);
        const result = this.filterData(positiveNumbers, 'tempDiff', min);
        return result;
      },

      //Factory calendar methods *************************************************

      checkForFactoryCalendar: function (selectedDay) {
        let isWorking = -1;
        let daySelected = 'select';
        const oDataFC = this.getView().getModel('taefFactoryCalendarModel').getData()['d'];

        if (oDataFC !== undefined) {
          switch (selectedDay) {
            case 1: //monday
              daySelected = 'monday'; //0=holiday 1=working
              isWorking = Number(oDataFC.MondayIsWorkingDay) === 0 ? 0 : 1;
              break;
            case 2: //tuesday
              daySelected = 'tuesday';
              isWorking = Number(oDataFC.TuesdayIsWorkingDay) === 0 ? 0 : 1;
              break;
            case 3: //wednesday
              daySelected = 'wednesday';
              isWorking = Number(oDataFC.WednesdayIsWorkingDay) === 0 ? 0 : 1;
              break;
            case 4: //thursday
              daySelected = 'thursday';
              isWorking = Number(oDataFC.ThursdayIsWorkingDay) === 0 ? 0 : 1;
              break;
            case 5: //friday
              daySelected = 'friday';
              isWorking = Number(oDataFC.FridayIsWorkingDay) === 0 ? 0 : 1;
              break;
            case 6: //saturday
              daySelected = 'saturday';
              isWorking = Number(oDataFC.SaturdayIsWorkingDay) === 0 ? 0 : 1;
              break;
            case 0: //sunday
              daySelected = 'sunday';
              isWorking = Number(oDataFC.SundayIsWorkingDay) === 0 ? 0 : 1;
              break;
            default:
              break;
          }
        }
        return { isItWorking: isWorking, day: daySelected };
      },

      //handle click methods *****************************************************
      handleStartDateChange: function (oEvent) {
        //Header Start Date
        const oText = this.byId('START_DATE_EntryForm'),
          oDP = oEvent.getSource(),
          sValue = oEvent.getParameter('value'),
          bValid = oEvent.getParameter('valid');

        //  sValue = formatter.convertToTargetFormat(sValue, 'dd-MM-yyyy');
        const selectedDate = this.getDateFromString(sValue);

        let noOfWeekEnds;
        //check start date must not be less than so order date
        const SOOrderDate = this.byId('SO_Order_Date_EntryForm').getValue();
        const dtSOOrderDate = that.getDateFromString(SOOrderDate);

        //check for holiday
        const result = that.checkForFactoryCalendar(selectedDate.getDay());
        if (selectedDate < dtSOOrderDate) {
          this.byId('START_DATE_EntryForm').setValue(null);
          MessageToast.show('Start Date must not be less than SO order date');
        } else if (result['isItWorking'] === 0) {
          //holiday
          this.byId('START_DATE_EntryForm').setValue(null);
          MessageToast.show(Constant.CONST_MSG.PLEASE_SELECT_WORKING_DAY_DATE);
        } else {
          that
            .getView()
            .getModel(this.getEntryFormDataSourceModelName())
            .setProperty('/tah_startdate', formatter.getDateFromatIn_ddMMyyyy(selectedDate));

          //set planned start - end, actual start - end ***********************************

          const aData = that.getView().getModel(this.getEntryFormDataSourceModelName()).getData();

          for (let index = 0; index < aData['tactiondetail'].length; index++) {
            const element = aData['tactiondetail'][index];
            if (index === 0) {
              if (this.screen === 'add') {
                //set planned start date
                element.tahd_plnstdate = formatter.getDateFromatIn_ddMMyyyy(selectedDate);
                //set planned end date after adding days
                const NoOfDays = Number(element.tahd_noofdays);
                let edPlanningDt = this.manipulateDate(sValue, NoOfDays - 1, 'add'); //total days added

                //**************** */
                const st = this.getDateFromString(element.tahd_plnstdate);
                noOfWeekEnds = this.countweekoffdays(st, edPlanningDt);
                //var noOfWeekEnds = this.countWeekendDays(st, edPlanningDt);
                edPlanningDt = this.manipulateDate(formatter.getDateFromatIn_ddMMyyyy(edPlanningDt), noOfWeekEnds, 'add');

                edPlanningDt = that.checkForNextDateIsWeekOff(edPlanningDt);

                element.tahd_plneddate = formatter.getDateFromatIn_ddMMyyyy(edPlanningDt);

                //Set Actual Dates
                element.tahd_actstdate = element.tahd_plnstdate;
                element.tahd_acteddate = element.tahd_plneddate;
              } else {
                // only reset actual start end date in case of edit
                //set planned start date
                element.tahd_actstdate = formatter.getDateFromatIn_ddMMyyyy(selectedDate);
                //set planned end date after adding days
                const NoOfDays = Number(element.tahd_noofdays);
                let edActualDt = this.manipulateDate(sValue, NoOfDays - 1, 'add');

                //**************** */
                const st = this.getDateFromString(element.tahd_actstdate);
                noOfWeekEnds = this.countweekoffdays(st, edActualDt);
                // var noOfWeekEnds = this.countWeekendDays(st, edActualDt);
                edActualDt = this.manipulateDate(formatter.getDateFromatIn_ddMMyyyy(edActualDt), noOfWeekEnds, 'add');
                //**************** */

                edActualDt = that.checkForNextDateIsWeekOff(edActualDt);

                element.tahd_acteddate = formatter.getDateFromatIn_ddMMyyyy(edActualDt);
              }

              //get difference between actual end date and planned end date
              const dtfPlannedEndDate = this.getDateFromString(element.tahd_plneddate);

              //var strActualEndDate = element.tahd_acteddate;
              const dtfActualEndDate = this.getDateFromString(element.tahd_acteddate);

              const diffTimeDelay = dtfActualEndDate - dtfPlannedEndDate;
              if (diffTimeDelay >= 0) {
                const diffDaysDelay = Math.ceil(diffTimeDelay / (1000 * 60 * 60 * 24));
                element.tahd_dldays = diffDaysDelay.toString();
              }
            } else {
              if (this.screen === 'add') {
                //get previous index
                const PrevIndex = index - 1;
                //get previous data
                const dictPrevData = aData['tactiondetail'][PrevIndex];
                const prevDT = this.getDateFromString(dictPrevData.tahd_plneddate);
                let nextStartDate = this.manipulateDate(dictPrevData.tahd_plneddate, 1, 'add');
                noOfWeekEnds = this.countweekoffdays(prevDT, nextStartDate);
                nextStartDate = this.manipulateDate(formatter.getDateFromatIn_ddMMyyyy(nextStartDate), noOfWeekEnds, 'add');

                nextStartDate = that.checkForNextDateIsWeekOff(nextStartDate);

                element.tahd_plnstdate = formatter.getDateFromatIn_ddMMyyyy(nextStartDate);
                const NoOfDays = Number(element.tahd_noofdays);
                let dtAfterDaysAdded = this.manipulateDate(element.tahd_plnstdate, Number(NoOfDays - 1), 'add');
                //**************** */
                const st = this.getDateFromString(element.tahd_plnstdate);
                noOfWeekEnds = this.countweekoffdays(st, dtAfterDaysAdded);
                //var noOfWeekEnds = this.countWeekendDays(st, dtAfterDaysAdded);
                dtAfterDaysAdded = this.manipulateDate(formatter.getDateFromatIn_ddMMyyyy(dtAfterDaysAdded), noOfWeekEnds, 'add');
                //**************** */

                dtAfterDaysAdded = that.checkForNextDateIsWeekOff(dtAfterDaysAdded);

                element.tahd_plneddate = formatter.getDateFromatIn_ddMMyyyy(dtAfterDaysAdded);

                //Set Actual Dates***********************
                element.tahd_actstdate = element.tahd_plnstdate;
                element.tahd_acteddate = element.tahd_plneddate;
              } else {
                // only reset actual start end date in case of edit
                //get previous index
                const PrevIndex = index - 1;
                //get previous data
                const dictPrevData = aData['tactiondetail'][PrevIndex];
                const prevDT = this.getDateFromString(dictPrevData.tahd_acteddate);
                let nextStartDate = this.manipulateDate(dictPrevData.tahd_acteddate, 1, 'add');
                noOfWeekEnds = this.countweekoffdays(prevDT, nextStartDate);
                nextStartDate = this.manipulateDate(formatter.getDateFromatIn_ddMMyyyy(nextStartDate), noOfWeekEnds, 'add');

                nextStartDate = that.checkForNextDateIsWeekOff(nextStartDate);

                element.tahd_actstdate = formatter.getDateFromatIn_ddMMyyyy(nextStartDate);
                const NoOfDays = Number(element.tahd_noofdays);
                let dtAfterDaysAdded = this.manipulateDate(element.tahd_actstdate, Number(NoOfDays - 1), 'add');

                //**************** */
                const st = this.getDateFromString(element.tahd_actstdate);
                noOfWeekEnds = this.countweekoffdays(st, dtAfterDaysAdded);
                //var noOfWeekEnds = this.countWeekendDays(st, dtAfterDaysAdded);
                dtAfterDaysAdded = this.manipulateDate(formatter.getDateFromatIn_ddMMyyyy(dtAfterDaysAdded), noOfWeekEnds, 'add');
                //**************** */

                dtAfterDaysAdded = that.checkForNextDateIsWeekOff(dtAfterDaysAdded);

                element.tahd_acteddate = formatter.getDateFromatIn_ddMMyyyy(dtAfterDaysAdded);
              }

              //get difference between actual end date and planned end date
              //var strPlannedEndDate = element.tahd_plneddate;
              const dtfPlannedEndDate = this.getDateFromString(element.tahd_plneddate);

              //var strActualEndDate = element.tahd_acteddate;
              const dtfActualEndDate = this.getDateFromString(element.tahd_acteddate);

              const diffTimeDelay = dtfActualEndDate - dtfPlannedEndDate;
              if (diffTimeDelay >= 0) {
                const diffDaysDelay = Math.ceil(diffTimeDelay / (1000 * 60 * 60 * 24));
                element.tahd_dldays = diffDaysDelay.toString();
              }
            }
          }

          that.getView().getModel(this.getEntryFormDataSourceModelName()).setData(aData);
        }
      },

      handleActualStartDateChange: function (oEvent) {
        const oText = this.byId('ACT_START_DATE_EntryForm'),
          oDP = oEvent.getSource(),
          sValue = oEvent.getParameter('value'),
          bValid = oEvent.getParameter('valid');

        let noOfWeekEnds;
        let st;
        let NoOfDays;
        let dtfActualEndDate;

        const index = oEvent.oSource.oParent.oParent.indexOfItem(oEvent.oSource.oParent);

        const aData = that.getView().getModel(this.getEntryFormDataSourceModelName()).getData();
        const element = aData.tactiondetail[index];

        let PlannedStartDateFromString;
        if (this.screen === 'edit') {
          PlannedStartDateFromString = this.getDateFromString(formatter.getDateFromatIn_ddMMyyyy(element.tahd_plnstdate));
        } else {
          PlannedStartDateFromString = this.getDateFromString(element.tahd_plnstdate);
        }
        const ActualStartDateFromString = this.getDateFromString(sValue);

        const result = that.checkForFactoryCalendar(ActualStartDateFromString.getDay());
        if (result['isItWorking'] === 0) {
          //holiday
          element.tahd_actstdate = element.tahd_plnstdate;
          //reset end date too
          NoOfDays = Number(element.tahd_noofdays);

          if (this.screen === 'edit') {
            dtfActualEndDate = this.manipulateDate(
              formatter.getDateFromatIn_ddMMyyyy(element.tahd_plnstdate),
              NoOfDays - 1,
              'add'
            ); //sValue
            st = this.getDateFromString(formatter.getDateFromatIn_ddMMyyyy(element.tahd_plnstdate));
          } else {
            dtfActualEndDate = this.manipulateDate(element.tahd_plnstdate, NoOfDays - 1, 'add'); //sValue
            st = this.getDateFromString(element.tahd_plnstdate);
          }

          noOfWeekEnds = this.countweekoffdays(st, dtfActualEndDate); //ActualStartDateFromString
          dtfActualEndDate = this.manipulateDate(formatter.getDateFromatIn_ddMMyyyy(dtfActualEndDate), noOfWeekEnds, 'add');

          dtfActualEndDate = that.checkForNextDateIsWeekOff(dtfActualEndDate);
          // var IsWeekOffDay = that.checkForFactoryCalendar(dtfActualEndDate.getDay());
          // dtfActualEndDate=IsWeekOffDay['isItWorking']==0 ? this.manipulateDate(formatter.getDateFromatIn_ddMMyyyy(dtfActualEndDate), 1, 'add') : dtfActualEndDate;

          // var noOfWeekEnds = this.countweekoffdays(st, dtfActualEndDate);
          // dtfActualEndDate = this.manipulateDate(formatter.getDateFromatIn_ddMMyyyy(dtfActualEndDate), noOfWeekEnds, 'add');

          element.tahd_acteddate = formatter.getDateFromatIn_ddMMyyyy(dtfActualEndDate);
          MessageToast.show(Constant.CONST_MSG.PLEASE_SELECT_WORKING_DAY_DATE);
        } else if (ActualStartDateFromString < PlannedStartDateFromString) {
          element.tahd_actstdate = element.tahd_plnstdate;
          //reset end date too
          NoOfDays = Number(element.tahd_noofdays);
          if (this.screen === 'edit') {
            dtfActualEndDate = this.manipulateDate(
              formatter.getDateFromatIn_ddMMyyyy(element.tahd_plnstdate),
              NoOfDays - 1,
              'add'
            ); //svalue
            st = this.getDateFromString(formatter.getDateFromatIn_ddMMyyyy(element.tahd_plnstdate));
          } else {
            dtfActualEndDate = this.manipulateDate(element.tahd_plnstdate, NoOfDays - 1, 'add'); //svalue
            st = this.getDateFromString(element.tahd_plnstdate);
          }
          noOfWeekEnds = this.countweekoffdays(st, dtfActualEndDate); //ActualStartDateFromString
          dtfActualEndDate = this.manipulateDate(formatter.getDateFromatIn_ddMMyyyy(dtfActualEndDate), noOfWeekEnds, 'add');

          dtfActualEndDate = that.checkForNextDateIsWeekOff(dtfActualEndDate);

          // var noOfWeekEnds1 = this.countweekoffdays(st, dtfActualEndDate);
          // dtfActualEndDate = this.manipulateDate(formatter.getDateFromatIn_ddMMyyyy(dtfActualEndDate), noOfWeekEnds1, 'add');

          element.tahd_acteddate = formatter.getDateFromatIn_ddMMyyyy(dtfActualEndDate);

          MessageToast.show('Actual Start Date should be greater than or equal to Planned Start Date');
        } else {
          //get actual end date after adding days to actual start date
          const NoOfDays = Number(element.tahd_noofdays);

          dtfActualEndDate = this.manipulateDate(sValue, NoOfDays - 1, 'add');

          const st = this.getDateFromString(sValue);
          noOfWeekEnds = this.countweekoffdays(st, dtfActualEndDate);
          dtfActualEndDate = this.manipulateDate(formatter.getDateFromatIn_ddMMyyyy(dtfActualEndDate), noOfWeekEnds, 'add');

          dtfActualEndDate = that.checkForNextDateIsWeekOff(dtfActualEndDate);
          // var noOfWeekEnds1 = this.countweekoffdays(st, dtfActualEndDate);
          // dtfActualEndDate = this.manipulateDate(formatter.getDateFromatIn_ddMMyyyy(dtfActualEndDate), noOfWeekEnds1, 'add');

          element.tahd_acteddate = formatter.getDateFromatIn_ddMMyyyy(dtfActualEndDate);

          //get difference between actual end date and planned end date
          //var strPlannedEndDate = element.tahd_plneddate;
          let dtfPlannedEndDate;
          if (this.screen === 'edit') {
            dtfPlannedEndDate = this.getDateFromString(formatter.getDateFromatIn_ddMMyyyy(element.tahd_plneddate));
          } else {
            dtfPlannedEndDate = this.getDateFromString(element.tahd_plneddate);
          }

          //get difference and delay days
          const diffTimeDelay = dtfActualEndDate - dtfPlannedEndDate;
          if (diffTimeDelay >= 0) {
            const diffDaysDelay = Math.ceil(diffTimeDelay / (1000 * 60 * 60 * 24));
            element.tahd_dldays = diffDaysDelay.toString();
          }

          that.getView().getModel(this.getEntryFormDataSourceModelName()).setData(aData);
        }
      },

      handleActualEndDateChange: function (oEvent) {
        const oText = this.byId('ACT_END_DATE_EntryForm'),
          oDP = oEvent.getSource(),
          sValue = oEvent.getParameter('value'),
          bValid = oEvent.getParameter('valid');

        const index = oEvent.oSource.oParent.oParent.indexOfItem(oEvent.oSource.oParent);

        const aData = that.getView().getModel(this.getEntryFormDataSourceModelName()).getData();

        const element = aData.tactiondetail[index];
        let noOfWeekEnds;
        let st;
        let NoOfDays;
        //var selectedDate = this.getDateFromString(sValue);
        let ActualStartDateFromString;
        if (this.screen === 'edit') {
          ActualStartDateFromString = this.getDateFromString(formatter.getDateFromatIn_ddMMyyyy(element.tahd_actstdate));
        } else {
          ActualStartDateFromString = this.getDateFromString(element.tahd_actstdate);
        }
        const ActualEndDateFromString = this.getDateFromString(sValue);
        let dtfActualEndDate;
        const result = that.checkForFactoryCalendar(ActualEndDateFromString.getDay());
        if (result['isItWorking'] === 0) {
          //holiday
          //element.tahd_actstdate = element.tahd_plnstdate;
          //reset end date too
          NoOfDays = Number(element.tahd_noofdays);

          if (this.screen === 'edit') {
            dtfActualEndDate = this.manipulateDate(
              formatter.getDateFromatIn_ddMMyyyy(element.tahd_actstdate),
              NoOfDays - 1,
              'add'
            ); //sValue
            st = this.getDateFromString(formatter.getDateFromatIn_ddMMyyyy(element.tahd_actstdate));
          } else {
            dtfActualEndDate = this.manipulateDate(element.tahd_actstdate, NoOfDays - 1, 'add'); //sValue
            st = this.getDateFromString(element.tahd_actstdate);
          }

          noOfWeekEnds = this.countweekoffdays(st, dtfActualEndDate); //ActualStartDateFromString
          dtfActualEndDate = this.manipulateDate(formatter.getDateFromatIn_ddMMyyyy(dtfActualEndDate), noOfWeekEnds, 'add');

          dtfActualEndDate = that.checkForNextDateIsWeekOff(dtfActualEndDate);
          // var noOfWeekEnds = this.countweekoffdays(st, dtfActualEndDate);
          // dtfActualEndDate = this.manipulateDate(formatter.getDateFromatIn_ddMMyyyy(dtfActualEndDate), noOfWeekEnds, 'add');

          element.tahd_acteddate = formatter.getDateFromatIn_ddMMyyyy(dtfActualEndDate);
          MessageToast.show(Constant.CONST_MSG.PLEASE_SELECT_WORKING_DAY_DATE);
        } else if (ActualEndDateFromString < ActualStartDateFromString) {
          //element.tahd_actstdate = element.tahd_plnstdate;
          //reset end date too
          NoOfDays = Number(element.tahd_noofdays);

          if (this.screen === 'edit') {
            dtfActualEndDate = this.manipulateDate(
              formatter.getDateFromatIn_ddMMyyyy(element.tahd_actstdate),
              NoOfDays - 1,
              'add'
            ); //svalue
            st = this.getDateFromString(formatter.getDateFromatIn_ddMMyyyy(element.tahd_actstdate));
          } else {
            dtfActualEndDate = this.manipulateDate(element.tahd_actstdate, NoOfDays - 1, 'add'); //svalue
            st = this.getDateFromString(element.tahd_actstdate);
          }

          noOfWeekEnds = this.countweekoffdays(st, dtfActualEndDate); //ActualStartDateFromString
          dtfActualEndDate = this.manipulateDate(formatter.getDateFromatIn_ddMMyyyy(dtfActualEndDate), noOfWeekEnds, 'add');

          dtfActualEndDate = that.checkForNextDateIsWeekOff(dtfActualEndDate);
          // //check for factory cal
          // var noOfWeekEnds1 = this.countweekoffdays(st, dtfActualEndDate);
          // dtfActualEndDate = this.manipulateDate(formatter.getDateFromatIn_ddMMyyyy(dtfActualEndDate), noOfWeekEnds1, 'add');

          element.tahd_acteddate = formatter.getDateFromatIn_ddMMyyyy(dtfActualEndDate);

          MessageToast.show('Actual End Date should be greater than or equal to Actual Start Date');
        } else {
          //convert actual end date to date
          dtfActualEndDate = this.getDateFromString(sValue);
        }

        //get planned end date and convert to date
        //var strPlannedEndDate = element.tahd_plneddate;
        let dtfPlannedEndDate;
        if (this.screen === 'edit') {
          dtfPlannedEndDate = this.getDateFromString(formatter.getDateFromatIn_ddMMyyyy(element.tahd_plneddate));
        } else {
          dtfPlannedEndDate = this.getDateFromString(element.tahd_plneddate);
        }

        //get difference and delay days
        const diffTimeDelay = dtfActualEndDate - dtfPlannedEndDate;
        if (diffTimeDelay >= 0) {
          const diffDaysDelay = Math.ceil(diffTimeDelay / (1000 * 60 * 60 * 24));
          element.tahd_dldays = diffDaysDelay.toString();
        }

        that.getView().getModel(this.getEntryFormDataSourceModelName()).setData(aData);
      },

      handleProjectStatusSelectionChange: function (oEvent) {
        const selText = oEvent.getParameter('selectedItem').getText();
        const selKey = oEvent.getParameter('selectedItem').getKey();
        // let dict = {
        //     code: selKey,
        //     name: selText
        // }
        const data = that.getView().getModel(this.getEntryFormDataSourceModelName()).getData();

        data.tah_prjstatuscode = selKey;
        data.tah_prjstatusname = selText;

        that.getView().getModel(this.getEntryFormDataSourceModelName()).setData(data);
      },

      handleEmployeeSelectionChange: function (oEvent) {
        const selText = oEvent.getParameter('selectedItem').getText();
        const selKey = oEvent.getParameter('selectedItem').getKey();

        const index = oEvent.oSource.oParent.oParent.indexOfItem(oEvent.oSource.oParent);

        const aData = that.getView().getModel(this.getEntryFormDataSourceModelName()).getData();

        const filteredData = aData['tactiondetail'][index]['tactiondetailEmpAssign'].filter((ele) => {
          return ele.emp_code === selKey;
        });

        aData['tactiondetail'][index]['emp_id_UserID'] = filteredData[0]['emp_id'];
        aData['tactiondetail'][index]['emp_code'] = filteredData[0]['emp_code'];
        aData['tactiondetail'][index]['emp_name'] = filteredData[0]['emp_name'];

        that.getView().getModel(this.getEntryFormDataSourceModelName()).setData(aData);
      },

      fnGrowingFinishedHandler: function (oEvent) {
        // Your logic when growing is finished
        console.log('Growing finished for table');
        // Access added rows or perform any necessary actions here
      },

      onTaskStatusChangefunction: function (oEvent) {
        this.bMoreButtonClicked = false;

        let dtfPlannedEndDate;
        const oTable = this.byId('TATable_EntryForm');
        oTable.detachGrowingFinished(this.fnGrowingFinishedHandler);

        const selText = oEvent.getParameter('selectedItem').getText();
        const selKey = oEvent.getParameter('selectedItem').getKey();

        const index = oEvent.oSource.oParent.oParent.indexOfItem(oEvent.oSource.oParent);

        // hModel.attachRequestCompleted(function () {
        const aData = that.getView().getModel(this.getEntryFormDataSourceModelName()).getData();

        aData['tactiondetail'][index]['tahd_tskstatuscode'] = selKey;
        aData['tactiondetail'][index]['tahd_tskstatusdesc'] = selText;

        if (this.roleInfo['RoleCode'] === Constant.TNA_ROLE.TAUSER && selKey === 'CL') {
          //current date
          const oDate = new Date();
          const oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
            pattern: 'dd-MM-yyyy'
          });
          // Format the date
          const sFormattedDate = oDateFormat.format(oDate);
          aData['tactiondetail'][index]['tahd_acteddate'] = sFormattedDate;

          dtfPlannedEndDate = that.getDateFromString(aData['tactiondetail'][index]['tahd_plneddate']);
          //get difference and delay days
          const diffTimeDelay = oDate - dtfPlannedEndDate;
          if (diffTimeDelay >= 0) {
            const diffDaysDelay = Math.ceil(diffTimeDelay / (1000 * 60 * 60 * 24));
            aData['tactiondetail'][index]['tahd_dldays'] = diffDaysDelay.toString();
          }
        } else if (this.roleInfo['RoleCode'] === Constant.TNA_ROLE.TAUSER && selKey !== 'CL') {
          //actual end date
          aData['tactiondetail'][index]['tahd_acteddate'] = aData['tactiondetail'][index]['tahd_plneddate'];

          const dtfActualEndDate = that.getDateFromString(aData['tactiondetail'][index]['tahd_acteddate']);
          dtfPlannedEndDate = that.getDateFromString(aData['tactiondetail'][index]['tahd_plneddate']);
          //get difference and delay days
          const diffTimeDelay = dtfActualEndDate - dtfPlannedEndDate;
          if (diffTimeDelay >= 0) {
            const diffDaysDelay = Math.ceil(diffTimeDelay / (1000 * 60 * 60 * 24));
            aData['tactiondetail'][index]['tahd_dldays'] = diffDaysDelay.toString();
          }
        }

        that.getView().getModel(this.getEntryFormDataSourceModelName()).setData(aData);
      },

      ////////
      enableOnlyNextRow: function (iindex) {
        const oTable = that.getView().byId('TATable');
        const aItems = oTable.getItems();
        const cellId = aItems[iindex].getAggregation('cells')[12].getId();
        const cellObj = sap.ui.getCore().byId(cellId);
        //remarks
        const cellIdRem = aItems[iindex].getAggregation('cells')[13].getId();
        const cellObjRem = sap.ui.getCore().byId(cellIdRem);

        cellObj.setEnabled(true);
        cellObjRem.setEnabled(true);
      },
      //////

      //Date functions**********************************************************
      isDateValid: function (dateStr) {
        return !isNaN(new Date(dateStr));
      },

      countweekoffdays: function (startDate, endDate) {
        let count = 0;
        const curDate = new Date(startDate.getTime());
        while (curDate <= endDate) {
          const dayOfWeek = curDate.getDay();
          const result = that.checkForFactoryCalendar(dayOfWeek);
          if (result['isItWorking'] === 0) {
            //holiday
            count++;
          }
          //if (dayOfWeek !== 0 && dayOfWeek !== 6) count++;
          curDate.setDate(curDate.getDate() + 1);
        }
        return count;
      },

      manipulateDate: function (date, days, operation) {
        //dd/MM/yyyy
        let arr;
        let nDate;
        let year, month, day, str;
        if (date.indexOf('-') > -1) {
          arr = date.split('-');
        } else if (date.indexOf('/') > -1) {
          arr = date.split('/');
        }
        if (arr !== undefined) {
          year = Number(arr[2]);
          month = Number(arr[1]);
          day = Number(arr[0]);
          str = year + ',' + month + ',' + day;
          nDate = new Date(str);
          // nDate = new Date(year,month,day);
        }

        if (nDate !== undefined) {
          if (operation === 'sub') {
            nDate.setDate(nDate.getDate() - days);
          } else if (operation === 'add') {
            nDate.setDate(nDate.getDate() + days);
          }
        }
        return nDate;
      },

      getDateFromString(date) {
        //dd/mm/yyyy
        let arr;
        let nDate;
        let str, day, month, year;
        if (date !== undefined && date !== null) {
          if (date.includes('-') && date.indexOf('-') > -1) {
            arr = date.split('-');
          } else if (date.includes('/') && date.indexOf('/') > -1) {
            arr = date.split('/');
          }
          if (arr !== undefined) {
            if (arr[0].length <= 2) {
              //dd/mm/yyyy
              year = Number(arr[2]);
              month = Number(arr[1]);
              day = Number(arr[0]);
              str = year + ',' + month + ',' + day;
              nDate = new Date(str);
            } else if (arr[0].length > 2) {
              //yyyy/mm/dd
              year = Number(arr[0]);
              month = Number(arr[1]);
              day = Number(arr[2]);
              str = year + ',' + month + ',' + day;
              nDate = new Date(str);
            }

            // nDate = new Date(year,month,day);
          }
        }
        return nDate;
      },

      checkForNextDateIsWeekOff: function (dtToCheck) {
        let dtToReturn;
        const IsWeekOffDay = that.checkForFactoryCalendar(dtToCheck.getDay());
        if (IsWeekOffDay['isItWorking'] === 1) {
          //working
          return (dtToReturn = dtToCheck);
        } else {
          dtToReturn = this.manipulateDate(formatter.getDateFromatIn_ddMMyyyy(dtToCheck), 1, 'add');
        }
        that.checkForNextDateIsWeekOff(dtToReturn);
      },

      convertS4DateToRegularDate: function (S4Date) {
        const numDate = S4Date !== null ? parseInt(S4Date.replace(/[^0-9]/g, '')) : null;
        const dtDate = numDate !== null ? new Date(numDate) : null;
        return dtDate;
      },

      getDiffBetweenTwoDatesInDays: function (date1, date2) {
        let dateDiffInDays;
        if (this.isDateValid(date1) && this.isDateValid(date2)) {
          const diffTimeDelay = Math.abs(date1 - date2);
          dateDiffInDays = Math.ceil(diffTimeDelay / (1000 * 60 * 60 * 24));
        }
        return dateDiffInDays;
      },

      //Save Time And Action***************************************************
      isFormValid: function () {
        let isValid = true;

        const y = this.getView().getModel(this.getEntryFormDataSourceModelName());

        const valSoNo = y.getProperty('/tah_sono'); //this.getView().byId('SO_NO_EntryForm').getValue()
        const valSoLineItemNo = y.getProperty('/tah_itemdesc'); //this.getView().byId('SO_LINEITEM_NO_EntryForm').getValue()
        const valProjTemp = y.getProperty('/tah_prjtemplnme'); //this.getView().byId('PROJECT_TEMPLATE_EntryForm').getValue()
        const valStDt = y.getProperty('/tah_startdate'); //this.getView().byId('START_DATE_EntryForm').getValue()
        const valProjStatus = y.getProperty('/tah_prjstatuscode'); // this.getView().byId('PROJECT_STATUS_EntryForm').getSelectedItem()

        const oData = y.getData();
        const filteredDataDelayAdmin = oData['tactiondetail'].filter((ele) => {
          return (
            (Number(ele.tahd_dldays) > 0 || Number(ele.tahd_dldays) < 0) &&
            (ele.tahd_admincomments === undefined || ele.tahd_admincomments === '' || ele.tahd_admincomments === null)
          );
        });

        const filteredDataDelayUser = oData['tactiondetail'].filter((ele) => {
          return (
            (Number(ele.tahd_dldays) > 0 || Number(ele.tahd_dldays) < 0) &&
            (ele.tahd_comments === undefined || ele.tahd_comments === '' || ele.tahd_comments === null)
          );
        });

        const filteredDataStatus = oData['tactiondetail'].filter((ele) => {
          return (
            ele.tahd_tskstatuscode === 'CL' &&
            (ele.tahd_comments === undefined || ele.tahd_comments === '' || ele.tahd_comments === null)
          );
        });
        if (
          (valSoNo === undefined || valSoNo === null || valSoNo === '') &&
          (valSoLineItemNo === undefined || valSoLineItemNo === null || valSoLineItemNo === '') &&
          (valProjTemp === undefined || valProjTemp === null || valProjTemp === '') &&
          (valStDt === undefined || valStDt === null || valStDt === '') &&
          (valProjStatus === undefined || valProjStatus === null || valProjStatus === '')
        ) {
          isValid = false;
          MessageToast.show('All header selection is mandatory, Please select header data!');
          return isValid;
        } else if (valSoNo === undefined || valSoNo === null || valSoNo === '') {
          isValid = false;
          MessageToast.show('Please select So No!');
          return isValid;
        } else if (valSoLineItemNo === undefined || valSoLineItemNo === null || valSoLineItemNo === '') {
          isValid = false;
          MessageToast.show('Please select So Line Item No!');
          return isValid;
        } else if (valProjTemp === undefined || valProjTemp === null || valProjTemp === '') {
          isValid = false;
          MessageToast.show('Please select Project Template');
          return isValid;
        } else if (valStDt === undefined || valStDt === null || valStDt === '') {
          isValid = false;
          MessageToast.show('Please select Start Date!');
          return isValid;
        } else if (
          this.roleInfo['RoleCode'] === Constant.TNA_ROLE.TAADMIN &&
          (valProjStatus === undefined || valProjStatus === null || valProjStatus === '')
        ) {
          isValid = false;
          MessageToast.show('Please select Project Status!');
          return isValid;
        } else if (
          this.roleInfo['RoleCode'] === Constant.TNA_ROLE.TAADMIN &&
          filteredDataStatus.length > 0 &&
          filteredDataStatus[0]['tahd_tskstatuscode'] !== 'CL' &&
          filteredDataDelayAdmin.length > 0 &&
          filteredDataDelayAdmin[0]['tahd_admincomments'] === null
        ) {
          MessageToast.show('Please enter remarks for Delay days');
          isValid = false;
        } else if (
          this.roleInfo['RoleCode'] === Constant.TNA_ROLE.TAUSER &&
          filteredDataDelayUser.length > 0 &&
          filteredDataDelayUser[0]['tahd_comments'] === null
        ) {
          MessageToast.show('Please enter remarks for Delay days');
          isValid = false;
        } else {
          // for (let index = 0; index < oData['tactiondetail'].length; index++) {
          //     const element = oData['tactiondetail'][index];
          //     if (element.emp_code === null) {
          //         MessageToast.show(`Please select Employee Responsible for ${element.tahd_depname} at index ${element.srno} !`);
          //         isValid = false;
          //         break;
          //     }
          // }
        }
        return isValid;
      },

      createObjectTarget: function () {
        const x = {
          tah_sono: null,
          tah_lineno: null,
          tah_itemcode: null,
          tah_itemdesc: null,
          tah_prjtemplno: null,
          tah_prjtemplnme: null,
          tah_prjtempdesc: null,
          tah_startdate: null,
          tah_prjstatuscode: null,
          tah_prjstatusname: null,
          tah_sodate: null,
          tah_sodeldate: null,
          tah_soitemcategory: null,
          tah_isactive: null,
          tah_isdeleted: null,
          tah_addbyEmpid: null,
          tah_addbyEmpCode: null,
          tah_addbyUsername: null,
          tah_customercode: null,
          tah_customername: null,
          tah_plant: null,
          tactiondetail: [
            {
              tahd_depcode: null,
              tahd_depname: null,
              tahd_prjtaskid: null,
              tahd_prjtaskname: null,
              tahd_noofdays: null,
              tahd_days: null,
              tahd_plnstdate: null,
              tahd_plneddate: null,
              tahd_actstdate: null,
              tahd_acteddate: null,
              tahd_dldays: null,
              tahd_tskstatuscode: null,
              tahd_tskstatusdesc: null,
              tahd_comments: null,
              tahd_admincomments: null,
              tahd_rescostcentercode: null,
              tahd_rescostcentername: null,
              emp_id_UserID: null,
              emp_code: null,
              emp_name: null,
              TaskType: null,
              DocumentType: null,
              APICode: null
            }
          ]
        };

        return x;
      },

      onSave: async function () {
        if (that.isFormValid()) {
          //if (this._jsonRequestPayload)
          {
            let modelData = this.getView().getModel(this.getEntryFormDataSourceModelName()).getData();

            modelData.tah_isactive = 'Y';
            modelData.tah_isdeleted = 'N';
            modelData.tah_addbyEmpid = this.loginInfo['UserID'];
            modelData.tah_addbyEmpCode = this.loginInfo['Usercode'];
            modelData.tah_addbyUsername = this.loginInfo['Username'];

            modelData.tah_startdate = formatter.getDateFromatIn_yyyyMMdd(this.getDateFromString(modelData.tah_startdate));
            modelData.tah_sodate = formatter.getDateFromatIn_yyyyMMdd(this.getDateFromString(modelData.tah_sodate));
            modelData.tah_sodeldate = formatter.getDateFromatIn_yyyyMMdd(this.getDateFromString(modelData.tah_sodeldate));

            modelData.tactiondetail.forEach((element) => {
              element.tahd_plnstdate = formatter.getDateFromatIn_yyyyMMdd(this.getDateFromString(element.tahd_plnstdate));
              element.tahd_plneddate = formatter.getDateFromatIn_yyyyMMdd(this.getDateFromString(element.tahd_plneddate));
              element.tahd_actstdate = formatter.getDateFromatIn_yyyyMMdd(this.getDateFromString(element.tahd_actstdate));
              element.tahd_acteddate = formatter.getDateFromatIn_yyyyMMdd(this.getDateFromString(element.tahd_acteddate));
              element.tahd_noofdays = element.tahd_noofdays.toString();
            });

            let y = this.createObjectTarget();

            if (this.roleInfo['RoleCode'] === Constant.TNA_ROLE.TAUSER) {
              const filterdata = this.filterData(modelData.tactiondetail, 'editable', true);
              modelData = filterdata[0];
              y = y.tactiondetail[0];

              let urlToSaveUpdate = this.getEntryFormDataSourceURLToUpdateData();
              urlToSaveUpdate = urlToSaveUpdate + '(' + modelData.tahd_id + ')';
              this.setEntryFormDataSourceURLToUpdateData(urlToSaveUpdate);
            }
            this.transferObjectValues(modelData, y);

            await this.onPressOfEntryFormSaveButton(y);

            const res = this.getApiResponseObject();
            if (res.success === true) {
              if (this.roleInfo['RoleCode'] === Constant.TNA_ROLE.TAUSER) {
                MessageToast.show('Time And Action updated successfully for T&A no ' + res.object.tah_no);
              } else {
                if (this.screen === 'add') {
                  MessageToast.show('Time And Action added successfully for T&A no ' + res.object.tah_no);
                } else {
                  MessageToast.show('Time And Action updated successfully for T&A no ' + res.object.tah_no);
                }
              }
              setTimeout(
                function () {
                  this.router.navTo(this.getBackwardRoute());
                }.bind(this),
                Constant.SCREEN_NAV_TIMEOUT
              );
            } else {
              MessageToast.show(res.object.responseJSON.error.message);
            }

            // const response = this.getView().getModel(this.getEntryFormResponseDataSourceModelName()).getData();
            // if (response) {
            //   if (this.roleInfo['RoleCode'] === Constant.TNA_ROLE.TAUSER) {
            //     MessageToast.show('Time And Action updated successfully for T&A no ' + response.tah_no);
            //   } else {
            //     if (this.screen === 'add') {
            //       MessageToast.show('Time And Action added successfully for T&A no ' + response.tah_no);
            //     } else {
            //       MessageToast.show('Time And Action updated successfully for T&A no ' + response.tah_no);
            //     }
            //   }
            //   setTimeout(
            //     function () {
            //       this.router.navTo(this.getBackwardRoute());
            //     }.bind(this),
            //     Constant.SCREEN_NAV_TIMEOUT
            //   );
            // } else {
            //   // Show an error message if data is not available
            // }
          }
        }
      }
    });
  }
);

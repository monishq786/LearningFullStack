sap.ui.define(
  [
    'core/generic/genericentryform',
    'stoneman/modone/model/JSONLoader',
    'stoneman/modone/constants/FormMode',
    'stoneman/modone/constants/COPStoneFormulas',
    'stoneman/modone/constants/Constant',
    './ApproveRejectFragment.controller',
    'sap/m/MessageToast'
  ],

  function (genericentryform, JSONLoader, FormMode, COPStoneFormulas, Constant, ApproveRejectFragment, MessageToast) {
    'use strict';

    return genericentryform.extend('modonecontroller.copentryform', {
      onInit: function () {
        genericentryform.prototype.onInit.apply(this, arguments);
      },

      initialize: function () {
        this.setPageId('copef'); // costing one pager entry form == copef
        this.setFormTitle('COP Entry Form');
        this.setBackwardRoute('RouterNameCOPListViewNew');
        this.setEntryFormDataSourceURLToAddData('/odata/v4/stoneman-crf/TCostingHeader');
        this.setEntryFormDataSourceURLToUpdateData(
          '/odata/v4/stoneman-crf/TCostingHeader(' + this.getListViewEditPropertyValue() + ')'
        );
        this.loginInfo = this.getLoginInfo();
        this.loadStaticDropdownModel();
        this.setModelForCOPRequest();
        this.loadFragments([
          'Header',
          'Dimensions',
          'Attachment',
          'Stone',
          'StoneProcess',
          'Metal',
          'MetalProcess',
          'Wood',
          'WoodProcess',
          'Accessory',
          'Packing',
          'ExtraCharges',
          'SeekAdvice',
          'ApprovalHistory'
        ]);
        this.loadPayloadRequest();
        let oObjectPageLayout = this.byId('copefHeaderLayout');
        let oSection = this.byId('copefHeaderSection');
        oObjectPageLayout.setSelectedSection(oSection);
      },

      setModelForCOPRequest: function () {
        const oPath = jQuery.sap.getModulePath('stoneman', '/modone/model/COPEntryForm.json');
        const oModel = new sap.ui.model.json.JSONModel(oPath);
        this.getView().setModel(oModel, this.getEntryFormDataSourceModelName());
      },

      onBeforeShow: async function (oEvent) {
        this.identifyFormMode(oEvent);
        this.initialize();
        this.setEntryFormDataSourceURLForEditMode(
          '/odata/v4/stoneman-crf/TCostingHeader(' +
            this.getListViewEditPropertyValue() +
            ')?$expand=CostingStoneActualCostDetail,CostingStoneBaseCostDetail,CostingStoneProcessDetail,CostingWoodActualCostDetail,CostingWoodBaseCostDetail,CostingWoodProcessDetail,CostingMetalActualCostDetail,CostingMetalBaseCostDetail,CostingMetalProcessDetail,CostingAccessory,CostingPacking,CostingExtraCharges,CostingApprovalTransaction,CostingSeekAdvice,Costing_ATL,Costing_Head,Costing_Executive'
        );
        await this.showEntryForm();
        this.handleUIOperation();
        this.pageValidatations();
      },

      pageValidatations: function () {
        const roleInfo = this.getRoleDetails();
        if (roleInfo?.RoleCode === Constant.USER_ROLE_CODE.COSTING_EXECUTIVE) {
          this.getView().byId('copefSave').setVisible(true);
          this.getView().byId('copefSubmit').setVisible(true);
          this.getView().byId('copefApprove').setVisible(false);
          this.getView().byId('copefReject').setVisible(false);
        } else if (
          roleInfo?.RoleCode === Constant.USER_ROLE_CODE.COSTING_HEAD ||
          roleInfo?.RoleCode === Constant.USER_ROLE_CODE.COSTING_ATL
        ) {
          this.getView().byId('copefApprove').setVisible(true);
          this.getView().byId('copefReject').setVisible(true);
          this.getView().byId('copefSubmit').setVisible(false);
          this.getView().byId('copefSave').setVisible(false);
        }
      },

      // onPressSubmit: async function () {
      //   if (this.requestPayload) {
      //     const viewModel = this.getView().getModel(this.getEntryFormDataSourceModelName());
      //     viewModel.setProperty(`/Costing_Executive_UserID`, this.loginInfo?.UserID);
      //     viewModel.setProperty(`/loginUserID_UserID`, this.loginInfo?.UserID);
      //     viewModel.setProperty(`/CreatedByUserID_UserID`, this.loginInfo?.UserID);
      //     viewModel.setProperty(`/ApprStatus`, 'NA');
      //     viewModel.setProperty(`/SaveOrSubmit`, 'SUBMIT');
      //     viewModel.setProperty(`/newApprovalStatus`, 'NA');
      //     viewModel.setProperty(`/TotalApproved`, 0);
      //     viewModel.setProperty(`/TotalRejected`, 0);
      //     viewModel.setProperty(`/FormStatus`, 'New');
      //     viewModel.setProperty(`/FormType`, 'COSTINGPAGER');
      //     const modelData = this.getView().getModel(this.getEntryFormDataSourceModelName()).getData();
      //     this.transferObjectValues(modelData, this.requestPayload);
      //     await this.onPressOfEntryFormSaveButton(this.requestPayload);
      //     const res = this.getApiResponseObject();
      //     const formMode = this.getFormMode();
      //     if (res?.success === true && formMode === FormMode.CREATE) {
      //       MessageToast.show('COP created successfully ' + res?.object?.CostingNo);
      //       setTimeout(
      //         function () {
      //           this.router.navTo(this.getBackwardRoute());
      //         }.bind(this),
      //         500
      //       );
      //     } else if (res?.success === true && formMode === FormMode.EDIT) {
      //       MessageToast.show('COP updated successfully ' + res?.object?.CostingNo);
      //       setTimeout(
      //         function () {
      //           this.router.navTo(this.getBackwardRoute());
      //         }.bind(this),
      //         500
      //       );
      //     } else {
      //       MessageToast.show(res?.object?.responseJSON?.error?.message);
      //     }
      //   } else {
      //     // Show an error message if data is not available
      //   }
      // },

      // onPressSave: async function () {
      //   if (this.requestPayload) {
      //     const viewModel = this.getView().getModel(this.getEntryFormDataSourceModelName());
      //     viewModel.setProperty(`/Costing_Executive_UserID`, this.loginInfo?.UserID);
      //     viewModel.setProperty(`/loginUserID_UserID`, this.loginInfo?.UserID);
      //     viewModel.setProperty(`/CreatedByUserID_UserID`, this.loginInfo?.UserID);
      //     viewModel.setProperty(`/ApprStatus`, 'NA');
      //     viewModel.setProperty(`/SaveOrSubmit`, 'SAVE');
      //     viewModel.setProperty(`/newApprovalStatus`, 'NA');
      //     viewModel.setProperty(`/TotalApproved`, 0);
      //     viewModel.setProperty(`/TotalRejected`, 0);
      //     viewModel.setProperty(`/FormStatus`, 'New');
      //     viewModel.setProperty(`/FormType`, 'COSTINGPAGER');
      //     const modelData = this.getView().getModel(this.getEntryFormDataSourceModelName()).getData();
      //     this.transferObjectValues(modelData, this.requestPayload);
      //     await this.onPressOfEntryFormSaveButton(this.requestPayload);
      //     const res = this.getApiResponseObject();
      //     const formMode = this.getFormMode();
      //     if (res?.success === true && formMode === FormMode.CREATE) {
      //       MessageToast.show('COP created successfully ' + res?.object?.CostingNo);
      //       setTimeout(
      //         function () {
      //           this.router.navTo(this.getBackwardRoute());
      //         }.bind(this),
      //         500
      //       );
      //     } else if (res?.success === true && formMode === FormMode.EDIT) {
      //       MessageToast.show('COP updated successfully ' + res?.object?.CostingNo);
      //       setTimeout(
      //         function () {
      //           this.router.navTo(this.getBackwardRoute());
      //         }.bind(this),
      //         500
      //       );
      //     } else {
      //       MessageToast.show(res?.object?.responseJSON?.error?.message);
      //     }
      //   } else {
      //     // Show an error message if data is not available
      //   }
      // },

      onPressSubmit: async function () {
        if (this.requestPayload) {
          await this.setViewModelProperties('SUBMIT');
          await this.handleApiResponse('SUBMIT');
        } else {
          // Show an error message if data is not available
        }
      },

      onPressSave: async function () {
        if (this.requestPayload) {
          await this.setViewModelProperties('SAVE');
          await this.handleApiResponse('SAVE');
        } else {
          // Show an error message if data is not available
        }
      },

      setViewModelProperties: async function (actionType) {
        const viewModel = this.getView().getModel(this.getEntryFormDataSourceModelName());
        const userID = this.loginInfo?.UserID;

        // Set common properties
        viewModel.setProperty(`/Costing_Executive_UserID`, userID);
        viewModel.setProperty(`/loginUserID_UserID`, userID);
        viewModel.setProperty(`/CreatedByUserID_UserID`, userID);
        viewModel.setProperty(`/ApprStatus`, 'NA');
        viewModel.setProperty(`/SaveOrSubmit`, actionType); 
        viewModel.setProperty(`/newApprovalStatus`, 'NA');
        viewModel.setProperty(`/TotalApproved`, 0);
        viewModel.setProperty(`/TotalRejected`, 0);
        viewModel.setProperty(`/FormStatus`, 'New');
        viewModel.setProperty(`/FormType`, 'COSTINGPAGER');
        // Transfer model data to request payload
        const modelData = viewModel.getData();
        this.transferObjectValues(modelData, this.requestPayload);
      },

      handleApiResponse: async function (actionType) {
        await this.onPressOfEntryFormSaveButton(this.requestPayload);
        const res = this.getApiResponseObject();
        const formMode = this.getFormMode();

        if (res?.success) {
          const actionMessage = formMode === FormMode.CREATE ? 'created' : 'updated';
          MessageToast.show(`COP ${actionMessage} successfully ${res?.object?.CostingNo}`);

          setTimeout(() => {
            this.router.navTo(this.getBackwardRoute());
          }, 500);
        } else {
          MessageToast.show(res?.object?.responseJSON?.error?.message);
        }
      },

      loadFragments: function (fragments) {
        fragments.forEach(this.loadFragment.bind(this));
      },

      handleUIOperation: function () {
        const formMode = this.getFormMode();
        if (formMode === FormMode.EDIT) {
          this.handleFormInEditMode();
        } else if (formMode === FormMode.CREATE) {
          this.handleFormInCreateMode();
        }
      },

      loadFragment: function (fragmentName) {
        const oView = this.getView();
        const sectionId = fragmentName.toLowerCase() + 'Section'; // Dynamically assign section ID
        sap.ui.core.Fragment.load({
          id: oView.getId(),
          name: `stoneman.modone.fragment.copfragment.${fragmentName}`,
          controller: this
        }).then(function (oFragment) {
          oView.byId(sectionId).addItem(oFragment);
        });
      },

      loadPayloadRequest: function () {
        const copPayloadReqPath = '/modone/model/COPEntryFormSavePayload.json';
        JSONLoader.loadJSONData(copPayloadReqPath)
          .then(
            function (data) {
              // Store the loaded JSON data for reuse
              this.requestPayload = data;
            }.bind(this)
          )
          .catch(function (error) {
            console.error(error);
          });
      },

      loadStaticDropdownModel: function () {
        const copPayloadReqPath = '/modone/model/COPEntryFormStaticDropdowns.json';
        JSONLoader.loadJSONData(copPayloadReqPath)
          .then(
            function (data) {
              this.createNewModelUsingArray('COPEntryFormStaticDropdownModel', data);
            }.bind(this)
          )
          .catch(function (error) {
            console.error(error);
          });
      },

      handleFormInCreateMode: async function () {
        await this.createNewModelUsingAPI(
          'GET',
          '/odata/v4/stoneman-crf/MStage?$filter=FormType%20eq%20%27COSTINGPAGER%27%20and%20OrderBy%20eq%201',
          '',
          'MStageModel'
        );
        const data = this.getView().getModel('MStageModel').getData();
        const { value = [] } = data || {};
        const viewModel = this.getView().getModel(this.getEntryFormDataSourceModelName());
        if (value.length > 0) {
          const { StageCode_StageConstant, StageName } = value[0] || {};
          viewModel.setProperty(`/CostingStageCode_StageCode_StageConstant`, StageCode_StageConstant);
          viewModel.setProperty(`/CostingStageName`, StageName);
        }
        viewModel.setProperty(`/CostingExecutive`, this.loginInfo?.Username);
      },

      handleFormInEditMode: function () {
        const viewModel = this.getView().getModel(this.getEntryFormDataSourceModelName());
        const { Costing_Executive = {}, Costing_ATL = {}, Costing_Head = {} } = viewModel.getData();
        viewModel.setProperty(`/CostingExecutive`, Costing_Executive?.Username);
        viewModel.setProperty(`/CostingATL`, Costing_ATL?.Username);
        viewModel.setProperty(`/CostingHead`, Costing_Head?.Username);
      },

      addStoneActualCosting: function () {
        const oModel = this.getView().getModel(this.getEntryFormDataSourceModelName());
        const data = oModel.getData();
        const bomIndex = data.CostingStoneActualCostDetail.findIndex((item) => item?.name?.startsWith('BOM'));
        let bomItem = null;
        if (bomIndex !== -1) {
          bomItem = data.CostingStoneActualCostDetail.splice(bomIndex, 1)[0]; // Remove and store "BOM" item
        }
        const newStone = { name: `Stone ${data.CostingStoneActualCostDetail.length + 1}`, isDelete: true };
        data.CostingStoneActualCostDetail.push(newStone);
        if (bomItem) {
          data.CostingStoneActualCostDetail.push(bomItem);
        } else {
          data.CostingStoneActualCostDetail.push({ name: 'BOM', isDelete: false });
        }
        oModel.setData(data);
        this.getView().setModel(oModel, this.getEntryFormDataSourceModelName());
      },

      onDeleteStone: function (oEvent) {
        const oModel = this.getView().getModel(this.getEntryFormDataSourceModelName());
        const data = oModel.getData();
        const index = oEvent.getSource().getParent().getParent().indexOfItem(oEvent.getSource().getParent());
        sap.m.MessageBox.show('Are you sure you want to delete the record?', {
          title: 'Confirm',
          actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
          onClose: (oAction) => {
            if (oAction === sap.m.MessageBox.Action.YES) {
              this.deleteStoneItem(index, data, oModel);
            }
          }
        });
      },

      deleteStoneItem: function (index, data, oModel) {
        // Check if the index is valid
        if (index > -1 && index < data.CostingStoneActualCostDetail.length) {
          // Remove the item at the specified index
          data.CostingStoneActualCostDetail.splice(index, 1);
          // Clear the array if it's has only one item
          if (data.CostingStoneActualCostDetail.length === 1) {
            data.CostingStoneActualCostDetail = [];
          }
          oModel.setData(data);
          this.getView().setModel(oModel, this.getEntryFormDataSourceModelName());
          // Call methods to recalculate sums if necessary
          if (data.CostingStoneActualCostDetail.length > 0) {
            COPStoneFormulas.formulaSumOfActualStoneUnitCost(oModel);
            COPStoneFormulas.formulaTotalActualWastageAmount(oModel);
          }
        }
      },

      addBaseStoneCostRow: function () {
        const oModel = this.getView().getModel(this.getEntryFormDataSourceModelName());
        const data = oModel.getData();
        const bomIndex = data.CostingStoneBaseCostDetail.findIndex((item) => item.name.startsWith('BOM'));
        let bomItem = null;
        if (bomIndex !== -1) {
          bomItem = data.CostingStoneBaseCostDetail.splice(bomIndex, 1)[0]; // Remove and store "BOM" item
        }
        const newStone = { name: `Stone ${data.CostingStoneBaseCostDetail.length + 1}`, isDelete: true };
        data.CostingStoneBaseCostDetail.push(newStone);
        if (bomItem) {
          data.CostingStoneBaseCostDetail.push(bomItem);
        } else {
          data.CostingStoneBaseCostDetail.push({ name: 'BOM', isDelete: false });
        }
        oModel.setData(data);
        this.getView().setModel(oModel, this.getEntryFormDataSourceModelName());
      },

      onDeleteBaseStone: function (oEvent) {
        const oModel = this.getView().getModel(this.getEntryFormDataSourceModelName());
        const data = oModel.getData();
        const index = oEvent.getSource().getParent().getParent().indexOfItem(oEvent.getSource().getParent());
        sap.m.MessageBox.show('Are you sure you want to delete the record?', {
          title: 'Confirm',
          actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
          onClose: (oAction) => {
            if (oAction === sap.m.MessageBox.Action.YES) {
              this.deleteBaseStoneItem(index, data, oModel);
            }
          }
        });
      },

      deleteBaseStoneItem: function (index, data, oModel) {
        if (index > -1 && index < data.CostingStoneBaseCostDetail.length) {
          // Remove the item at the specified index
          data.CostingStoneBaseCostDetail.splice(index, 1);
          if (data.CostingStoneBaseCostDetail.length === 1) {
            data.CostingStoneBaseCostDetail = [];
          }
          oModel.setData(data);
          this.getView().setModel(oModel, this.getEntryFormDataSourceModelName());
          if (data.CostingStoneBaseCostDetail.length > 0) {
            COPStoneFormulas.formulaSumOHStoneUnitCost(oModel);
            COPStoneFormulas.formulaSumOfWastageAmount(oModel);
          }
          COPStoneFormulas.formulaStoneLocalHandlingAmount(oModel);
        }
      },

      addStoneProcessRow: function () {
        const oModel = this.getView().getModel(this.getEntryFormDataSourceModelName());
        const data = oModel.getData();
        let rowLen = data.CostingStoneProcessDetail.length;
        if (rowLen === 0) {
          data.CostingStoneProcessDetail[rowLen] = { name: 'Sum Of Total Process Stone Cost', isDelete: false };
        }

        const bomItem = data.CostingStoneProcessDetail.find((item) => item.name.startsWith('Sum Of Total Process Stone Cost'));
        if (bomItem) {
          data.CostingStoneProcessDetail = data.CostingStoneProcessDetail.filter(
            (item) => !item.name.startsWith('Sum Of Total Process Stone Cost')
          );
        }
        rowLen = data.CostingStoneProcessDetail.length;
        // Add the new "Stone" item
        data.CostingStoneProcessDetail.push({ name: 'Process ' + (rowLen + 1) });

        // Add the "BOM" item back at the end of the array, preserving its original data
        if (bomItem) {
          data.CostingStoneProcessDetail.push(bomItem);
        }
        oModel.setData(data);
        this.getView().setModel(oModel, this.getEntryFormDataSourceModelName());
      },

      addMetalRow: function () {
        const oModel = this.getView().getModel(this.getEntryFormDataSourceModelName());
        const data = oModel.getData();
        let rowLen = data.MetalActualCosting.length;
        if (rowLen === 0) {
          data.MetalActualCosting[rowLen] = { name: 'BOM', isDelete: false };
        }

        const bomItem = data.MetalActualCosting.find((item) => item.name.startsWith('BOM'));
        if (bomItem) {
          data.MetalActualCosting = data.MetalActualCosting.filter((item) => !item.name.startsWith('BOM'));
        }
        rowLen = data.MetalActualCosting.length;
        // Add the new "Stone" item
        data.MetalActualCosting.push({ name: 'Metal ' + (rowLen + 1) });

        // Add the "BOM" item back at the end of the array, preserving its original data
        if (bomItem) {
          data.MetalActualCosting.push(bomItem);
        }

        oModel.setData(data);
        this.getView().setModel(oModel, this.getEntryFormDataSourceModelName());
      },

      addBaseMetalCostRow: function () {
        const oModel = this.getView().getModel(this.getEntryFormDataSourceModelName());
        const data = oModel.getData();
        let rowLen = data.BaseMetalCost.length;

        if (rowLen === 0) {
          data.BaseMetalCost[rowLen] = { name: 'BOM', isDelete: false };
        }

        const bomItem = data.BaseMetalCost.find((item) => item.name.startsWith('BOM'));
        if (bomItem) {
          data.BaseMetalCost = data.BaseMetalCost.filter((item) => !item.name.startsWith('BOM'));
        }
        rowLen = data.BaseMetalCost.length;
        // Add the new "Stone" item
        data.BaseMetalCost.push({ name: 'Metal ' + (rowLen + 1) });

        // Add the "BOM" item back at the end of the array, preserving its original data
        if (bomItem) {
          data.BaseMetalCost.push(bomItem);
        }
        oModel.setData(data);
        this.getView().setModel(oModel, this.getEntryFormDataSourceModelName());
      },

      addMetalProcessRow: function () {
        const oModel = this.getView().getModel(this.getEntryFormDataSourceModelName());
        const data = oModel.getData();
        let rowLen = data.MetalProcess.length;

        if (rowLen === 0) {
          data.MetalProcess[rowLen] = { name: 'Sum Of Total Process Metal Cost', isDelete: false };
        }

        const bomItem = data.MetalProcess.find((item) => item.name.startsWith('Sum Of Total Process Metal Cost'));
        if (bomItem) {
          data.MetalProcess = data.MetalProcess.filter((item) => !item.name.startsWith('Sum Of Total Process Metal Cost'));
        }
        rowLen = data.MetalProcess.length;
        // Add the new "Stone" item
        data.MetalProcess.push({ name: 'Process ' + (rowLen + 1) });

        // Add the "BOM" item back at the end of the array, preserving its original data
        if (bomItem) {
          data.MetalProcess.push(bomItem);
        }

        oModel.setData(data);
        this.getView().setModel(oModel, this.getEntryFormDataSourceModelName());
      },

      addWoodRow: function () {
        const oModel = this.getView().getModel(this.getEntryFormDataSourceModelName());
        const data = oModel.getData();
        let rowLen = data.wood.length;

        if (rowLen === 0) {
          data.wood[rowLen] = { name: 'BOM', isDelete: false };
        }

        const bomItem = data.wood.find((item) => item.name.startsWith('BOM'));
        if (bomItem) {
          data.wood = data.wood.filter((item) => !item.name.startsWith('BOM'));
        }
        rowLen = data.wood.length;
        // Add the new "Stone" item
        data.wood.push({ name: 'Wood ' + (rowLen + 1) });

        // Add the "BOM" item back at the end of the array, preserving its original data
        if (bomItem) {
          data.wood.push(bomItem);
        }

        oModel.setData(data);
        this.getView().setModel(oModel, this.getEntryFormDataSourceModelName());
      },

      addWoodCostRow: function () {
        const oModel = this.getView().getModel(this.getEntryFormDataSourceModelName());
        const data = oModel.getData();
        let rowLen = data.basewoodcost.length;
        if (rowLen === 0) {
          data.basewoodcost[rowLen] = { name: 'BOM', isDelete: false };
        }

        const bomItem = data.basewoodcost.find((item) => item.name.startsWith('BOM'));
        if (bomItem) {
          data.basewoodcost = data.basewoodcost.filter((item) => !item.name.startsWith('BOM'));
        }
        rowLen = data.basewoodcost.length;
        // Add the new "Stone" item
        data.basewoodcost.push({ name: 'Wood ' + (rowLen + 1) });

        // Add the "BOM" item back at the end of the array, preserving its original data
        if (bomItem) {
          data.basewoodcost.push(bomItem);
        }

        oModel.setData(data);
        this.getView().setModel(oModel, this.getEntryFormDataSourceModelName());
      },

      addWoodProcessRow: function () {
        const oModel = this.getView().getModel(this.getEntryFormDataSourceModelName());
        const data = oModel.getData();
        let rowLen = data.woodprocess.length;

        if (rowLen === 0) {
          data.woodprocess[rowLen] = { name: 'Sum Of Total Wood Process Cost', isDelete: false };
        }

        const bomItem = data.woodprocess.find((item) => item.name.startsWith('Sum Of Total Wood Process Cost'));
        if (bomItem) {
          data.woodprocess = data.woodprocess.filter((item) => !item.name.startsWith('Sum Of Total Wood Process Cost'));
        }
        rowLen = data.woodprocess.length;
        // Add the new "Stone" item
        data.woodprocess.push({ name: 'Process ' + (rowLen + 1) });

        // Add the "BOM" item back at the end of the array, preserving its original data
        if (bomItem) {
          data.woodprocess.push(bomItem);
        }

        oModel.setData(data);
        this.getView().setModel(oModel, this.getEntryFormDataSourceModelName());
      },

      cflForHeaderCadNo: async function () {
        this.setCflTitle('Select CAD No.');
        await this.createNewModelUsingAPI(
          'GET',
          "/odata/v4/stoneman-crf/TCadDetail?$filter=CrfStatus eq 'CLS'&$expand=MainAssembly,SubAssembly,ChildAssembly",
          '',
          this.getCflListViewDataSourceModelName()
        );
        this.setCflDisplayColumns(['CAD No.']);
        this.setCflDataColumns(['CadDetailNo']);
        this.setCflValueAndDisplay('copefHeaderCadNo', 'CadDetailNo', '', '');
        this.showCfl(
          'copefHeaderCadNo',
          this.getCflListViewDataSourceModelName(),
          'value',
          this.onConfirmforHeaderCadNo.bind(this),
          this.onCancelforHeaderCadNo.bind(this)
        );
      },

      /**
       * This function is triggered when the user selects a CADNo in a popup.
       * It auto-populates various fields in the view model based on the selected CADNo's details.
       *
       */
      onConfirmforHeaderCadNo: function () {
        const {
          CadDetailNo,
          BuyerName,
          Category,
          ItemCode,
          ItemDesc,
          SeasonProgram,
          MainAssembly = [],
          ChildAssembly = []
        } = this.getCflObject() || {};

        const viewModel = this.getView().getModel(this.getEntryFormDataSourceModelName());

        viewModel.setProperty(`/CADNo`, CadDetailNo);
        viewModel.setProperty(`/BuyerName`, BuyerName);
        viewModel.setProperty(`/ProductCategory`, Category);
        viewModel.setProperty(`/ItemCode`, ItemCode);
        viewModel.setProperty(`/ItemDesc`, ItemDesc);
        viewModel.setProperty(`/SeasonProgram`, SeasonProgram);

        if (MainAssembly.length > 0) {
          const { DiameterUOM, LengthUOM, WidthUOM, HeightUOM, WeightUom, UOMCode, UOMName } = MainAssembly[0] || {};
          viewModel.setProperty(`/Diameter`, DiameterUOM);
          viewModel.setProperty(`/Length`, LengthUOM);
          viewModel.setProperty(`/Width`, WidthUOM);
          viewModel.setProperty(`/Height`, HeightUOM);
          viewModel.setProperty(`/Weight`, WeightUom);
          viewModel.setProperty(`/UnitCode`, UOMCode);
          viewModel.setProperty(`/UnitName`, UOMName);
        }
        if (ChildAssembly.length > 0) {
          const actualCostDetail = ChildAssembly.map((item) => ({
            ItemCode: item.ProductName,
            Finish: item.Finish,
            Density: item.Density,
            UOMName: item.UOM,
            SurfaceArea: item.SurfaceArea,
            Micron: item.Micron,
            DFT: item.DFT,
            GrossWeight: item.GrossWeight,
            GrossQty: item.GrossQty,
            GrossQtyUOM: item.GrossQtyUOM,
            Remarks: item.Remarks,
            ActWastePercent: item.WastagePer
          }));
          const stoneProcessDetail = ChildAssembly.map((item) => ({
            ProcessJobworkRate: item.ProcessJobworkRate,
            ProcessTime: item.ProcessTime,
            WastageProcessPercentage: item.WastagePer
          }));
          viewModel.setProperty(`/CostingStoneActualCostDetail`, actualCostDetail);
          viewModel.setProperty(`/CostingStoneProcessDetail`, stoneProcessDetail);
        }
      },

      onCancelforHeaderCadNo: function () {},

      cflForCostingATL: async function () {
        this.setCflTitle('Select Costing ATL');
        await this.createNewModelUsingAPI(
          'GET',
          "/odata/v4/stoneman-crf/MUser?$filter=UserRoleCode_RoleCode_RoleConstant eq 'COSTING_ATL'",
          '',
          this.getCflListViewDataSourceModelName()
        );
        this.setCflDisplayColumns(['User Name.']);
        this.setCflDataColumns(['Username']);
        this.setCflValueAndDisplay('copefCostingATL', 'Username', '', '');
        this.showCfl(
          'copefCostingATL',
          this.getCflListViewDataSourceModelName(),
          'value',
          this.onConfirmforCostingATL.bind(this)
        );
      },

      onConfirmforCostingATL: function () {
        const { Username, UserID } = this.getCflObject();
        const viewModel = this.getView().getModel(this.getEntryFormDataSourceModelName());
        viewModel.setProperty(`/CostingATL`, Username);
        viewModel.setProperty(`/Costing_ATL_UserID`, UserID);
      },

      cflForCostingHead: async function () {
        this.setCflTitle('Select Costing Head');
        await this.createNewModelUsingAPI(
          'GET',
          "/odata/v4/stoneman-crf/MUser?$filter=UserRoleCode_RoleCode_RoleConstant eq 'COSTING_HEAD'",
          '',
          this.getCflListViewDataSourceModelName()
        );
        this.setCflDisplayColumns(['User Name.']);
        this.setCflDataColumns(['Username']);
        this.setCflValueAndDisplay('copefCostingHead', 'Username', '', '');
        this.showCfl(
          'copefCostingHead',
          this.getCflListViewDataSourceModelName(),
          'value',
          this.onConfirmforCostingHead.bind(this)
        );
      },

      onConfirmforCostingHead: function () {
        const { Username, UserID } = this.getCflObject();
        const viewModel = this.getView().getModel(this.getEntryFormDataSourceModelName());
        viewModel.setProperty(`/CostingHead`, Username);
        viewModel.setProperty(`/Costing_Head_UserID`, UserID);
      },

      cflForHeaderBuyerName: async function () {
        await this.createNewModelUsingAPI(
          'GET',
          '/sap/opu/odata/sap/API_BUSINESS_PARTNER/A_BusinessPartner',
          '',
          this.getCflListViewDataSourceModelName()
        );
        this.setCflDisplayColumns(['BusinessPartner', 'Customer', 'Supplier', 'BusinessPartnerName']);
        this.setCflDataColumns(['BusinessPartner', 'Customer', 'Supplier', 'BusinessPartnerName']);
        this.setCflValueAndDisplay('copefHeaderBuyerName', 'BusinessPartnerName', '', '');
        this.showCfl(
          'copefHeaderBuyerName',
          this.getCflListViewDataSourceModelName(),
          'd/results',
          this.onConfirmforBuyerName.bind(this)
        );
      },

      onConfirmforBuyerName: function () {
        const { BusinessPartner, BusinessPartnerName } = this.getCflObject();
        const viewModel = this.getView().getModel(this.getEntryFormDataSourceModelName());
        viewModel.setProperty(`/BuyerName`, BusinessPartnerName);
        viewModel.setProperty(`/BuyerCode`, BusinessPartner);
      },

      onChangeQuantity: function (oEvent) {
        const oSource = oEvent.getSource();
        const oContext = oSource.getBindingContext(this.getEntryFormDataSourceModelName());
        const rowIndex = oContext.getPath().split('/').pop();
        const viewModel = this.getView().getModel(this.getEntryFormDataSourceModelName());
        COPStoneFormulas.formulaActualStoneUnitCost(oEvent, viewModel, rowIndex);
      },

      onChangePurchasePrice: function (oEvent) {
        const oSource = oEvent.getSource();
        const oContext = oSource.getBindingContext(this.getEntryFormDataSourceModelName());
        const rowIndex = oContext.getPath().split('/').pop();
        const viewModel = this.getView().getModel(this.getEntryFormDataSourceModelName());
        COPStoneFormulas.formulaActualStoneUnitCost(oEvent, viewModel, rowIndex);
      },

      onChangeActWastePercent: function (oEvent) {
        const oSource = oEvent.getSource();
        const oContext = oSource.getBindingContext(this.getEntryFormDataSourceModelName());
        const rowIndex = oContext.getPath().split('/').pop();
        const viewModel = this.getView().getModel(this.getEntryFormDataSourceModelName());
        COPStoneFormulas.formulaActualWastageAmount(oEvent, viewModel, rowIndex);
      },

      onChangeOHStonePrice: function (oEvent) {
        const oSource = oEvent.getSource();
        const oContext = oSource.getBindingContext(this.getEntryFormDataSourceModelName());
        const rowIndex = oContext.getPath().split('/').pop();
        const viewModel = this.getView().getModel(this.getEntryFormDataSourceModelName());
        COPStoneFormulas.formulaOHStoneUnitCost(oEvent, viewModel, rowIndex);
      },

      onChangeOHWastePercent: function (oEvent) {
        const oSource = oEvent.getSource();
        const oContext = oSource.getBindingContext(this.getEntryFormDataSourceModelName());
        const rowIndex = oContext.getPath().split('/').pop();
        const viewModel = this.getView().getModel(this.getEntryFormDataSourceModelName());
        COPStoneFormulas.formulaOHWasteAmount(oEvent, viewModel, rowIndex);
      },

      onChangeStoneLocalHandlingPer: function () {
        const viewModel = this.getView().getModel(this.getEntryFormDataSourceModelName());
        COPStoneFormulas.formulaStoneLocalHandlingAmount(viewModel);
      },

      onPressAccept: function () {
        const oView = this.getView();
        const oModelData = oView.getModel(this.getEntryFormDataSourceModelName()).getData();
        const dialog = new ApproveRejectFragment(oView, 'Comment', 'APPROVED', this, oModelData);
        dialog.open();
      },

      onPressReject: function () {
        const oView = this.getView();
        const oModelData = oView.getModel(this.getEntryFormDataSourceModelName()).getData();
        const dialog = new ApproveRejectFragment(oView, 'Comment', 'REJECTED', this, oModelData);
        dialog.open();
      },

      getApproveRejectComment: function (sReplyValue) {
        const oModel = this.getView().getModel(this.getEntryFormDataSourceModelName());
        oModel.setProperty('/newApprovalComment', sReplyValue.Comment);
        oModel.setProperty('/newApprovalStatus', sReplyValue.Status);
        this.onPressApproveReject();
      },

      onPressApproveReject: async function () {
        if (this.requestPayload) {
          const viewModel = this.getView().getModel(this.getEntryFormDataSourceModelName());
          viewModel.setProperty(`/loginUserID_UserID`, this.loginInfo?.UserID);
          const modelData = this.getView().getModel(this.getEntryFormDataSourceModelName()).getData();
          this.transferObjectValues(modelData, this.requestPayload);
          await this.onPressOfEntryFormSaveButton(this.requestPayload);
          //let response = this.getView().getModel(this.getEntryFormResponseDataSourceModelName()).getData();
          this.router.navTo(this.getBackwardRoute());
        } else {
          // Show an error message if data is not available
        }
      },

      onChangeCostingCategory: function (oEvent) {
        var oSelectedItem = oEvent.getParameter('selectedItem');
        var sSelectedText = oSelectedItem.getText();
        var oInput = this.byId('copefHeaderCadNo');
        const viewModel = this.getView().getModel(this.getEntryFormDataSourceModelName());
        if (sSelectedText === 'Rendering') {
          oInput.setEnabled(false);
        } else {
          oInput.setEnabled(true);
        }
        viewModel.setProperty('/CADNo', null);
      }
    });
  }
);

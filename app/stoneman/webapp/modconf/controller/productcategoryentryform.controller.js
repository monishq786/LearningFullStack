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
    return genericentryform.extend('modconfcontroller.productcategoryentryform', {
      onInit: async function () {
        genericentryform.prototype.onInit.apply(this, arguments);
        this.getView().getModel(this.getEntryFormDataSourceModelName()).refresh(true);
      },

      onBeforeShow: async function (oEvent) {
        this.identifyFormMode(oEvent);
        this.initialize();
        await this.populateCADLevel();

        this.setEntryFormDataSourceURLForEditMode(
          '/odata/v4/stoneman-crf/MProductCategory(' + this.getListViewEditPropertyValue() + ')' + '?$expand=ProductCategoryCADLevel'
        );

        await this.showEntryForm();
      },

      initialize: async function () {
        _RoleInfo = this.getRoleDetails();
        this.formMode = this.getFormMode();
        await this.populateCADLevel();

        this.setPageId('productcategoryref');
        this.setFormTitle('Product Category Entry Form');
        this.setBackwardRoute('RouteNameProductCategoryListView');
        this.setEntryFormDataSourceURLForNewMode('');
        this.setEntryFormDataSourceURLToAddData('/odata/v4/stoneman-crf/MProductCategory');
        this.setEntryFormDataSourceURLToUpdateData(
          '/odata/v4/stoneman-crf/MProductCategory(' + this.getListViewEditPropertyValue() + ')' + '?$expand=ProductCategoryCADLevel'
        );

        if (this.formMode === '3') {
          const oPath = jQuery.sap.getModulePath('stoneman', '/modconf/model/ProductCategoryAddView.json');
          const oModel = new sap.ui.model.json.JSONModel(oPath);
          this.getView().setModel(oModel, this.getEntryFormDataSourceModelName());
          this.getView().byId("ProductCategoryCode").setEnabled(true);
          this.getView().byId("ProductCategoryName").setEnabled(true);
          this.getView().byId("FirstNumber").setEnabled(true);
          this.getView().byId("IncrementValue").setEnabled(true);
          this.getView().byId("Prefix").setEnabled(true);
          this.getView().byId("Suffix").setEnabled(true);
        }
        if (this.formMode == "2") {
          const oPath = jQuery.sap.getModulePath('stoneman', '/modconf/model/ProductCategoryAddView.json');
          const oModel = new sap.ui.model.json.JSONModel(oPath);
          this.getView().setModel(oModel, this.getEntryFormDataSourceModelName());

          this.getView().byId("ProductCategoryCode").setEnabled(false);
          this.getView().byId("ProductCategoryName").setEnabled(false);
          this.getView().byId("FirstNumber").setEnabled(false);
          this.getView().byId("IncrementValue").setEnabled(false);
          this.getView().byId("Prefix").setEnabled(false);
          this.getView().byId("Suffix").setEnabled(false);

        }


      },

      onSelect: function (oEvent) {
        const bSelected = oEvent.getParameter('selected');
        const y = this.getView().getModel(this.getEntryFormDataSourceModelName());

        if (bSelected === true) {
          y.setProperty(`/IsActive`, 'Y');
        } else {
          y.setProperty(`/IsActive`, 'N');
        }
      },

      validateFields: function () {
        let isValid = true;

        const oModel = this.getView().getModel(this.getEntryFormDataSourceModelName());
        const oData = oModel.getData();
        if (oData.ProductCategoryCode === '' || oData.ProductCategoryCode === undefined || oData.ProductCategoryCode === null) {
          isValid = false;
          MessageToast.show('Please enter product category code');
        } else if (
          oData.ProductCategoryName === '' ||
          oData.ProductCategoryName === undefined ||
          oData.ProductCategoryName === null
        ) {
          isValid = false;
          MessageToast.show('Please enter product category name');
        } else if (oData.FirstNum === '' || oData.FirstNum === undefined || oData.FirstNum === null) {
          isValid = false;
          MessageToast.show('Please enter first number');
        } else if (oData.IncrementBy === '' || oData.IncrementBy === undefined || oData.IncrementBy === null) {
          isValid = false;
          MessageToast.show('Please enter increament by');
        }

        return isValid;
      },

      targetObject: function () {
        const x = {
          FirstNum: null,
          IncrementBy: null,
          LastNum: null,
          Prefix: null,
          ProductCategoryCode: null,
          ProductCategoryName: null,
          Remarks: null,
          Suffix: null,
          IsActive: null,
          ProductCategoryCADLevel: [
            {
              CADLevelCode: null,
              IncrementBy: null,
              RowNumber: 1,
              DelMark: 0
            }
          ]
        };
        return x;
      },

      onSave: async function () {
        const srcObject = this.getView().getModel(this.getEntryFormDataSourceModelName()).getData();
        const trgObject = this.targetObject();

        if (this.validateFields()) {
          this.transferObjectValues(srcObject, trgObject);
          console.log("srcObject", srcObject)
          console.log("trgObject", trgObject)
          await this.onPressOfEntryFormSaveButton(trgObject);
          const res = this.getApiResponseObject();
          if (res.success === true && this.formMode === '3') {
            MessageToast.show('Product Category created successfully');
            setTimeout(
              function () {
                this.router.navTo(this.getBackwardRoute());
              }.bind(this),
              1000
            );
          } else if (res.success === true && this.formMode === '2') {
            MessageToast.show('Product Category Updated successfully');
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
      },
      onDigitValueNotAccepted: function (oEvent) {
        var value = oEvent.getParameter("newValue");
        var regex = /\d/;
        if (regex.test(value)) {
          var newValue = value.replace(/\d/g, '');
          oEvent.getSource().setValue(newValue);
        }
        // if (value.length > 50) {
        //   var oText = this.getView().byId("errorMessage");
        //   oText.setText("You are exceeding the limit");
        //   oText.setVisible(true);
        // } else {
        //   // Hide the error message when input length is valid
        //   var oText = this.getView().byId("errorMessage");
        //   oText.setVisible(false);
        // }
      },

      onCancel: async function () {
        this.router.navTo(this.getBackwardRoute());

      },


      addRow: function () {
        const newRow = {
          CADLevelCode: null,
          IncrementBy: null,
          RowNumber: 1,
          DelMark: 0,
        };
        this.addRowInObj('ProductCategoryCADLevel', newRow, 'RowNumber');
      },

      populateCADLevel: async function () {
        await this.createNewModelUsingAPI('GET', `/odata/v4/stoneman-crf/MEnum?$filter=EnumType eq 'CAD_Level'  `, '', 'pcefSelectCadlevelModel');
        this.populateSelect('cadlevel', 'pcefSelectCadlevelModel', 'value', 'EnumCode', 'EnumDescription');
      },

      // handleCADLevelSelectionChange: function (oEvent) {
      //   const selText = oEvent.getParameter('selectedItem').getText();
      //   const selKey = oEvent.getParameter('selectedItem').getKey();

      //   const index = oEvent.oSource.oParent.oParent.indexOfItem(oEvent.oSource.oParent);

      //   const aData = that.getView().getModel(this.getEntryFormDataSourceModelName()).getData();

      //   const filteredData = aData['tactiondetail'][index]['tactiondetailEmpAssign'].filter((ele) => {
      //     return ele.emp_code === selKey;
      //   });

      //   aData['tactiondetail'][index]['emp_id_UserID'] = filteredData[0]['emp_id'];
      //   aData['tactiondetail'][index]['emp_code'] = filteredData[0]['emp_code'];
      //   aData['tactiondetail'][index]['emp_name'] = filteredData[0]['emp_name'];

      //   that.getView().getModel(this.getEntryFormDataSourceModelName()).setData(aData);
      // },

      handleCADLevelSelectionChange: function (oEvent) {
        const oSource = oEvent.getSource();
        const oContext = oSource.getBindingContext(this.getEntryFormDataSourceModelName());
        const rowIndex = oContext.getPath().split('/').pop();
        irowIndex = rowIndex;

        const oComboBox = oEvent.getSource();
        const oSelectedItem = oComboBox.getSelectedItem();
        console.log("oSelectedItem---", oSelectedItem)
        // Access the binding context of the selected item
        if (oSelectedItem) {
          const oBindingContext = oSelectedItem.getBindingContext("EntryFormDataSourceModel");
          console.log("oBindingContext.getObject()-----", oBindingContext.getObject())
          // if (oBindingContext) {
          // const { EnumCode = '', EnumDescription = '' } = oBindingContext.getObject();
          // const viewModel = this.getView().getModel(this.getEntryFormDataSourceModelName());
          // viewModel.setProperty(`/CAD/${irowIndex}/CADLevel`, EnumCode);
          // console.log("VIEWMODEL___",viewModel)
          // }
        }
      },

      //   onDeleteCad: function (oEvent) {
      //     // Step 1: Get the source of the event (e.g., the button)
      //     var oButton = oEvent.getSource();

      //     // Step 2: Get the binding context of the row containing the button
      //     var oBindingContext = oButton.getBindingContext(this.getEntryFormDataSourceModelName());

      //     if (!oBindingContext) {
      //         console.error("Binding context not found");
      //         return;
      //     }

      //     // Step 3: Extract the full data path and calculate the index
      //     var sPath = oBindingContext.getPath(); // e.g., "/Role/1"
      //     console.log("Binding Path:", sPath);

      //     var iIndex = parseInt(sPath.split("/").pop(), 10); // Extract the last part of the path
      //     console.log("Calculated Index:", iIndex);

      //     // Step 4: Access the data model and retrieve data
      //     var oModel = this.getView().getModel(this.getEntryFormDataSourceModelName());
      //     var aData = oModel.getProperty("/ProductCategoryCADLevel");

      //     // Step 5: Confirm deletion
      //     MessageBox.show("Are you sure you want to delete record?", {
      //         title: "Confirm",
      //         actions: [MessageBox.Action.YES, MessageBox.Action.NO],
      //         onClose: function (oAction) {
      //             if (oAction === MessageBox.Action.YES) {
      //                 this.updateStageRoleModel(iIndex);
      //             }
      //         }.bind(this)
      //     });
      // },

      onDeleteCad: function (oEvent) {
        const modelName = this.getEntryFormDataSourceModelName();
        const oModel = this.getView().getModel(modelName);
        const aData = oModel.getData();

        const iIndex = oEvent.getSource().getParent().getParent().indexOfItem(oEvent.getSource().getParent());
        this.deleteRow(modelName, 'ProductCategoryCADLevel', iIndex);

        // if (aData.Buyer.length === 1) {
        //   MessageToast.show('Atleast one buyer should be there.');
        // } else {
        //   const iIndex = oEvent.getSource().getParent().getParent().indexOfItem(oEvent.getSource().getParent());
        //   this.deleteRow(modelName, 'ProductCategoryCADLevel', iIndex);
        // }
      }

    });
  }
);

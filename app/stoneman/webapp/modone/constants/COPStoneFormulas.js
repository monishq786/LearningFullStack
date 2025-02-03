sap.ui.define([], function () {
    'use strict';

    return {
        /**
         * Calculates the ActualStoneUnitCost using Quantity and PurchasePrice, 
         *
         * Formla:
         * ActualStoneUnitCost = Quantity * PurchasePrice
         *
         * After calculating ActualStoneUnitCost, it invokes the formula to sum the Sum of Unit Cost 
         * and then calculates the Actual Wastage Amount.
         * and then calculates the OH Stone Unit Cast.
         * 
         * @param {*} oEvent - The event triggered by the UI interaction.
         * @param {Model} viewModel - The getEntryFormDataSourceModelName() containing the data.
         * @param {number} rowIndex - The index of the current row in the CostingStoneActualCostDetail array.
         * 
         */
        formulaActualStoneUnitCost: function (oEvent, viewModel, rowIndex) {
            const { CostingStoneActualCostDetail = [] } = viewModel.getData();
            if (CostingStoneActualCostDetail.length > 0) {
                const { Quantity = '', PurchasePrice = '' } = CostingStoneActualCostDetail[rowIndex];
                if (Quantity && PurchasePrice) {
                    const actualStoneCosting = parseFloat(Quantity) * parseFloat(PurchasePrice);
                    CostingStoneActualCostDetail[rowIndex].ActualStoneUnitCost = actualStoneCosting;
                } else {
                    CostingStoneActualCostDetail[rowIndex].ActualStoneUnitCost = '';
                }
                viewModel.setProperty(`/CostingStoneActualCostDetail`, CostingStoneActualCostDetail);
                this.formulaSumOfActualStoneUnitCost(viewModel);
                this.formulaActualWastageAmount(oEvent, viewModel, rowIndex);
                this.formulaOHStoneUnitCost(oEvent, viewModel, rowIndex);
            }
        },

        /** 
         * Calculates the total of ActualStoneUnitCost for all non-deleted items in CostingStoneActualCostDetail
         * and updates each non-deleted item with the total sum. 
         *
         * Formula:
         * totalActualStoneUnitCost = sum of ActualStoneUnitCost for items where isDelete is true
         *
         * After calculating totalActualStoneUnitCost, it calls the formulaTotalActualCostOfStone 
         * function to update the "Total Actual Cost of Stone".
         *
         * @param {*} viewModel - check above
         */
        formulaSumOfActualStoneUnitCost: function (viewModel) {
            const { CostingStoneActualCostDetail = [] } = viewModel.getData();
            if (CostingStoneActualCostDetail.length > 0) {
                const totalActualStoneUnitCost = CostingStoneActualCostDetail.reduce((sum, item) => {
                    return item.isDelete && item.ActualStoneUnitCost ? sum + item.ActualStoneUnitCost : sum;
                }, 0);

                const updatedCostingStoneActualCostDetail = CostingStoneActualCostDetail.map(item => {
                    return item.isDelete ? item : { ...item, SumOfUnitCost: totalActualStoneUnitCost };
                });

                viewModel.setProperty(`/CostingStoneActualCostDetail`, updatedCostingStoneActualCostDetail);
                this.formulaTotalActualCostOfStone(viewModel);
            }
        },

        /**
         * Calculates the Actual Wastage Amount based on ActWastePercent and ActualStoneUnitCost
         *
         * Formula:
         * ActWasteAmount = (ActWastePercent / 100) * ActualStoneUnitCost
         *
         *
         * After updating the wastage amount, it calls the formulaTotalActualWastageAmount function
         * to update the "Total Actual Wastage Amount".
         *
         * @param {*} oEvent - check obove
         * @param {*} viewModel - Check obove
         * @param {*} rowIndex - check obove
         */
        formulaActualWastageAmount: function (oEvent, viewModel, rowIndex) {
            const { CostingStoneActualCostDetail = [] } = viewModel.getData();
            if (CostingStoneActualCostDetail.length > 0) {
                const { ActWastePercent = '', ActualStoneUnitCost = '' } = CostingStoneActualCostDetail[rowIndex];
                if (ActWastePercent && ActualStoneUnitCost) {
                    const percentage = (parseFloat(ActWastePercent) / 100) * parseFloat(ActualStoneUnitCost);
                    CostingStoneActualCostDetail[rowIndex].ActWasteAmount = percentage;
                } else {
                    CostingStoneActualCostDetail[rowIndex].ActWasteAmount = '';
                }
                viewModel.setProperty(`/CostingStoneActualCostDetail`, CostingStoneActualCostDetail);
                this.formulaTotalActualWastageAmount(viewModel);
            }
        },

        /**
         * Calculates the total actual wastage amount by summing up the ActWasteAmount
         * of all non-deleted entries in CostingStoneActualCostDetail.
         *
         * Formula:
         * TotalActualWastageAmount = Sum of all ActWasteAmount from non-deleted items.
         *
         * After updating the TotalActualWastageAmount, it calls the formulaTotalActualCostOfStone
         * function to update the "Total Actual Wastage Amount".
         *
         * @param {*} viewModel - The ViewModel containing the data.
         */
        formulaTotalActualWastageAmount: function (viewModel) {
            const { CostingStoneActualCostDetail = [] } = viewModel.getData();
            if (CostingStoneActualCostDetail.length > 1) {
                const totalActWasteAmount = CostingStoneActualCostDetail.reduce((sum, item) => {
                    return item.isDelete && item.ActWasteAmount ? sum + item.ActWasteAmount : sum;
                }, 0);

                const updatedCostingStoneActualCostDetail = CostingStoneActualCostDetail.map(item => {
                    return item.isDelete ? item : { ...item, TotalActualWastageAmount: totalActWasteAmount };
                });

                viewModel.setProperty(`/CostingStoneActualCostDetail`, updatedCostingStoneActualCostDetail);
                this.formulaTotalActualCostOfStone(viewModel);
            }
        },

        /**
         * Calculates the total actual cost of stone for the non-deleted entries in 
         * CostingStoneActualCostDetail by adding the SumOfUnitCost and TotalActualWastageAmount.
         *
         * Formula:
         * TotalActualCostOfStone = SumOfUnitCost + TotalActualWastageAmount
         *
         * The function finds the first non-deleted item in CostingStoneActualCostDetail, 
         * sums its SumOfUnitCost and TotalActualWastageAmount, and updates the 
         * TotalActualCostOfStone for all non-deleted rows in the array.
         *
         * @param {*} viewModel - check above.
         */
        formulaTotalActualCostOfStone: function (viewModel) {
            const { CostingStoneActualCostDetail = [] } = viewModel.getData();
            if (CostingStoneActualCostDetail.length > 1) {
                const deletedObj = CostingStoneActualCostDetail.find(v => !v.isDelete);
                const totalActualCostOfStone = deletedObj.SumOfUnitCost + deletedObj.TotalActualWastageAmount;

                const updatedCostingStoneActualCostDetail = CostingStoneActualCostDetail.map(item => {
                    return item.isDelete ? item : { ...item, TotalActualCostOfStone: totalActualCostOfStone };
                });

                viewModel.setProperty(`/CostingStoneActualCostDetail`, updatedCostingStoneActualCostDetail);
            }
        },

        /**
          * Calculates the OHStoneUnitCost for a given row in the CostingStoneBaseCostDetail
          * by multiplying the Quantity from the corresponding entry in CostingStoneActualCostDetail
          * with the OHStonePrice from CostingStoneBaseCostDetail.
          *
          * Formula:
          * OHStoneUnitCost = Quantity * OHStonePrice
          *
          * - formulaSumOHStoneUnitCost: Updates the sum of all OHStoneUnitCost values.
          * - formulaOHWasteAmount: Recalculates the OH wastage amount for the updated row.
         */
        formulaOHStoneUnitCost: function (oEvent, viewModel, rowIndex) {
            const { CostingStoneActualCostDetail = [], CostingStoneBaseCostDetail = [] } = viewModel.getData();
            if (CostingStoneActualCostDetail.length > 0 && CostingStoneBaseCostDetail.length > 0) {
                if (rowIndex < CostingStoneActualCostDetail.length && rowIndex < CostingStoneBaseCostDetail.length) {
                    const { Quantity = '' } = CostingStoneActualCostDetail[rowIndex];
                    const { OHStonePrice = '' } = CostingStoneBaseCostDetail[rowIndex];
                    if (Quantity && OHStonePrice) {
                        const ohStoneUnitCost = Quantity * OHStonePrice;
                        CostingStoneBaseCostDetail[rowIndex].OHStoneUnitCost = ohStoneUnitCost;
                    } else {
                        CostingStoneBaseCostDetail[rowIndex].OHStoneUnitCost = '';
                    }
                    viewModel.setProperty(`/CostingStoneBaseCostDetail`, CostingStoneBaseCostDetail);
                    this.formulaSumOHStoneUnitCost(viewModel);
                    this.formulaOHWasteAmount(oEvent, viewModel, rowIndex)
                }
            }
        },

        /**
          * formulaSumOHStoneUnitCost: Calculates the sum of OHStoneUnitCost for all entries in the 
          * 'CostingStoneBaseCostDetail' array where the 'isDelete' flag is true. It then updates the 
          * 'SumOHStoneUnitCost' property for each entry where 'isDelete' is false with the calculated sum.
          *
          * Formula:
          * SumOHStoneUnitCost = ∑OHStoneUnitCost where isDelete === true
          *
         */
        formulaSumOHStoneUnitCost: function (viewModel) {
            const { CostingStoneBaseCostDetail = [] } = viewModel.getData();
            if (CostingStoneBaseCostDetail.length > 1) {
                const sumOHStoneUnitCost = CostingStoneBaseCostDetail.reduce((sum, item) => {
                    return item.isDelete && item.OHStoneUnitCost ? sum + item.OHStoneUnitCost : sum;
                }, 0);
                const updatedCostingStoneBaseCostDetaill = CostingStoneBaseCostDetail.map(item => {
                    return item.isDelete ? item : { ...item, SumOHStoneUnitCost: sumOHStoneUnitCost };
                });
                viewModel.setProperty(`/CostingStoneBaseCostDetail`, updatedCostingStoneBaseCostDetaill);
                this.formulaTotalCostOfBaseStone(viewModel);
            }
        },
        
        /**
         * Calculates the OHWasteAmount for a specific row in the CostingStoneBaseCostDetail
         * by using the OHWastePercent and OHStoneUnitCost values from that row.
         *
         * Formula:
         * OHWasteAmount = (OHWastePercent / 100) * OHStoneUnitCost
         * after update the OHWasteAmount then is call the formulaSumOfWastageAmount function to 
         * calculate the Sum of Wastage Amount 
         */
        formulaOHWasteAmount: function (oEvent, viewModel, rowIndex) {
            const { CostingStoneBaseCostDetail = [] } = viewModel.getData();
            if (CostingStoneBaseCostDetail.length > 0) {
                if (rowIndex < CostingStoneBaseCostDetail.length) {
                    const { OHWastePercent = '', OHStoneUnitCost = '' } = CostingStoneBaseCostDetail[rowIndex];
                    if (OHWastePercent && OHStoneUnitCost) {
                        const oHWasteAmount = (OHWastePercent / 100) * OHStoneUnitCost;
                        CostingStoneBaseCostDetail[rowIndex].OHWasteAmount = oHWasteAmount;
                    } else {
                        CostingStoneBaseCostDetail[rowIndex].OHWasteAmount = '';
                    }
                    viewModel.setProperty(`/CostingStoneBaseCostDetail`, CostingStoneBaseCostDetail);
                    this.formulaSumOfWastageAmount(viewModel);
                }
            }
        },

        /**
         * 
         * formulaSumOfWastageAmount: Calculates the total sum of OHWasteAmount for all entries in the
         * 'CostingStoneBaseCostDetail' array where the 'isDelete' flag is true. It then updates the
         * 'SumOfWastageAmount' property for each entry where 'isDelete' is false with the calculated sum.
         *
         * Formula:
         * SumOfWastageAmount = ∑(OHWasteAmount) where isDelete === true
         *
         */
        formulaSumOfWastageAmount: function (viewModel) {
            const { CostingStoneBaseCostDetail = [] } = viewModel.getData();
            if (CostingStoneBaseCostDetail.length > 1) {
                const sumOfWastageAmount = CostingStoneBaseCostDetail.reduce((sum, item) => {
                    return item.isDelete && item.OHWasteAmount ? sum + item.OHWasteAmount : sum;
                }, 0);
                const updatedCostingStoneBaseCostDetaill = CostingStoneBaseCostDetail.map(item => {
                    return item.isDelete ? item : { ...item, SumOfWastageAmount: sumOfWastageAmount };
                });
                viewModel.setProperty(`/CostingStoneBaseCostDetail`, updatedCostingStoneBaseCostDetaill);
                this.formulaTotalCostOfBaseStone(viewModel);
            }
        },

        /**
         * 
          * Calculates the total cost of the base stone by adding the
         * 'SumOfWastageAmount' and 'SumOHStoneUnitCost' for the first entry where 'isDelete' is false.
         * The resulting value is then assigned to the 'TotalCostOfBaseStone' property for each entry where
         * 'isDelete' is false.
         *
         * Formula:
         * TotalCostOfBaseStone = SumOfWastageAmount + SumOHStoneUnitCost
         *
         */
        formulaTotalCostOfBaseStone: function (viewModel) {
            const { CostingStoneBaseCostDetail = [] } = viewModel.getData();
            if (CostingStoneBaseCostDetail.length > 1) {
                const deletedObj = CostingStoneBaseCostDetail.find(v => !v.isDelete);
                const totalCostOfBaseStone = deletedObj?.SumOfWastageAmount + deletedObj?.SumOHStoneUnitCost;
                const updatedCostingStoneActualCostDetail = CostingStoneBaseCostDetail.map(item => {
                    return item.isDelete ? item : { ...item, TotalCostOfBaseStone: totalCostOfBaseStone };
                });
                viewModel.setProperty(`/CostingStoneBaseCostDetail`, updatedCostingStoneActualCostDetail);
                this.formulaStoneLocalHandlingAmount(viewModel);
            }
        },

        /**
         * 
         * formulaStoneLocalHandlingAmount: Calculates the stone local handling amount based on the
         * 'StoneLocalHandlingPer' percentage and the 'TotalCostOfBaseStone' from the first entry
         * where 'isDelete' is false. The calculated amount is then set in the view model under 'StoneLocalHandlingAmount'.
         *
         * Formula:
         * StoneLocalHandlingAmount = (StoneLocalHandlingPer / 100) * TotalCostOfBaseStone
         *
         */
        formulaStoneLocalHandlingAmount: function (viewModel) {
            const { CostingStoneBaseCostDetail = [], StoneLocalHandlingPer = '' } = viewModel.getData();
            if (CostingStoneBaseCostDetail.length > 1) {
                const deletedObj = CostingStoneBaseCostDetail.find(v => !v.isDelete);
                if (StoneLocalHandlingPer && deletedObj?.TotalCostOfBaseStone) {
                    const stoneLocalHandlingAmount = (StoneLocalHandlingPer / 100) * deletedObj?.TotalCostOfBaseStone;
                    viewModel.setProperty(`/StoneLocalHandlingAmount`, stoneLocalHandlingAmount);
                } else {
                    viewModel.setProperty(`/StoneLocalHandlingAmount`, '');
                }
            } else {
                viewModel.setProperty(`/StoneLocalHandlingAmount`, '');
            }
        },
    };
});

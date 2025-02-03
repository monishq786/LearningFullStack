sap.ui.define([], function () {
    "use strict";
    return {
        SCREEN_NAV_TIMEOUT: 1000,
        TNA_ROLE: { TAUSER: 'TAUser', TAADMIN: 'TAAdmin' },
        USER_ROLE_CODE: {
            COSTING_EXECUTIVE: 'COSTING_EXECUTIVE',
            COSTING_HEAD: 'COSTING_HEAD',
            COSTING_ATL: 'COSTING_ATL',
            MERCHANT_ATL: 'MERCHANT_ATL',
            MERCHANT_TL: 'MERCHANT_TL',
            HEAD: 'HEAD',
            QUALITY_TL: 'QUALITY_TL',
            QUALITY_ATL: 'QUALITY_ATL',
            PD_COORDINATOR: 'PD_COORDINATOR',
            TECHNOLOGIST: 'TECHNOLOGIST',
            //PRODUCT_ENGG: 'PRODUCT_ENGG',
            PRODUCT_ENGG: 'Product_Engee',
            DESIGNER: 'DESIGNER',
        },
        CONST_MSG: {
            PLEASE_SELECT_WORKING_DAY_DATE: 'Please select working day date'
        }
    };
});
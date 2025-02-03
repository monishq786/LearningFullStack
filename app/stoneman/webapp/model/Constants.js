const BASE_URL_TA = "/odata/v4/stoneman-ta/" //"/odata/v4/stoneman/"
const BASE_URL_S4 = "/sap/opu/odata/sap/"
const BASE_URLCAD = "/odata/v4/stoneman-crf/"
const Attach_URL = "/odata/v4/stoneman-attachment/"
const BASE_URL_S4_COSTCENTER = "/sap/opu/odata4/sap/"
appUrls = {
  LOGIN: BASE_URLCAD + 'MUser',
  TASK_STATUS_API: BASE_URL_TA + 'TaskStatusMaster',
  PROJECT_STATUS_API: BASE_URL_TA + 'PrjStatusMaster',

  SEARCH_HEADERLIST_API: BASE_URL_TA + 'Tactionheader?$expand=tactiondetail',
  SAVE_TIME_AND_ACTION: BASE_URL_TA + 'Tactionheader',
  UPDATE_TAUSER: BASE_URL_TA + 'Tactiondetail',

    API_BUSINESS_PARTNER: BASE_URL_S4 + "API_BUSINESS_PARTNER/A_BusinessPartner?$filter=BusinessPartnerGrouping eq 'BP02'&$select=BusinessPartner,BusinessPartnerFullName",
    //"API_BUSINESS_PARTNER/A_BusinessPartner?$select=BusinessPartner,BusinessPartnerFullName,BusinessPartnerUUID,BusinessPartner",
    API_SALES_ORDER_LIST: BASE_URL_S4 + "API_SALES_ORDER_SRV/A_SalesOrder",
    // API_SALES_ORDER_LINE_ITEM_LIST:BASE_URL_S4+"API_SALES_ORDER_SRV/A_SalesOrder('B2C0700004')?$expand=to_Item&$select=to_Item/SalesOrder,to_Item/SalesOrderItem,to_Item/Material,to_Item/RequestedQuantity,to_Item/RequestedQuantityUnit,to_Item/SalesOrderItemText,SalesOrder,SoldToParty",
    //https://my409722-api.s4hana.cloud.sap/sap/opu/odata/sap/API_SALES_ORDER_SRV/A_SalesOrder('B2C0700004')?$expand=to_Item&$select=to_Item/SalesOrder,to_Item/SalesOrderItem,to_Item/Material,to_Item/RequestedQuantity,to_Item/RequestedQuantityUnit,to_Item/SalesOrderItemText,SalesOrder,SoldToParty
    API_ENTERPRISE_PROJECT: BASE_URL_S4 + "API_ENTERPRISE_PROJECT_SRV/A_EnterpriseProject",
    //API_ENTERPRISE_PROJECT_WITH_FILTER:BASE_URL_S4+"API_ENTERPRISE_PROJECT_SRV/A_EnterpriseProject(guid'938851ea-56fe-1edf-80f8-58ac3dac1e32')?$expand=to_EnterpriseProjectElement"

    API_FACTORY_CALENDAR: BASE_URL_S4 + "YY1_FACTORYCALENDAR_CDS/YY1_FactoryCalendar",
    API_WORKFORCE_PERSON: BASE_URL_S4 + "YY1_WORKFORCEPERSON_CDS/YY1_WorkforcePerson",
    TCAD_DETAIL_API: BASE_URLCAD + 'TCadDetail',
    //CAD Request Form Monish
    TCRF_HEADER_API: BASE_URLCAD + 'TCrfHeader',
    TCRF_HEADER__Patch_API: BASE_URLCAD + 'TCrfHeader',
    VIEW_DATA_API: BASE_URLCAD + 'TCrfHeader',
    USER_API: BASE_URLCAD + 'MUser',
    ROLE_API: BASE_URLCAD + 'MRole',
    TCRF_HEADER_LIST: BASE_URLCAD + 'MyDocuments',
    TCAD_HEADER_LIST: BASE_URLCAD + 'MyCADDetailDocuments',
    Attactment_API: Attach_URL + 'Attachments',
    Download_Attactment_API: Attach_URL + 'GetAttachmentDataWithFile',
    BUYER_API: BASE_URL_S4 + 'API_BUSINESS_PARTNER/A_BusinessPartner',
    CATEGORY_API: BASE_URL_S4 + 'YY1_EXTPRODGRP_CDS/YY1_ExtProdGrp',
    MERCHANT_API: BASE_URL_S4 + 'YY1_WORKFORCEPERSON_CDS/YY1_WorkforcePerson',
    API_PDCOORDINATOR: BASE_URL_S4 + "YY1_WORKFORCEPERSON_CDS/YY1_WorkforcePerson",
    API_DEPARTMENT: BASE_URL_S4_COSTCENTER + "api_cost_center/srvd_a2x/sap/costcenter/0001/A_CostCenterText_2",
    API_ITEMDESCRIPTION: BASE_URL_S4 + "API_PRODUCT_SRV/A_Product",
    API_STAGE: BASE_URLCAD + "MStage",
    ENABLE_DISABLE_API: BASE_URLCAD + 'MCrfControls',
    Config_API: BASE_URLCAD + '',
    API_Metrial: BASE_URL_S4 + "YY1_EXTPRODGRP_CDS/YY1_ExtProdGrp",
    API_Muser: BASE_URLCAD + "MUser?$select=UserRoleCode_RoleCode_RoleConstant,Username",
    API_MfgProcess: BASE_URL_S4 + "YY1_MANUFACTURINGANDOPERAT_CDS/YY1_MANUFACTURINGANDOPERAT?$select=SAP_UUID,ManufacturingProcessCode,ManufacturingProcessName",
    API_MOperation: BASE_URL_S4 + "YY1_MANUFACTURINGANDOPERAT_CDS/YY1_OPERATION_MANUFACTURINGAND",
    COP_COSTING_HEADER: BASE_URLCAD + 'TCostingHeader',
    API_MOperation: BASE_URL_S4 + "YY1_MANUFACTURINGANDOPERAT_CDS/YY1_OPERATION_MANUFACTURINGAND",
    ENABLE_DISABLE_BTN: BASE_URLCAD + 'EnableAndDisable',
    ENABLE_DISABLE_BTN_CAD: BASE_URLCAD + 'EnableAndDisableForCAD',
    SEEK_ADVICE_API: BASE_URLCAD + 'TcrfSeekAdvice',
}



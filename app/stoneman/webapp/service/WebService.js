sap.ui.define([
    "./CoreService",
    "../model/Constants"

], function (CoreService, Constants) {
    "use strict";

    var WebService = CoreService.extend("stoneman.service.WebService", {
        /*getTANOList: function () {
            debugger
            const configObject = {
                method: "GET",
                url: appUrls.PROJECT_STATUS_API, 
                //"/odata/v4/stoneman/TaskStatusMaster",
                //"/odata/v4/stoneman/PrjStatusMaster",
                //"/odata/v4/catalog/Udemy_Header",
                username: "",
                password:""
            }
            return this.odata(configObject);
        },*/
        callGetAPI: function (url, method) {
            const configObject = {
                method: method,
                url: url,
            }
            return this.odata(configObject);
        },
        callLoginAPI: function (username, password) {
            const configObject = {
                method: "GET",
                url: appUrls.LOGIN + `?$expand=UserRoleCode&$filter=EmailId eq '${username}' and Password eq '${password}'`,
            }
            return this.odata(configObject);
        },
        getTandASearchListAllDataToExport:function(loggedinuser){
            let empfilter = `($filter=emp_id_UserID eq ${loggedinuser})`
            let bUrl = appUrls.SEARCH_HEADERLIST_API;
            const configObject = {
                method: "GET",
                url: bUrl + `${empfilter}`
            }
            return this.odata(configObject);
        },
        getSearchHeaderList: function (filter, loggedinuser, role) {
            if (filter != undefined) {
                let empfilter = `($filter=emp_id_UserID eq ${loggedinuser})`

                let bUrl = appUrls.SEARCH_HEADERLIST_API;
                const configObject = {
                    method: "GET",
                    //url: bUrl + (role != 'TAAdmin' ? `($expand=tactiondetailEmpAssign${empfilter})&$filter=${filter}` : `($expand=tactiondetailEmpAssign)&$filter=${filter}`)
                    url: bUrl + `${empfilter}` + `&$filter=${filter}`
                    // url: bUrl + `($expand=tactiondetailEmpAssign${empfilter})&$filter=${filter}` 
                    //url: bUrl + `($expand=tactiondetailEmpAssign${empfilter})&$filter=${filter}`
                }
                return this.odata(configObject);
            }
        },
        getTimeAndActionNoList: function () {
            const configObject = {
                method: "GET",
                url: appUrls.SAVE_TIME_AND_ACTION
            }
            return this.odata(configObject);
        },
        getHeaderChildList:function(th_id,loggedinuser){
            let empfilter = `($filter=emp_id_UserID eq ${loggedinuser})`
            const configObject = {
                method: "GET",
                url: appUrls.SAVE_TIME_AND_ACTION+'('+th_id+')'+'?$expand=tactiondetail'//+`${empfilter}`,//'/tactiondetail', 

                //Tactionheader(259427df-4fa3-48e9-95b1-1bde7d3e74f0)?$expand=tactiondetail($filter=emp_id_UserID eq 0131c2b2-bef2-1edf-8dec-fbaff9ffbe4d)
            }
            return this.odata(configObject);
        },
        getProjectStatus: function () {
            const configObject = {
                method: "GET",
                url: appUrls.PROJECT_STATUS_API,
            }
            return this.odata(configObject);
        },
        getTaskStatusList: function () {
            const configObject = {
                method: "GET",
                url: appUrls.TASK_STATUS_API,
            }
            return this.odata(configObject);
        },
        saveUpdateTimeAndAction: function (oData, method, Id) {
            const configObject = {
                method: method,
                url: Id == undefined ? appUrls.SAVE_TIME_AND_ACTION : appUrls.SAVE_TIME_AND_ACTION + '(' + Id + ')',
                data: oData
            }
            return this.odata(configObject);
        },
        updateTActionDetailForTAUser: function (oData, method, Id) {
            const configObject = {
                method: method,
                url: appUrls.UPDATE_TAUSER + '(' + Id + ')',
                data: oData
            }
            return this.odata(configObject);
        },

        callBusinessPartnerAPI: function () {
            const configObject = {
                method: "GET",
                url: appUrls.API_BUSINESS_PARTNER,
            }
            return this.odata(configObject);
        },
        callSalesOrderAPI: function () {
            const configObject = {
                method: "GET",
                url: appUrls.API_SALES_ORDER_LIST,
            }
            return this.odata(configObject);
        },
        callSalesOrderLineItemListAPI: function (salesOrder) {
            const configObject = {
                method: "GET",
                url: appUrls.API_SALES_ORDER_LIST + "('" + salesOrder + "')" + "?$expand=to_Item&$select=to_Item/SalesOrder,to_Item/SalesOrderItem,to_Item/Material,to_Item/AdditionalMaterialGroup1,to_Item/RequestedQuantity,to_Item/RequestedQuantityUnit,to_Item/SalesOrderItemText,SalesOrder,SoldToParty"
            }
            return this.odata(configObject);
        },
        callEnterpriseProjectListAPI: function () {
            const configObject = {
                method: "GET",
                url: appUrls.API_ENTERPRISE_PROJECT,
            }
            return this.odata(configObject);
        },
        callEnterpriseProjectChildListAPI: function (ProjectUUID) {//child data at time of add
            const configObject = {
                method: "GET",
                url: appUrls.API_ENTERPRISE_PROJECT + "(guid'" + ProjectUUID + "')" + "?$expand=to_EnterpriseProjectElement"
            }
            return this.odata(configObject);
        },
        callFactoryCalendarAPI: function () {
            const configObject = {
                method: "GET",
                url: appUrls.API_FACTORY_CALENDAR + "('IN')",
            }
            return this.odata(configObject);
        },
        callPersonWorkforceDetail: function (costcenter) {
            const configObject = {
                method: "GET",
                url: appUrls.API_WORKFORCE_PERSON + `?$filter=CostCenter eq '${costcenter}'`,
            }
            return this.odata(configObject);
        },

        //*************************************** */
        //CAD Request Form Monish
        getTCRFHeaderListAPI: function () {
            const configObject = {
                method: "GET",
                url: appUrls.TCRF_HEADER_API,
            }
            return this.odata(configObject);
        },
        getCADDetailNoListAPI: function () {
            const configObject = {
                method: "GET",
                url: appUrls.TCAD_DETAIL_API + `?$filter=CrfStatus eq 'CLS'`,
            }
            return this.odata(configObject);
        },
        getTCRFHeaderSearch: function (oData) {
            const configObject = {
                method: "POST",
                url: appUrls.TCRF_HEADER_LIST,
                data: oData
            }
            return this.odata(configObject);
        },
        getCADRequestNoAPI: function () {
            const configObject = {
                method: "GET",
                url: appUrls.TCRF_HEADER_API + `?$filter=CrfStatus eq 'CLS' and CrfCategory eq 'CAD'`,
            }
            return this.odata(configObject);
        },
        getViewDataCADDetailAPI: function () {
            const configObject = {
                method: "GET",
                url: appUrls.TCAD_DETAIL_API + `?$orderby=CadDetailNo desc`
            }
            return this.odata(configObject);
        },
        getCadDetailSearchData: function (oData) {
            const configObject = {
                method: "POST",
                url: appUrls.TCAD_HEADER_LIST,
                data: oData
            }
            return this.odata(configObject);
        },
        getViewDataAPI: function (guId) {
            const configObject = {
                method: "GET",
                url: appUrls.VIEW_DATA_API + `(${guId})?$expand=TechnoUserId,Material,PDCUserId,QualityTLUserId,DesignerUserId,QualityATLUserId,InspDraw($expand=InspRefDocAbsId,DraftUserID),PDCAttachmentAbsId,MerTeamHead,MerTL,MerATL,UserAssign($expand=UserID),SeekAdvice($expand=UserID,RoleCode,SeekAdviceDocAbsId),ApprovalTransaction($expand=UserId)`
            }
            return this.odata(configObject);
        },
        getViewDataDetailAPI: function (guId) {
            const configObject = {
                method: "GET",
                url: appUrls.TCAD_DETAIL_API + `(${guId})?$expand=MerTeamHead,MerTL,MerATL,TechnoUserId,PDCUserId,QualityATLUserId,QualityTLUserId,DesignerUserId,InspDraw($expand=DraftUserID,DraftAttachmentAbsId,InspRefDocAbsId),ApprovalTransaction($expand=UserId),SeekAdvice($expand=UserID,RoleCode,SeekAdviceDocAbsId),Material,MainAssembly($expand=AssemblyCadAttachment),SubAssembly($expand=AssemblyCadAttachment),ChildAssembly($expand=AssemblyCadAttachment)`
            }
            return this.odata(configObject);
        },

        patchMUserAPI: function (oData, guId) {
            const configObject = {
                method: "PATCH",
                url: appUrls.USER_API + `(${guId})`,
                data: oData
            }
            return this.odata(configObject);

        },
        getMUserAPI: function () {
            const configObject = {
                method: "GET",
                url: appUrls.USER_API + `?$orderby=createdAt desc`,
            }
            return this.odata(configObject);
        },
        getFilteredMuserListAPI: function (queryString) {

            queryString = "?$filter=" + queryString;
            const configObject = {
                method: "GET",
                url: appUrls.USER_API + queryString,
            }
            return this.odata(configObject);
        },
        postMUserAPI: function (oData) {
            const configObject = {
                method: "POST",
                url: appUrls.USER_API,
                data: oData
            }
            return this.odata(configObject);
        },
        getMRoleAPI: function () {
            const configObject = {
                method: "GET",
                url: appUrls.ROLE_API,
            }
            return this.odata(configObject);
        },
        callCostCenter: function () {
            const configObject = {
                method: "GET",
                url: appUrls.COSTCENTER,
            }
            return this.odata(configObject);
        },

        postTCRAPI: function (oData) {
            const configObject = {
                method: "POST",
                url: appUrls.TCRF_HEADER_API,
                data: oData
            }
            return this.odata(configObject);
        },
        patchTCRAPIForPD: function (oData, guId) {
            const configObject = {
                method: "PATCH",
                url: appUrls.TCRF_HEADER_API + `(${guId})`,
                data: oData
            }
            return this.odata(configObject);
        },
        postTCADDetail: function (oData) {
            const configObject = {
                method: "POST",
                url: appUrls.TCAD_DETAIL_API,
                data: oData
            }
            return this.odata(configObject);
        },
        patchTCADDetail: function (oData, guId) {
            const configObject = {
                method: "PATCH",
                url: appUrls.TCAD_DETAIL_API + `(${guId})`,
                data: oData
            }
            return this.odata(configObject);
        },
        postAttachmentAPI: function (oFileData) {
            const configObject = {
                method: "POST",
                url: appUrls.Attactment_API,
                data: oFileData
            }
            return this.odata(configObject);
        },
        downloadAttachmentAPI: function (oFileData) {
            const configObject = {
                method: "POST",
                url: appUrls.Download_Attactment_API,
                data: oFileData
            }
            return this.odata(configObject);
        },
        viewAttachmentAPI: function (oFileData) {
            const configObject = {
                method: "POST",
                url: appUrls.Download_Attactment_API,
                data: oFileData
            }
            return this.odata(configObject);
        },
        getBuyerAPI: function () {
            const configObject = {
                method: "GET",
                url: appUrls.BUYER_API,
            }
            return this.odata(configObject);
        },
        getCategoryAPI: function () {
            const configObject = {
                method: "GET",
                url: appUrls.CATEGORY_API,
            }
            return this.odata(configObject);
        },
        getUserLookupAPI: function () {
            const configObject = {
                method: "GET",
                url: appUrls.API_WORKFORCE_PERSON,
            }
            return this.odata(configObject);
        },
        getUserLookupAPIForUpdateConfig: function () {
            const configObject = {
                method: "GET",
                url: appUrls.API_WORKFORCE_PERSON,
            }
            return this.odata(configObject);
        },
        getTechnoUserLookupAPI: function () {
            const configObject = {
                method: "GET",
                url: appUrls.USER_API + `?$expand=UserRoleCode&$filter=UserRoleCode_RoleCode_RoleConstant eq 'TECHNOLOGIST'`,
            }
            return this.odata(configObject);
        },
        getMerchantAPI: function () {
            const configObject = {
                method: "GET",
                url: appUrls.MERCHANT_API,
            }
            return this.odata(configObject);
        },
        getFilteredTCRFHeaderListAPI: function (queryString) {
            queryString = "?$filter=" + queryString;
            const configObject = {
                method: "GET",
                url: appUrls.TCRF_HEADER_API + queryString,
            }
            return this.odata(configObject);
        },
        getFilteredTCRFSearchListAPI: function (oData) {
            const configObject = {
                method: "POST",
                url: appUrls.TCRF_HEADER_LIST,
                data: oData
            }
            return this.odata(configObject);
        },
        getFilteredTCADDetailListAPI: function (queryString) {
            queryString = "?$filter=" + queryString;
            const configObject = {
                method: "GET",
                url: appUrls.TCAD_DETAIL_API + queryString,
            }
            return this.odata(configObject);
        },
        getFilteredTCADDetailSearchListAPI: function (oData) {
            const configObject = {
                method: "POST",
                url: appUrls.TCAD_HEADER_LIST,
                data: oData
            }
            return this.odata(configObject);
        },

        getItemGroup: function () {
            const configObject = {
                method: "GET",
                url: appUrls.API_ITEMDESCRIPTION,
            }
            return this.odata(configObject);
        },
        getItemCode: function (data) {
            const configObject = {
                method: "GET",
                url: appUrls.API_ITEMDESCRIPTION + "('" + data + "')" + "?$expand=to_Description"
            }
            return this.odata(configObject);
        },
        getProductNumber: function (data) {
            const configObject = {
                method: "GET",
                url: appUrls.API_ITEMDESCRIPTION + "?$expand=to_Description"
            }
            return this.odata(configObject);
        },
        getUserByBuyer: function (data) {
            const configObject = {
                method: "GET",
                url: appUrls.Murl + "&$expand=Buyer($filter=BuyerCode eq '" + data + "')"
            }
            return this.odata(configObject);
        },

        getPdCoordinatorAPI: function () {
            const configObject = {
                method: "GET",
                url: appUrls.API_PDCOORDINATOR,
            }
            return this.odata(configObject);
        },

        getItemDescription: function () {
            const configObject = {
                method: "GET",
                url: appUrls.API_ITEMDESCRIPTION,
            }
            return this.odata(configObject);
        },
        getAPIForFragment: function (inputId, data) {
            if (inputId == "buyer") {
                return this.getBuyerAPI();
            }
            else if (inputId == "buyerTable") {
                return this.getBuyerAPI();
            }
            else if (inputId == "pdCoordinator") {
                return this.getPdCoordinatorAPI();
            } else if (inputId == "itemDescription") {
                return this.getItemDescription();
            } else if (inputId == "itemGroup") {
                return this.getItemGroup();
            } else if (inputId == "merchant") {
                return this.getMerchantAPI();
            } else if (inputId == "department") {
                return this.getDepartment();
            } else if (inputId == "user") {
                return this.getUser(data);
            } else if (inputId == "userseek") {
                return this.getUser(data);
            } else if (inputId == "deptseek") {
                return this.getDepartment();
            } else if (inputId == "category") {
                return this.getCategoryAPI();
            } else if (inputId === "materialCategory" || inputId === "categoryCode") {
                return this.getCategoryAPI();
            } else if (inputId == "configDept")
                return this.getConfigDepartment(data);
            else if (inputId == "itemcode")
                return this.getItemCode(data);
            else if (inputId == "productNo" || inputId == "subProductNo" || inputId == "childProductNo")
                return this.getProductNumber();
            else if (inputId == "cadNo")
                return this.getTCRFHeaderListAPI();
            else if (inputId == "caddtlNo")
                return this.getViewDataCADDetailAPI();
            else if (inputId == "cadNoDetail")
                return this.getCADRequestNoAPI();
            else if (inputId == "oldcrf")
                return this.getTCRFHeaderListAPI();
            else if (inputId == "userLookup")
                return this.getUserLookupAPI();
            else if (inputId == "role")
                return this.getMRoleAPI();
            else if (inputId == "tech")
                return this.getTechnoUserLookupAPI();
            else if (inputId == "crno")
                return this.getTechnoUserLookupAPI();
            else if (inputId == "deptSearch")
                return this.getDepartment();
            else if (inputId == "mfgprocess" || inputId == "subMfgprocess" || inputId == "childMfgprocess")
                return this.getMfgProcess();
            else if (inputId == "depthead")
                return this.getDTPHead();
            else if (inputId == "operationMain" || inputId == "operationChild" || inputId == "operationSub")
                return this.getMOperation(data);
            else if (inputId == "cadDetailNo")
                return this.getCADDetailNoListAPI();
        },
        getDTPHead: function () {
            const configObject = {
                method: "GET",
                url: appUrls.USER_API + `?$filter=UserRoleCode_RoleCode_RoleConstant eq 'DTP_HEAD'`,
            }
            return this.odata(configObject);
        },


        getDepartment: function () {
            const configObject = {
                method: "GET",
                url: appUrls.API_DEPARTMENT,
            }
            return this.odata(configObject);
        },
        getMfgProcess: function () {
            const configObject = {
                method: "GET",
                url: appUrls.API_MfgProcess,
            }
            return this.odata(configObject);
        },
        getMOperation: function (data) {

            const configObject = {
                method: "GET",
                url: appUrls.API_MOperation + `? $filter=SAP_PARENT_UUID eq '${data}'&$select=SAP_UUID,SAP_PARENT_UUID,OperationNamewithSymbolsCode,OperationNamewithSymbolsName`,
            }
            return this.odata(configObject);

        },
        getConfigDepartment: function (costcenter) {
            const configObject = {
                method: "GET",
                url: appUrls.API_DEPARTMENT + `?$filter=CostCenter eq '${costcenter}'`,
            }
            return this.odata(configObject);
        },
        getConfigDepartmentForUpdate: function (costcenter) {
            const configObject = {
                method: "GET",
                url: appUrls.API_DEPARTMENT + `?$filter=CostCenter eq '${costcenter}'`,
            }
            return this.odata(configObject);
        },
        getUser: function (costcenter) {
            const configObject = {
                method: "GET",
                url: appUrls.USER_API + `?$filter=DepartmentCode eq '${costcenter}'&$expand=UserRoleCode`
            }
            return this.odata(configObject);
        },
        getOldCadNumber: function () {
            const configObject = {
                method: "GET",
                url: appUrls.TCRF_HEADER_API,
            }
            return this.odata(configObject);
        },
        getStagefields: function (FormType) {
            const configObject = {
                method: "GET",
                url: appUrls.API_STAGE + `?$filter=OrderBy eq 1 and FormType eq '${FormType}'`,
            }
            return this.odata(configObject);
        },
        getEnableDisableAPI: function (roleId, stageCode) {
            const configObject = {
                method: "GET",
                url: appUrls.ENABLE_DISABLE_API + `?$expand=Detail&$filter=RoleCode_RoleCode_RoleConstant eq '${roleId}' and StageCode_StageCode_StageConstant eq '${stageCode}'`,
            }
            return this.odata(configObject);
        },
        getAllDisableControlAPI: function (roleId) {
            const configObject = {
                method: "GET",
                url: appUrls.ENABLE_DISABLE_API + `?$filter=RoleCode eq ${null} and StageCode eq ${null} and FormType eq 'CRF'&$expand=Detail`,
            }
            return this.odata(configObject);
        },
        getDataOnOldCadReqNo: function (reqId) {
            const configObject = {
                method: "GET",
                url: appUrls.TCRF_HEADER_API + `?$expand=MerTeamHead,MerTL,MerATL,TechnoUserId,PDCUserId,QualityATLUserId,QualityTLUserId,DesignerUserId,Material,InspDraw($expand=DraftUserID,DraftAttachmentAbsId,InspRefDocAbsId)&$filter=CrfReqUUID eq ${reqId}`,
            }
            return this.odata(configObject);
        },
        getDataOnCADDetailNo: function (crfReqUUID) {
            const configObject = {
                method: "GET",
                url: appUrls.TCRF_HEADER_API + `?$expand=MerTeamHead,MerTL,MerATL,TechnoUserId,PDCUserId,QualityATLUserId,QualityTLUserId,DesignerUserId,Material,InspDraw($expand=DraftUserID,DraftAttachmentAbsId,InspRefDocAbsId)&$filter=CrfReqUUID eq ${crfReqUUID}`,
            }
            return this.odata(configObject);
        },
        getConfigListAPI: function () {
            const configObject = {
                method: "GET",
                url: appUrls.Config_API,
            }
            return this.odata(configObject);
        },
        onBuyerSelectionAPIForOthers: function (buyerCode,catCode) {
            const configObject = {
                method: "GET",
                url: appUrls.USER_API + `?$select=UserRoleCode_RoleCode_RoleConstant,Username&$expand=Buyer($filter=BuyerCode eq '${buyerCode}' and MCatCode eq '${catCode}')`,
            }
            return this.odata(configObject);
        },

        getTechnoUserLookupAPI: function () {
            const configObject = {
                method: "GET",
                url: appUrls.USER_API + `?$expand=UserRoleCode&$filter=UserRoleCode_RoleCode_RoleConstant eq 'TECHNOLOGIST'`,
            }
            return this.odata(configObject);
        },

        callMetrialApi: function () {
            const configObject = {
                method: "GET",
                url: appUrls.API_Metrial,
            }
            return this.odata(configObject);
        },
        getAssignProdEngg: function (buyerCode) {
            const configObject = {
                method: "GET",
                url: appUrls.USER_API + `?$expand=Buyer($filter=BuyerCode eq '${buyerCode}')&$filter=UserRoleCode_RoleCode_RoleConstant eq 'PRODUCT_ENGG'`,
            }
            return this.odata(configObject);
        },
        onSearchLookupAPI: function (sQuery) {
            const configObject = {
                method: "GET",
                url: appUrls.API_DEPARTMENT + `?$filter=contains(CostCenter,'${sQuery}')`,
            }
            return this.odata(configObject);
        },
        getCOPCostingAPI: function (oData) {
            const configObject = {
                method: "GET",
                url: appUrls.COP_COSTING_HEADER,
                data: oData
            }
            return this.odata(configObject);
        },
        getEnableDisableAPIForApproveBtn: function (oData) {
            const configObject = {
                method: "POST",
                url: appUrls.ENABLE_DISABLE_BTN,
                data: oData
            }
            return this.odata(configObject);
        },
        getEnableDisableAPIApproveBtnForCAD: function (oData) {
            const configObject = {
                method: "POST",
                url: appUrls.ENABLE_DISABLE_BTN_CAD,
                data: oData
            }
            return this.odata(configObject);
        },
        postSeekAdviceCADAPI: function (oData,guId) {
            const configObject = {
                method: "PATCH",
                url: appUrls.TCAD_DETAIL_API + `(${guId})`,
                data: oData
            }
            return this.odata(configObject);
        },
        postSeekAdviceCRFAPI: function (oData,guId) {
            const configObject = {
                method: "PATCH",
                url: appUrls.TCRF_HEADER_API + `(${guId})`,
                data: oData
            }
            return this.odata(configObject);
        },
        getViewDataConfigurationAPI: function (guId) {
            const configObject = {
                method: "GET",
                url: appUrls.USER_API + `(${guId})?$expand=Buyer`
            }
            return this.odata(configObject);
        },
        getUpdatedDeptAPI: function (costcenter) {
            const configObject = {
                method: "GET",
                url: appUrls.API_DEPARTMENT + `?$filter=CostCenter eq '${costcenter}'`,
            }
            return this.odata(configObject);
        },

    });
    return new WebService();
});
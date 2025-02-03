namespace Stonemen;

using {managed} from '@sap/cds/common';

entity MStage : managed {
    key StageGuid           : UUID;
        StageCode           : String;
        Description         : String;
        IsApproval          : Enum_YesNo default 'N';
        SendEmail           : Enum_YesNo default 'Y';
        SendAppNotification : Enum_YesNo default 'Y';
        NoOfApprovals       : Int16 default-1;
        NoOfRejections      : Int16 default-1;
        DelMark             : Enum_DelMark default 0;
        Remarks             : String;
        Role                : Composition of many CStageRole
                                  on Role.Stage = $self;
}

entity CStageRole : managed {
    key StageRoleGuid : UUID;
        Stage         : Association to one MStage;
        StageCode     : String = Stage.StageCode;
        RoleCode      : String = Role.RoleCode;
        Role          : Association to one MRole;
        DelMark       : Enum_DelMark default 0;
        Remarks       : String;
        // RoleType      : Int32 default 0; //TCM
        RoleType      : String default '0'; // Rishiraj
        RowNumber     : Int64;
}

entity MEnum : managed {
    key EnumGuid        : UUID;
        EnumCode        : String;
        EnumDescription : String;
        EnumType        : String;
}

entity MEmp : managed {
    key EmpGuID : UUID;
        EmpID   : Integer;
        EmpName : String;
        cEmpEdu : Composition of many CEmpEdu
                      on cEmpEdu.mEmp = $self;
        cEmpFam : Composition of many CEmpFam
                      on cEmpFam.mEmp = $self;
}

entity CEmpEdu : managed {
    key EduGuid  : UUID;
        EduID    : Integer;
        DegreeID : Integer;
        YOP      : Integer;
        mEmp     : Association to one MEmp;
}

entity CEmpFam : managed {
    key FamGuid      : UUID;
        FamID        : Integer;
        MemName      : Integer;
        RelationType : Integer;
        mEmp         : Association to one MEmp;
}

entity MReferenceType : managed {
    key ReferenceGuid : UUID;
        TableCode     : String NULL;
        TableName     : String NULL;
        TableDesc     : String NULL;
        DelMark       : Enum_DelMark default 0;
        Remarks       : String NULL;
}


entity DAttachment : managed {
    key AttachmentGuId   : UUID;
        AttachmentName   : String;
        OrgFileName      : String;
        OrgFileExtension : String;
        SysFileName      : String;
        SysFileExtension : String;
        ReferenceType    : Integer;
        ReferenceId      : Integer;
        ReferenceGuid    : UUID;
        SysFilePath      : String;
        UploadedOnCloud  : Enum_YesNo default 'N';
        DelMark          : Enum_DelMark default 0;
        Remarks          : String;
}

entity MManufacturing : managed {
    key ManufacturingGuid : UUID;
        ManufacturingCode : String;
        ManufacturingName : String;
        Operation         : Composition of many CManufacturingOpDetail
                                on Operation.Parent = $self;
        DelMark           : Enum_DelMark default 0;
        Remarks           : String;
}

entity CManufacturingOpDetail : managed {
    key ManufacturingOpDetailGuid : UUID;
        OperationProcessCode      : String;
        OperationProcessName      : String;
        Parent                    : Association to one MManufacturing;
        DelMark                   : Enum_DelMark default 0;
        Remarks                   : String;
}

entity MeetingConfig : managed {
    key MeetingConfigGuid : UUID;
        TimeSlotMinutes   : Integer;
        StartTime         : Timestamp;
        EndTime           : Timestamp;
        DelMark           : Enum_DelMark default 0;
        Remarks           : String;
}

entity MMenu : managed {
    key MenuGuid       : UUID;
        MenuCode       : String;
        Description    : String;
        ParentMenuCode : String = ParentMenuGuid.MenuCode; // default-1;
        ParentMenuGuid : Association to one MMenu;
        MenuIcon       : String;
        MenuPath       : String;
        OrderBy        : Integer;
        DelMark        : Enum_DelMark default 0;
        Remarks        : String;
        Role           : Composition of many CMenuRoleAccessDetail
                             on Role.Menu = $self;
        IsActive       : Enum_YesNo default 'Y';

}

entity MRole : managed {
    key RoleGuid    : UUID;
        RoleCode    : String not null;
        Description : String;
        DelMark     : Enum_DelMark default 0;
        Remarks     : String;
        Menu        : Composition of many MMenuRoleAccess
                          on Menu.Role = $self;
        Stage       : Association to many CStageRole
                          on Stage.Role = $self;
}

entity MMenuRoleAccess : managed {
    key MenuRoleAccessGuid : UUID;
        Role               : Association to one MRole;
        RoleCode           : String = Role.RoleCode;
        DelMark            : Enum_DelMark default 0;
        Remarks            : String;
        Detail             : Composition of many CMenuRoleAccessDetail
                                 on Detail.Parent = $self;
}

entity CMenuRoleAccessDetail : managed {
    key MenuRoleAccessDetailGuid : UUID;
        Parent                   : Association to one MMenuRoleAccess;
        Menu                     : Association to one MMenu;
        MenuCode                 : String = Menu.MenuCode;
        Add                      : Boolean;
        Update                   : Boolean;
        View                     : Boolean;
        DelMark                  : Enum_DelMark default 0;
        Remarks                  : String;
}

entity MUser : managed {
    key UserGuid          : UUID;
        UserName          : String;
        UserCode          : String;
        Password          : String
        @mandatory;
        FirstName         : String;
        LastName          : String;
        EmailId           : String
        @mandatory;
        MobileNo          : String;
        DepartmentCode    : String;
        DepartmentName    : String;
        SubDepartmentCode : String;
        SubDepartmentName : String;
        Buyer             : Composition of many CUserBuyer
                                on Buyer.User = $self;
        Role              : Association to one MRole not null;
        UserRoleCode      : String = Role.RoleCode;
        Designation       : String;
        Manager           : Association to one MUser;
        ManagerName       : String = Manager.UserName;
        DelMark           : Enum_DelMark default 0;
        Remarks           : String;
        MaterialCategory  : Composition of many CUserMaterialCategory
                                on MaterialCategory.Parent = $self;
        ProductCategory   : Composition of many CUserProductCategory
                                on ProductCategory.Parent = $self;
        IsActive          : Enum_YesNo default 'Y';
}

entity CUserMaterialCategory : managed {
    key UserMaterialCategoryGuid : UUID;
        Parent                   : Association to one MUser;
        MaterialCategoryCode     : String;
        MaterialCategoryName     : String;
        DelMark                  : Enum_DelMark default 0;
        Remarks                  : String;
}

entity CUserProductCategory : managed {
    key UserProductCategoryGuid : UUID;
        Parent                  : Association to one MUser;
        ProductCategoryCode     : String;
        ProductCategoryName     : String;
        DelMark                 : Enum_DelMark default 0;
        Remarks                 : String;
        ProductCategoryGuid     : Association to one MProductCategory;
}

entity CUserBuyer : managed {
    key BuyerGuid : UUID;
        BuyerCode : String;
        BuyerName : String;
        User      : Association to one MUser;
        MCatCode  : String;
        MCatName  : String;
        DelMark   : Enum_DelMark default 0;
        Remarks   : String;
}

entity MBuyer : managed {
    key BuyerGuid : UUID;
        BuyerCode : String;
        BuyerName : String;
        Brand     : Composition of many CBuyerBrand
                        on Brand.Parent = $self;
        DelMark   : Enum_DelMark default 0;
        Remarks   : String;
}

entity CBuyerBrand : managed {
    key BuyerBrandGuid : UUID;
        Parent         : Association to one MBuyer;
        BrandCode      : String;
        BrandName      : String;
        DelMark        : Enum_DelMark default 0;
        Remarks        : String;
}

entity DTemplate : managed {
    key TemplateGuid    : UUID;
        TemplateName    : String not null;
        Description     : String NULL;
        ActiveStartDate : DateTime not null;
        ActiveEndDate   : DateTime not null;
        IsActive        : Enum_YesNo default 'Y ';
        DelMark         : Enum_DelMark default 0;
        Remarks         : String NULL;
        TemplateStages  : Composition of many CTemplateStage
                              on TemplateStages.Parent = $self;
        TemplateMenus   : Composition of many CTemplateMenu
                              on TemplateMenus.Parent = $self;
}

entity CTemplateStage : managed {
    key TemplateStageGuid : UUID;
        Parent            : Association to one DTemplate;
        Stage             : Association to one MStage;
        StageCode         : String = Stage.StageCode;
        StageSeqId        : Integer;
        DelMark           : Enum_DelMark default 0;
        Remarks           : String;
}

entity CTemplateMenu : managed {
    key TemplateMenuGuid : UUID;
        Parent           : Association to one DTemplate;
        Menu             : Association to one MMenu;
        MenuCode         : String = Menu.MenuCode;
        MenuSubType      : String; //CAD , Rendering, Handwritten
        DelMark          : Enum_DelMark default 0;
        Remarks          : String;
}

entity MCrfControls : managed {
    key ControlsID    : UUID;
        RoleCode      : Association to one MRole;
        RoleCodeName  : String = RoleCode.RoleCode;
        Detail        : Composition of many MCrfControlDetail
                            on Detail.Parent = $self;
        StageCode     : Association to one MStage;
        StageCodeName : String = StageCode.StageCode;
        FormType      : String;
        IsActive      : Enum_YesNo default 'Y';
        Menu          : Association to one MMenu;
}

entity MCrfControlDetail : managed {
    key ControlsDetailID : UUID;
        Parent           : Association to one MCrfControls;
        ControlName      : String;
        Enabled          : Boolean default true;
        TableName        : String;
        ControlId        : String;
        IsActive         : Enum_YesNo default 'Y';
        Visible          : Boolean default true;
}

entity MFormControl : managed {
    key FormControlGuid : UUID;
        Detail          : Composition of many CFormControlDetail
                              on Detail.Parent = $self;
        Menu            : Association to one MMenu;
        Scenario        : String;
        Stage           : Association to one MStage;
        Role            : Association to one MRole;
        DelMark         : Enum_DelMark default 0;
        Remarks         : String;
        SubMenu1        : Composition of many CFormControlSubMenu1Detail
                              on SubMenu1.Parent = $self;
        SubMenu2        : Composition of many CFormControlSubMenu2Detail
                              on SubMenu2.Parent = $self;
}

entity CFormControlSubMenu1Detail : managed {
    key FormControlSubMenu1DetailGuid : UUID;
        Parent                        : Association to one MFormControl;
        SubMenu                       : String;
        DelMark                       : Enum_DelMark default 0;
        Remarks                       : String;
}

entity CFormControlSubMenu2Detail : managed {
    key FormControlSubMenu2DetailGuid : UUID;
        Parent                        : Association to one MFormControl;
        SubMenu                       : String;
        DelMark                       : Enum_DelMark default 0;
        Remarks                       : String;
}

entity CFormControlDetail : managed {
    key FormControlDetailGuid : UUID;
        Parent                : Association to one MFormControl;
        ControlId             : String;
        ControlName           : String;
        Enabled               : Boolean default true;
        Visible               : Boolean default true;
        TableName             : String;
        DelMark               : Enum_DelMark default 0;
        Remarks               : String;
}

entity DData : managed {
    key DataGuid         : UUID;
        Template         : Association to one DTemplate;
        ActiveStartDate  : DateTime;
        ActiveEndDate    : DateTime;
        ObjectGuid       : UUID not null;
        Menu             : Association to one MMenu;
        MenuCode         : String  = Menu.MenuCode;
        SubMenu          : String;
        DelMark          : Enum_DelMark default 0;
        Remarks          : String;
        Stage            : Association to one MStage;
        StageCode        : String  = Stage.StageCode;
        NoOfApprovalReq  : Integer = Stage.NoOfApprovals;
        NoOfRejectionReq : Integer = Stage.NoOfRejections;
        TotalApproved    : Integer not null default 0;
        TotalRejected    : Integer not null default 0;
        ApprovalStatus   : Enum_ApprovalStatus default 'NA';
        //RowStatus : Enum_RowStatus default 'OPEN';
        RowStatus        : Enum_RowStatus default 'NA';
        DataFlow         : Composition of many CDataFlow
                               on DataFlow.Parent = $self;
        IsCurrentStage   : Enum_YesNo default 'N';
        RowNumber        : Integer default 0; //TCM
}

entity CDataFlow : managed {
    key DataFlowGuid      : UUID;
        Parent            : Association to one DData;
        User              : Association to one MUser;
        UserName          : String = User.UserName;
        RowStatus         : Enum_RowStatus default 'OPEN';
        ApprovalStatus    : Enum_ApprovalStatus default 'NA';
        IsEMailSent       : Enum_YesNo default 'N';
        InAppNotification : Enum_YesNo default 'N';
        RowNumber         : Int64;
        ProcessDate       : Timestamp;
        StartDate         : Timestamp;
        EndDate           : Timestamp;
        Type              : String;
        DelMark           : Enum_DelMark default 0;
        Remarks           : String;
        // UserType          : Enum_UserType default 1;
        UserType          : String default 0; // add by Rishiraj - 20/01/2025
        UserEmail         : String = User.EmailId;
}

// @assert.unique: {NotifyTemplateCode: [ NotifyTemplateCode ]}
entity MNotifyTemplate : managed {
    key NotifyTemplateGuid    : UUID;
        NotifyTemplateCode    : String not null;
        NotifyTemplateSubject : String;
        Description           : String;
        NotifyTemplateBody    : LargeString not null;
        NotificationBody      : LargeString;
        Type                  : String;
        DelMark               : Enum_DelMark default 0;
        Remarks               : String NULL;
        IsActive              : Enum_YesNo default 'Y ';
        MenuCode              : String;
        MenuGuid              : Association to MMenu;
}

entity MEmailParent : managed {
    key EmailParentGuid    : UUID;
        NotifyTemplateGuid : Association to MNotifyTemplate;
        EmailSubject       : String;
        EmailBody          : LargeString not null;
        EmailFrom          : String;
        DelMark            : Enum_DelMark default 0;
        Status             : String;
        Remarks            : String;
}

entity CEmailChild : managed {
    key EmailChildGuid  : UUID;
        EmailParentGuid : Association to MEmailParent;
        RecepientEmail  : String;
        EmailType       : String not null; // To , Cc, Bcc
        DelMark         : Enum_DelMark default 0;
        Remarks         : String;
}

entity DCrfHeader : managed {
    key CrfReqGuid          : UUID;
        CrfReqNo            : Integer64;
        SaveOrSubmit        : Enum_SaveOrSubmit not null;
        ReqTyp              : Enum_RequestType not null;
        OldCrfReqNoGuid     : Association to one DCrfHeader;
        // OldCrfReqNo         : Integer64;
        OldCrfReqNo         : String; //insert in this field Cad Uneeque number
        InputType           : Enum_InputType not null;
        MerReqDate          : Date;
        BuyerCode           : String;
        BuyerName           : String;
        BuyerGuid           : UUID; //Trupti
        Category            : String;
        ItemCode            : String;
        ItemDesc            : String;
        ItemGroup           : String;
        ItemGroupName       : String;
        CrfDelDate          : Date;
        Reamrks             : String;
        ECNNo               : String;
        CarNo               : String;
        CRFNo               : String;
        ProductCatCode      : String;
        ProductCatName      : String;
        SubCatCode          : String;
        SubCatName          : String;
        Length              : Decimal(19, 2);
        TolLength           : Decimal(19, 2);
        Width               : Decimal(19, 2);
        TolWidth            : Decimal(19, 2);
        Height              : Decimal(19, 2);
        TolHeight           : Decimal(19, 2);
        UnitCode            : String;
        UnitName            : String;
        DiaTop              : Decimal(19, 2);
        TolDiaTop           : Decimal(19, 2);
        DiaLeft             : Decimal(19, 2);
        TolDiaLeft          : Decimal(19, 2);
        DiaRight            : Decimal(19, 2);
        TolDiaRight         : Decimal(19, 2);
        DiaBottom           : Decimal(19, 2);
        TolDiaBottom        : Decimal(19, 2);
        CrfStatus           : Enum_CrfStatus not null;
        CrfReqDate          : Date;
        PDDate              : Date;
        PDNo                : String;
        ApprovalStatus      : Enum_ApprovalStatus not null;
        ApprovalComments    : LargeString;
        newApprovalStatus   : Enum_ApprovalStatus not null;
        newApprovalComment  : LargeString;
        CreatedByUserID     : Association to one MUser;
        CreatedByUserName   : String = CreatedByUserID.UserName;
        Template            : Association to one DTemplate;
        Stage               : Association to one MStage;
        CrfStageCode        : String = Stage.StageCode;
        CrfStageName        : String = Stage.Description;
        appliDiamter        : Enum_YesNo default 'N';
        appliDimension      : Enum_YesNo default 'N';
        InspDraw            : Composition of many CCrfAttachment
                                  on InspDraw.Parent = $self;
        UserAssign          : Composition of many CCrfMeetingDetail
                                  on UserAssign.Parent = $self;
        SeekAdvice          : Composition of many CCrfSeekAdvice
                                  on SeekAdvice.Parent = $self;
        Material            : Composition of many CCrfMaterial
                                  on Material.Parent = $self;
        MaterialComments    : String;
        loginUserID         : Association to one MUser;
        TotalApproved       : Integer default 0;
        TotalRejected       : Integer default 0;
        MMenu               : Association to one MMenu;
        MenuCode            : String = MMenu.MenuCode;
        CrfCategory         : Enum_CrfCategory not null;
        PDDateDate          : Date;
        OldCADUUID          : UUID;
        OldCADNo            : Integer64;
        MCatCode            : String;
        MCatName            : String;
        UOMCode             : String;
        UOMName             : String;
        TimeSlotMinutes     : Int64;
        StartTime           : Time;
        EndTime             : Time;
        EstCostInDocCur     : Decimal(19, 2);
        DocumentCur         : String;
        ExchRate            : Decimal(19, 2);
        BuyerCur            : String;
        EstCostInINR        : Decimal(19, 2);
        //  Brand : Composition of many CCrfBrand on Brand.Parent = $self;
        Team                : Composition of many CCrfTeam
                                  on Team.Parent = $self;
        Accessibility       : String; //enum table
        ApprovalTransaction : Composition of many DData
                                  on ApprovalTransaction.ObjectGuid = $self.CrfReqGuid;
        CategoryCode        : String;
        CategoryUniqueNum   : String;
        CADLevel            : Enum_CADLevel;
        DelMark             : Enum_DelMark default 0;
        ProductCatGuid      : Association to one MProductCategory;
        Brand               : Association to CBuyerBrand;
        BrandCode           : String;
        BrandName           : String;
        Diameter            : Decimal(19, 2);
        TolDiameter         : Decimal(19, 2);
        HolderCode          : String;
        HolderName          : String;
        ShapeCode           : String;
        ShapeName           : String;
        CordCode            : String;
        CordName            : String;
        CountryCode         : String;
        CountryDescription  : String;


}

entity CCrfAttachment : managed {
    key CrfAttachmentsGuid : UUID;
        Parent             : Association to one DCrfHeader;
        AttachmentRemarks  : String;
        User               : Association to one MUser;
        Attachment         : Composition of many DAttachment
                                 on Attachment.ReferenceGuid = CrfAttachmentsGuid;
        Stage              : Association to one MStage;
        StageCode          : String = Stage.StageCode;
        ApprovalStatus     : Enum_ApprovalStatus default 'NA';
        DelMark            : Enum_DelMark default 0;
        Remarks            : String NULL;
        RowStatus          : Enum_RowStatus default 'OPEN';
        RowNumber          : Int64 default 1;
}

entity CCrfMeetingDetail : managed {
    key CrfUserAssgGuid   : UUID;
        RowNumber         : Int64;
        DepartmentCode    : String;
        DepartmentName    : String;
        UserID            : Association to one MUser;
        UserCode          : String = UserID.UserCode;
        UserName          : String = UserID.UserName;
        UserEmailId       : String = UserID.EmailId;
        CallMeeting       : Enum_YesNo default 'Y';
        MeetingRemarks    : String;
        IsMeetingAttended : Enum_YesNo;
        Parent            : Association to one DCrfHeader;
        UserAvailable     : String;
        MeetingStartDate  : Timestamp;
        MeetingEndDate    : Timestamp;
        DelMark           : Enum_DelMark default 0;
        Remarks           : String NULL;
        SendEmail         : Enum_YesNo default 'Y'; //TCM
}

entity CCrfSeekAdvice : managed {
    key CrfSeekAdviceGuid    : UUID;
        RowNumber            : Int64;
        DepartmentCode       : String;
        DepartmentName       : String;
        QuestionToUser       : Association to one MUser;
        QuestionToUserName   : String = QuestionToUser.UserName;
        Role                 : Association to one MRole;
        Question             : String;
        Answer               : String;
        Attachment           : Composition of many DAttachment
                                   on Attachment.ReferenceGuid = CrfSeekAdviceGuid;
        Parent               : Association to one DCrfHeader;
        QuestionFromUser     : Association to one MUser;
        QuestionFromUserName : String = QuestionFromUser.UserName;
        NewAlert             : String;
        DelMark              : Enum_DelMark default 0;
        SendEmailQuestion    : Enum_YesNo default 'Y';
        SendEmailAnswer      : Enum_YesNo default 'N'
}

entity CCrfMaterial : managed {
    key CrfMaterialGuid     : UUID;
        RowNumber           : Int64;
        MaterialAutoCode    : String;
        MaterialCatHanaText : String;
        MaterialCatFreeText : String;
        Parent              : Association to one DCrfHeader;
        UserComments        : LargeString;
        TestProtocol        : String;
        DelMark             : Enum_DelMark default 0;
}

entity CCrfTeam : managed {
    key CrfTeamGuid              : UUID;
        Parent                   : Association to one DCrfHeader;
        User                     : Association to one MUser;
        DelMark                  : Enum_DelMark default 0;
        RoleGuid                 : Association to one MRole;
        RoleCode                 : String = RoleGuid.RoleCode;
        RoleName                 : String = RoleGuid.Description;
        UserName                 : String = User.UserName;
        UserMaterialCategoryCode : String;
        UserMaterialCategoryName : String;
        ProductCategoryCode      : String;
        ProductCategoryName      : String;
        ProductCatGuid           : Association to one MProductCategory;
        RowNumber                : Int64 default 1;
}

entity CCrfBrand : managed {
    key CrfBrandGuid : UUID;
        Parent       : Association to one DCrfHeader;
        BrandCode    : String;
        BrandName    : String;
        DelMark      : Enum_DelMark default 0;

}

entity PrjStatusMaster {
    key prj_id         : UUID;
        prjstatus_code : String(100);
        prjstatus_name : String(100);
}

entity TaskStatusMaster {
    key tsk_id         : UUID;
        tskstatus_code : String(100);
        tskstatus_name : String(100);
}

entity Tactionheader {
    key tah_id              : UUID;
        tah_sono            : String(100);
        tah_no              : Int64;
        tah_lineno          : String(100);
        tah_itemcode        : String(100);
        tah_itemdesc        : String(500);
        tah_prjtemplno      : String(100);
        tah_prjtemplnme     : String(100);
        tah_prjtempdesc     : String(500);
        tah_startdate       : Date;
        tah_prjstatuscode   : String(50);
        tah_prjstatusname   : String(100);
        tah_isactive        : String(100);
        tah_isdeleted       : String(100);
        tah_addbyEmpid      : UUID;
        tah_addbyEmpCode    : String(100);
        tah_addbyUsername   : String(100);
        tactiondetail       : Composition of many Tactiondetail
                                  on tactiondetail.tactionheader = $self;
        tah_sodate          : Date;
        tah_sodeldate       : Date;
        tah_soitemcategory  : String(100);
        tah_prjtempcategory : String(100);
        tah_prjtempnoofdays : String(100);
        tah_customercode    : String(100);
        tah_customername    : String(100);
}

entity Tactiondetail {
    key tahd_id                : UUID;
        tahd_depcode           : String(100);
        tahd_depname           : String(100);
        tahd_prjtaskid         : String(100);
        tahd_prjtaskname       : String(100);
        tahd_noofdays          : String(100);
        tahd_days              : String(100);
        tahd_plnstdate         : Date;
        tahd_plneddate         : Date;
        tahd_actstdate         : Date;
        tahd_acteddate         : Date;
        tahd_dldays            : String(100);
        tahd_tskstatuscode     : String(100);
        tahd_tskstatusdesc     : String(100);
        tahd_comments          : String(100);
        tahd_admincomments     : String(100);
        tactionheader          : Association to one Tactionheader;
        emp_id                 : Association to one MUser;
        emp_code               : String(100);
        emp_name               : String(100);
        tahd_rescostcentercode : String(100);
        tahd_rescostcentername : String(100);
        TaskType               : String(200);
        DocumentType           : String(200);
        APICode                : String(200);
}

entity TNotification : managed {
    key NotificationID      : UUID;
        Menu                : Association to one MMenu;
        MenuDesc            : String = Menu.Description;
        DocumentGUID        : UUID;
        DocumentNo          : Integer;
        // Role                : Association to one MRole;
        User                : Association to one MUser;
        UserName            : String = User.UserName;
        Status              : String;
        NotificatoinMessage : String;
        DateTime            : DateTime;
        Read                : Boolean;
        Clear               : Boolean default false;
        IsActive            : Enum_YesNo default 'Y';
}

entity MProductCategory : managed {
    key ProductCategoryGuid     : UUID;
        ProductCategoryCode     : String;
        ProductCategoryName     : String;
        DelMark                 : Enum_DelMark default 0;
        Remarks                 : String;
        FirstNum                : Integer64;
        IncrementBy             : Integer64;
        LastNum                 : Integer64;
        Prefix                  : String;
        Suffix                  : String;
        IsActive                : Enum_YesNo default 'Y';
        ProductCategoryCADLevel : Composition of many CProductCategoryCADLevel
                                      on ProductCategoryCADLevel.Parent = $self;
}

entity CProductCategoryCADLevel : managed {
    key ProductCategoryCADLevelGuid : UUID;
        Parent                      : Association to one MProductCategory;
        CADLevelCode                : String;
        CADLevelDescription         : String;
        IncrementBy                 : Int32;
        RowNumber                   : Int64;
        DelMark                     : Enum_DelMark default 0;
}

type Enum_ApprovalStatus    : String enum {
    NA;
    APPROVED;
    REJECTED;
    PENDING;
}

type Enum_CADLevel          : String enum {
    Easy;
    Critical;
    Medium;
}

type Enum_CrfCategory       : String enum {
    CAD;
    Rendering;
    Handwritten;
}

type Enum_CrfStatus         : String enum {
    New        = 'N';
    InProgress = 'WIP';
    Closed     = 'CLS';
    Cancelled  = 'C';
}

type Enum_DelMark           : Int16 enum {
    Yes        = 1;
    No         = 0;
}

type Enum_InputType         : String enum {
    Internal   = 'I';
    External   = 'E';
    ToSelect   = '-1';
}

type Enum_RequestType       : String enum {
    New        = 'N';
    Revision   = 'R';
    ToSelect   = '-1';
}

type Enum_RowStatus         : String enum {
    OPEN;
    CLOSED;
    NA;
    REFERENCE; //NEWLY ADDED
}

type Enum_SaveOrSubmit      : String enum {
    SAVE;
    SUBMIT;
    HOLD;
}

type Enum_StageFlowScenario : String enum {
    NA;
    APPROVED;
    REJECTED;
}

// type Enum_UserType          : Integer enum { removed by Rishiraj 20/01/2025
//     Approval_non_Mandatory_User = 2;
//     Approval_Mandatory_User     = 3;
//     Workflow_User               = 1;
// }

type Enum_YesNo             : String enum {
    Yes        = 'Y';
    No         = 'N';
}

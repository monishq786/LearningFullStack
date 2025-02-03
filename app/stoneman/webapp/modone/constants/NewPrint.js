//callingAPiForPrint()

function onDocumentLoad(id) {
    console.log('Received ID:', id);
    callingAPiForPrint(id);
    // You can now use the ID for further logic in your controller
    // Example: Fetch some data or update the UI based on the ID
}
function callingAPiForPrint(id) {
    var myHeaders = new Headers();

    myHeaders.append("Content-Type", "application/json");


    var requestOptions = {
        method: 'GET',
        // headers: myHeaders,
        contentType: "application/json; charset=utf-8",


        xhrFields: {
            withCredentials: true,
        },
        cors: [
            {
                enabled: false,
            },
        ],
        dataType: "json",
        force_ssl: false,
        contentType: "application/json; charset=utf-8",
        crossDomain: true,
        async: true,
    };
    let baseUrl = window.location.origin;

    // fetch(baseUrl + "/odata/v4/stoneman-crf/TCrfHeader(" + id + ")?$expand=TechnoUserId,Material,PDCUserId,QualityTLUserId,QualityATLUserId,DesignerUserId,InspDraw($expand=InspRefDocAbsId,DraftUserID),PDCAttachmentAbsId,MerTeamHead,MerTL,MerATL,UserAssign($expand=UserID),SeekAdvice($expand=UserID,RoleCode,SeekAdviceDocAbsId),ApprovalTransaction($expand=UserId)", requestOptions)
    fetch(baseUrl + "/odata/v4/stoneman-crf/TCrfHeader(" + id + ")?$expand=Team,Material", requestOptions)
        .then((response) => response.json())
        .then(result => {

            console.log("Result of apicalls:" + result);
            this.bindingData(result);
        })
        .catch(error => console.log('error', error));

    // function ends here
}

function bindingData(result) {
    // let delDate = new Date(result.CrfDelDate);
    let pdDate = new Date(result.PDDate);
    let crfDate = new Date(result.CrfReqDate);
    // let Crfno = new Date(result.CrfReqNo);


    let MaterialData = result.Material;
    // const itemDesc = result.ItemDesc || "N/A";
    // const crfDelDate = delDate.toLocaleDateString('en-GB').replace(/\//g, '-') || "N/A";
    const PDDate = pdDate.toLocaleDateString('en-GB').replace(/\//g, '-') || "N/A";
    const CRFDate = crfDate.toLocaleDateString('en-GB').replace(/\//g, '-') || "N/A";
    const PRODUCTCat = result.ProductCatName || "N/A";
    const UserMaterial1 = MaterialData[0].MaterialAutoCode || "N/A";
    const UserCmt1 = MaterialData[0].UserComments || "N/A";
    // const UserName1 = MaterialData[0].UserName || "N/A";
    const UserMaterial2 = MaterialData[1].MaterialAutoCode || "N/A";
    const UserCmt2 = MaterialData[1].UserComments || "N/A";
    // const UserName2 = MaterialData[1].UserName || "N/A";

    let team = result.Team;

    let d = team.filter(user => user.RoleCode == 'Product_Engee').map(user => user.UserName)
    let t1 = team.filter(user => user.RoleCode == 'TECHNOLOGIST').map(user => user.UserName)
    let t2 = team.filter(user => user.RoleCode == 'TECHNOLOGIST').map(user => user.UserName)
    let t3 = team.filter(user => user.RoleCode == 'TECHNOLOGIST').map(user => user.UserName)


    const s1 = t1[0] || "N/A";
    const s2 = t2[1] || "N/A";
    const s3 = t3[2] || "N/A";
    const Designer = d[0] || "N/A";
    const DocNo = result.CrfReqNo || "N/A";
    // const UnitName = result.UnitName || "N/A";

    // Inject the data into the appropriate table cells
    // document.querySelector("#productDesc").innerText = itemDesc;
    // document.querySelector("#CrfDelDate").innerText = crfDelDate;
    document.querySelector("#PDDate").innerText = PDDate;
    document.querySelector("#CRFDate").innerText = CRFDate;
    document.querySelector("#ProductCatName").innerText = PRODUCTCat;
    document.querySelector("#UserName1").innerText = s1;
    document.querySelector("#UserName2").innerText = s2;
    document.querySelector("#UserName3").innerText = s3;
    document.querySelector("#Designer").innerText = Designer;
    document.querySelector("#DocNo").innerText = DocNo;
    // document.querySelector("#DocNo").innerText = DocNo;
    document.querySelector("#UserMaterialCategoryName").innerText = UserMaterial1;
    document.querySelector("#UserComments").innerText = UserCmt1;
    document.querySelector("#UserMaterialCategoryName2").innerText = UserMaterial2;
    document.querySelector("#UserComments2").innerText = UserCmt2;
    // document.querySelector("#UnitName").innerText = UnitName;
    // // Example: If you have multiple fields to bind, do it similarly:
    // const materialCatInput = result.MaterialCat || "Unknown";
    // document.querySelector("#materialCatInput").innerText = materialCatInput;
}


//TODO - remove authentication in ILX system
// const authHeader = {'Authorization': 'Basic ' + btoa(':')}

// the system url for intelex
// const baseUrl = "https://cloud3.intelex.com/aionnorthdemo1/" + "api/v2/";


async function fetchRecordById(ilxObjectSysName, recordId, params="") {
   /*******************************************
    * 
    * Submit GET request to ILX API
    * 
    *    ilxObjectSysName: variable - objectSysName
    *    recordId: records uuid
    * 
    *  return JSON record data
    * 
    *******************************************/
   const options = {
      headers: ilxCreds // TODO: remove this line in ILX
   }

   // let params = new URLSearchParams(searchParams);
   // console.log(params.toString());
   let ILXResponse = await fetch(ilxUrl + 'object/' + ilxObjectSysName + '(' + recordId + ')', options);

   return await ILXResponse.json();
}


async function fetchSingleRecordDataWithParams(objectSysName, searchParams) {
/*******************************************
 * 
 * Submit GET request to ILX API
 * 
 *    Object: variable - objectSysName
 *    OData Query String: variable - searchParams
 * 
 *  return JSON record data
 * 
 *******************************************/
   const options = {
      headers: ilxCreds // TODO: remove this line in ILX
   }

   // let params = new URLSearchParams(searchParams);
   // console.log(params.toString());
   let ILXResponse = await fetch(ilxUrl + 'object/' + objectSysName + '?' + searchParams, options);
   
   return await ILXResponse.json();
}


async function submitFile(file) {
/*******************************************
 * 
 * Submit File to ILX API
 * 
 *    Object SysName: SysFileInfoEntity
 * 
 * Return File object json
 * 
 *******************************************/
   let formData = new FormData();
   formData.append('file', file);

   let options = {
      method: 'POST',
      body: formData,
      headers: ilxCreds  // TODO: remove this line in ILX 
   };

   let SFIEntityResponse = await fetch(ilxUrl + "object/SysFileInfoEntity", options);
   let r = await SFIEntityResponse.json();
   console.log(r);
   return r;
}




// async function submitFile2(file, i) {
//    /*******************************************
//     * 
//     * Submit File to ILX API
//     * 
//     *    Object SysName: SysFileInfoEntity
//     * 
//     * Return File object json
//     * 
//     *******************************************/
//       let formData = new FormData();
//       formData.append('file' + i, file);
   
//       let options = {
//          method: 'POST',
//          body: formData,
//          headers: authHeader  // TODO: remove this line in ILX 
//       };
   
//       let SFIEntityResponse = await fetch(baseUrl + "FileUpload", options);
//       let r = await SFIEntityResponse.json();
//       return r;
//    }



// async function submitFile(file, i) {
//    /*********************************************
//    *
//    *  File-only submit
//    *  TODO - swap for the other submit function below
//    *
//    *********************************************/
//     var formData = new FormData();
// 	 formData.append('file' + i, file);

//     console.log(file);
   
//    await $.ajax({
//       url: baseUrl + "object/SysFileInfoEntity",
//       type: "POST",
//       processData: false,
//       contentType: false,
//       data: formData,
//       dataType: 'json',
//       headers: authHeader,
//       success: function(data, textStatus, xhr) {
//          console.log(data.JSON);
//          return data
//       },
//       error: function(xhr, textStatus, errorThrown) {
//          throw errorThrown
//       }
//   })
// }










async function submit(objectSysName, data) {
   let headers = ilxCreds;
   headers['Content-Type'] = 'application/json'

   const options = {
      method: 'POST',
      body: JSON.stringify(data),
      headers: headers  // TODO: remove this line in ILX 
   };

   let ILXResponse = await fetch(ilxUrl + 'object/' + objectSysName, options);
   let r = await ILXResponse.json();
   console.log(r)
   return r;
}


async function update(odataId, data) {
   let headers = ilxCreds;
   headers['Content-Type'] = 'application/json'

   const options = {
      method: 'PATCH',
      body: JSON.stringify(data),
      headers: headers  // TODO: remove this line in ILX 
   };

   let ILXResponse = await fetch(odataId, options);
   return await ILXResponse.status;
}
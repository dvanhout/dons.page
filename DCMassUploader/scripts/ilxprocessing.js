const delay = ms => new Promise(res => setTimeout(res, ms));

/*******************************************
 * 
 *    ILXObjects
 * 
 *       This object is a store for configuration items. If the headers in the csv change, this needs to be updated
 *       This does not contain all the values in the csv
 * 
 *       KEYS - 
 *       --> sysName: Object's system name
 *       --> ilxSearchField: used with csvField in GET requests to filter for related record - see example   
 *       --> csvField: used with ilxSearchField in GET requests to filter for related record - see example
 * 
 *          EXAMPLE - 
 *             {siteURL}/api/v2/object/{sysName}?$filter={ilxSearchField} eq '{csvField.value}'
 * 
 *       --> values  - store previously retrieved records from ILX to cut down on duplicate requests
 *                - app will prefer to pick from here over GET request
 */
let ILXObjects = {
   Document: {sysName: 'DocDocumentEntity', ilxSearchField: '', csvField: '', values: []},
   DocumentRevision: {sysName: 'DocDocumentRevisionEntity', ilxSearchField: '', csvField: '', values: []},
   NewDocumentRevision: {sysName: 'DocCtrl_RevisionStdObject', ilxSearchField: '', csvField: '', values: []},
   Location: {sysName: 'SysLocationEntity', ilxSearchField: 'LocationCode', csvField: 'LocationCode', values: []},
   // NOTE: Employee csvField has multiple values and is different to the other objects
   Employee: {sysName: 'SysEmployeeEntity', ilxSearchField: 'Number', csvField: {owner: 'DocumentOwner', author: 'DocumentAuthor'}, values: []},
   DocumentLifecycle: {sysName: 'DocDocumentLifecycleEntity', ilxSearchField: 'Name', csvField: 'DocumentLifeCycle', values: []},
   Culture: {sysName: 'SysCultureEntity', ilxSearchField: 'Name', csvField: 'Language_Name', values: []},
   NumberingScheme: {sysName: 'DocCtrl_NumberingSchemeObject', ilxSearchField: 'Code', csvField: 'NumberingScheme', values: []},
   File: {sysName: 'SysFileInfoEntity', ilxSearchField: '', csvField: '', values: []},
   Folder: {sysName: 'DocFolderEntity', ilxSearchField: 'Code', csvField: 'DocumentFolderCode', values: []},
   RetentionClass: {sysName: 'DocCtrl_ClassifLevelObject', ilxSearchField: 'Code', csvField: 'RetentionClass', values: []},
   DocumentCategory: {sysName: 'DocCtrl_DocCategoryObject', ilxSearchField: 'Name', csvField: 'Type', values: []},
   
   // ControlTypes --> 'Controlled' or 'Uncontrolled'
   ControlType: {sysName: 'DocCtrl_ControlTypeObject', ilxSearchField: 'Value', csvField: 'ControlType', values: []},
   
   // StorageTypes --> 'File', 'URL', or 'PhysicalLoc' 
   StorageType: {sysName: 'DocCtrl_StorageTypeObject', ilxSearchField: 'Code', csvField: 'StorageType', values: []},
   Shortcut: {sysName: 'DocCtrl_ShortcutObject'},
   
   // DocumentStatus --> 'Draft', 'UnderReview', 'Released', 'Obsolete'
   DocumentStatus: {sysName: 'DocCtrl_DocStatusObject', ilxSearchField: 'Code', csvField: 'DocumentStatus', values: []}
}

const I = ILXObjects;


async function submitFiles(files, metaData) {

   for (localFile of files) {
      // find the right csv row data - checking that the filename and directory path matches from csv to actual file location 
      let csvFileInfo = findCsvRow(localFile, metaData);

      if (csvFileInfo !== undefined) {
         let fd = await submitFile(localFile.file);
         I.File.values.splice(metaData.ANDCNum, 0, fd);
      }
  }
}


/*******************************************
 * 
 *    processFile() 
 * 
 *       DESCIRPTION 
 *       This is the main function that creates a single Doc Control record with related data
 * 
 *       VARS
 *       --> docCtlFile - the document control file to be submitted to ILX
 *       --> csvData - list of key value pairs in the form [{key: value}, ...] where the key is the 
 *             csv column header and value is the cell value
 */
async function processFile(csvData) {

   // our main document
   let DocumentEntity = {};
   let DocumentRevisionEntity = {};

   try {
      // 1. submit file to /SysFileInfoEntity
      // fileData = await submitFile(docCtlFile, csvData.ANDCNum);
      // fileData = await submitFile(docCtlFile, csvData.ANDCNum);

      // fileData = I.File.values

      // the file data has been posted previously
      let fileData = I.File.values[csvData.ANDCNum];
      console.log(fileData);


      // 2. find related data
      let locationData = await findOrFetch(I.Location, csvData[I.Location.csvField]);
      let folderData = await findOrFetch(I.Folder, csvData[I.Folder.csvField]);
      let ownerData = await findOrFetch(I.Employee, csvData[I.Employee.csvField.owner]);
      let authorData = await findOrFetch(I.Employee, csvData[I.Employee.csvField.author]);
      let docLifeCycleData = await findOrFetch(I.DocumentLifecycle, csvData[I.DocumentLifecycle.csvField]);
      let numSchemeData = await findOrFetch(I.NumberingScheme, csvData[I.NumberingScheme.csvField]);
      let retentionClassData = await findOrFetch(I.RetentionClass, csvData[I.RetentionClass.csvField]);
      let docCategoryData = await findOrFetch(I.DocumentCategory, csvData[I.DocumentCategory.csvField]);
      let controlTypeData = await findOrFetch(I.ControlType, csvData[I.ControlType.csvField]);
      let storageTypeData = await findOrFetch(I.StorageType, csvData[I.StorageType.csvField]);
      let documentStatusData = await findOrFetch(I.DocumentStatus, csvData[I.DocumentStatus.csvField])

      // ISSUE - we cannot query language data...it is a locked system object - does it default to the api user profile culture?
      // let languageData = await findOrFetch(I.Culture, csvData[I.Culture.csvField]);


      // 3. Create the object entities in ILX format
      
      // ---- DOCUMENT ENTITY ----
      DocumentEntity = {
         // 'Code': csvData['DocumentNumber'],
         // 'NextReviewDate': csvData['NextReviewDate'],
         'Title': csvData['DocumentTitle'],
         'DocumentStatus@odata.bind': documentStatusData['@odata.id'],
         'Owner@odata.bind': ownerData['@odata.id'],
         'Folder@odata.bind': folderData['@odata.id'],
         'Location@odata.bind': locationData['@odata.id'],
         'DocCategory@odata.bind': docCategoryData['@odata.id'],
         'DocumentLifecycle@odata.bind': docLifeCycleData['@odata.id'],
         'NumberScheme@odata.bind': numSchemeData['@odata.id'],
         'ClassifLevel@odata.bind': retentionClassData['@odata.id'],
         'IsPublic': csvData['AvailableToPublic'].toLowerCase() === 'true' ? true : false,
         'LstDateReleased': new Date().toISOString(),
       };
      
      // Document Review frequency override
      if (csvData['ReviewIntervalOverride'] != '') {
         console.log("override rev freq");
         if (docLifeCycleData.AllowOverFreq) {  // check if the lifecycle allows overrides
            DocumentEntity['OverRevFreq'] = true;
            DocumentEntity['Frequency'] = formatFrequencyOverride(csvData['ReviewIntervalOverride'], csvData['ReviewFrequencyOverride']);
         } else {
            console.log("document lifecyle does not allow override review frequency");
            DocumentEntity['OverRevFreq'] = false;
         }
      }

      // post the data to ilx
      let docEntity = await submit(I.Document.sysName, DocumentEntity);

      // check for a blank code - if this is the case we will be using automatic numbering
      if (csvData['DocumentNumber'] != '') {
         // Update the code with the overriden code from csv
         // DocumentEntity.Code = csvData['DocumentNumber'];
         await update(docEntity['@odata.id'], {"Code": csvData['DocumentNumber']})
      } else {
         // update document number entity using AH - this is set by an action handler that must be triggered on update
         // refer to DocDocumentEntity Acation Handler:  DocCtrl - Document Number - 2. Update Mask & Temporary Codes
         await update(docEntity['@odata.id'], {"UpDocNumHelp": true})
      }



      // DocumentRevisionEntity = {
      //    'RevisionNumber': csvData['RevisionNumber'] !== '' ? csvData['RevisionNumber'] : '1',
      //    'Title': csvData['DocumentTitle'],
      //    'Abstract': csvData['ExecutiveSummary'],
      //    'Notes': csvData['Notes'],
      //    'Author@odata.bind': authorData['@odata.id'],
      //    'EffectiveDate': csvData['EffectiveDate'],
      //    'PhysicalLoc': csvData['StorageType'] === 'PhysicalLoc' ? csvData['DocumentPhysicalLocation'] : null,
      //    'URL': csvData['StorageType'] === 'URL' ? csvData['URL'] : null,  // only needed if the document type is a url
      //    'Keywords': csvData['Keywords'],
      //    'ControlType@odata.bind': controlTypeData['@odata.id'],
      //    'UncontrolJustif': csvData['ControlType'] === 'Uncontrolled' ? csvData['UncontrolledJustification'] : null,
      //    'StorageType@odata.bind': storageTypeData['@odata.id'],
      //    'Location@odata.bind': locationData['@odata.id'],
      //    'File@odata.bind': fileData['@odata.id'],
      //    // 'File@odata.bind': "https://cloud3.intelex.com/aionnorthdemo1/api/v2/object/SysFileInfoEntity(" + fileData[0] + ")",
      //    'Document@odata.bind': docEntity['@odata.id']  // add the document from the first post
      // };



      NewDocumentRevisionEntity = {
         'RevisionNumber': csvData['RevisionNumber'] !== '' ? csvData['RevisionNumber'] : '1',
         'Title': csvData['DocumentTitle'],
         'Abstract': csvData['ExecutiveSummary'],
         'Notes': csvData['Notes'],
         'Author@odata.bind': authorData['@odata.id'],
         'EffectiveDate': csvData['EffectiveDate'],
         'PhysicalLoc': csvData['StorageType'] === 'PhysicalLoc' ? csvData['DocumentPhysicalLocation'] : null,
         'URL': csvData['StorageType'] === 'URL' ? csvData['URL'] : null,  // only needed if the document type is a url
         'Keywords': csvData['Keywords'],
         'ControlType@odata.bind': controlTypeData['@odata.id'],
         'UncontrolJustif': csvData['ControlType'] === 'Uncontrolled' ? csvData['UncontrolledJustification'] : null,
         'StorageType@odata.bind': storageTypeData['@odata.id'],
         'Location@odata.bind': locationData['@odata.id'],
         'File@odata.bind': fileData['@odata.id'],
         // 'File@odata.bind': "https://cloud3.intelex.com/aionnorthdemo1/api/v2/object/SysFileInfoEntity(" + fileData[0] + ")",
         'Document@odata.bind': docEntity['@odata.id']  // add the document from the first post
      }


      // post the document revision entity using the document's id   
      // let docRevEntity = await submit(I.DocumentRevision.sysName, DocumentRevisionEntity);

      let newDocRevEntity = await submit(I.NewDocumentRevision.sysName, NewDocumentRevisionEntity);

      // update the document with the document revision record in the CurrentRevision field
      // DocumentEntity['CurrentRevision@odata.bind'] = docRevEntity['@odata.id'];
   

      // let docUpdateStatus = await update(docEntity['@odata.id'], {'CurrentRevision@odata.bind': docRevEntity['@odata.id']});
      let docUpdateStatus = await update(docEntity['@odata.id'], {'CurrentRevision@odata.bind': newDocRevEntity['@odata.id']});


      if (docUpdateStatus === 204) {
         setFileStatus('ANDCNum_' + csvData.ANDCNum, 'Loaded to Intelex', {'color': 'green'});
      }
   } catch (e) {
      console.log(e);
      setFileStatus('ANDCNum_' + csvData.ANDCNum, e, {'color': 'red'});
   }
}



/************** helpers ******************/
function schParams(searchField, val) {
// TODO - not finished for numbers or boolens
   if (typeof val == 'string') {
      // return {$filter: searchField + " eq " + "'" + value + "'"}
      return "$filter=" + searchField + " eq '" + val + "'"; 
   } else if (typeof val === 'number') {
      //return {$filter: searchField + " eq " + value}
   }
}

async function findOrFetch(ilxObj, val) {
   // TODO: error handling
   let ret = undefined;
   // was it already found and stored in our list?
   if (ilxObj.values.length > 0) {
      ret = await ilxObj.values.find(v => v[ilxObj.ilxSearchField] === val)
   }
   
   if (typeof ret === 'undefined') {
      // there may be values but it is not in the array or the array is empty, so find it from ILX
      let sp = schParams(ilxObj.ilxSearchField, val);
      let x = await fetchSingleRecordDataWithParams(ilxObj.sysName, sp);
      ret = x.value[0];
      // add to array for later
      ilxObj.values.push(x.value[0]);
   }

   if (typeof ret === 'undefined') {
      // if it's still not there, throw an error
      throw "can't find related object [" + ilxObj.sysName + "]";
   }
   return ret;   
}

function formatFrequencyOverride(interval='', frequency='') {
   /* Follows RRULE format - 
   *
   *  There are 2 arguments:
   *     -frequency: one of ['WEEKLY', 'MONTHLY', 'YEARLY']
   *     -interval:  
   *        * number, the number of (frequency)
   *        * if if this is 1 or blank, we don't use anything
   *     
   *  EXAMPLES  
   *    One Time = ''   *this is default
   *    Yearly = 'RRULE:FREQ=YEARLY'  
   *    Every 2 years = 'RRULE:FREQ=YEARLY;INTERVAL=2'
   *    Monthly = 'RUULE:FREQ=MONTHLY'      
   *    Every 2 months = 'RRULE:FREQ=MONTHLY;INTERVAL=2'
   *    Weekly = 'RRULE:FREQ=WEEKLY'
   */
   if (interval === '' || interval === '1') {
      return 'RRULE:FREQ=' + frequency.toString();
   } else {
      return 'RRULE:FREQ=' + frequency.toUpperCase() + ';INTERVAL=' + interval.toString();
   }
}

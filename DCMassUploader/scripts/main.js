// ilx url
let ilxUrl = '';
const ilxUrlIpt = document.querySelector('#ilxUrl');

// creds
let ilxCreds = {};
const ilxPwd = document.querySelector('#password');
const ilxUsr = document.querySelector('#username');

// list of files in the user's directory
let docCtlFiles;

// the metadata file contents
let csvMetaData;

// for errors that occur prior to loading files to ILX
let preloadErrors = [];

// CSV File
const csvFileInput = document.querySelector('#csvFileInput');
const csvData = document.querySelector('#csvData');
const loader = document.querySelector('#loader')

//  Choose Root Folder button handle
const rootDirButton = document.querySelector('#butGetRootDirectory');

// process files btn
const processFilesBtn = document.querySelector('#butProcessFiles');

//  select CSV file event
csvFileInput.addEventListener('change', function() {
   const [file] = this.files;
   readFile(file, csvData);
})


// authorization 
ilxUrlIpt.addEventListener('input', function() {
   ilxUrl = this.value + '/api/v2/';
})

ilxPwd.addEventListener('input', function() {
   ilxCreds = {'Authorization': 'Basic ' + btoa(ilxUsr.value + ':' + this.value)};
})

ilxUsr.addEventListener('input', function() {
   ilxCreds = {'Authorization': 'Basic ' + btoa(this.value + ':' + ilxPwd.value)};
})

// convert csv text data to an array
csvData.addEventListener('change', function() {
   csvMetaData = parseCsvText(this.value, 'csvMetaTableHead', 'csvMetaTableBody');
})

// multi-file select dir button event
rootDirButton.addEventListener('click', async function() {
   // get the files, but exclude the root csv metadata file
   docCtlFiles = await getFilesArr(csvFileInput.files[0].name);
   
   // if there are extra file found with no csv meta data
   let filesWithNoCSVData = [];

   for (file of docCtlFiles) {

         let csvFileInfo = findCsvRow(file, csvMetaData);

         if (typeof csvFileInfo === 'undefined') {
            preloadErrors.push({'csvDataAbsent': 'cannot find csv metadata for file: ' + file.Filename});
         } else {
            setFileStatus('ANDCNum_' + csvFileInfo.ANDCNum, 'File found', {'color': 'green'});
         }
   }
});

// process files button
processFilesBtn.addEventListener('click', async function() {
   // TODO - check for errors in the files before processing
   // names match? # files same? char/str issues? papaparse errors? folder loading errors?

   await submitFiles(docCtlFiles, csvMetaData)

   for (localFile of docCtlFiles) {
         // find the right csv row data - checking that the filename and directory path matches from csv to actual file location 
         let csvFileInfo = findCsvRow(localFile, csvMetaData);

         if (csvFileInfo !== undefined) {
            console.log(localFile);
            await processFile(csvFileInfo);
         }
   }
})
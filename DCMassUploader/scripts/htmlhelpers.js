function setFileStatus(tdStatusId, status, styles={}, clearStatus=false) {
   let element = document.getElementById(tdStatusId);


   if (clearStatus) {
      element.innerHtml = status;
   } else {
      element.innerHTML += status + '</br>';
   }
   setStyle(tdStatusId, styles);
}

function setStyle(elemId, propertyObject) {
   let element = document.getElementById(elemId);
   for (let prop in propertyObject) {
      element.style[prop] = propertyObject[prop];
   }
}

function findCsvRow (fileInfo, csvMetaData) {
   return csvMetaData.data.find(f => {
      if((f.Filename === fileInfo.Filename) && (JSON.stringify(f.Local_FolderPath) === JSON.stringify(fileInfo.dirpath))) {
          return true
      }
  });
}
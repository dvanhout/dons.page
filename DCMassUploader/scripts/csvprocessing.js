function createDataElement(htmlTag, innerText, idParent, dataElementId) {
   let node = document.createElement(htmlTag);
   let textnode = document.createTextNode(innerText);
   
   // give it an id if requested
   if (dataElementId != null) {
      node.setAttribute("id", dataElementId);
   }
   
   node.appendChild(textnode);
   document.getElementById(idParent).appendChild(node);
}

function createHeaderElement(columnText, tableHeaderId, dataElementId) {
   createDataElement("th", columnText, tableHeaderId, dataElementId);
}

function createCellData(rowIndex, newRow, cellText, tableBodyId, dataElementId=null) {
   if(newRow) {  // create a new row w/ id
       let node = document.createElement("tr");
       node.setAttribute("id", "row" + rowIndex);
       document.getElementById(tableBodyId).appendChild(node);
       createDataElement("td", cellText, "row" + rowIndex, dataElementId);

   } else {  // just a data cell        
       createDataElement("td", cellText, "row" + rowIndex, dataElementId);
   }
}

function parseCsvText(csvText, tableHeaderId, tableBodyId) {
   /*********************************************
   *
   * return the csv as an array of js objects
   * may need to turn on streaming if csv gets too large
   *  -- see https://www.papaparse.com/docs
   * TODO: complete error handling
   * 
   *********************************************/
   const config = {
      header: true,
      skipEmptyLines: true,
      complete: function (parsed) {

         let headers = ['Document Number', 'File', 'ILX Folder Code', 'Status'];
         for (headerText of headers) {
            createHeaderElement(headerText, tableHeaderId);
         }

         for (let i = 0; i < parsed.data.length; i++) { 
            createCellData(i, true, parsed.data[i].DocumentNumber, tableBodyId);
            createCellData(i, false, parsed.data[i].Filename, tableBodyId);
            createCellData(i, false, parsed.data[i].DocumentFolderCode, tableBodyId);
            createCellData(i, false, '', tableBodyId, 'ANDCNum_' + parsed.data[i].ANDCNum);
         }

         // transform the folder path to an array 
         parsed.data.forEach(row => Object.assign(row, {Local_FolderPath: row.Local_FolderPath.split('\\')}))
      }
   }
   return Papa.parse(csvText, config);
}


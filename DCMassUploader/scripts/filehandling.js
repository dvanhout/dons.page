async function listAllFiles(dirHandle, origDirHandle, csvMetaFilename) {
   /*********************************************
   *
   * recursively create array of the files
   *
   *********************************************/
   const filesArr = [];
   const dirsArr = [];

   for await (let [filename, handle] of dirHandle) {
      const {kind} = handle;
      if (handle.kind === "directory") {
         filesArr.push(...await listAllFiles(handle, origDirHandle, csvMetaFilename));
      } else {
         const dirpath = await origDirHandle.resolve(handle);
         dirpath.pop();  // removes last item filename from directory path
         const ext = filename.split('.').pop();
         const file = await handle.getFile();
         // do not add the root csv meta file
         if (filename.toLowerCase() !== csvMetaFilename && dirpath.length !== 0) {
            filesArr.push({Filename: filename, dirpath, ext, handle, file});
         }
      }
   }
   return filesArr;
}

async function getFilesArr(csvMetaFilename) {
   /*********************************************
   *
   * returns list of files from a directory
   *
   *********************************************/
   try {
      const directoryHandle = await window.showDirectoryPicker()
      for await (const [key, value] of directoryHandle.entries()) {
      }
      return await listAllFiles(directoryHandle, directoryHandle, csvMetaFilename); 
         
      // TODO - handle the csv root file contents
   } catch(e) {
      console.log('there was an error choosing the directory');
   }
}

function readFile(file, output) {
   /*********************************************
   *
   * sets the value of an html element to the csv content
   *
   *********************************************/
   const reader = new FileReader();
   reader.addEventListener('load', function() {
      output.value = reader.result;
      output.dispatchEvent(new Event('change'));
   })
   if (file) {
      reader.readAsText(file);
   }
}
# Diagram Editor - 

## mxGraph

### SETUP

The backend must be hosted on a server outside of Intelex.

__Setup Steps:__

* Edit `diagrameditor.html` code-
  * Set the `ITX_URL` variable to be your company's __Intelex Server URL__ -- `$protocol://$hostname` --  _Do not include trailing_ `/`

    * E.g. ![Alt text](/ITX_URL.jpg "Intelex URL")


```Javascript
      const ITX_URL = "https://cloud3.intelex.com";  // <--- change to Intelex Server base URL
```

 * copy the URL of the editor into intelex settings _(field is inline editable - click on the record to edit; click out to save)_ 

 ![Alt text](/settingsURL.jpg "Intelex Settings")

* Optional - You can adjust the look feel of the page by editing the HTML/CSS.  Example: 
  * edit the page title
  * edit the css to change colours, positioning of elements, etc. 


-------------------
-------------------
## Intelex

 * Create two objects within an Application -
  
   ![Alt text](/mxGraphObjects.jpg "mxGraph Objects")

1. __xGraph Object Fields__:

      
  ![Alt text](/mxGraphFields.jpg "mxGraph Fields")

  * __mxEditor URL (sysname: mxEditorURL)__
    * Type: URL
    * Default Value: Expression (see below)

    * ![Alt text](/mxEditorURLDefaultValue.jpg "mxEditorURL Default Value Calculation - Expression (GETSETTING(objname, iframeURL")

  * __XML Definition (sysname: XMLDefinition)__
    * Type: Text
    * NO Max Length!  _(This may get to be quite a long text string)_
-------------------

2. __xGraph Settings Object Fields__:

  ![Alt text](/mxGraphSettingsFields.jpg "mxGraph Settings Fields")

  * __EditorURL (sysname: ifameURL)__ - a client editable setting designed for the application _settings_ tab
    * type: URL

-------------------

### Detail View Code Sample of mxGraph Object


 * The page uses an `<iframe>` that get's injected via the custom JavaScript into the div `<div id="ITXmxGraphViewer" style="height:980px;"/>`

 * The code is designed to mimic Intelex's native funcationality, where:
  * Each Detail View has three possible view modes - 'Create', 'Edit', 'View', determined by the page's url
  * In `'Create'` AND `'Edit'` modes - a user is able edit the diagram by clicking 
    * the XML definition of the diagram is posted back by the `diagrameditor.html` page and the Intelex page's event handler then updates the `XMLDefinition` field value with the newly received text.  
  * In `'View'` mode, the user simply sees a read only view of the digram.


SAMPLE PAGE CODE BELOW -
```html
<ix:DetailPage ShowEditReadOnlyLink="True">
  <ix:DetailPageMenuBar id="DetailPageMenuBar" runat="server">
<ix:EditReadOnlyActionLink Override="true" Visible="true" runat="server"/>
  </ix:DetailPageMenuBar>
  <ix:DetailSection Title="Chart Definition" runat="server">
    <ix:FieldArea span="true">
<ix:Field For="Name" runat="server"/>
<ix:Field For="XMLDefinition" runat="server"/>
<ix:Field For="mxEditorURL" EditReadOnly="True" ReadOnly="True" runat="server"/>
    </ix:FieldArea>
  </ix:DetailSection>
  <ix:DetailSection Title="mxGraph" runat="server">

<div id="ITXmxGraphViewer" style="height:980px;"/>

  </ix:DetailSection>
</ix:DetailPage>
<ix:JavaScript Scope="OnReady">
  <script type="text/javascript">
// get configuration vars
    var conf = config();

    function config() {
      /******************************
      *
      *  creates configuration for the page
      *
      ********************************/
      // get editor link from Intelex settings
      var editorURL = document.createElement('a');
      editorURL.href = Intelex.DetailPage.getField('mxEditorURL').value;
      
      var conf = {mxURL: editorURL};
 
      var pageUrlSegments = location.pathname.replace('/^//','').split('/')
      // create-mode check
      if (pageUrlSegments[pageUrlSegments.length - 1] === 'Create') {
        conf.objUID = null;
        conf.viewMode = 'Create';
      // view, edit mode
      } else {
      conf.objUID = pageUrlSegments[pageUrlSegments.length - 1];
      conf.viewMode = pageUrlSegments[pageUrlSegments.length - 2];
      }
    
      // do not let user spoil xml
      if (conf.viewMode === 'Create' || conf.viewMode === 'Edit') {
        $('#XMLDefinition')
          .prop('readonly', true)
          .prop('style', 'background:#e6e8d0');
      }
      return conf;
    }
    
    function sendToFrame(e) {
      /******************************
      *
      *  sends a message to the editor
      *
      ********************************/
      e.preventDefault();
          
      // get reference to the iframe window
      var receiver = document.getElementById('mxGraphViewer').contentWindow;
            
      // send message to editor along with source url
      receiver.postMessage({
       	viewMode: conf.viewMode,  // for server security check
        originUrl: window.location.href,
      	itxXML: Intelex.DetailPage.getField('XMLDefinition').value  // the xml code from the Intelex field
      }, conf.mxURL.href);   
    }  
     
    function receiveXML(e) {
      /******************************
      *
      *  receives xml message from the editor
      *  and updates the xml textbox in the page
      *
      ********************************/
      e.preventDefault();
      if (e.origin !== conf.mxURL.origin) {  // <--change the origin here
        console.log('ERROR: Invalid sender');
        return;
      } else {
        // change the text of the input field to the new xml definition
        $('#XMLDefinition').val(e.data.mxXML);
        $('#XMLDefinition').change();       
      }
    }

    // add iframe to DOM
    var iframe = document.createElement('iframe');
    iframe.setAttribute('id', 'mxGraphViewer');
    iframe.setAttribute('src', conf.mxURL);
    iframe.setAttribute('height', '100%');
    iframe.setAttribute('width', '100%');
    iframe.setAttribute('style', 'position:absolute;left:auto;');
    $("#ITXmxGraphViewer").append(iframe);
    
    // onload event to send xml to the iframe
    window.onload = sendToFrame;
     
    // the message handler from the iframe to load the xml definition into the field
    if (window.addEventListener) {  // good browsers
      window.addEventListener('message', receiveXML, { passive: false });
    } else {
      if (window.attachEvent) {  // IE
        window.attachEvent("onmessage", receiveXML)
      }
    }
  </script>
</ix:JavaScript>
<style>
#ITXmxGraphViewer {
  overflow: hidden;
  /* Calculated from the aspect ration of the content (in case of 16:9 it is 9/16= 0.5625) */
  padding-top: 56.25%;
  position: relative;
}

#ITXmxGraphViewer iframe {
   border: 0;
   height: 100%;
   left: 0;
   position: absolute;
   top: 0;
   width: 100%;
}

/*   Hide the xml text input by uncommenting this code
#fld_XMLDefinition{
  visibility: hidden;
}
*/
</style>
```

-------------------
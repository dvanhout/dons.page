### Server Side Integration - 

#### mxGraph

The backend must be hosted on a server. 

The code is pure JavaScript. 

* Edit `diagrameditor.html` code-
  * Set the `ITX_URL` variable to be Intelex Server URL e.g. `https://clients.intelex.com`.  _Do not include trailing_ `/`

```Javascript
      const ITX_URL = "https://cloud3.intelex.com";  // <--- change to Intelex Server base URL
```

 * copy the url of the editor into intelex settings _(field is inline editable - click on the record to edit; click out to save)_ 

 ![Alt text](/settingsURL.jpg "Intelex Settings")



#### Intelex
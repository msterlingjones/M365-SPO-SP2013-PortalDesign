const masterStr = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('projects')/items?";
//const masterStr = "http://portal.sorenson.com/sites/it/projects/_api/web/lists/getbytitle('projects')/items?";
const requestHeaders = { 'ACCEPT': 'application/json; odata=verbose' };
var selectStr = "";
var expandStr = "";
var orderByStr = "";
var filterStr = "";
	
class ReactSP extends React.Component{    
    //debugger;
    constructor(){    
        super();    
        this.state = {    
            items: [{
                "Id": "",
                "Title": "",
                "Description_x0020_Of_x0020_Proje": "",
                "Project_x0020_Note": "",
                "Product_x0020_Front_x0020_End_x0": "",
                "Launch_x0020_Committed": ""
            }]
        };
    }    
    componentDidMount() {    
        //debugger;
        //this.RetrieveSPData();
        this.GetProjectID();
    }
    GetProjectID() {
        var reactHandler = this;
        if (location.href.toLowerCase().indexOf('projectid') > 0) {
            var projectGuid = parseQueryString("projectid");
        }
        function parseQueryString(keyStr) {
            var pid = {};
            var urlLst = location.href.toLowerCase().split("?");
            var qryStr = urlLst[1];
            if (qryStr.indexOf("&") > 0) {
                var keyVals = qryStr.split("&");
                for (var i = 0; i < keyVals.length; i++) {
                    var keyVal = keyVals[i].split("=");
                    var currentKey = keyVal[0];
                    if (currentKey == keyStr.toLowerCase()) {
                        pid = keyVal[1];
                        console.log("var pid for 2 or more qstring params = " + pid);
                        break;
                    }
                }
            } else {
                var keyVal = qryStr.split("=");
                pid = keyVal[1];
                console.log("var pid for 1 qstring param = " + pid);
            }
            filterStr = "$filter=(Id eq '" + pid + "')";
            return pid;
        }
        console.log("masterStr and filterStr = " + masterStr + filterStr);
        jQuery.ajax({
            url: masterStr + filterStr,
            dataType: "json",
            headers: requestHeaders,
            method: "GET",
            success: function (data) {
                var CallResults = data.d.results;
                var resultStr = JSON.stringify(CallResults);
                //console.log("Results stringified with OOB JS = " + resultStr);
                var row = 0;
                while (row < CallResults.length) {
                    var project = CallResults[row];
                    document.getElementById("DeltaPlaceHolderPageTitleInTitleArea").innerHTML = project.Title;
                    row++;
                }
                //for Old browsers to parse JSON still not working in IE
                var result1 = jQuery.parseJSON(resultStr);
                console.log ("Result string parsed with jQuery = " + result1 + "should read '[Object object]")
                
                //Modern Browsers string to parse JSON
                /*var result2 = JSON.parse(resultStr);
                console.log("Result string parsed with 'JSON.parse' = " + result2 + "should read '[Object object]");*/

                //Set State of component to Project information we just gathered and packaged
                reactHandler.setState({
                    items: result1
                });
            },
            error: function (err) {
                var errObj = jQuery.parseJSON(err.responseText);
                console.log("Sorry, could not get all CallResults \n Error: " + JSON.stringify(errObj.error.message.value));
            }
        });
    };
    RetrieveSPData(){
        var reactHandler = this;
        var pid = {};
        if (location.href.toLowerCase().indexOf('project') > 0) {
            var projectGuid = parseQueryString("project");
        }
        function parseQueryString(keyStr) {
            var urlLst = location.href.toLowerCase().split("?");
            var qryStr = urlLst[1];
            if (qryStr.indexOf("&") > 0) {
                var keyVals = qryStr.split("&");
                for (var i = 0; i < keyVals.length; i++) {
                    var keyVal = keyVals[i].split("=");
                    var currentKey = keyVal[0];
                    if (currentKey == keyStr.toLowerCase()) {
                        pid = keyVal[1];
                        //console.log("var pid for 2 or more qstring params = " + pid);
                        break;
                    }
                }
            } else {
                var keyVal = qryStr.split("=");
                pid = keyVal[1];
                //console.log("var pid for 1 qstring param = " + pid);
            }
            return pid;
        }
        var spRequest = new XMLHttpRequest();
        //selectStr = "$select=Title,Id,Description_x0020_Of_x0020_Proje,Project_x0020_Note,Launch_x0020_Committed,Phase,Status";
        //orderByStr = "$orderby=Title asc";
        //console.log(pid);
        filterStr = "$filter=(Id eq '" + pid + "')";
        var RestURLStr = masterStr + selectStr + orderByStr + filterStr + expandStr;
        console.log("RestURLStr = " + RestURLStr);
        spRequest.open('GET',RestURLStr,true);
        spRequest.setRequestHeader("Accept","application/json; odata=verbose");
        spRequest.overrideMimeType("application/json");
        //spRequest.responseType= 'json';           
        spRequest.onreadystatechange = function(){    
            if (spRequest.readyState === 4 && spRequest.status === 200){ 
                //console.log("Response = " + spRequest.responseText);
                var data = jQuery.parseJSON(spRequest.responseText);
                console.log(data);
                //var resultStr = JSON.stringify(data.d.results);
                //console.log(resultStr);
                //var results = jQuery.parseJSON(resultStr);
                //console.log(results);
                //var results = spRequest.responseText.d
                //console.log(results)
                //var result = jQuery.parseJSON(results)
                //console.log(result)
                document.getElementById("DeltaPlaceHolderPageTitleInTitleArea").innerHTML = data.Title;   
                reactHandler.setState({
                    items: data.value
                });    
            }else if (spRequest.readyState === 4 && spRequest.status !== 200){    
                console.log('Error Occured !');    
            }    
        };    
        spRequest.send();
    }    
    render(){   
        //debugger; 
        console.log(this.state.items);
        return (
            <div  className='rPanel'>   
                <br></br>
                <br></br>
                
                {this.state.items.map(function(item,key){ 
                    return (
                        <div key={key}>
                            <table className='rTable' key={item.Id + "_" + item.Title}>
                                <caption className='rTableCaption'>Project: {item.Title}</caption>
                                <tbody key={"Project Info"}>
                                    <tr className='rHeaderRow'>
                                        <th className='rHeader' id='features'>Features</th>
                                        <th className='rHeader'></th>
                                        <th className='rHeader'>PFE</th>
                                        <th className='rHeader'>Launch</th>
                                    </tr>
                                    <tr className='rTableRow'>
                                        <td className='rCell' rowSpan='2'>{item.Description_x0020_Of_x0020_Proje}</td>
                                        <th className='rHeader'>Committed:</th>
                                        <td className='rCell'>{item.Product_x0020_Front_x0020_End_x0}</td>
                                        <td className='rCell'>{item.Launch_x0020_Committed}</td>
                                    </tr>
                                    <tr className='rTableRow'>
                                        <th className='rHeader'>Notes:</th>
                                        <td className='rCell' colSpan='2'>{item.Project_x0020_Note}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>);
                })}
            </div>
        );    
    }
}

ReactDOM.render(<ReactSP />, document.getElementById('ProjectInfo'));
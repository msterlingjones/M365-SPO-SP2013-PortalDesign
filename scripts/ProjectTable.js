'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var masterStr = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('projects')/items?";
//var masterStr = "http://portal.sorenson.com/sites/it/projects/_api/web/lists/getbytitle('projects')/items?";
var requestHeaders = { 'ACCEPT': 'application/json; odata=verbose' };
var selectStr = "";
var expandStr = "";
var orderByStr = "";
var filterStr = "";

var ReactSP = function (_React$Component) {
    _inherits(ReactSP, _React$Component);

    //debugger;
    function ReactSP() {
        _classCallCheck(this, ReactSP);

        var _this = _possibleConstructorReturn(this, (ReactSP.__proto__ || Object.getPrototypeOf(ReactSP)).call(this));

        _this.state = {
            items: [{
                "Id": "",
                "Title": "",
                "Description_x0020_Of_x0020_Proje": "",
                "Project_x0020_Note": "",
                "Product_x0020_Front_x0020_End_x0": "",
                "Launch_x0020_Committed": ""
            }]
        };
        return _this;
    }

    _createClass(ReactSP, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            //debugger;
            //this.RetrieveSPData();
            this.GetProjectID();
        }
    }, {
        key: 'GetProjectID',
        value: function GetProjectID() {
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
                success: function success(data) {
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
                    console.log("Result string parsed with jQuery = " + result1 + "should read '[Object object]");

                    //Modern Browsers string to parse JSON
                    /*var result2 = JSON.parse(resultStr);
                    console.log("Result string parsed with 'JSON.parse' = " + result2 + "should read '[Object object]");*/

                    //Set State of component to Project information we just gathered and packaged
                    reactHandler.setState({
                        items: result1
                    });
                },
                error: function error(err) {
                    var errObj = jQuery.parseJSON(err.responseText);
                    console.log("Sorry, could not get all CallResults \n Error: " + JSON.stringify(errObj.error.message.value));
                }
            });
        }
    }, {
        key: 'RetrieveSPData',
        value: function RetrieveSPData() {
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
            spRequest.open('GET', RestURLStr, true);
            spRequest.setRequestHeader("Accept", "application/json; odata=verbose");
            spRequest.overrideMimeType("application/json");
            //spRequest.responseType= 'json';           
            spRequest.onreadystatechange = function () {
                if (spRequest.readyState === 4 && spRequest.status === 200) {
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
                } else if (spRequest.readyState === 4 && spRequest.status !== 200) {
                    console.log('Error Occured !');
                }
            };
            spRequest.send();
        }
    }, {
        key: 'render',
        value: function render() {
            //debugger; 
            console.log(this.state.items);
            return React.createElement(
                'div',
                { className: 'rPanel' },
                React.createElement('br', null),
                React.createElement('br', null),
                this.state.items.map(function (item, key) {
                    return React.createElement(
                        'div',
                        { key: key },
                        React.createElement(
                            'table',
                            { className: 'rTable', key: item.Id + "_" + item.Title },
                            React.createElement(
                                'caption',
                                { className: 'rTableCaption' },
                                'Project: ',
                                item.Title
                            ),
                            React.createElement(
                                'tbody',
                                { key: "Project Info" },
                                React.createElement(
                                    'tr',
                                    { className: 'rHeaderRow' },
                                    React.createElement(
                                        'th',
                                        { className: 'rHeader', id: 'features' },
                                        'Features'
                                    ),
                                    React.createElement('th', { className: 'rHeader' }),
                                    React.createElement(
                                        'th',
                                        { className: 'rHeader' },
                                        'PFE'
                                    ),
                                    React.createElement(
                                        'th',
                                        { className: 'rHeader' },
                                        'Launch'
                                    )
                                ),
                                React.createElement(
                                    'tr',
                                    { className: 'rTableRow' },
                                    React.createElement(
                                        'td',
                                        { className: 'rCell', rowSpan: '2' },
                                        item.Description_x0020_Of_x0020_Proje
                                    ),
                                    React.createElement(
                                        'th',
                                        { className: 'rHeader' },
                                        'Committed:'
                                    ),
                                    React.createElement(
                                        'td',
                                        { className: 'rCell' },
                                        item.Product_x0020_Front_x0020_End_x0
                                    ),
                                    React.createElement(
                                        'td',
                                        { className: 'rCell' },
                                        item.Launch_x0020_Committed
                                    )
                                ),
                                React.createElement(
                                    'tr',
                                    { className: 'rTableRow' },
                                    React.createElement(
                                        'th',
                                        { className: 'rHeader' },
                                        'Notes:'
                                    ),
                                    React.createElement(
                                        'td',
                                        { className: 'rCell', colSpan: '2' },
                                        item.Project_x0020_Note
                                    )
                                )
                            )
                        )
                    );
                })
            );
        }
    }]);

    return ReactSP;
}(React.Component);

ReactDOM.render(React.createElement(ReactSP, null), document.getElementById('ProjectInfo'));
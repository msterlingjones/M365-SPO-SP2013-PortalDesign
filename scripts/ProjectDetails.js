(function () {
    var masterStr = _spPageContextInfo.webAbsoluteUrl + "/_api/ProjectServer/Projects";
    //var riMasterStr = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle(‘Risk & Issues')/items";
    var riMasterStr = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists(guid'6BF1F639-ED91-4087-876E-81A551F0E4E9')/items";
    var StrategyMatrixStr = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists(guid'EE649D90-62B1-4F16-A69B-A010E8A5B3A6')/items";
    var requestHeaders = { 'ACCEPT': 'application/json; odata=verbose' };
    var app = angular.module("StatusApp", []);
     
    app.directive("statusReport", function () {
        return {
            restrict: 'E',
            templateUrl: _spPageContextInfo.webAbsoluteUrl + '/siteassets/Reports/Initiative/MS/MilestoneStatusTemplate.html',
            controller: ['$scope', function ($scope) {
                $scope.taskLst = [];
                $scope.StatusLookUpTableGuid = "";
                $scope.GeoLookUpTableGuid = "";
                //$scope.AudienceLookUpTableGuid = "";
                //$scope.BudgetLookUpTableGuid = "";
                //$scope.KeyholdersLookUpTableGuid = "";
                /*$scope.upcomingCount = 0;
                $scope.lateMilestoneCount = 0;
                $scope.openIssuesCount = 0;
                $scope.lateIssuesCount = 0;*/
             
                $scope.statusStr = "";
 
                $scope.GetLookupTable = function (customFieldGuid, typeStr){
                    jQuery.ajax({
                        url: _spPageContextInfo.webAbsoluteUrl + "/_api/projectserver/customfields('" + customFieldGuid + "')/LookupTable?$select=id",
                        dataType: "json",
                        headers: requestHeaders,
                        method: "GET",
                        async: false,
                        success: function (data) {
                            switch(typeStr)
                            {
                                case 'status':
                                    $scope.StatusLookUpTableGuid = data.d.Id;
                                    break;
                                case 'geo':
                                    $scope.GeoLookUpTableGuid = data.d.Id;
                                   break;
                                /*case 'audience':
                                    $scope.AudienceLookUpTableGuid = data.d.Id;
                                    break;
                                case 'budget':
                                    $scope.BudgetLookUpTableGuid = data.d.Id;
                                    break;
                                case 'stakeholders':
                                    $scope.KeyholdersLookUpTableGuid = data.d.Id;
                                    break;*/
                            }
                        },
                        error: function (err) {
                            var errObj = jQuery.parseJSON(err.responseText);
                            console.log("Sorry, could not get lookup table data \n Error: " + JSON.stringify(errObj.error.message.value));
                        }
                    });
                };
 
                $scope.GetEntryValue = function(entryGuid, typeGuid, typeStr){
                    var rval = "Medium";
                    jQuery.ajax({
                        url: _spPageContextInfo.webAbsoluteUrl + "/_api/projectserver/LookupTables('" + typeGuid + "')/Entries('" + entryGuid.replace("Entry_", "") + "')?$select=*",//FullValue,Description",
                        dataType: "json",
                        headers: requestHeaders,
                        method: "GET",
                        async: false,
                        success: function (data) {
                            if (typeStr == "Status")
                                rval = data.d.FullValue;
                            //original rval = data.d.Description.split(" - ")[0];
                            else
                                rval = data.d.Value;
                        },
                        error: function (err) {
                            var errObj = jQuery.parseJSON(err.responseText);
                            console.log("Sorry, could not get entry value \n Error: " + JSON.stringify(errObj.error.message.value));
                        }
                    });
                    return rval;
                };
 
                $scope.GetTasksByProdId = function (projID,projName){
                    var todayDateObj = new Date();
                    var completeCheckDateObj = new Date();
                    completeCheckDateObj.setHours(((24 * 30) * -1), 0, 0, 0);
                    var selectStr = "$select=*";//ID,Name,FinishText";//,Custom_0f0f4dd6046be51180d900155d88a724";
                    var expandStr = "";
                    var orderByStr = "&$orderby=Finish desc";
                    var filterStr = "&$filter=(IsMilestone eq true)";
                    var taskUrlStr = masterStr + "('" + projID + "')/tasks?" + selectStr + orderByStr + filterStr + expandStr;
                    console.log("Milestone Status QString:  "+taskUrlStr);
                    jQuery.ajax({
                        url: taskUrlStr,
                        dataType: "json",
                        headers: requestHeaders,
                        method: "GET",
                        success: function (data) {
                            var tasks = data.d.results;
                            var row = 0;
                            var count = tasks.length;
                            if (tasks.length === 0)
                            {
                                $scope.$apply(function () {
                                    $scope.statusStr = "Sorry, no milestone found";
                                });
                            }
                            else
                            {
                                $scope.$apply(function () {
                                    $scope.statusStr = "";
                                });
                            }
                            while (row < tasks.length) {
                                var currentTask = tasks[row];
                                var finishDateLst = currentTask.FinishText.split(" ");
                                var statusVal = "Grey";
                                var geoVal = "";
                                var audienceVal = currentTask.Custom_x005f_a4a0698cb3ade51180eb00155d88681e;
                                var stakeHoldersVal = currentTask.Custom_x005f_f94c5b9cb3ade51180eb00155d88681e;
                                //var budgetVal = "";
 
                                try{
                                    statusVal = $scope.GetEntryValue(currentTask.Custom_x005f_0f0f4dd6046be51180d900155d88a724.results[0], $scope.StatusLookUpTableGuid, "Status");
                                    geoVal = $scope.GetEntryValue(currentTask.Custom_x005f_2107237e9172e51180ec00155d882108.results[0], $scope.GeoLookUpTableGuid, "GEO");
                                    //audienceVal = currentTask.Custom_x005f_a4a0698cb3ade51180eb00155d88681e;
                                    //stakeHoldersVal = currentTask.Custom_x005f_f94c5b9cb3ade51180eb00155d88681e;
                                    //budgetVal = "$" + $scope.CommaFormatted($scope.CurrencyFormatted(currentTask.Custom_x005f_e365d4528672e51180f200155d88a114));
                                }
                                catch(err)
                                {
                                    console.log(err.message);
                                }
                                var rec = {
                                    ID: currentTask.ID,
                                    Task: currentTask.Name,
                                    FinishDate: finishDateLst[0],
                                    Status: statusVal,
                                    ImpactedGeo: geoVal,
                                    ImpactedAudiences: audienceVal,
                                    Stakeholders: stakeHoldersVal
                                    //Budget: budgetVal,
                                    //Project: projName
                                };
                                $scope.$apply(function () {
                                    $scope.taskLst.push(rec);
                                });
                                row++;
                            }
                        },
                        error: function (err) {
                            var errObj = jQuery.parseJSON(err.responseText);
                            console.log("Sorry, could not get tasks \n Error: " + JSON.stringify(errObj.error.message.value));
                        }
                    });
                };
                 
                $scope.GetUpcomingCount = function (projID) {
                var todayDateObj = new Date();
                var completeCheckDateObj = new Date();
                completeCheckDateObj.setHours(((24 * 30) * -1), 0, 0, 0);
                var upcomingCheckDateObj = new Date();
                upcomingCheckDateObj.setHours((24 * 60), 0, 0, 0);
                var selectStr = "$select=ID";//,Custom_9cd9d090638de51180ed00155da05c19";
                var expandStr = "";
                var orderByStr = "&$orderby=Finish desc";
                var filterStr = "&$filter=(IsMilestone eq true)and((Finish lt datetime'" + upcomingCheckDateObj.toISOString() + "')and(Finish gt datetime'" + todayDateObj.toISOString() + "'))";
                var taskUrlStr = masterStr + "('" + projID + "')/tasks?" + selectStr + orderByStr + filterStr + expandStr;
                 
                //console.log("Upcoming Milestones Count QString:  "+taskUrlStr);
                 
                jQuery.ajax({
                    url: taskUrlStr,
                    dataType: "json",
                    headers: requestHeaders,
                    method: "GET",
                    success: function (data) {
                        var tasks = data.d.results;
                        var upcomingCount = parseInt(jQuery("#UpcomingCount").html());
                        upcomingCount += tasks.length;
                        jQuery("#UpcomingCount").html(upcomingCount);
                        //console.log("Upcoming Milestones Count:  "+upcomingCount);
                        /*
                        $scope.$apply(function () {
                            $scope.upcomingCount += tasks.length;
                        });
                        */
                    },  
                    error: function (err) {
                        var errObj = jQuery.parseJSON(err.responseText);
                        console.log("Sorry, could not get milestones \n Error: " + JSON.stringify(errObj.error.message.value));
                    }
                });
            };
 
                $scope.GetLateMilestoneCount = function (projID) {
                var todayDateObj = new Date();
                var completeCheckDateObj = new Date();
                completeCheckDateObj.setHours(((24 * 30) * -1), 0, 0, 0);
                var upcomingCheckDateObj = new Date();
                upcomingCheckDateObj.setHours((24 * 60), 0, 0, 0);
                var selectStr = "$select=ID";//,Custom_9cd9d090638de51180ed00155da05c19";
                var expandStr = "";
                var orderByStr = "&$orderby=Finish desc";
                var filterStr = "&$filter=(IsMilestone eq true)and(Finish lt datetime'" + todayDateObj.toISOString() + "')and(PercentComplete lt 100)";
                var taskUrlStr = masterStr + "('" + projID + "')/tasks?" + selectStr + orderByStr + filterStr + expandStr;
                //console.log("Late Milestones Count QString:  "+taskUrlStr);
                jQuery.ajax({
                    url: taskUrlStr,
                    dataType: "json",
                    headers: requestHeaders,
                    method: "GET",
                    success: function (data) {
                        var tasks = data.d.results;
                        var lateCount = parseInt(jQuery("#LateCount").html());
                        lateCount += tasks.length;
                        jQuery("#LateCount").html(lateCount);
                         
                        //console.log("Late Milestones Count:  "+lateCount);
                         
                        /*$scope.$apply(function () {
                            $scope.lateMilestoneCount += tasks.length;
                        });
                        */
                    },
                    error: function (err) {
                        var errObj = jQuery.parseJSON(err.responseText);
                        console.log("Sorry, could not get tasks \n Error: " + JSON.stringify(errObj.error.message.value));
                    }
                });
            };
         
                $scope.GetOpenIssuesCount = function (StrategyMatrixID) {
                var selectStr = "";
                var expandStr = "?&expand=Status";
                var orderByStr = "";
                var filterStr = "&$filter=(Status eq 'Open') and (InitiativeIDId eq '" + StrategyMatrixID +"')";
                var taskUrlStr = riMasterStr + expandStr + selectStr + orderByStr + filterStr ;
                console.log("Open RI Count QString:  "+taskUrlStr);
                    jQuery.ajax({
                    url: taskUrlStr,
                    dataType: "json",
                    headers: requestHeaders,
                    method: "GET",
                    success: function (data) {
                        var tasks = data.d.results;
                        var openCount = parseInt(jQuery("#OpenRICount").html());
                        openCount += tasks.length;
                        jQuery("#OpenRICount").html(openCount);
                         
                        console.log("Open RI Count:  "+openCount);
 
                    },
                    error: function (err) {
                        var errObj = jQuery.parseJSON(err.responseText);
                        console.log("Sorry, could not get Risks & Issues \n Error: " + JSON.stringify(errObj.error.message.value));
                    }
                }); 
        };
 
                $scope.GetLateIssuesCount = function (StrategyMatrixID) {
                var todayDateObj = new Date();
                var selectStr = "";
                var expandStr = "?&expand=Status";
                var orderByStr = "";
                var filterStr = "&$filter=(DueDate lt datetime'" + todayDateObj.toISOString() + "')and(Status eq 'Open') and (InitiativeIDId eq '" + StrategyMatrixID +"')";
                var taskUrlStr = riMasterStr + expandStr + selectStr + orderByStr + filterStr ;
                console.log("Late RI Count QString:  "+taskUrlStr);
                    jQuery.ajax({
                    url: taskUrlStr,
                    dataType: "json",
                    headers: requestHeaders,
                    method: "GET",
                    success: function (data) {
                        var tasks = data.d.results;
                        var lateCount = parseInt(jQuery("#LateRICount").html());
                        lateCount += tasks.length;
                        jQuery("#LateRICount").html(lateCount);
                         
                        console.log("Late RI Count:  "+lateCount);
 
                    },
                    error: function (err) {
                        var errObj = jQuery.parseJSON(err.responseText);
                        console.log("Sorry, could not get Risks & Issues \n Error: " + JSON.stringify(errObj.error.message.value));
                    }
                });
            };
         
               /* $scope.CurrencyFormatted = function(amount) {
                    var i = parseFloat(amount);
                    if (isNaN(i)) { i = 0.00; }
                    var minus = '';
                    if (i < 0) { minus = '-'; }
                    i = Math.abs(i);
                    i = parseInt((i + .005) * 100);
                    i = i / 100;
                    s = new String(i);
                    if (s.indexOf('.') < 0) { s += '.00'; }
                    if (s.indexOf('.') == (s.length - 2)) { s += '0'; }
                    s = minus + s;
                    return s;
                }
 
                $scope.CommaFormatted = function(amount) {
                    var delimiter = ","; // replace comma if desired  
                    var a = amount.split('.', 2)
                    var d = a[1];
                    var i = parseInt(a[0]);
                    if (isNaN(i)) { return ''; }
                    var minus = '';
                    if (i < 0) { minus = '-'; }
                    i = Math.abs(i);
                    var n = new String(i);
                    var a = [];
                    while (n.length > 3) {
                        var nn = n.substr(n.length - 3);
                        a.unshift(nn);
                        n = n.substr(0, n.length - 3);
                    }
                    if (n.length > 0) { a.unshift(n); }
                    n = a.join(delimiter);
                    if (d.length < 1) { amount = n; }
                    else { amount = n + '.' + d; }
                    amount = minus + amount;
                    return amount;
                }*/
                $scope.GetStrategyMatrixID = function (projID){
                    var selectStr = "";
                    var expandStr = "?&expand=Title";
                    var orderByStr = "";
                    var filterStr = "&$filter=(ProjUID eq '" + projID +"')";
                    var taskUrlStr = StrategyMatrixStr + expandStr + selectStr + orderByStr + filterStr ;
                    console.log("Strategy Matrix QString:  "+taskUrlStr);
                        jQuery.ajax({
                        url: taskUrlStr,
                        dataType: "json",
                        headers: requestHeaders,
                        method: "GET",
                        success: function (data) {
                                var initiatives = data.d.results;
                                var row = 0;
                                while (row < initiatives.length) {
                                    var initiative = initiatives[row];
                                    $scope.GetLateIssuesCount(initiative.Id);
                                    $scope.GetOpenIssuesCount(initiative.Id);
                                    console.log("InitiativeID = " + initiative.Id);
                                    row++;
                                }
                            },
                            error: function (err) {
                                var errObj = jQuery.parseJSON(err.responseText);
                                console.log("Sorry, could not get the InitiativeID from the Strategy Matrix \n Error: " + JSON.stringify(errObj.error.message.value));
                            }
                    }); 
                };
                 
                $scope.GetProjectUID = function (){
                    $scope.taskLst = [];
                    if(location.href.toLowerCase().indexOf('projuid') > 0){
                        var projectGuid = GetQueryString("projuid");
                    }
                    function GetQueryString(keyStr){
                    var pid = {};
                        var urlLst = location.href.toLowerCase().split("?");
                        var qryStr = urlLst[1];
                        if(qryStr.indexOf("&") > 0){
                            var keyVals = qryStr.split("&");
                            //console.log("var keyVals = "+keyVals);
                            for(var i = 0; i < keyVals.length; i++){
                                var keyVal = keyVals[i].split("=");
                                //console.log("var keyVal = "+keyVal);
                                var currentKey = keyVal[0];
                                if(currentKey == keyStr.toLowerCase()){
                                    pid = keyVal[1];
                                    console.log("var pid for 2 or more qstring params = "+pid);
                                    break;
                                }
                            }
                        }else{
                            var keyVal = qryStr.split("=");
                            pid = keyVal[1];
                            console.log("var pid for 1 qstring param = " + pid);
                        }
                        filterStr = "?$filter=(Id eq guid'" + pid + "')";
                        $scope.GetLateMilestoneCount(pid);
                        $scope.GetUpcomingCount(pid);
                        $scope.GetStrategyMatrixID(pid)
                        return pid;
                        }
                        jQuery.ajax({
                        url: masterStr + filterStr,
                        dataType: "json",
                        headers: requestHeaders,
                        method: "GET",
                        success: function (data) {
                            var projects = data.d.results;
                            var row = 0;
                            while (row < projects.length) {
                                var project = projects[row];
                                $scope.GetTasksByProdId(project.Id, project.Name);
                                document.getElementById("pageTitle").innerHTML = project.Name;
                                row++;
                            }
                            console.log("masterStr and filterStr = " + masterStr + filterStr);
                        },
                        error: function (err) {
                            var errObj = jQuery.parseJSON(err.responseText);
                            console.log("Sorry, could not get all projects \n Error: " + JSON.stringify(errObj.error.message.value));
                        }
                    });
                };
 
                /* $scope.GetAllProjects = function ()
                {
                    $scope.taskLst = [];
                    var filterStr = "";
                    if (jQuery("#ProjectNames").length > 0)
                    {
                        if(jQuery("#ProjectNames").val().length > 0)
                        {
                            if(jQuery("#ProjectNames").val().indexOf("|") > 0)
                            {
                                var projectLst = jQuery("#ProjectNames").val().split("|");
                                for(p = 0; p < projectLst.length; p++)
                                {
                                    if(p === 0)
                                    {
                                        filterStr = "?$filter=(Name eq '" + projectLst[p] + "')";
                                    }
                                    else
                                    {
                                        filterStr += "or(Name eq '" + projectLst[p] + "')";
                                    }
                                }
                            }
                            else
                            {
                                filterStr = "?$filter=(Name eq '" + jQuery("#ProjectNames").val() + "')";
                            }
                        }
                    }
                    jQuery.ajax({
                        url: masterStr + filterStr,
                        dataType: "json",
                        headers: requestHeaders,
                        method: "GET",
                        success: function (data) {
                            var projects = data.d.results;
                            var row = 0;
                            while (row < projects.length) {
                                var project = projects[row];
                                $scope.GetTasksByProdId(project.Id, project.Name);
                                row++;
                            }
                        },
                        error: function (err) {
                            var errObj = jQuery.parseJSON(err.responseText);
                            console.log("Sorry, could not get all projects \n Error: " + JSON.stringify(errObj.error.message.value));
                        }
                    });
                };
*/
                $scope.PageLoad = function () {
                    if (jQuery("#UpcomingCount").length == 0) {
                        jQuery(".ms-promlink-body:first .ms-tileview-tile-root:first-child .ms-tileview-tile-titleMedium > div ").prepend("<span id='UpcomingCount' class='MilestoneCount'>0</span> - ");
                    }
 
                    if (jQuery("#LateCount").length == 0) {
                        jQuery(".ms-promlink-body:first .ms-tileview-tile-root:nth-child(2) .ms-tileview-tile-titleMedium > div ").prepend("<span id='LateCount' class='MilestoneCount'>0</span> - ");
                    }
                    if (jQuery("#OpenRICount").length == 0) {
                        jQuery(".ms-promlink-body:first .ms-tileview-tile-root:nth-child(3) .ms-tileview-tile-titleMedium > div ").prepend("<span id='OpenRICount' class='RICount'>0</span> - ");
                    }
                    if (jQuery("#LateRICount").length == 0) {
                        jQuery(".ms-promlink-body:first .ms-tileview-tile-root:nth-child(4) .ms-tileview-tile-titleMedium > div ").prepend("<span id='LateRICount' class='RICount'>0</span> - ");
                    }
                    $scope.GetLookupTable('0f0f4dd6046be51180d900155d88a724', 'status'); //Status
                    $scope.GetLookupTable('2107237e9172e51180ec00155d882108', 'geo'); //Impacted GEO
                    //$scope.GetLookupTable('21ea39119172e51180d900155d88a026', 'audience'); //Impacted Audiences
                    //$scope.GetLookupTable('f94c5b9cb3ade51180eb00155d88681e ', 'stakeholders'); //Key Stakeholders
                    //$scope.GetLookupTable('e365d4528672e51180f200155d88a114', 'budget'); //Budget
                    //$scope.GetAllProjects();
                    $scope.GetProjectUID();
                    //document.getElementById("WebPartTitleWPQ9").innerHTML='<h2 style="text-align:justify;" class="ms-webpart-titleText">Key Links</h2>';
                    document.getElementById("WebPartTitleWPQ8").innerHTML='<h2 style="text-align:justify;" class="ms-webpart-titleText">Risks, Issues & Asks</h2>';
                };
 
                $scope.PageLoad();
            }],
            controllerAs: 'statusUpdate'
        };
    });
})();
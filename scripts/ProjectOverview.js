(function () {
    var riMasterStr = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists(guid'7B56BFFE-34EF-4F5B-9BDF-8D563F789960')/items";
    var StrategyMatrixStr = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists(guid'EE649D90-62B1-4F16-A69B-A010E8A5B3A6')/items";
    var requestHeaders = { 'ACCEPT': 'application/json; odata=verbose' };
    var app = angular.module("OverviewApp", []);

    app.directive("ProjectOverview", function () {
        return {
            restrict: 'E',
            templateUrl: _spPageContextInfo.webAbsoluteUrl + '/siteassets/templates/ProjectOverview.html',
            controller: ['$scope', function ($scope) {
                $scope.taskLst = [];
                $scope.StatusLookUpTableGuid = "";
                $scope.GeoLookUpTableGuid = "";
                $scope.statusStr = "";
                $scope.GetLookupTable = function (customFieldGuid, typeStr) {
                    jQuery.ajax({
                        url: _spPageContextInfo.webAbsoluteUrl + "/_api/projectserver/customfields('" + customFieldGuid + "')/LookupTable?$select=id",
                        dataType: "json",
                        headers: requestHeaders,
                        method: "GET",
                        async: false,
                        success: function (data) {
                            switch (typeStr) {
                                case 'status':
                                    $scope.StatusLookUpTableGuid = data.d.Id;
                                    break;
                                case 'geo':
                                    $scope.GeoLookUpTableGuid = data.d.Id;
                                    break;
                            }
                        },
                        error: function (err) {
                            var errObj = jQuery.parseJSON(err.responseText);
                            console.log("Sorry, could not get lookup table data \n Error: " + JSON.stringify(errObj.error.message.value));
                        }
                    });
                };

                $scope.GetEntryValue = function (entryGuid, typeGuid, typeStr) {
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

                $scope.GetTasksByProdId = function (projID, projName) {
                    var todayDateObj = new Date();
                    var completeCheckDateObj = new Date();
                    completeCheckDateObj.setHours(((24 * 30) * -1), 0, 0, 0);
                    var selectStr = "$select=*";//ID,Name,FinishText";//,Custom_0f0f4dd6046be51180d900155d88a724";
                    var expandStr = "";
                    var orderByStr = "&$orderby=Finish desc";
                    var filterStr = "&$filter=(IsMilestone eq true)";
                    var taskUrlStr = masterStr + "('" + projID + "')/tasks?" + selectStr + orderByStr + filterStr + expandStr;
                    console.log("Milestone Status QString:  " + taskUrlStr);
                    jQuery.ajax({
                        url: taskUrlStr,
                        dataType: "json",
                        headers: requestHeaders,
                        method: "GET",
                        success: function (data) {
                            var tasks = data.d.results;
                            var row = 0;
                            var count = tasks.length;
                            if (tasks.length === 0) {
                                $scope.$apply(function () {
                                    $scope.statusStr = "Sorry, no milestone found";
                                });
                            } else {
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

                                try {
                                    statusVal = $scope.GetEntryValue(currentTask.Custom_x005f_0f0f4dd6046be51180d900155d88a724.results[0], $scope.StatusLookUpTableGuid, "Status");
                                    geoVal = $scope.GetEntryValue(currentTask.Custom_x005f_2107237e9172e51180ec00155d882108.results[0], $scope.GeoLookUpTableGuid, "GEO");
                                }
                                catch (err) {
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
                    var filterStr = "&$filter=(Status eq 'Open') and (InitiativeIDId eq '" + StrategyMatrixID + "')";
                    var taskUrlStr = riMasterStr + expandStr + selectStr + orderByStr + filterStr;
                    console.log("Open RI Count QString:  " + taskUrlStr);
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
                            console.log("Open RI Count:  " + openCount);
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
                    var filterStr = "&$filter=(DueDate lt datetime'" + todayDateObj.toISOString() + "')and(Status eq 'Open') and (InitiativeIDId eq '" + StrategyMatrixID + "')";
                    var taskUrlStr = riMasterStr + expandStr + selectStr + orderByStr + filterStr;
                    console.log("Late RI Count QString:  " + taskUrlStr);
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

                            console.log("Late RI Count:  " + lateCount);

                        },
                        error: function (err) {
                            var errObj = jQuery.parseJSON(err.responseText);
                            console.log("Sorry, could not get Risks & Issues \n Error: " + JSON.stringify(errObj.error.message.value));
                        }
                    });
                };
                $scope.GetStrategyMatrixID = function (projID) {
                    var selectStr = "";
                    var expandStr = "?&expand=Title";
                    var orderByStr = "";
                    var filterStr = "&$filter=(ProjUID eq '" + projID + "')";
                    var taskUrlStr = StrategyMatrixStr + expandStr + selectStr + orderByStr + filterStr;
                    console.log("Strategy Matrix QString:  " + taskUrlStr);
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
                $scope.GetProjectUID = function () {
                    $scope.taskLst = [];
                    if (location.href.toLowerCase().indexOf('projuid') > 0) {
                        var projectGuid = GetQueryString("projuid");
                    }
                    function GetQueryString(keyStr) {
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
                    $scope.GetProjectUID();
                    document.getElementById("WebPartTitleWPQ8").innerHTML = '<h2 style="text-align:justify;" class="ms-webpart-titleText">Risks, Issues & Asks</h2>';
                };
                $scope.PageLoad();
            }],
            controllerAs: 'statusUpdate'
        };
    });
})();
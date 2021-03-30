/// <reference path="../angular-cookies.min.js" />
'use strict';

Sorenson.HomeApp.controller('LinksController', ['$scope', '$rootScope', 'Membership', '$filter', 'AngularSPCSOM', 'AngularSPREST', 'ContentLoad',
    function ($scope, $rootScope, $membership, $filter, $angularSPCSOM, $angularSP, ContentLoad) {
        $scope.Links = [];
        $scope.rater = false;
        $scope.center = false;
        $scope.corporate = false;
        $scope.reviewer1 = false;
        $scope.reviewer2 = false;
        $scope.pd = false;
        $scope.admin = false;
        $scope.hr = false;
        $scope.preScreener = false;
        $scope.capture = false;
        $scope.Display = false;
        $scope.GetLinks = function GetLinks() {
            var p = $angularSPCSOM.GetListItems("Links", "http://portal.sorenson.com/", "<View><Query><Where><And><Eq><FieldRef Name='Visible' /><Value Type='Boolean'>1</Value></Eq><Eq><FieldRef Name='Location' /><Value Type='Text'>LaunchPad</Value></Eq></And></Where><OrderBy><FieldRef Name='Order0' /><FieldRef Name='Title' /></OrderBy></Query><RowLimit>8</RowLimit><ViewFields><FieldRef Name='Title' /><FieldRef Name='URL' /><FieldRef Name='LinkClass' /></ViewFields></View>").then(function (data) {
                $scope.Links = data;
            });
            ContentLoad.registerLoader(p);
        }

        $scope.SendToViewAssessment = function SendToViewAssessment() {
            //if ($scope.manager)
            //console.log("User is center manager");
            //if ($scope.rater)
            //console.log("User is rater");
        }

        $scope.Init = function () {
            ContentLoad.onLoaded($scope, function () {
                $scope.Display = true;
            }.bind(this));
            $membership.then(function (data) {
                $scope.rater = data.rater;
                $scope.admin = data.adminTeam;
                $scope.center = data.centerManagement;
                $scope.reviewer1 = data.reviewer1;
                $scope.pd = data.PD;
                $scope.hr = data.HR;
                $scope.preScreener = data.prescreener;
                $scope.corporate = data.corporateManagement;
                $scope.reviewer2 = data.reviewer2;
                $scope.capture = data.capture;
            });
            $scope.GetLinks();
            //$scope.GetGroupMembership();
        }

        SP.SOD.executeFunc('sp.js', 'SP.ClientContext', $scope.Init);
    }]);
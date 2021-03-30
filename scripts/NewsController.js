'use strict';

Sorenson.HomeApp.controller('NewsController', ['$scope', '$rootScope', '$filter', 'AngularSPCSOM', 'ContentLoad',
    function ($scope, $rootScope, $filter, $angularSPCSOM, ContentLoad) {
        $scope.newsArr = [];
        $scope.MonthArr = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        $scope.Display = false;
        $scope.GetNewsArticles = function () {
            var p = $angularSPCSOM.GetListItems("Posts", "/news/", "<View><Query><OrderBy><FieldRef Name='PublishedDate' Ascending='FALSE' /></OrderBy></Query><RowLimit>4</RowLimit></View>").then(function (data) {
                $scope.newsArr = data;
                for (var i = 0; i < $scope.newsArr.length; i++) {
                    //var tmp = jQuery($scope.newsArr[i].PublishingPageImage);
                    //$scope.newsArr[i].ImageUrl = tmp.attr("src");
                    var tmpDate = new Date($scope.newsArr[i].PublishedDate);
                    $scope.newsArr[i].DisplayDate = $scope.MonthArr[tmpDate.getMonth()] + " " + tmpDate.getDate();
                    var tmp = jQuery($scope.newsArr[i].Body);
                    $scope.newsArr[i].BodyText = tmp.text();
                    delete $scope.newsArr[i].Body;
                }
            });
            ContentLoad.registerLoader(p);
        }
        $scope.Init = function () {
            ContentLoad.onLoaded($scope, function () {
                $scope.Display = true;
            }.bind(this));
            $scope.GetNewsArticles();
        }
        SP.SOD.executeFunc('sp.js', 'SP.ClientContext', $scope.Init);
    }]);
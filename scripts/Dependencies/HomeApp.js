'use strict';
var Sorenson = Sorenson || {};

//Polyfill added to fix emails problems because includes method not implemented in IE
if (!String.prototype.includes) {
    String.prototype.includes = function () {
        'use strict';
        return String.prototype.indexOf.apply(this, arguments) !== -1;
    };
}

Sorenson.HomeApp = angular.module('HomeApp', ['AngularSP', 'ngCookies', 'ngRoute', 'ui.date', 'ngSanitize']);
Sorenson.HomeApp.filter('unsafe', function ($sce) {
    return function (val) {
        if (typeof (val) === "string")
            return $sce.trustAsHtml(val);
        else if (typeof (val.$$unwrapTrustedValue) !== "undefined")
            return $sce.trustAsHtml(val.$$unwrapTrustedValue());
        else
            return false;
    };
}).directive('equalheights', function () {
    return function (scope, element, attrs) {
        if (scope.$last) {
            window.setTimeout('equalheight("' + attrs.equalheights + '")', 500);
        }
    };
}).directive('ngNoEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if (event.which === 13) {
                event.preventDefault();
            }
        });
    };
}).filter('characters', function () {
    return function (input, chars, breakOnWord) {
        if (isNaN(chars)) return input;
        if (chars <= 0) return '';
        if (input && input.length > chars) {
            input = input.substring(0, chars);

            if (!breakOnWord) {
                var lastspace = input.lastIndexOf(' ');
                //get last space
                if (lastspace !== -1) {
                    input = input.substr(0, lastspace);
                }
            } else {
                while (input.charAt(input.length - 1) === ' ') {
                    input = input.substr(0, input.length - 1);
                }
            }
            return input + '…';
        }
        return input;
    };
}).filter('splitcharacters', function () {
    return function (input, chars) {
        if (isNaN(chars)) return input;
        if (chars <= 0) return '';
        if (input && input.length > chars) {
            var prefix = input.substring(0, chars / 2);
            var postfix = input.substring(input.length - chars / 2, input.length);
            return prefix + '...' + postfix;
        }
        return input;
    };
}).filter('words', function () {
        return function (input, words) {
            if (isNaN(words)) return input;
            if (words <= 0) return '';
            if (input) {
                var inputWords = input.split(/\s+/);
                if (inputWords.length > words) {
                    input = inputWords.slice(0, words).join(' ') + '…';
                }
            }
            return input;
        };
    }).filter('paginate', function () {
        return function (array, pageNumber, itemsPerPage) {
            var begin = ((pageNumber - 1) * itemsPerPage);
            var end = begin + itemsPerPage;
            return array.slice(begin, end);
        };
    }).filter('roundUp', function () {
        return function (value) {
            return Math.ceil(value);
        };
    }).filter('isCorrectSource', ['$filter', function ($filter) {
        var standardFilter = $filter('filter');
        return function (raters, assessment) {
            return standardFilter(raters, function (rater) {
                if (typeof (rater.SourcesId.results) != "undefined") {
                    for (var i = 0; i < rater.SourcesId.results.length; i++) {
                        if (rater.SourcesId.results[i] === assessment.VideoSource.Id)
                            return true;
                    }
                }
                return false;
            });
        };
    }]).service('Validator', ['$rootScope', function ($rootScope) {
        var validateEventId = "Validate";

        this.validate = function validate(checkOnly) {
            return $rootScope.$broadcast(validateEventId, checkOnly);
        }

        this.onValidate = function ($scope, handler) {
            $scope.$on(validateEventId, function (event, checkOnly) {
                var res = handler({
                    checkOnly: checkOnly
                });
                if (!res)
                    event.preventDefault();
            });
        }
    }]).service('ContentLoad', ['$rootScope', '$q', '$timeout', function ($rootScope, $q, $timeout) {
        var eventId = "ContentLoaded";
        var pendingPromises = [];
        var timeout = null;

        this.registerLoader = function registerLoader(promise) {
            if (timeout != null)
                $timeout.cancel(timeout);
            pendingPromises.push(promise);
            timeout = $timeout(this.waitForPromises.bind(this), 200);
        }
        this.waitForPromises = function waitForPromises() {
            $q.all(pendingPromises).then(function () {
                $rootScope.$broadcast(eventId);
            });
        }

        this.onLoaded = function ($scope, handler) {
            $scope.$on(eventId, function (event) {
                var res = handler({});
            });
        }
    }]);
    
angular.element(document.body).ready(function () {
    angular.bootstrap(document.body, ['HomeApp']);
});

Sorenson.HomeApp.config(['$locationProvider', function ($locationProvider) {
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });
}]);

//This line is to fix problems where links will not load because of the client side loading.
jQuery(document).ready(function () { jQuery("a:not([target]").attr("target", "_self"); });
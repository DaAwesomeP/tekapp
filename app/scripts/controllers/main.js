'use strict';

/**
 * @ngdoc function
 * @name tekForumApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the tekForumApp
 */
angular.module('tekForumApp')
    .controller('MainCtrl', function ($scope, $rootScope, FactoryCategory, FactoryTopic, $cookies, localStorageService, $http, $routeParams, $interval, PhoneGap, FactoryUserStorage, FactoryUser, ServerAddress, $cordovaFile) {
        // set loading flag
        $scope.busyLoadingData = false;
        $scope.userPrefs = FactoryUserStorage.user.prefs;
        var nginfiniteActive = false,
            wait = 3000,
            topicFile = 'topics.json',
            categoryFile = 'categories.json';

        /**
         * Loads the categories from the database to be renddered to the page
         * @method GetCategories
         **/
        $scope.GetCategories = function () {
            FactoryCategory.get().success(function (Data) {
                $rootScope.customNav.url = 'views/nav-main.html';
                $rootScope.customNav.scope.categoryList = Data.category_list.categories;

                if (!!window.cordova) {
                    $cordovaFile.writeFile(cordova.file.cacheDirectory, categoryFile, JSON.stringify(Data.category_list.categories), true).then(function (success) {
                        console.log(success);
                    }, function (error) {
                        console.log(error);
                    });
                } else {
                    localStorageService.set('categoryList', JSON.stringify(Data.category_list.categories));
                }
            });
        };

        /**
         * Loads the topics from the database to be renddered to the page
         * @method GetTopics
         **/
        $scope.GetTopics = function () {
            if ($routeParams.id) {
                FactoryTopic.getLatestCategory($routeParams.id).success(function (Data) {
                    $scope.category = true;
                    if ($routeParams.name) {
                        $scope.categoryName = $routeParams.name;
                    }
                    $scope.UpdateTopics(Data, false, true);
                });

            } else {
                FactoryTopic.getLatest().success(function (Data) {
                    //                    console.log(Data);
                    $scope.category = false;
                    $scope.UpdateTopics(Data, true, true);
                });
            }
        };

        /**
         * Updates the topic list on the page
         * @method UpdateTopics
         **/
        $scope.UpdateTopics = function (Data, storage, refresh) {
            // if refreshing data, rebuild array
            if (refresh) {
                $scope.page = 1;
                $scope.topicList = Data.topic_list.topics;
            } else {
                $scope.topicList.push.apply($scope.topicList, Data.topic_list.topics);
            }
            if (storage) {
                if (!!window.cordova) {
                    $cordovaFile.writeFile(cordova.file.cacheDirectory, topicFile, JSON.stringify(Data.topic_list.topics), true).then(function (success) {
                        console.log(success);
                    }, function (error) {
                        console.log(error);
                    });
                } else {
                    localStorageService.set('topicList', JSON.stringify(Data.topic_list.topics));
                }
            }
        };

        /**
         * Fetches next page of topics
         * @method FetchTopics
         **/
        $scope.FetchTopics = function () {
            nginfiniteActive = true;
            // set loading flag
            $scope.busyLoadingData = true;
            $scope.page++;
            if ($routeParams.id) {
                FactoryTopic.getLatestCategory($routeParams.id, $scope.page).success(function (Data) {
                    // set loading flag
                    $scope.category = true;
                    if ($routeParams.name) {
                        $scope.categoryName = $routeParams.name;
                    }
                    $scope.busyLoadingData = false;
                    $scope.UpdateTopics(Data);
                });

            } else {
                FactoryTopic.getLatest($scope.page).success(function (Data) {
                    // set loading flag
                    $scope.category = false;
                    $scope.busyLoadingData = false;
                    $scope.UpdateTopics(Data);
                });
            }
        };

        /**
         * Loads the topics from the database to be rendered to the page
         * @method GetTopics
         **/
        var init = function () {

            // if not a category and available, load the categories and topics from local storage, to quickly render results to user before rebuilding from data on server
            if (!$routeParams.id && !$scope.topicList) {
                if (!!window.cordova) {
                    $cordovaFile.readAsText(cordova.file.cacheDirectory, topicFile).then(function (success) { // success
                        $scope.topicList = $scope.topicList || JSON.parse(success);
                    }, function (error) { // error
                        // localstorage copy has not been created yet
                    });
                    $cordovaFile.readAsText(cordova.file.cacheDirectory, categoryFile).then(function (success) { // success
                        $rootScope.customNav.scope.categoryList = $rootScope.customNav.scope.categoryList || JSON.parse(success);
                    }, function (error) { // error
                        // localstorage copy has not been created yet
                    });
                } else {
                    // Is not Cordova - Use old method
                    $rootScope.customNav.scope.categoryList = localStorageService.get('categoryList') || [];
                    $scope.topicList = localStorageService.get('topicList') || [];
                }
            }
            $scope.page = 1;

            // get updated categories and topics from the server
            $scope.GetCategories();
            $scope.GetTopics();

        };

        init();

    });
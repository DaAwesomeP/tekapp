'use strict';

/**
 * @ngdoc function
 * @name tekForumApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the tekForumApp
 */
angular.module('tekForumApp')
    .controller('MainCtrl', function ($scope, $rootScope, FactoryCategory, FactoryTopic, $cookies, localStorageService, $http, $routeParams, $interval, PhoneGap, FactoryUser, ServerAddress) {
        // set loading flag
        $scope.busyLoadingData = false;
        var nginfiniteActive = false,
            wait = 3000;

        /**
         * Loads the categories from the database to be renddered to the page
         * @method GetCategories
         **/
        $scope.GetCategories = function () {
            FactoryCategory.get().success(function (Data) {
                $rootScope.customNav.url = 'views/nav-main.html';
                $rootScope.customNav.scope.categoryList = Data.category_list.categories;
                localStorageService.set('categoryList', JSON.stringify(Data.category_list.categories));
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
                    $scope.UpdateTopics(Data, null, true);
                });

            } else {
                FactoryTopic.getLatest().success(function (Data) {
                    $scope.category = false;
                    $scope.UpdateTopics(Data, localStorageService, true);
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
                storage.set('topicList', JSON.stringify(Data.topic_list.topics));
            }
            $('.canvas-slid').offcanvas('hide');
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
            // begin listening to the phones network status
//            var polling = function () {
//                $interval(function () {
//                    if (!nginfiniteActive && !PhoneGap.paused) {
//                        wait = 3000;
//                        $scope.GetTopics();
//                        //checkNotifications();
//                    } else {
//                        wait = 5000;
//                    }
//                }, wait); // Temporarily disabled until push nitification pulling is completed, and this is integrated in
//            };
//            polling();

            // if not a category and available, load the categories and topics from local storage, to quickly render results to user before rebuilding from data on server
            if (!$routeParams.id && !$scope.topicList) {
                $rootScope.customNav.scope.categoryList = localStorageService.get('categoryList');
                $scope.topicList = localStorageService.get('topicList') || [];
            }
            $scope.page = 1;

            // get updated categories and topics from the server
            $scope.GetCategories();
            $scope.GetTopics();

        };

        init();

    });
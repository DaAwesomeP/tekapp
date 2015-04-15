'use strict';

/**
 * @ngdoc function
 * @name tekForumApp.controller:NavigationCtrl
 * @description
 * # NavigationCtrl
 * Controller of the tekForumApp
 */
angular.module('tekForumApp')
    .controller('NavigationCtrl', function ($scope, FactoryUserStorage) {
        // listen for android options button

        $scope.menuVisible = false;
        $scope.user = FactoryUserStorage.user;

        /**
         * Reveals the off canvas menu
         * @method ShowMenu
         **/
        $scope.ShowMenu = function () {
            if (!$scope.menuVisible) {
                $('#right-menu').offcanvas('show');
            }
        };

        /**
         * Hides the off canvas menu, if open, otherwise navigate back
         * @method SwipeRight
         **/
        $scope.SwipeRight = function () {
            if ($scope.menuVisible) {
                $('#right-menu').offcanvas('hide');
            } else {
                window.history.back();
            }
        };
        
        /**
         * Toggles the off canvas menu
         * @method ToggleMenu
         **/
        $scope.ToggleMenu = function () {
            $('#right-menu').offcanvas('toggle');
        };

        // Bind events for navigating through the app
        $('#right-menu').on('show.bs.offcanvas', function () {
            $scope.menuVisible = true;
        });
        $('#right-menu').on('hide.bs.offcanvas', function () {
            $scope.menuVisible = false;
        });


        document.addEventListener('menubutton', $scope.ToggleMenu, false);
    });
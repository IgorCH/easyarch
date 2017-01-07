angular
    .module('theme.core.navigation_controller', ['theme.core.services'])
    .controller('NavigationController', ['$scope', '$location', '$timeout', function ($scope, $location, $timeout) {
        'use strict';
/*
* {{rootCtrl.translations.menu.signup}}
 {{rootCtrl.translations.menu.main}}
 {{rootCtrl.translations.menu.service}}
 {{rootCtrl.translations.menu.portfolio}}
 {{rootCtrl.translations.menu.contacts}}
 {{rootCtrl.translations.menu.help}}

 {{rootCtrl.translations.menu.projects}}
 {{rootCtrl.translations.menu.tasks}}
 {{rootCtrl.translations.menu.models}}
 {{rootCtrl.translations.menu.scenes}}

 * */
        $scope.menu = [
            {
                label: 'Service',
                iconClasses: 'glyphicon glyphicon-pencil',
                url: '#/service'
            },
            {
                label: 'Portfolio',
                iconClasses: 'glyphicon glyphicon-usd',
                url: '#/portfolio'
            },
            {
                label: 'Contacts',
                iconClasses: 'glyphicon glyphicon-shopping-cart',
                url: '#/contacts'
            },
            {
                label: 'Help',
                iconClasses: 'glyphicon glyphicon-briefcase',
                url: '#/help'
            },
            {
                label: 'Projects',
                iconClasses: 'glyphicon glyphicon-time',
                url: '#/projects',
                children: [
                    {
                        label: 'Create New Project',
                        url: '#/new_project'
                    },
                    {
                        label: 'Create New Task',
                        url: '#/new_task'
                    }
                ]
            },
            /*{
                label: 'Tasks',
                iconClasses: 'glyphicon glyphicon-calendar',
                url: '#/tasks',
                children: [
                    {
                        label: 'Create New',
                        url: '#/new_task'
                    }
                ]
            },*/
            {
                label: 'Models',
                iconClasses: 'glyphicon glyphicon-file',
                url: '#/models'
            },
            {
                label: 'Scenes',
                iconClasses: 'glyphicon glyphicon-print',
                url: '#/scenes'
            },
            {
                label: 'Users',
                iconClasses: 'glyphicon glyphicon-print',
                url: '#/users'
            },
            {
                label: 'Exit',
                iconClasses: 'glyphicon glyphicon-arrow-left',
                url: '#/exit'
            }
        ];


        var setParent = function (children, parent) {
            angular.forEach(children, function (child) {
                child.parent = parent;
                if (child.children !== undefined) {
                    setParent(child.children, child);
                }
            });
        };

        $scope.findItemByUrl = function (children, url) {
            for (var i = 0, length = children.length; i < length; i++) {
                if (children[i].url && children[i].url.replace('#', '') === url) {
                    return children[i];
                }
                if (children[i].children !== undefined) {
                    var item = $scope.findItemByUrl(children[i].children, url);
                    if (item) {
                        return item;
                    }
                }
            }
        };

        setParent($scope.menu, null);

        $scope.openItems = [];
        $scope.selectedItems = [];
        $scope.selectedFromNavMenu = false;

        $scope.select = function (item) {
            // close open nodes
            if (item.open) {
                item.open = false;
                return;
            }
            for (var i = $scope.openItems.length - 1; i >= 0; i--) {
                $scope.openItems[i].open = false;
            }
            $scope.openItems = [];
            var parentRef = item;
            while (parentRef !== null) {
                parentRef.open = true;
                $scope.openItems.push(parentRef);
                parentRef = parentRef.parent;
            }

            // handle leaf nodes
            if (!item.children || (item.children && item.children.length < 1)) {
                $scope.selectedFromNavMenu = true;
                for (var j = $scope.selectedItems.length - 1; j >= 0; j--) {
                    $scope.selectedItems[j].selected = false;
                }
                $scope.selectedItems = [];
                parentRef = item;
                while (parentRef !== null) {
                    parentRef.selected = true;
                    $scope.selectedItems.push(parentRef);
                    parentRef = parentRef.parent;
                }
            }
        };

        $scope.highlightedItems = [];
        var highlight = function (item) {
            var parentRef = item;
            while (parentRef !== null) {
                if (parentRef.selected) {
                    parentRef = null;
                    continue;
                }
                parentRef.selected = true;
                $scope.highlightedItems.push(parentRef);
                parentRef = parentRef.parent;
            }
        };

        var highlightItems = function (children, query) {
            angular.forEach(children, function (child) {
                if (child.label.toLowerCase().indexOf(query) > -1) {
                    highlight(child);
                }
                if (child.children !== undefined) {
                    highlightItems(child.children, query);
                }
            });
        };

        // $scope.searchQuery = '';
        $scope.$watch('searchQuery', function (newVal, oldVal) {
            var currentPath = '#' + $location.path();
            if (newVal === '') {
                for (var i = $scope.highlightedItems.length - 1; i >= 0; i--) {
                    if ($scope.selectedItems.indexOf($scope.highlightedItems[i]) < 0) {
                        if ($scope.highlightedItems[i] && $scope.highlightedItems[i] !== currentPath) {
                            $scope.highlightedItems[i].selected = false;
                        }
                    }
                }
                $scope.highlightedItems = [];
            } else if (newVal !== oldVal) {
                for (var j = $scope.highlightedItems.length - 1; j >= 0; j--) {
                    if ($scope.selectedItems.indexOf($scope.highlightedItems[j]) < 0) {
                        $scope.highlightedItems[j].selected = false;
                    }
                }
                $scope.highlightedItems = [];
                highlightItems($scope.menu, newVal.toLowerCase());
            }
        });

        $scope.$on('$routeChangeSuccess', function () {
            if ($scope.selectedFromNavMenu === false) {
                var item = $scope.findItemByUrl($scope.menu, $location.path());
                if (item) {
                    $timeout(function () {
                        $scope.select(item);
                    });
                }
            }
            $scope.selectedFromNavMenu = false;
            $scope.searchQuery = '';
        });
    }]);
(function () {
  'use strict';

  // Declare app level module which depends on views, and components
  angular.module('webcastApp', [
          'ngRoute',
          'ngCookies',
          'satellizer',
          'webcastApp.video'
        ])
        .config(config);

  config.$inject = ['$routeProvider', '$locationProvider','$authProvider','$httpProvider'];
  function config( $routeProvider, $locationProvider, $authProvider, $httpProvider) {
      $authProvider.facebook({
        clientId: '119572161402051'
      });

      //$locationProvider.html5Mode(true);
      
      $routeProvider
          .when('/', {
              controller: 'HomeController',
              templateUrl: 'home/home.view.html',
              controllerAs: 'vm',
              resolve: {
                loginRequired: loginRequired
              }
          })

          .when('/login', {
              controller: 'LoginController',
              templateUrl: 'login/login.view.html',
              controllerAs: 'vm',
              resolve: {
                skipIfLoggedIn: skipIfLoggedIn
              }
          })

          .when('/register', {
              controller: 'RegisterController',
              templateUrl: 'register/register.view.html',
              controllerAs: 'vm',
              resolve: {
                skipIfLoggedIn: skipIfLoggedIn
              }
          })

          .when('/logout', {
              controller: 'LogoutController',
              template: null,
              controllerAs: 'vm'
          })

          .when('/video', {
            controller: 'VideoController',
            templateUrl: 'video/video.view.html',
            controllerAs: 'vm',
            resolve: {
              loginRequired: loginRequired
            }
          })
          .otherwise({ redirectTo: '/login' });

      //================================================
      // An interceptor for AJAX errors
      //================================================

      $httpProvider.interceptors.push(['$q', '$injector', function($q, $injector) {
        return function (promise) {
          return promise.then(
            // Successs
            function (response) {
              return response;
            },
            // Error 
            function (response) {
              if (response.status === 401) {
                var $state = $injector.get('$state');
                $state.go('public.login');
                return $q.reject(response);
              }
            }
          );
        };
      }]);
    

      function skipIfLoggedIn($q, $auth) {
        var deferred = $q.defer();
        if ($auth.isAuthenticated()) {
          deferred.reject();
        } else {
          deferred.resolve();
        }
        return deferred.promise;
      }

      function loginRequired($q, $location, $auth) {
        var deferred = $q.defer();
        if ($auth.isAuthenticated()) {
          deferred.resolve();
        } else {
          $location.path('/login');
        }
        return deferred.promise;
      }
  }

  
})();
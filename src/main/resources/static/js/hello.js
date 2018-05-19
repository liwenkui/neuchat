angular.module('hello', ['ngRoute']).config(function ($routeProvider) {

    $routeProvider.when('/', {
        templateUrl: 'home.html',
        controller: 'home',
        controllerAs: 'controller'
    }).when('/login', {
        templateUrl: 'login.html',
        controller: 'navigation',
        controllerAs: 'controller'
    }).when('/signUp', {
        templateUrl: 'signup.html',
        controller: 'signUp',
        controllerAs: 'controller'
    }).otherwise('/');

}).controller('navigation',

    function ($rootScope, $http, $location, $route) {

        var self = this;

        self.tab = function (route) {
            return $route.current && route === $route.current.controller;
        };

        var authenticate = function (callback) {

            $http.get('user').then(function (response) {
                if (response.data.name) {
                    $rootScope.authenticated = true;
                } else {
                    $rootScope.authenticated = false;
                }
                callback && callback();
            }, function () {
                $rootScope.authenticated = false;
                callback && callback();
            });

        };

        authenticate();

        self.credentials = {};
        self.login = function () {
            $http.post('login', $.param(self.credentials), {
                headers: {
                    "content-type": "application/x-www-form-urlencoded"
                }
            }).then(function () {
                authenticate(function () {
                    if ($rootScope.authenticated) {
                        console.log("Login succeeded")
                        $location.path("/");
                        self.error = false;
                        $rootScope.authenticated = true;
                    } else {
                        console.log("Login failed with redirect")
                        $location.path("/login");
                        self.error = true;
                        $rootScope.authenticated = false;
                    }
                });
            }, function () {
                console.log("Login failed")
                $location.path("/login");
                self.error = true;
                $rootScope.authenticated = false;
            })
        };

        self.logout = function () {
            $http.post('logout', {}).finally(function () {
                $rootScope.authenticated = false;
                $location.path("/");
            });
        }

    })
    .controller('home', function ($http, $scope) {
        var self = this;
        var stompClient = null;

        var setConnected = function (connected) {
            $("#connect").prop("disabled", connected);
            $("#disconnect").prop("disabled", !connected);
            if (connected) {
                $("#conversation").show();
            }
            else {
                $("#conversation").hide();
            }
            $("#greetings").html("");
        };

        self.connectWs = function () {
            var socket = new SockJS('/ws-connect');
            stompClient = Stomp.over(socket);
            stompClient.connect({}, function (frame) {
                setConnected(true);
                console.log('Connected: ' + frame);
                stompClient.subscribe('/topic/all', function (message) {
                    self.showMessage(message.body);
                });
                stompClient.send("/app/connect", {}, "connect");

                stompClient.subscribe('/topic/connect', function (message) {
                    self.showNewUser(message.body);
                });
                stompClient.subscribe('/topic/disconnect', function (message) {
                    self.showDisconnect(message.body);
                });
                $http.get("/latest?page=0&size=10").then(function (rep) {
                    self.showHistoryMessage(rep.data.content);
                }, function (reason) {
                    console.log("error " + reason.toString());
                })
            });
        };

        self.showHistoryMessage = function (message) {
            message.forEach(function (value) {
                $("#greetings").append("<tr><td>" + "history message " + value.user.name + " : " + value.message  +" time: "+value.createTime+ "</td></tr>");
            })
        };

        self.showDisconnect = function (message) {
            $("#greetings").append("<tr><td>" + message + " left the chat room " + "</td></tr>");
        };

        self.showNewUser = function (message) {
            $("#greetings").append("<tr><td>" + message + " enters the chat room" + "</td></tr>");
        };

        self.showMessage = function (message) {
            console.log("receive message : " + message);
            $("#greetings").append("<tr><td>" + message + "</td></tr>");
        };

        self.disconnect = function () {
            if (stompClient !== null) {
                stompClient.disconnect();
            }
            setConnected(false);
            console.log("Disconnected");
        };

        self.send = function () {
            console.log("send message is :" + $scope.message);
            stompClient.send("/app/all", {}, $scope.message);
        };

    }).controller('signUp',
    function ($scope, $http, $location, $route) {

        var self = this;

        self.signUp = function () {
            console.log("crate new user : ", $scope.user);
            $http.post('/user', $scope.user).then(function (rep) {
                alert("signed Up. please login");
                $location.path("/login");
            }, function (reason) {
                alert("error ，" + reason.data);
                console.log("error : " + reason.data);
            })
        }
    });

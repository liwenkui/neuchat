angular.module('hello', ['ngRoute']).config(function ($routeProvider) {

    $routeProvider.when('/', {
        templateUrl: 'home.html',
        controller: 'home',
        controllerAs: 'controller'
    }).when('/login', {
        templateUrl: 'login.html',
        controller: 'navigation'
    }).when('/signUp', {
        templateUrl: 'signup.html',
        controller: 'signUp',
        controllerAs: 'controller'
    }).otherwise('/');

}).controller('navigation',

    function ($rootScope, $http, $location, $route,$scope) {

        $scope.tab = function (route) {
            return $route.current && route === $route.current.controller;
        };

        /**
         * 获取用户登录状态
         * @param callback
         */
        var authenticate = function (callback) {

            $http.get('user').then(function (response) {
                if (response.data.name) {
                    $rootScope.username = response.data.name;
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

        $scope.credentials = {};

        /**
         * 登录
         */
        $scope.login = function () {
            $http.post('login', $.param($scope.credentials), {
                headers: {
                    "content-type": "application/x-www-form-urlencoded"
                }
            }).then(function () {
                //请求成功
                authenticate(function () {
                    //获取用户信息成功
                    if ($rootScope.authenticated) {
                        console.log("Login succeeded")
                        $location.path("/"); //跳到主页
                        $scope.error = false;
                        $rootScope.authenticated = true; //将flag置为true
                        //获取用户信息失败
                    } else {
                        console.log("Login failed with redirect")
                        $location.path("/login"); //继续在login页面
                        $scope.error = true;
                        $rootScope.authenticated = false;
                    }
                });
            }, function () {
                //失败
                console.log("Login failed")
                $location.path("/login");
                $scope.error = true;
                $rootScope.authenticated = false;
            })
        };

        /**
         * 登出
         */
        $scope.logout = function () {
            $http.post('logout', {}).finally(function () {
                $rootScope.authenticated = false;
                $location.path("/");
            });
        }

    })
    .controller('home', function ($http, $scope, $rootScope) {
        var stompClient = null;
        $scope.users = [];

        Array.prototype.indexOf = function (val) {
            for (var i = 0; i < this.length; i++) {
                if (this[i] == val) return i;
            }
            return -1;
        };

        Array.prototype.remove = function (val) {
            var index = this.indexOf(val);
            if (index > -1) {
                this.splice(index, 1);
            }
        };

        /**
         * 设置连接行为
         * @param connected
         */
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

        /**
         * 连接
         */
        $scope.connectWs = function () {
            var socket = new SockJS('/ws-connect');
            stompClient = Stomp.over(socket);
            stompClient.connect({}, function (frame) {
                setConnected(true);
                console.log('Connected: ' + frame);
                //监听聊天信息
                stompClient.subscribe('/topic/all', function (message) {
                    $scope.showMessage(message.body);
                });
                //发送登录信息
                stompClient.send("/app/connect", {}, "connect");
                //监听登录事件
                stompClient.subscribe('/topic/connect', function (message) {
                    $scope.showNewUser(message.body);
                    $scope.users.push(message.body);
                    // $scope.$apply();
                });
                //监听离开事件
                stompClient.subscribe('/topic/disconnect', function (message) {
                    $scope.showDisconnect(message.body);
                    $scope.users.remove(message.body);
                    // $scope.$apply();

                });
                //监听私信
                stompClient.subscribe('/user/queue/private', function (message) {
                    $scope.privateMessage(message.body);
                });
                //获取上十条聊天记录
                $http.get("/latest?page=0&size=10").then(function (rep) {
                    $scope.showHistoryMessage(rep.data.content);
                }, function (reason) {
                    console.log("error " + reason.toString());
                });
                //获取所有已连接用户列表
                $http.get("/allUser").then(function (rep) {
                    console.log("users is : ", rep.data)
                    $scope.showCurrentOnlineUsers(rep.data);
                }, function (reason) {
                    console.log("error " + reason.toString())
                });
            });
        };

        /**
         * 渲染私信
         * @param message
         */
        $scope.privateMessage = function (message) {
            $("#greetings").append("<tr><td>" + "private message : " + message + "</td></tr>");
        };

        /**
         * 发送信息到指定用户
         * @param user 用户
         * @param message 消息
         */
        $scope.sendMessageToUser = function (user) {
            console.log("send private message to " + user);
            stompClient.send("/user" + "/" + user + "/queue/private", {}, $rootScope.username + " : " + $scope.message);
            $("#greetings").append("<tr><td>" + "send private message : " + $scope.message + " to " + user + "</td></tr>");
        };

        /**
         * 显示目前登录用户
         * @param us
         */
        $scope.showCurrentOnlineUsers = function (us) {
            $scope.users = us;
        };

        /**
         * 显示历史聊天记录
         * @param message
         */
        $scope.showHistoryMessage = function (message) {
            message.forEach(function (value) {
                $("#greetings").append("<tr><td>" + "history message " + value.user.name + " : " + value.message + " time: " + value.createTime + "</td></tr>");
            })
        };

        /**
         * 显示离开事件
         * @param user
         */
        $scope.showDisconnect = function (user) {
            $("#greetings").append("<tr><td>" + user + " left the chat room " + "</td></tr>");
        };

        /**
         * 显示进入聊天室记录
         * @param user
         */
        $scope.showNewUser = function (user) {
            $("#greetings").append("<tr><td>" + user + " enters the chat room" + "</td></tr>");
        };

        /**
         * 显示消息
         * @param message
         */
        $scope.showMessage = function (message) {
            console.log("receive message : " + message);
            $("#greetings").append("<tr><td>" + message + "</td></tr>");
        };

        /**
         * 断开ws连接
         */
        $scope.disconnect = function () {
            if (stompClient !== null) {
                stompClient.disconnect();
            }
            setConnected(false);
            console.log("Disconnected");
        };

        /**
         * 发送聊天信息
         */
        $scope.send = function () {
            console.log("send message is :" + $scope.message);
            stompClient.send("/app/all", {}, $scope.message);
        };

    }).controller('signUp',
    function ($scope, $http, $location, $route) {

        /**
         * 注册用户
         */
        $scope.signUp = function () {
            console.log("crate new user : ", $scope.user);
            $http.post('/user', $scope.user).then(function (rep) {
                alert("signed Up. please login");
                $location.path("/login");
            }, function (reason) {
                alert("error ，" + reason.data);
                console.log("error : " + reason.data.error);
            })
        }
    });

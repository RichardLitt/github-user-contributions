'use strict';

angular.module('githubUserContributionsApp')
  .controller('MainCtrl', ['$scope', '$http', function ($scope, $http) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];

    $scope.username = 'RichardLitt';

    /*
    * So, steps we need to do:
    *   * DONE: Call Github - all pages - for the initial list of issues
    *   * Enable OAuthentication
    *   * Sort those issues for repositories
    *   * Call those repositories for information to display
    *   * Display all information
    */

    $scope.currentPage = 0;
    $scope.data = [];

    // Object example: 
    // data = [
    //   {
    //     repo_url: String,
    //     repository: {Object},
    //     issues: [{Objects},...],
    //     pull_requests: [{Objects},...]
    //   },
    //   ...
    // ]

    $scope.findRepository = function(repo){
      $http({
        url: 'https://api.github.com/repos/' + repo.owner + '/' + repo.name,
        method: 'GET',
      })
      .success(function(data){
        return data;
      })
      .error(function(){
        return null;
      });
    }

    $scope.findRepositories = function(){
      $http({
        url: 'https://api.github.com/search/issues',
        method: 'GET',
        params: {
          'q': 'author:' + $scope.username,
          'page': $scope.currentPage
        }
      })
        .success(function(data){
          console.log('Original data: ', data);

          _.forEach(data.items, function(issue) {
            var repo = {
              'owner': issue.html_url.split('/')[3],
              'name': issue.html_url.split('/')[4],
              'url': issue.html_url.split('/').slice(0,5).join('/')
            };
            console.log(repo);

            if (repo.owner !== $scope.username) {
              /* Needs to map onto the original object */
              var existingRepo = _.find($scope.data, {'repo_url': repo.url } );
              if (existingRepo) {
                if (issue.pull_request) {
                  /* If the issue is a PR */
                  existingRepo.pull_requests.push(issue);
                } else {
                  /* If an issue */
                  existingRepo.issues.push(issue)
                }
              } else {
                var newRepo = {
                  repo_url: repo.url,
                  repository: $scope.findRepository(repo),
                  issues: [],
                  pull_requests: []
                };
                if (issue.pull_request) {
                  /* If the issue is a PR */
                  newRepo.issues.push(issue);
                } else {
                  /* If an issue */
                  newRepo.pull_requests.push(issue)
                }
              }
            }
          });

          console.log('Cleaned data: ', $scope.data);

          if (data.items.length !== 0) {
            $scope.currentPage += 1
            $scope.findRepositories();
          }
        })
        .error(function(){
          console.log("Finding Repositories didn't work");
        });
    };

  }]);

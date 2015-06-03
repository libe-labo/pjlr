'use strict';

var app = angular.module('app', []);

app.filter('slugify', function() {
    return function(str) {
        return str.toLowerCase()
                  .replace('/\s+/g', '-')
                  .replace(/[^\w\-]+/g, '')
                  .replace(/\-\-+/g, '-')
                  .replace(/^-+/, '')
                  .replace(/-+$/, '');
    };
});

app.controller('Ctrl', ['$scope', '$http', '$timeout', '$sce', '$location', '$filter',
                        function($scope, $http, $timeout, $sce, $location, $filter) {

    var callIsotope = function() {
        $timeout(function() {
            $('.isotope').isotope({
                itemSelector : '.pages',
                masonry : {
                  columnWidth : '.pages'
                },
                filter: function() {
                    var text = $(this).children('.' + $scope.category).text().trim();
                    return text.length > 0 && text !== '-';
                }
            });
        }, 100);

        if ($scope.category === 'savoir-plus') {
            $timeout(callIsotope, 1000);
        }
    };

    var allData = [];

    /*
    ** Category
    */
    var notFadedOut = null;
    $scope.category = 'une-phrase';

    $scope.isCategory = function(toTest) {
        return $scope.category === toTest;
    };

    $scope.setCategory = function(category) {
        $scope.fadeAllBut(null);

        $scope.category = category;
        callIsotope();

        $location.path('/' + category);
    };

    $scope.fadeAllBut = function(slug) {
        if (slug != null && notFadedOut !== slug) {
            notFadedOut = slug;
        } else {
            notFadedOut = null;
        }
    };

    /*
    ** Handle URL
    */
    var path = $location.path();
    if (path.length > 0) {
        path = path.substr(1).split('--');
        $scope.category = path[0];

        if (path.length > 1) {
            $scope.fadeAllBut(path[1]);

            $timeout(function() {
                $(window).scrollTop($('#' + path[1]).offset().top - 50);
            }, 500);
        }
    }

    /*
    ** Get data
    */
    $http.get('data/texts.tsv').then(function(response) {
        allData = d3.tsv.parse(response.data, function(d) {
            return {
                title : d['Mot-clé'],
                slug : $filter('slugify')(d['Mot-clé']),
                'une-phrase' : $sce.trustAsHtml(d['tl;dr']),
                'en-details' : $sce.trustAsHtml(d.Explication),
                'quel-probleme' : $sce.trustAsHtml(d['Quels problèmes ça pose?']),
                'dans-la-vraie-vie' : $sce.trustAsHtml(d['Vie réelle']),
                'avec-des-poissons' : $sce.trustAsHtml(d['Pêche']),
                'savoir-plus' : $sce.trustAsHtml(d['Liens pour en savoir plus'])
            };
        });

        $http.get('data/plus.tsv').then(function(response) {
            d3.tsv.parse(response.data, function(d) {
                for (var i = 0; i < allData.length; ++i) {
                    if (allData[i].title === d['Mot-clé']) {
                        allData[i]['savoir-plus'] = {
                            link : d.Lien,
                            title : d.Titre,
                            picture : d.Image,
                            text : d.Texte,
                            pictureStyle : allData[i].title === 'Motifs' ? { width : 'auto' , height : '200px' }
                                                                         : { }
                        };
                        break;
                    }
                }
            });

            $scope.pages = allData;

            callIsotope();
        });
    });

    /*
    ** Classes utils
    */
    $scope.categoryClass = function() {
        var classes = {};
        classes['wrapper-' + $scope.category] = true;
        return classes;
    };

    $scope.columnsClass = function() {
        return {
            twocols : ['en-details', 'quel-probleme'].indexOf($scope.category) >= 0
        };
    };

    $scope.pageClass = function(slug) {
        return {
            fadedout : notFadedOut != null && notFadedOut !== slug
        };
    };


    $scope.getPageLink = function(slug) {
        return '#/' + $scope.category + '--' + slug;
    };
}]);
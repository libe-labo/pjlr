'use strict';

var app = angular.module('app', []);

app.filter('slugify', function() {
    return function(str) {
        return str.toLowerCase()
                  .replace('/\s+/g', '-')
                  .replace(/[^\w\-]+/g, '')
                  .replace(/\-\-+/g, '-');
    };
});

app.controller('Ctrl', ['$scope', '$http', '$timeout', '$sce', '$location', '$filter',
                        function($scope, $http, $timeout, $sce, $location, $filter) {

    /*
    ** Isotope
    */
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
    var mouseIsOver = null;
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

    /*
    ** Fade out
    */
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
        if (path[0] != null && path[0].length > 0) {
            $scope.category = path[0];

            if (path.length > 1) {
                $scope.fadeAllBut(path[1]);

                $timeout(function() {
                    $(window).scrollTop($('#' + path[1]).offset().top - 50);
                }, 500);
            }
        }
    }

    /*
    ** Get data
    */
    $http.get('data/texts.tsv').then(function(response) {
        allData = d3.tsv.parse(response.data, function(d) {
            return {
                'title' : d['Mot-clé'],
                'slug' : $filter('slugify')(d['Mot-clé']),
                'une-phrase' : $sce.trustAsHtml(d['tl;dr']),
                'en-details' : $sce.trustAsHtml(d.Explication),
                'quel-probleme' : $sce.trustAsHtml(d['Quels problèmes ça pose?']),
                'dans-la-vraie-vie' : $sce.trustAsHtml(d['Vie réelle']),
                'avec-des-poissons' : $sce.trustAsHtml(d['Pêche'])
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
    ** Utils
    */
    $scope.categoryClass = function() {
        var classes = {};
        classes['wrapper-' + $scope.category] = true;
        return classes;
    };

    $scope.menuClass = function(category) {
        return {
            selected : $scope.category === category
        };
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

    $scope.twitterClass = function(slug) {
        return {
            display : mouseIsOver === slug
        };
    };

    $scope.getPageLink = function(slug) {
        return '#/' + $scope.category + '--' + slug;
    };

    $scope.isOver = function(slug) {
        mouseIsOver = slug;
    };

    $scope.tweet = function(item) {
        var text = encodeURIComponent(item.title + ' : j\'ai tout compris à la Loi Renseignement grâce à @libe. Et vous ? #pjlr');
        var url = encodeURIComponent($location.absUrl() + '#' + $scope.category + '--' + item.slug);
        var link = 'https://twitter.com/intent/tweet?original_referer=' + '' + '&text=' + text + '&url=' + url;
        window.open(link);
    };

    /*
    ** Resize handler
    */
    var menu = $('#menu');
    var basePos = menu.position().top + parseInt(menu.css('margin-top'));
    $(document).on('scroll', _.debounce(function() {
        if (window.innerWidth <= 992) {
            if (window.scrollY >= basePos) {
                menu.css({
                    position : 'fixed',
                    top : 30,
                });
            } else {
                menu.css({
                    position : 'relative'
                });
            }
        }
    }));
}]);
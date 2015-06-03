$(function() {
	var menuTop = $("#menu").position().top;

	var callIsotope = function(className) {
		$('.isotope').isotope({
			itemSelector : '.pages',
			masonry : {
			  columnWidth : '.pages'
			},
			filter: function() {
				return $(this).children('.' + className).text().length > 0;
			}
		});
	};

	var activateSection = function(className, noscroll) {
		noscroll = noscroll || false;
		// Change colors
		$('.pagewrapper').removeClass('wrapper-une-phrase wrapper-en-details wrapper-quel-probleme wrapper-dans-la-vraie-vie wrapper-avec-des-poissons wrapper-savoir-plus');
		$('.pagewrapper').addClass('wrapper-' + className);

		// Activate menu item
		$('#menu li').removeClass('selected');
		$('#menu li.' + className).addClass('selected');

		// Change what is displayed
		$('.pages > p').hide();
		$('.pages .savoir-plus').hide();
		$('.pages .' + className).show();

		if (['en-details', 'quel-probleme'].indexOf(className) >= 0) {
			$('.isotope').addClass('twocols');
		} else {
			$('.isotope').removeClass('twocols');
		}

		$('.fadedout').removeClass('fadedout');

		// Reorder content
		callIsotope(className);

		// Scroll up
		if (!noscroll) {
			if (window.innerWidth <= 992) {
				$('body').scrollTop(menuTop);
			}
		}
	};

	// Register menu actions
	$('#menu li a').on('click', function(event) {
		event.preventDefault();
		activateSection($(this).attr('rel'));
	});

	// Twitter buttons
	$('.pages .une-phrase').on('mouseenter', function() {
		$(this).find('.twitter-share-button').show();
	});
	$('.pages .une-phrase').on('mouseleave', function() {
		$(this).find('.twitter-share-button').hide();
	});
	$('.pages .une-phrase').each(function() {
		var button = $('<a href="#" class="twitter-share-button"><i class="fa fa-twitter"></i></a>');
		var text = encodeURIComponent($(this).siblings('h3').text() + " : j'ai tout compris à la Loi Renseignement grâce à @libe. Et vous ? #pjlr");
		var url = encodeURIComponent(window.location.href + '#' + $(this).parents('.pages').attr('id'));
		var link = "https://twitter.com/intent/tweet?original_referer=" + "" + "&text=" + text + "&url=" + url;
		button.on('click', function(event) {
			event.preventDefault();
			window.open(link);
		});
		$(this).append(button);
	});

	$('body').append($('<div>').addClass('hidden'));

	// Initialize
	activateSection('une-phrase', true);

	// Check if there's a #
	if (window.location.hash != null && window.location.hash.length > 0) {
		var id = window.location.hash.slice(1, window.location.hash.length);
		$('.pages').each(function() {
			if ($(this).attr('id') != id) {
				$(this).addClass('fadedout');
			}
		});
		$('body').scrollTop($("#" + id).position().top);

		window.setTimeout(function() {
			$('.fadedout').removeClass('fadedout');
		}, 10000);
	}

	var menu = $("#menu");
	var basePos = menu.position().top + parseInt(menu.css('margin-top'));
	$(document).on('scroll', function(event) {
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
	});
});
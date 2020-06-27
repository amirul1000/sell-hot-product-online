$(document).ready(function () {

    //script to hover the MEGA-menu
    $("#aig-navigationWrapper li.dropdown").hover(
        function (e) {
            //e.stopPropagation();
            $('.dropdown-menu', this).stop(true, true).slideDown('fast');
            $(this).toggleClass('open');
        },
        function (e) {
            //e.stopPropagation();
            $('.dropdown-menu', this).stop(true, true).delay(200).hide('fast');
            $(this).toggleClass('open');
        }
    );

    // When tabbing menu is clickable disable close when clicked inside
    $('ul.navbar-aig-menu > li.dropdown').click(function (e) {
        e.stopPropagation();
    });

    $("#aig-search-icon").click(function () {
        var $searchInput = $('#aig-search');
        if (!$searchInput.hasClass('search-animate')) {
            $searchInput.addClass('search-animate').focus();
        }
        else {
            if ($searchInput.val()) {
                $("#aig-searchform").submit();
            }
            else {
                $searchInput.removeClass('search-animate');
            }
        }
    });

    $("#aig-search-icon-mobile").click(function () {
        var $searchInput = $('#aig-search-mobile');
        if (!$searchInput.hasClass('search-animate')) {
            $searchInput.addClass('search-animate').focus();
        }
        else {
            if ($searchInput.val()) {
                $("#aig-searchform-mobile").submit();
            }
            else {
                $searchInput.removeClass('search-animate');
            }
        }
    });

    $('#aig-header-requestbuttongrp').on('click', function () {
        $('body,html').animate({ scrollTop: 0 }, 800);
    });

});
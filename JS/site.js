$(document).ready(function () {

    $('.iconClick').click(function () {
        var url = $(this).data('url');

        window.location.href = url;
    });

    $('.scroll-top-btn').on('click', function () {
        $('body,html').animate({ scrollTop: 0 }, 800);
    });

});
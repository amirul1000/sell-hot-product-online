   $(function () {
       $('a[href*="#"]:not([href="#"])').click(function () {
           if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
               var target = $(this.hash);
               target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
               if (target.length) {
                   $('html, body').animate({
                       scrollTop: target.offset().top
                   }, 1000);
                   return false;
               }
           }
       });
   });

   $(document).ready(function () {
       $(document).off('click', '#app_common_modal_close');
       $(document).on('click', '#app_common_modal_close', function () {
           $('#app_common_modal').remove();
       });
   });

   function openNewWindow(page_url, type, window_name, width, height, top, left, features) {

       if (!type) {
           type = 'popup';
       }

       if (!width) {
           width = 480;
       }

       if (!height) {
           height = 480;
       }

       if (!top) {
           top = 50;
       }

       if (!left) {
           left = 50;
       }

       if (!features) {
           features = 'resizable,scrollbars';
       }

       if (type == 'popup') {
           var settings = 'height=' + height + ',';
           settings += 'width=' + width + ',';
           settings += 'top=' + top + ',';
           settings += 'left=' + left + ',';
           settings += features;

           win = window.open(page_url, window_name, settings);
           win.window.focus();
       } else if (type == 'modal') {
           var html = '';
           html += '<div id="app_common_modal">';
           html += '<div class="app_modal_body"><a href="javascript:void(0);" id="app_common_modal_close">X</a><iframe src="' + page_url + '" frameborder="0"></iframe></div>';
           html += '</div>';

           if (!$('#app_common_modal').length) {

               $('body').append(html);
           }
           $('#app_common_modal').fadeIn();
       }

   }



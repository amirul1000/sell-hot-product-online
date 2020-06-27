function showPopup(n) {
    $("#" + n + ",.bg_overlay").show();
}

function close(n) {
    $("#" + n).hide();
    $(".bg_overlay").hide();
    $(".form").show();
    $(".cartloader").hide();
    

}
// function setcontent(url) {
//	 	$("#div_error").html("");
//        showPopup("dv_info");
//        $("#popupcopy").load(url, function() {
//    });
//}
function showalert(n,b,msg) {
    $("#" + b).html(msg);
    showPopup(n);
}

function setcontent(url) {
    $("#div_error").html("");
    showPopup("dv_info");
    $(".closediv").show();

    $("#popupcopy").load(url, function () {
    });
}

function showerror(html) {
   
    $("#dv_info .closediv").show();
    $("#popupcopy").html(html);
    showPopup("dv_info");
} 
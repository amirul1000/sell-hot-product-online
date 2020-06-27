var _PageErrorList = {};

$(document).ready(function () {

    //select Box plugin
    $('select.custom-select').selectpicker({ selectOnTab: true, size: 8, liveSearch: false, mobile: ($('#Mobile').val() == 'true') });

    $('select.custom-select').change(function ()
    {
        if ($(this).val() != '') {
            $(this).parent().find('button.selectpicker').css('color', '#000');
        } else { 
            $(this).parent().find('button.selectpicker').css('color', '#999');
        }
    });

    //*********************************************************************************************************************
    // selector helper for finding hidden elements, NEEDS TO BE FIRST
    //*********************************************************************************************************************
    jQuery.expr[':'].hiddenByParent = function (a) {
        return jQuery(a).parent().is(':hidden');
    };

    jQuery.expr[':'].hiddenByParentParent = function (a) {
        return jQuery(a).parent().parent().is(':hidden');
    };

    // Calculate minimum and maximum dates for the birthdate field
    var agerangedate = new Date();
    var minimumdate = ('0' + (agerangedate.getMonth() + 1)).slice(-2) + '/' + (('0' + agerangedate.getDate()).slice(-2) + '/' + parseInt(agerangedate.getFullYear() - 85)).toString();
    var maximumdate = ('0' + (agerangedate.getMonth() + 1)).slice(-2) + '/' + (('0' + agerangedate.getDate()).slice(-2) + '/' + parseInt(agerangedate.getFullYear() - 18)).toString();

    // Form validation setup
    $('#leadForm').formValidation({
        framework: 'bootstrap',
        excluded: ':disabled,:hidden:not(.custom-select),.custom-select:hiddenByParent',
        live: 'disabled',
        autoFocus: false,
        icon: {
            valid: 'glyphicon',
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
        err: {
            container: 'tooltip'
        },
        fields: {
            BirthDate: {
                validators: {
                    date: {
                        min: minimumdate,
                        max: maximumdate,
                        message: 'This product is only for people age 18 to 85 years.'
                    }
                }
            },
            ZipCode: {
                validators: {
                    regexp: {
                        regexp: /^\d{5}$/,
                        message: 'The US Zip Code must Contain 5 digits.'
                    }
                }
            }
        }
    }).on('success.form.fv', function (e) {
        e.preventDefault();
    }).on('err.field.fv', function (e, data) {

        // This event can be raised multiple times per input field.  Create array to make sure we are only adding the error message once.
        if (typeof _PageErrorList.field !== 'undefined' && _PageErrorList.field.indexOf(data.field) == -1) {

            var errorMessage = data.element.data('fv.messages').find('.help-block[data-fv-for="' + data.field + '"][data-fv-result="INVALID"]:first');

            _PageErrorList.field.push(data.field);
            _PageErrorList.Message.push("<li>" + $(errorMessage).text() + "</li>");
        }
    }).on('success.field.fv', function (e, data) {
        e.preventDefault();

        if ($(data.element[0]).hasClass('custom-select')) {
            // Tool-tip still lingers so we need to manually remove it
            data.element.tooltip('destroy');
        }
    }).on('err.form.fv', function (e, data) {

        // only do this on mobile
        if ($('#Mobile').val().toLowerCase() == 'true') {
            bootbox.dialog({
                title: '<span class="glyphicon glyphicon-exclamation-sign text-error" aria-hidden="true" style="color: #a94442;"></span>&nbsp;&nbsp;Invalid Information',
                message: 'Please correct the issues indicated and try again.',
                closeButton: false,
                className: "my-modal",
                buttons: {
                    main: {
                        label: "Ok",
                        className: "btn-primary btn-lg"

                    }
                }
            });
            $("html, body").animate({ scrollTop: 0 }, "slow");
        } else {

            // Show BootBox Error Message
            bootbox.dialog({
                title: '<span class="glyphicon glyphicon-exclamation-sign text-error" aria-hidden="true" style="color: #a94442;"></span>&nbsp;&nbsp;Oops - we found some items that need your attention.',
                message: 'Please correct the issues indicated below and try again:<br/><br/><ul>' + _PageErrorList.Message.join(' ') + '</ul>',
                closeButton: false,
                className: "my-modal",
                buttons: {
                    main: {
                        label: "OK",
                        className: "btn-primary",
                        callback: function () {
                            // Empty Error List
                        }
                    }
                }
            });
        }
    });

    if (typeof $('#Mobile').val() !== 'undefined' && $('#Mobile').val().toLowerCase() == 'true')
    {
        $('.numeric-only').keyup(function (e)
        {
            var regex = /^[0-9\b.\t]+$/;
            var numericValue = $(this).val();

            var numberToValidate = numericValue.substr(numericValue.length - 1);
            if (!regex.test(numberToValidate))
            {
                if (numericValue.length > 0) {
                    var validatedValues = numericValue.substr(0, (numericValue.length - 1));

                    $(this).val(validatedValues);
                } else {
                    $(this).val('');
                }
            }
        });

        $('.alpha-only').keyup(function (e)
        {
            var regex = /^[a-zA-Z\b\-.\s\t']+$/;
            var str = $(this).val();
            var strToValidate = str.substr(str.length - 1);
            if (!regex.test(strToValidate)) {

                if (str.length > 0) {
                    var validatedValues = str.substr(0, (str.length - 1));
                    $(this).val(validatedValues);
                } else {
                    $(this).val('');
                }
            }
        });

        $('.alpha-numeric-only').keyup(function (e)
        {
            var regex = /^[a-zA-Z0-9\b\-.\s\t']+$/;
            var alphaNumeric = $(this).val();
            var strToValidate = alphaNumeric.substr(alphaNumeric.length - 1);
            if (!regex.test(strToValidate)) {

                if (alphaNumeric.length > 0) {
                    var validatedValues = alphaNumeric.substr(0, (alphaNumeric.length - 1));
                    $(this).val(validatedValues);
                } else {
                    $(this).val('');
                }
            }
        });
    }
    else { // For Desktop use keycode approach to filter values

        // Look for fields to force data type input on
        // Numbers Only
        $('.numeric-only').keydown(function (e)
        {
            // Allow: backspace, delete, tab, escape, enter, period, hyphen, keypad
            if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190, 173, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105]) !== -1 ||
                // Allow: Ctrl+A, Command+A
                (e.keyCode == 65 && (e.ctrlKey === true || e.metaKey === true)) ||
                // Allow: home, end, left, right, down, up
                (e.keyCode >= 35 && e.keyCode <= 40)) {
                // let it happen, don't do anything
                return;
            }

            // Ensure that it is a number and stop the keypress
            if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                e.preventDefault();
            }
        });

        // Alpha Only
        $('.alpha-only').keydown(function (e)
        {
            // Allow: space, backspace, delete, tab, hyphen, hyphen, escape, enter and .
            if ($.inArray(e.keyCode, [189, 109, 32, 46, 8, 9, 27, 190, 173, 13, 109, 110, 222]) !== -1 ||
                // Allow: Ctrl+A, Command+A
                (e.keyCode == 65 && (e.ctrlKey === true || e.metaKey === true)) ||
                // Allow: home, end, left, right, down, up
                (e.keyCode >= 35 && e.keyCode <= 40)) {
                // let it happen, don't do anything
                return;
            }

            // Disallow Keypad numbers / characters
            if ($.inArray(e.keyCode, [96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 111, 106, 107, 110]) !== -1) {
                e.preventDefault();
                return false;
            }

            if (!new RegExp("^[a-zA-Z]+$").test(String.fromCharCode(!e.charCode ? e.which : e.charCode))) {
                e.preventDefault();
                return false;
            }
        });

        $('.alpha-numeric-only').keydown(function (e)
        {
            // Allow: space, backspace, delete, tab, escape, enter and .
            if ($.inArray(e.keyCode, [189, 32, 46, 8, 9, 27, 13, 110, 190, 173, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 222]) !== -1 ||
                // Allow: Ctrl+A, Command+A
                (e.keyCode == 65 && (e.ctrlKey === true || e.metaKey === true)) ||
                // Allow: home, end, left, right, down, up
                (e.keyCode >= 35 && e.keyCode <= 40)) {
                // let it happen, don't do anything
                return;
            }

            if (!new RegExp("^[a-zA-Z0-9]+$").test(String.fromCharCode(!e.charCode ? e.which : e.charCode))) {
                e.preventDefault();
                return false;
            }
        });
    }

    // Date fields
    $('.date-only').mask('00/00/0000').blur(function () {
        $(this).parents('form').formValidation('resetField', $(this).attr('name'));
    });

    // Zip code fields
    $('.zipcode-only').mask('00000').blur(function () {
        $(this).parents('form').formValidation('resetField', $(this).attr('name'));
    });

    // Phone Number fields
    $('.phone-only').mask('000-000-0000').blur(function () {
        $(this).parents('form').formValidation('resetField', $(this).attr('name'));
    });

    // Error icon positioning for select boxes
    $('#leadForm select').next('i').addClass('shiftErrorIcon');

    // Error icon positioning for input boxes
    $('#leadForm input').next('i').addClass('shiftInputErrorIcon');

    // mobile header button
    $('#openQuotebutton').click(function () {
        $('div.aig-mobile-formWrapper').css('display', 'none').removeClass('hidden-xs').show();
        $('div.form-panel').css('display', 'none').removeClass('hidden-xs').show();
        $('div.headerButton').hide();
    });

    // Form validation
    var ValidateForm = function () {
        _PageErrorList = { field: new Array(), Message: new Array() };
        $('#leadForm').data('formValidation').validate();
        return $('#leadForm').data('formValidation').isValid();
    }

    // load timing stats
    var objDate = new Date();
    var miliseconds = objDate.getTime();
    var initialLoadTimeInSecs = Math.round(miliseconds / 1000);

    //Submit Quote
    $('#submitBtn').click(function (e) {
        e.preventDefault();

        var pageValidationFlag = false;

        // validate page
        pageValidationFlag = ValidateForm();

        // see if we passed validation before trying to move on
        if (pageValidationFlag) {
            // update next button to show loading
            $(this).button('loading');
            $("body").prepend("<div class='overlay'></div>");

            var clientHeight = $("#Height").val().split("-");

            //Object to post
            var postData = {};
            postData.Premium = $("#CoverageAmount").val();
            postData.Tobacco = $("#Tobacco").val();
            postData.DateOfBirth = $("#BirthDate").val();
            postData.Gender = $("#Gender").val();
            postData.HeightFeet = clientHeight[0];
            postData.HeightInches = clientHeight[1];
            postData.Weight = $("#Weight").val();
            postData.ZipCode = $("#ZipCode").val();
            postData.FirstName = $("#FirstName").val();
            postData.LastName = $("#LastName").val();
            postData.PhoneOne = $("#PrimaryPhone").val().replace(/-/g, "");
            postData.PhoneTwo = $("#SecondaryPhone").val().replace(/-/g, "");
            postData.Email = $("#EmailAddress").val();
            postData.SubMarketerCode3 = $("#SubMktrCode").val();
            postData.TCPAOptIn = $("#TCPAOptIn").val();
            postData.SMSOptIn = $("#SMSOptIn").val();
            postData.AllowAfterHoursCall = $('#allowAfterHoursCalls').val();
            postData.AllowPhoneValidation = $('#allowPhoneValidation').val();
            postData.AllowEmailValidation = $('#allowEmailValidation').val();
            postData.AllowNotifyCallingStatus = $('#allowNotifyCallingStatus').val();

            // timing stats
            var submitDate = new Date();
            var formSubmitTime = submitDate.getTime();
            var formSubmitTimeInSecs = Math.round(formSubmitTime / 1000);
            postData.TimeTakenToSubmit = parseInt(formSubmitTimeInSecs) - parseInt(initialLoadTimeInSecs);

            // make ajax call to post data
            $.ajax({
                type: "POST",
                url: "/lead/submit",
                data: JSON.stringify(postData),
                cache: false,
                processData: false,
                dataType: "json",
                contentType: 'application/json; charset=utf-8',
                success: function (response) {
                    if (response.success === true) {
                        var invalidPhone = false;
                        var invalidEmail = false;

                        var validator = $('#leadForm').data('formValidation');

                        if (response.code == 3) {

                            document.getElementById("leadForm").reset();
                            SubmitConsentPostForm("/" + $("#tyPage").val(), response.leadId, postData.PhoneOne, postData.PhoneTwo, $('#allowNotifyCallingStatus').val() == 'true');
                        }

                        if (response.code == 5 || response.code == 6 || response.code == 7 || response.code == 9 || response.code == 10 || response.code == 11) {
                            invalidPhone = true;

                            // phone number highlight with message to fix it
                            if (response.code == 5 || response.code == 10) {
                                validator.updateStatus("PrimaryPhone", 'INVALID', 'phone');
                            }

                            if (response.code == 6 || response.code == 11) {
                                validator.updateStatus("SecondaryPhone", 'INVALID', 'phone');
                            }

                            if (response.code == 7 || response.code == 9) {
                                validator.updateStatus("PrimaryPhone", 'INVALID', 'phone');
                                validator.updateStatus("SecondaryPhone", 'INVALID', 'phone');
                            }
                        }

                        if (response.code == 8 || response.code == 9 || response.code == 10 || response.code == 11) {
                            invalidEmail = true;
                            validator.updateStatus("EmailAddress", 'INVALID', 'emailaddress');
                        }

                        if (response.code >= 8 && response.code <= 11) {
                            $('#allowEmailValidation').val('false')
                        }

                        //Show BootBox modal for Phone/Email validation errors
                        if (invalidPhone && invalidEmail) {
                            bootbox.dialog({
                                title: '<i class="icon-warning-sign bigger-120"></i>&nbsp;&nbsp;Invalid Contact Information',
                                message: 'Sorry we are not able to confirm that the phone and email information you entered are active. Please check the information you entered and try again.',
                                closeButton: false,
                                className: "my-modal",
                                buttons: {
                                    main: {
                                        label: "Ok",
                                        className: "btn-primary btn-lg"
                                    }
                                }
                            });
                        }
                        else if (invalidPhone) {
                            bootbox.dialog({
                                title: '<i class="icon-warning-sign bigger-120"></i>&nbsp;&nbsp;Invalid Phone Number',
                                message: 'Sorry we are not able to confirm that this is an active phone number. Please check the number you entered and try again.',
                                closeButton: false,
                                className: "my-modal",
                                buttons: {
                                    main: {
                                        label: "Ok",
                                        className: "btn-primary btn-lg"
                                    }
                                }
                            });
                        }
                        else if (invalidEmail) {
                            bootbox.dialog({
                                title: '<i class="icon-warning-sign bigger-120"></i>&nbsp;&nbsp;Invalid Email',
                                message: 'Sorry we are not able to confirm that this is an active email address. Please check the email address you entered and try again.',
                                closeButton: false,
                                className: "my-modal",
                                buttons: {
                                    main: {
                                        label: "Ok",
                                        className: "btn-primary btn-lg"
                                    }
                                }
                            });
                        }
                        if (invalidPhone || invalidEmail) {
                            RemoveOverlayAndResetButton();
                        }

                        if (response.code == 4) {
                            document.getElementById("leadForm").reset();
                            SubmitLeadForm("/" + $("#tyPage").val(), response.leadId, false);
                        }

                        if (response.code === undefined) {
                            if ($('#allowNotifyCallingStatus').val() == 'true') {
                                SubmitLeadForm("/" + $("#tyPage").val(), response.leadId, true);
                            } else {
                                SubmitLeadForm("/" + $("#tyPage").val(), response.leadId, false);
                            }
                        }
                    } else {
                        RemoveOverlayAndResetButton();
                        var errors = response.messages;
                        for (var i in errors) {
                        }
                    }
                },
                error: function (response) {
                    RemoveOverlayAndResetButton();
                }
            });
        }
        else {
            RemoveOverlayAndResetButton();
        }
    });

    function SubmitConsentPostForm(action, leadId, phoneOne, phoneTwo, status) {
        var statusFlag = '';
        if (status) {
            statusFlag = '<input type="hidden" id="status" name="status" value="y" />';
        }
        $('#consentData').remove();
        $('body').append('<form id="consentData" action="' + action + '" method="post">' + statusFlag + '<input type="hidden" id="consent" name="consent" value="y" /><input type="hidden" id="leadId" name="leadId" value="' + leadId + '" /><input type="hidden" id="phoneOne" name="phoneOne" value="' + phoneOne + '" /><input type="hidden" id="phoneTwo" name="phoneTwo" value="' + phoneTwo + '" /></form>');
        $('#consentData').submit();
    }

    function SubmitLeadForm(action, leadId, status) {
        var statusFlag = '';
        if (status) {
            statusFlag = '<input type="hidden" id="status" name="status" value="y" />';
        }
        $('#leadDataForm').remove();
        $('body').append('<form id="leadDataForm" action="' + action + '" method="post">' + statusFlag + '<input type="hidden" id="leadId" name="leadId" value="' + leadId + '" /></form>');
        $('#leadDataForm').submit();
    }

    function RemoveOverlayAndResetButton() {
        $('.overlay').remove();
        $('.next-load-glyph').addClass('hide');
        $('#submitBtn').removeClass("disabled");
        $('#submitBtn').removeAttr('disabled');
        $('#submitBtn').button('reset');
    }

    $("#leadForm input, #leadForm select").bind('keydown', function (e) {
        if (e.which == 13) {
            $(this).blur();
            e.preventDefault();
            $("#submitBtn").click();
        }
    });

});
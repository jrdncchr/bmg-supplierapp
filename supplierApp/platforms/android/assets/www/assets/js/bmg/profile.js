function setupProfile() {
    $('body').scrollTop(0);
    readProfile();
    setupProfileUserDetails();
    activateChangePassword();
    activateInputChecking();

    try {
        pictureSource = navigator.camera.PictureSourceType;
        destinationType = navigator.camera.DestinationType;
    } catch (e) {
        alert("This error occured because you are viewing this on a browser.");
    }
}

function activateChangePassword() {
    $('#change-password-btn').click(function () {
        if ($('#profile-old-password').val().length > 0) {
            $("#profile-old-password").parents('.bmg-input-div').find('.profile-input-check').html("");
            if ($('#profile-new-password').val().length > 4) {
                $("#profile-new-password").parents('.bmg-input-div').find('.profile-input-check').html("");
                if ($('#profile-new-password').val() === $('#profile-confirm-password').val()) {
                    $("#profile-confirm-password").parents('.bmg-input-div').find('.profile-input-check').html("");
                    var api_key = localStorage.getItem('api_key');
                    change_password(api_key, $('#profile-old-password').val(), $('#profile-new-password').val(), function () {
                        $('#profile-old-password').val("");
                        $('#profile-new-password').val("");
                        $('#profile-confirm-password').val("");
                    });
                } else {
                    $("#profile-confirm-password").parents('.bmg-input-div').find('.profile-input-check').html("<i class='fa fa-times text-danger'></i>");
                }
            } else {
                $("#profile-new-password").parents('.bmg-input-div').find('.profile-input-check').html("<i class='fa fa-times text-danger'></i>");
            }
        } else {
            $("#profile-old-password").parents('.bmg-input-div').find('.profile-input-check').html("<i class='fa fa-times text-danger'></i>");
        }

    });
}

function setupProfileUserDetails() {
    $('#profile-top-picture').css({'background-image': "url('" + profile.photo + "')"});
    $('#profile-top-name').html(profile.first_name + " " + profile.last_name);
    //Basic
    $('#profile-firstname').val(profile.first_name);
    $('#profile-lastname').val(profile.last_name);
    $('#profile-gender').val(profile.gender);
    $('#profile-title').val(profile.title);
    $('#profile-dob').val(profile.dob);
    //Contact
    $('#profile-phonecode').val(profile.phone_code);
    $('#profile-phone').val(profile.phone);
    $('#profile-email').val(profile.email);
    //Address
    $('#profile-address').val(profile.street_address);
    $('#profile-zipcode').val(profile.zip_code);
    $('#profile-city').val(profile.city);
    $('#profile-country').val(profile.country);
    //Booking Notification
    $('#profile-notification-phonecode').val(profile.phone_code);
    $('#profile-notification-phone').val(profile.phone);
//    setupUserDetails();
}

function activateInputChecking() {
    var view = $("#profile");
    if (profile.user_type !== "Individual") {
        view = $("#profile-licensed");
    }
    // All Input and Select Checking
    view.find('.bmg-input-div').each(function () {
        var check = false;
        $(this).find('.profile-input').each(function () {
            if (!$(this).val()) {
                check = false;
            } else {
                check = true;
            }
        });
        if (check) {
            $(this).find('.profile-input-check').html("<i class='fa fa-check text-success'></i>");
        } else {
            $(this).find('.profile-input-check').html("");
        }
    });
    $('.profile-input').change(function () {
        var check = true;
        $(this).parents('.bmg-input-div').find('.profile-input').each(function () {
            if (!$(this).val()) {
                check = false;
            }
        });
        if (check) {
            $(this).parents('.bmg-input-div').find('.profile-input-check').html("<i class='fa fa-check text-success'></i>");
        } else {
            $(this).parents('.bmg-input-div').find('.profile-input-check').html("");
        }
        // Saving...
        //missing are country, website
        var formData = new FormData();
        formData.append('first_name', $('#profile-firstname').val());
        formData.append('last_name', $('#profile-lastname').val());
        formData.append('title', $('#profile-title').val());
        formData.append('gender', $('#profile-gender').val());
        formData.append('dob', $('#profile-dob').val());
        formData.append('phone_code', $('#profile-phone-code').val());
        formData.append('phone', $('#profile-phone').val());
        formData.append('street_address', $('#profile-address').val());
        formData.append('zip_code', $('#profile-zipcode').val());
        formData.append('city', $('#profile-city').val());
        saveProfile(formData, "updateInfo");
    });
}

/* Upload Photo */

var pictureSource;   // picture source
var destinationType; // sets the format of returned value

function clearCache() {
    navigator.camera.cleanup();
}

var retries = 0;
function onCapturePhoto(fileURI) {
    var win = function (r) {
        clearCache();
        retries = 0;
        try {
            readProfile();
        } finally {
            setupProfileUserDetails();
        }
        show_success("Uploading profile image successful!");
        kendo.mobile.application.hideLoading();
//        alert("Code: " + r.responseCode + "\n Response: " + r.response + "\n Sent: " + r.bytesSent);
    };

    var fail = function (error) {
        clearCache();
        alert(error.target);
        alert('Ups. Something wrong happens!');
        kendo.mobile.application.hideLoading();
    };

    var options = new FileUploadOptions();
    options.fileKey = "photo";
    options.fileName = fileURI.substr(fileURI.lastIndexOf('/') + 1);
    options.mimeType = "image/jpeg";
    options.chunkedMode = false;
    options.params = {
        'api_key': localStorage.getItem('api_key'),
        'email': $('#profile-email').val()
    };
    alert(options.fileName);
    var ft = new FileTransfer();
    kendo.mobile.application.showLoading();
    $("#modal-upload").data("kendoMobileModalView").close();
    ft.upload(fileURI, encodeURI(api_url + "user/update_profile"), win, fail, options);
}

function getPhoto(option) {
    if (option === "capture") {
        navigator.camera.getPicture(onCapturePhoto, onFail, {
            quality: 100,
            destinationType: Camera.DestinationType.FILE_URI
        });
    } else if (option === "existing") {
        navigator.camera.getPicture(onCapturePhoto, onFail, {
            quality: 100,
            destinationType: Camera.DestinationType.FILE_URI,
            sourceType: Camera.PictureSourceType.PHOTOLIBRARY
        });
    }
}

function onFail(message) {
}
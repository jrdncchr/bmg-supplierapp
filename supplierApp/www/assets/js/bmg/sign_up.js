function initSignUp() {
    $("#sign-up-btn").click(function () {
        if (validateSignupFields()) {
            kendo.mobile.application.showLoading();
            var data = {
                first_name: $('#reg-firstname').val(),
                last_name: $('#reg-lastname').val(),
                email: $('#reg-email').val(),
                phone_code: $('#reg-phonecode').val(),
                phone: $('#reg-phone').val(),
                password: $('#reg-password').val(),
                user_type: $('#reg-user-type').val(),
                admin_action: "supplier",
                android_id: localStorage.getItem('regId')
            };
            signUp(data);
        }
    });

    $('#reg-user-type').change(function () {
        if ($(this).val() !== "") {
            $(this).parent().css('color', 'black');
        }
    });
}


function validateSignupFields() {
    if ($('#reg-firstname').val().length === 0) {
        show_error("First name cannot be empty.");
        return false;
    }
    if ($('#reg-lastname').val().length === 0) {
        show_error("Last name cannot be empty.");
        return false;
    }
    if (!validateEmail($('#reg-email').val())) {
        show_error("Invalid email address.");
        return false;
    }
    if (null === $('#reg-phonecode').val() || $('#reg-phonecode').val().length < 2) {
        show_error("Please select a phone code.");
        return false;
    }
    if (isNaN(parseInt($('#reg-phone').val()))) {
        show_error("Phone cannot be empty and must be a number.");
        return false;
    }
    if ($('#reg-password').val().length < 4) {
        show_error("Password must be atleast 4 characters.");
        return false;
    }
    if ($('#reg-password').val() !== $('#reg-confirm-password').val()) {
        show_error("Password did not match.");
        return false;
    }

    if (null === $('#reg-user-type').val() || $('#reg-user-type').val() === "") {
        show_error("Please select a type");
        return false;
    }
    
    if(null === localStorage.getItem('regId') || localStorage.getItem('regId') === "") {
        show_error("Android Google ID not found!");
        return false;
    }
    return true;
}

function clearSignupFields() {
    $('#signupForm').find(".reg-field").each(function () {
        $(this).val("");
    });
}

function validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}
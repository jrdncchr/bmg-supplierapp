document.addEventListener("deviceready", onDeviceReady, false);

$(document).ready(function () {
    $('#bmg-alert-okay').click(function () {
        $("#bmg-alert").kendoMobileModalView("close");
    });
    $("#logoutBtn").off('click').click(function () {
        logout();
    });
});

function onDeviceReady() {
    check();
}

function check() {
    kendo.mobile.application.showLoading();
    var api_key = localStorage.getItem('api_key');
    if (checkNetwork() === true) {
        if (api_key) {
            login(localStorage.getItem('email'), localStorage.getItem('password'), false);
        } else {
            kendo.mobile.application.hideLoading();
        }
    } else {
        kendo.mobile.application.hideLoading();
        $("#bmg-alert-message").html("You are not connected to the internet.");
        $("#bmg-alert").kendoMobileModalView("open");

    }

}

/*
 * Global Functions
 */

function validateEmail(email)
{
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
}

function show_error(error) {
    $('#bmg-alert-header').removeClass('text-success').addClass('text-danger').html("<small><strong>Alert</strong></small>");
    $("#bmg-alert-message").html(error);
    $("#bmg-alert").kendoMobileModalView("open");
    $('#bmg-alert-okay').removeClass("btn-success").addClass("btn-danger");
}

function show_success(message) {
    $('#bmg-alert-header').removeClass('text-danger').addClass('text-success').html("<small><strong>Success</strong></small>");
    $("#bmg-alert-message").html(message);
    $('#bmg-alert-okay').removeClass("btn-danger").addClass("btn-success");
    $("#bmg-alert").kendoMobileModalView("open");
}

function show_confirm(message, accept) {
    if (accept) {
        $('#bmg-confirm-header').removeClass().addClass('text-success').html("<small><strong>Confirmation</strong></small>");
        $('#bmg-confirm-okay').removeClass("btn-danger").addClass("btn-success");
    } else {
        $('#bmg-confirm-header').removeClass().addClass('text-danger').html("<small><strong>Confirmation</strong></small>");
        $('#bmg-confirm-okay').removeClass("btn-success").addClass("btn-danger");
    }
    $("#bmg-confirm-message").html(message);
    $('#bmg-confirm-cancel').off('click').click(function () {
        $("#bmg-confirm").kendoMobileModalView("close");
    });
    $("#bmg-confirm").kendoMobileModalView("open");
}

function checkNetwork() {
    var networkState = navigator.connection.type;
    var online = true;
    if (networkState === Connection.NONE) {
        online = false;
    }
    return online;
}

Storage.prototype.setObject = function (key, value) {
    this.setItem(key, JSON.stringify(value));
};

Storage.prototype.getObject = function (key) {
    var value = this.getItem(key);
    return value && JSON.parse(value);
};
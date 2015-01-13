function setupBookings() {
    // refresh view
    jQuery('html,body').animate({scrollTop: 0}, 0);
    $('.topnav2 td').removeClass('topnav-active');
    $('#bookings-new').addClass('topnav-active');

    //get bookings, new bookings by default
    getBookings('all', "get_new_bookings", "new");
    localStorage.setItem('booking_status', 'new');
    activateBookingsEvents();
}

function activateBookingsEvents() {
    var method = "get_new_bookings";
    var booking_status = "new";
    // when a booking category is clicked, fetches again in server
    $('.bookings-nav td').off('click').click(function () {
        booking_status = $(this).attr('id').split('-')[1];
        localStorage.setItem('booking_status', booking_status);
        if (booking_status === "new") {
            method = "get_new_bookings";
        } else if (booking_status === "confirmed") {
            method = "get_confirmed_bookings";
        } else if (booking_status === "past") {
            method = "get_past_bookings";
        }
        $('.topnav2 td').removeClass('topnav-active');
        $(this).addClass('topnav-active');
        getBookings('all', method, booking_status);
    });
}

function showEmptyBookings() {
    $('#bookings-list').hide();
    $('#bookings-view-all-div').hide();
    $('#bookings-empty').show();
}

function setupBookingDetails() {
    jQuery('html,body').animate({scrollTop: 0}, 0);
    $(".booking-hidden").hide();
    if (booking.status_label === "Waiting" && booking.status !== "approved") {
        $('#booking-when').html("Expires in " + booking.when);
        $('#booking-status-message').html("You have not accepted/rejected this booking yet");
        $('#booking-reuqest-div').show();
        $("#bmg-status-div").show();
    } else if (booking.status_label === "Approved" || booking.status === "approved") {
        $('#booking-when').html("Starts " + booking.when);
        $('#booking-status-message').html("");
        $("#bmg-status-div").hide();
        $('#booking-guest-phone').html("+" + booking.guest_phone);
        $("#booking-guest-phone").attr("href", "tel:+" + booking.guest_phone);
        $("#booking-guest-call").attr("href", "tel:+" + booking.guest_phone);
        $("#booking-guest-message").attr("href", "sms:+" + booking.guest_phone);
        $('#booking-contact-div').show();
    } else if (booking.status_label === "Completed") {
        $('#booking-when').html("Completed " + booking.when);
        $('#booking-status-message').html("The booking request has been completed");
        $('#booking-completed-div').show();
        $("#bmg-status-div").show();
    } else if (booking.status_label === "Rejected" || booking.status_label === "rejected") {
        $('#booking-when').html("Rejected " + booking.when);
        $('#booking-status-message').html("The rejected this booking request");
        $('#booking-rejected-div').show();
        $("#bmg-status-div").show();
    } else if (booking.status_label === "Expired") {
        $('#booking-when').html("Expired " + booking.when);
        $('#booking-status-message').html("The booking request has expired");
        $('#booking-expired-div').show();
        $("#bmg-status-div").show();
    }
    $('#booking-image').css({'background-image': "url(" + booking.booking_image['680x325'] + ")"});

    $('#booking-code').html("[# " + booking.listingFK + "] ");
    $('#booking-title').html(booking.listing_title);
    $('#booking-guest-name').html(booking.guest_first_name + " " + booking.guest_last_name);
    $('#booking-requested-date').html(booking.arrival_date);
    $('#booking-adult-count').html(booking.number_of_guests);
    $('#booking-adult-price').html(booking.host_revenue_adult_price_total.toString().replace(/\d+/g, '') + " " + booking.host_revenue_adult_price_total.toString().replace(/^\D+/g, ''));
    $('#booking-children-count').html(booking.number_of_kids);
    $('#booking-children-price').html(booking.host_revenue_child_price_total.toString().replace(/\d+/g, '') + " " + booking.host_revenue_child_price_total.toString().replace(/^\D+/g, ''));
    $('#booking-security-deposit').html(booking.security_deposit);
    if (parseInt(booking.security_deposit) > 0) {
        $('#bmg-security-deposit-div').show();
    } else {
        $('#bmg-security-deposit-div').fadeOut();
    }
    if (booking.hasAccommodation === "no" || booking.hasAccommodation === "") {
        $('#bmg-accomodation-div').fadeOut();
        $('#booking-accommodation').html("");
    } else {
        $('#bmg-accomodation-div').show();
        $('#booking-accommodation').html(booking.accommodation_name);
    }
    var optional_activities = "";
    for (var i = 0; i < booking.addons.length; i++) {
        optional_activities += booking.addons[i] + ", ";
    }
    if (optional_activities !== "") {
        optional_activities = optional_activities.substring(0, optional_activities.length - 2);
        $('#booking-optional-activity').html(optional_activities);
        $('#booking-optional-activity-div').show();
    } else {
        $('#booking-optional-activity-div').hide();
    }
    $('#booking-revenue').html(booking.host_revenue.toString().replace(/\d+/g, '') + " " + booking.host_revenue.toString().replace(/^\D+/g, ''));
    if (booking.meeting_point !== "") {
        $('#booking-meetup-point').html(booking.meeting_point);
        $('#booking-meetup-point-div').show();
    } else {
        $('#booking-meetup-point-div').hide();
    }
    if (booking.additional_info) {
        $('#booking-additional-notes').html(booking.additional_info);
        $('#booking-additional-notes-div').show();
    } else {
        $('#booking-additional-notes-div').hide();
    }

    $('#booking-request-id').html(booking.bookingID);
    if (booking.message_to_host) {
        $('#booking-message-from-guest').html(booking.message_to_host);
        $("#booking-message-from-guest-div").show();
    } else {
        $("#booking-message-from-guest-div").hide();
    }
    activateBookingDetailsEvents();

    kendo.mobile.application.hideLoading();
}

function activateBookingDetailsEvents() {
    $('.booking-accept').off('click').click(function () {
        var ok = confirm("Confirm accept booking request.");
        if (ok) {
            approveBooking(function () {
                getBookingDetails(selectedBookingId, "confirmed", function () {
                    setupBookingDetails();
                    show_success("You have accepted the booking.");
                });
            });
        }
    });
    $('.booking-reject').off('click').click(function () {
        var ok = confirm("Confirm reject booking request");
        if (ok) {
            rejectBooking(function () {
                getBookingDetails(selectedBookingId, "past", function () {
                    setupBookingDetails();
                    show_success("You have rejected the booking.");
                });
            });
        }
    });
}
// initialize the dashboard view
function setupDashboard(e) {
    $("#main-overflow-btn").off('click').click(function() {
        $("#main-overflow").toggle();
    });

    /*
     * Profile Setup
     */
    readProfile();

    /*
     * Upcomming Bookings
     */
    getUpcomingBookings();

    /*
     * Notification Setup and Streaming
     */
    setupNotification();
}

// resets the nav overflow
function hideDashboard() {
    $("#main-overflow").hide();
}

//setup user details in the drawer
function setupUserDetails() {
    profile = localStorage.getObject('profile');
    $("#drawer-full-name").html(profile.first_name + " " + profile.last_name);
    $('#drawer-profile-picture').css({'background-image': 'url(' + profile.photo + ')'});

    //setup profile link depending on the the user type
    if (profile.user_type === "Individual") {
        $('.main-drawer-profile').attr('href', "#public_html/profile.html");
    } else {
        $('.main-drawer-profile').attr('href', "#public_html/profile_licensed.html");
    }
}

// checks the server for new notifications
function setupNotification() {
    var notification = {};
    getNewBookingsCount(function(n) {
        notification.bookings = n ? n : 0;
        getNewReviewsCount(function(n) {
            notification.reviews = n ? n : 0;
            //display
            displayNotification(notification);
            localStorage.setObject('notification', notification);
        });
    });
}

// display the notifcation below the screen
function displayNotification(n) {
    // check bookings notification
    var bookings = false;
    if (parseInt(n.bookings) > 0) {
        $("#new-bookings-count").html("You have " + n.bookings + " new booking request");
        $('#notification-bookings').show();
        // click event for the notification
        $('#notification-bookings').off('click').click(function() {
            app.navigate("#public_html/bookings.html");
        });
        bookings = true;
    } else {
        $('#notification-bookings').hide();
    }

    // check reviews notification
    var reviews = false;
    if (parseInt(n.reviews) > 0) {
        $("#new-reviews-count").html("You have " + n.reviews + " new review(s)");
        $('#notification-reviews').show();
        // click event for the notification
        $('#notification-reviews').off('click').click(function() {
            app.navigate("#public_html/reviews.html");
        });
        reviews = true;
    } else {
        $('#notification-reviews').hide('fast');
    }

    if (reviews || bookings) {
        $('#notifications-div').slideDown('fast');
    } else {
        $('#notifications-div').slideUp('fast');
    }

    kendo.mobile.application.hideLoading();
}
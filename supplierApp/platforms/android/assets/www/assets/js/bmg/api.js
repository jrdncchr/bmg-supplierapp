// Global Variable
var profile, activity, review, booking;

/* ========================================================= 
 MAIN / DASHBOARD
 =========================================================== */
function user_login(email, password) {
    kendo.mobile.application.showLoading();
    $.ajax({
        url: api_url + "user/login",
        type: 'POST',
        data: {e: email, p: password},
        dataType: 'json',
        success: function (data) {
            if (data.api_key) {
                localStorage.setItem('api_key', data.api_key);
                localStorage.setItem('email', email);
                localStorage.setItem('password', password);
                clearLogin();
                app.navigate("#public_html/dashboard.html");
            } else {
                kendo.mobile.application.hideLoading();
                show_error(data.error);
                return false;
            }
        },
        error: function (error) {
            var jsonError = JSON.parse(error['responseText']);
            show_error(jsonError.error);
            kendo.mobile.application.hideLoading();
        }
    });
}

function change_password(api_key, old_password, new_password, callback) {
    $.ajax({
        url: api_url + "user/change_password",
        data: {api_key: api_key, old_password: old_password, new_password: new_password},
        type: 'post',
        dataType: 'json',
        success: function (data) {
            if (data.error) {
                show_error(data.error);
            } else {
                show_success("Changing Password Successful");
            }
            callback();
        },
        error: function (error) {
            var jsonError = JSON.parse(error['responseText']);
            show_error(jsonError.error);
            kendo.mobile.application.hideLoading();
        }
    });
}

function logout() {
    var api_key = localStorage.getItem('api_key');
    kendo.mobile.application.showLoading();
    $.ajax({
        url: api_url + "user/logout",
        type: 'POST',
        data: {api_key: api_key},
        success: function (data) {
            if (data.error) {
                alert(data.error);
                kendo.mobile.application.hideLoading();
            } else {
                $('#upcoming-bookings-empty').fadeOut('fast');
                $('#upcoming-bookings').fadeOut('fast');
                $('#upcoming-booking-view-all').fadeOut('fast');
                localStorage.clear();
                kendo.mobile.application.hideLoading();
                app.navigate("#");
            }
        },
        error: function (error) {
            var jsonError = JSON.parse(error['responseText']);
            alert(jsonError.error);
            kendo.mobile.application.hideLoading();
        }
    });
}

function retrieve_password(e) {
    kendo.mobile.application.showLoading();
    $.ajax({
        url: api_url + "user/retrieve_password",
        type: 'POST',
        data: {e: e},
        success: function (data) {
            if (data.error) {
                alert(data.error);
                kendo.mobile.application.hideLoading();
            } else {
                $("#fwEmailError").html("Retrieving password successful!");
            }
            kendo.mobile.application.hideLoading();
        },
        error: function (error) {
            var jsonError = JSON.parse(error['responseText']);
            $("#fwEmailError").html(jsonError.error);
            kendo.mobile.application.hideLoading();
        }
    });
}

function signUp(data) {
    $.ajax({
        url: api_url + "user/create_user",
        data: data,
        type: 'post',
        success: function (data) {
            if (data.error) {
                alert(data.error);
                kendo.mobile.application.hideLoading();
            } else {
                localStorage.setItem("api_key", data.api_key);
                clearSignupFields();
                app.navigate("#public_html/profile.html");
                kendo.mobile.application.hideLoading();
            }
        },
        error: function (error) {
            console.log(JSON.stringify(error));
            var jsonError = JSON.parse(error['responseText']);
            alert(jsonError.error);
            kendo.mobile.application.hideLoading();
        }
    });
}

/* ========================================================= 
 PROFILES
 =========================================================== */
var android_checked = false;
function readProfile() {
    var api_key = localStorage.getItem('api_key');
    kendo.mobile.application.showLoading();
    $.ajax({
        url: api_url + "user/read_profile",
        type: 'GET',
        data: {api_key: api_key},
        dataType: 'json',
        async: false,
        success: function (data) {
            if (data.error) {
                alert(data.error);
                kendo.mobile.application.hideLoading();
            } else {
                profile = data;
                localStorage.setObject('profile', profile);
                setupUserDetails();

                //check android if set
                if (android_checked === false) {
                    if (!profile.android_id) {
                        var formData = new FormData();
                        formData.append('android_id', localStorage.getItem('regId'));
                        saveProfile(formData, "updateAndroid");
                    } else {
                        var android_id = localStorage.getItem('regId');
                        if (android_id !== profile.android_id) {
                            var confirmation = confirm("You are using a different device, do you want to set this as your default?");
                            if (confirmation) {
                                var formData = new FormData();
                                formData.append('android_id', localStorage.getItem('regId'));
                                saveProfile(formData, "updateAndroid");
                            }
                        }
                    }
                    android_checked = true;
                }
                kendo.mobile.application.hideLoading();
            }
        },
        error: function (error) {
            var jsonError = JSON.parse(error['responseText']);
            alert(jsonError.error);
            kendo.mobile.application.hideLoading();
        }
    });
}

function saveProfile(data, action) {
    data.append('api_key', localStorage.getItem('api_key'));
    var email = $('#profile-email').val() ? $('#profile-email').val() : profile.email;
    data.append('email', email);
    $.ajax({
        url: api_url + "user/update_profile",
        data: data,
        type: 'POST',
        cache: false,
        contentType: false,
        processData: false,
        dataType: 'json',
        success: function (data) {
            if (data.error) {
                alert(data.error);
            } else {
                if (action === "updatePhoto") {
                    readProfile();
                    setupProfileUserDetails();
                    $('#profile-edit-pic-check').attr('src', 'assets/img/profile/checkmark_icon.png');
                }
            }
        },
        error: function (error) {
            var jsonError = JSON.parse(error['responseText']);
            alert(jsonError.error);
            kendo.mobile.application.hideLoading();
        }
    });
}

/* ========================================================= 
 ACTIVITIES
 =========================================================== */
function getActivities(n, status) {
    var api_key = localStorage.getItem('api_key');
    kendo.mobile.application.showLoading();
    $.ajax({
        url: api_url + "activities/my_activities",
        data: {api_key: api_key},
        type: 'GET',
        dataType: 'json',
        success: function (data) {
            if (data.error) {
                $('#activities-empty').show();
                $('#activities-view-all-div').hide();
                kendo.mobile.application.hideLoading();
            } else {
                var list = new Array();
                for (key in data) {
                    if (status === "pending") {
                        if (data[key].status === "pending approval" || data[key].status === "draft") {
                            list.push(data[key]);
                        }
                    } else {
                        if (data[key].status === status) {
                            list.push(data[key]);
                        }
                    }

                }
                if (n === 'all') {
                    n = list.length;
                }
                var template;
                if (status === "active") {
                    template = kendo.template($("#activities-template").html());
                } else {
                    template = kendo.template($("#activities-template-inactive").html());
                }
                var dataSource = new kendo.data.DataSource({
                    data: list,
                    pageSize: n,
                    change: function () {
                        $("#activities-list").html(kendo.render(template, this.view()));
                    }
                });
                dataSource.read();
                $('#activities-empty').hide();
                if (list.length === 0) {
                    $("#activities-empty").fadeIn('fast');
                }
                $('.activity').off('click').click(function () {
                    var id = $(this).attr('data-id');
                    localStorage.setItem('activity_id', id);
                    getActivityDetails(id);
                });
                $('.leave_review').off('click').click(function () {
                    var id = $(this).attr('data-id');
                    localStorage.setItem('listing_id', id);
                    getActivityDetails(id, function () {
                        app.navigate("#public_html/reviews_leave_review.html");
                    });
                });
            }
            kendo.mobile.application.hideLoading();
        },
        error: function (error) {
            $('#activities-empty').show();
            $('#activities-view-all-div').hide();
            kendo.mobile.application.hideLoading();
        }
    });
}

function getActivityDetails(id, callback) {
    var api_key = localStorage.getItem('api_key');
    kendo.mobile.application.showLoading();
    $.ajax({
        url: api_url + "activities/get_activity_details",
        data: {api_key: api_key, activity_id: id},
        type: 'GET',
        dataType: 'json',
        success: function (data) {
            kendo.mobile.application.hideLoading();
            if (data.error) {
                alert(data.error);
            } else {
                activity = data;
                if (callback) {
                    callback();
                } else {
                    app.navigate("#public_html/activities_detailed.html");
                }
            }
        }
        ,
        error: function (error) {
            var jsonError = JSON.parse(error['responseText']);
            alert(jsonError.error);
            kendo.mobile.application.hideLoading();
        }
    });
}

function getActivitiesList(cb) {
    var api_key = localStorage.getItem('api_key');
    kendo.mobile.application.showLoading();
    $.ajax({
        url: api_url + "activities/my_activities",
        data: {api_key: api_key},
        type: 'GET',
        dataType: 'json',
        success: function (data) {
            if (data.error) {
                kendo.mobile.application.hideLoading();
            } else {
                var list = new Array();
                for (key in data) {
                    if (data[key].status !== "pending approval" || data[key].status !== "draft") {
                        list.push(data[key]);
                    }
                }
                kendo.mobile.application.hideLoading();
                activityList = list;
                cb();
            }
        },
        error: function (error) {
            var jsonError = JSON.parse(error['responseText']);
            alert(jsonError.error);
            kendo.mobile.application.hideLoading();
        }
    });
}

function getActivityReviews(id) {
    var api_key = localStorage.getItem('api_key');
    kendo.mobile.application.showLoading();
    $.ajax({
        url: api_url + "activities/get_activity_reviews",
        data: {api_key: api_key, activity_id: id},
        type: 'GET',
        dataType: 'json',
        success: function (data) {
            kendo.mobile.application.hideLoading();
            if (data.error) {
                alert(data.error);
            } else {
                review = data;
                app.navigate("#public_html/reviews_detailed.html");
            }
        },
        error: function (error) {
            var jsonError = JSON.parse(error['responseText']);
            alert(jsonError.error);
            kendo.mobile.application.hideLoading();
        }
    });
}

function delete_activity() {
    var api_key = localStorage.getItem('api_key');
    var id = localStorage.getItem('activity_id');
    kendo.mobile.application.showLoading();
    $.ajax({
        url: api_url + "activities/delete_activity",
        data: {api_key: api_key, activity_id: id},
        type: 'POST',
        dataType: 'json',
        success: function (data) {
            if (data.error) {
                alert(data.error);
            } else {
                app.navigate("#public_html/activities.html");
            }
        },
        error: function (error) {
            var jsonError = JSON.parse(error['responseText']);
            alert(jsonError.error);
            kendo.mobile.application.hideLoading();
        }
    });
}

/* ========================================================= 
 REVIEWS
 =========================================================== */
function getReviews() {
    newReviews = new Array();
    allReviews = new Array();

    var api_key = localStorage.getItem('api_key');
    kendo.mobile.application.showLoading();
    $.ajax({
        url: api_url + "reviews/get_reviews",
        data: {api_key: api_key},
        type: "GET",
        dataType: "json",
        success: function (data) {
            if (data.error) {
                $('#reviews-empty').show();
                kendo.mobile.application.hideLoading();
            } else {
                for (key in data) {
                    if (parseInt(data[key].is_new)) {
                        newReviews.push(data[key]);
                        allReviews.push(data[key]);
                    } else {
                        allReviews.push(data[key]);
                    }
                }
                if (newReviews.length > 0) {
                    $('#activity-new-count').html(newReviews.length);
                    $("#reviews-empty").hide();
                } else {
                    $('#activity-new-count').html("");
                    $("#reviews-empty").show();
                }

                var template = kendo.template($("#reviews-template").html());
                if (reviewCategory === "new") {
                    list = newReviews;
                } else {
                    list = allReviews;
                    $("#reviews-empty").hide();
                }
                var dataSource = new kendo.data.DataSource({
                    data: list,
                    change: function () {
                        $("#reviews-list").html(kendo.render(template, this.view()));
                    }
                });
                dataSource.read();
//                $('.review-text-2').css('width', $(window).width() - 180);
                $('.review').off('click').click(function () {
                    var id = $(this).attr('data-id');
                    getReviewDetails(id);
                });

                kendo.mobile.application.hideLoading();
            }
        },
        error: function (error) {
            $('#reviews-empty').show();
            kendo.mobile.application.hideLoading();

        }
    });
}

function getReviewDetails(id) {
    var api_key = localStorage.getItem('api_key');
    kendo.mobile.application.showLoading();
    $.ajax({
        url: api_url + "reviews/get_review_details",
        data: {api_key: api_key, review_id: id},
        type: 'GET',
        dataType: 'json',
        success: function (data) {
            kendo.mobile.application.hideLoading();
            if (data.error) {
                alert(data.error);
            } else {
                review = data;
                app.navigate("#public_html/reviews_detailed.html");
                getActivityDetails(review.activity_code.substring(1), function () {
                    localStorage.setItem('listing_id', review.activity_code.substring(1));
                });
            }
        },
        error: function (error) {
            var jsonError = JSON.parse(error['responseText']);
            alert(jsonError.error);
            kendo.mobile.application.hideLoading();
        }
    });
}

function updateReviewAsSeen(id, listing_id) {
    $.ajax({
        url: api_url + "reviews/update_review_as_seen",
        data: {review_id: id, listing_id: listing_id},
        type: "POST",
        dataType: 'json',
        success: function (data) {
            if (data.error) {
                alert(data.error);
            }
        }
    });
}

function getNewReviewsCount(callback) {
    var api_key = localStorage.getItem('api_key');
    kendo.mobile.application.showLoading();
    $.ajax({
        url: api_url + "reviews/get_reviews",
        data: {api_key: api_key},
        type: "GET",
        dataType: "json",
        success: function (data) {
            var n = 0;
            if (!data.error) {
                var list = new Array();
                for (key in data) {
                    if (parseInt(data[key].is_new)) {
                        list.push(data[key]);
                    }
                }
                n = list.length;
            }
            return callback(n);
        },
        error: function (error) {
            return callback(0);
        }
    });
}

function sendEmailReview(emails) {
    var listing_id = localStorage.getItem('listing_id');
    var supplier_name = profile.first_name + " " + profile.last_name;
    kendo.mobile.application.showLoading();
    $.ajax({
        url: api_url + "reviews/send_ask_review",
        data: {listing_id: listing_id, supplier_name: supplier_name, emails: emails},
        type: "POST",
        dataType: 'json',
        success: function (data) {
            if (data.error) {
                alert(data.error);
            } else {
                app.navigate("#public_html/reviews_leave_review.html");
                show_success("Asking for review successful!");
            }
            kendo.mobile.application.hideLoading();
        },
        error: function (error) {
            var jsonError = JSON.parse(error['responseText']);
            alert(jsonError.error);
            kendo.mobile.application.hideLoading();
        }
    });
}

/* ========================================================= 
 BOOKINGS
 =========================================================== */
function getUpcomingBookings(n) {
    var api_key = localStorage.getItem('api_key');
    $.ajax({
        url: api_url + "bookings/get_upcoming_bookings",
        data: {api_key: api_key},
        type: 'GET',
        dataType: 'json',
        success: function (data) {
            if (data.error) {
                $('#upcoming-bookings-empty').fadeIn('fast');
                $('#upcoming-booking-view-all').fadeOut('fast');
                kendo.mobile.application.hideLoading();
            } else {
                var list = new Array();
                for (key in data) {
                    list.push(data[key]);
                }
                localStorage.setObject('upcomingBookings', list);
                var template = kendo.template($("#upcoming-booking-template").html());
                var dataSource = new kendo.data.DataSource({
                    data: list,
                    pageSize: n,
                    change: function () {
                        $("#upcoming-bookings").html(kendo.render(template, this.view()));
                    }
                });
                dataSource.read();
                $('#upcoming-bookings').fadeIn('fast');
                $('#upcoming-bookings-empty').fadeOut('fast');
                if (list.length > 4) {
                    $('#upcoming-booking-view-all').fadeIn('fast');
                } else {
                    $('#upcoming-booking-view-all').fadeOut('fast');
                }

                $('.booking').off('click').click(function () {
                    getBookingDetails($(this).attr('data-id'), 'confirmed');
                });
                kendo.mobile.application.hideLoading();
            }
        },
        error: function (error) {
            $('#upcoming-bookings-empty').fadeIn('fast');
            $('#upcoming-booking-view-all').fadeOut('fast');
            kendo.mobile.application.hideLoading();
        }
    });
}

function getNewBookingsCount(callback) {
    var api_key = localStorage.getItem('api_key');
    $.ajax({
        url: api_url + "bookings/get_new_bookings",
        data: {api_key: api_key},
        type: "GET",
        dataType: 'json',
        success: function (data) {
            var n = 0;
            if (!data.error) {
                var list = new Array();
                for (key in data) {
                    list.push(data[key]);
                }
                n = list.length;
            }
            return callback(n);
        },
        error: function (error) {
            return callback(0);
        }
    });
}
var selectedBookingId;
function getBookings(n, method, status) {
    kendo.mobile.application.showLoading();
    var api_key = localStorage.getItem('api_key');
    $.ajax({
        url: api_url + "bookings/" + method,
        data: {api_key: api_key},
        type: "GET",
        dataType: 'json',
        success: function (data) {
            if (data.error) {
                $('#bookings-empty-status').html("There is no " + status + " bookings request.");
                if (status === "confirmed") {
                    $('#bookings-empty-status').html("You have no confirmed upcoming bookings.");
                }
                showEmptyBookings();
                kendo.mobile.application.hideLoading();
            } else {
                $('#bookings-view-all-status').html(status);
                var list = new Array();
                for (key in data) {
                    data[key].host_revenue = data[key].host_revenue.toString().replace(/\d+/g, '') + " " + data[key].host_revenue.toString().replace(/^\D+/g, '');
                    list.push(data[key]);
                }
                if (method === "get_new_bookings") {
                    if (list.length > 0) {
                        $('#bookings-new-count').html(list.length);
                    } else {
                        $('#bookings-new-count').html("");
                    }
                }
                var template = kendo.template($("#booking-template-new").html());
                if (status === "confirmed") {
                    template = kendo.template($("#booking-template-confirmed").html());
                } else if (status === "past") {
                    template = kendo.template($("#booking-template-past").html());
                }
                list.reverse();
                var dataSource = new kendo.data.DataSource({
                    data: list,
                    pageSize: list.length,
                    change: function () {
                        $("#bookings-list").html(kendo.render(template, this.view()));
                    }
                });
                dataSource.read();
                if (list.length > 0) {
                    $('#bookings-list').fadeIn('fast');
                    $('#bookings-empty').fadeOut('fast');
                } else {
                    $("#bookings-empty").fadeIn('fast');
                    $('#bookings-list').fadeOut('fast');
                }
                $('.booking').off('click').click(function () {
                    selectedBookingId = $(this).attr('data-id');
                    getBookingDetails(selectedBookingId, "", null);
                });
                kendo.mobile.application.hideLoading();
            }
        },
        error: function (error) {
            $('#bookings-empty-status').html("There is no " + status + " bookings request.");
            if (status === "confirmed") {
                $('#bookings-empty-status').html("You have no confirmed upcoming bookings.");
            }
            showEmptyBookings();
            kendo.mobile.application.hideLoading();
        }
    });
}

function getBookingDetails(id, status, cb) {
    kendo.mobile.application.showLoading();
    var api_key = localStorage.getItem('api_key');
    if (status === "") {
        status = localStorage.getItem('booking_status');
    }
    $.ajax({
        url: api_url + "bookings/get_booking_details",
        data: {api_key: api_key, booking_id: id, type: status},
        type: "GET",
        dataType: 'json',
        success: function (data) {
            if (data.error) {
                alert(data.error);
            } else {
                booking = data;
                if (cb) {
                    cb();
                } else {
                    app.navigate("#public_html/bookings_detailed.html");
                }
            }
        },
        error: function (error) {
            var jsonError = JSON.parse(error['responseText']);
            alert(jsonError.error);
            kendo.mobile.application.hideLoading();
        }
    });
}

function approveBooking(cb) {
    kendo.mobile.application.showLoading();
    var api_key = localStorage.getItem('api_key');
    $.ajax({
        url: api_url + "bookings/approve_booking",
        data: {api_key: api_key, secret_key: booking.secret_key},
        type: "POST",
        dataType: 'json',
        success: function (data) {
            if (data.error) {
                alert(data.error);
            } else {
                cb();
            }
        },
        error: function (error) {
            kendo.mobile.application.hideLoading();
            cb();
        }
    });
}

function rejectBooking(cb) {
    kendo.mobile.application.showLoading();
    var api_key = localStorage.getItem('api_key');
    $.ajax({
        url: api_url + "bookings/reject_booking",
        data: {api_key: api_key, secret_key: booking.secret_key},
        type: "POST",
        dataType: 'json',
        success: function (data) {
            if (data.error) {
                alert(data.error);
            } else {
                kendo.mobile.application.hideLoading();
                cb();
            }
        },
        error: function (error) {
            kendo.mobile.application.hideLoading();
            cb();
        }
    });
}

function addReview(data) {
    $.ajax({
        url: api_url + "reviews/add_review",
        data: data,
        type: 'POST',
        dataType: 'json',
        success: function (data) {
            if (data.error) {
                alert(data.error);
            } else {
                kendo.mobile.application.hideLoading();
                app.navigate("#public_html/activities.html");
                show_success("Submitting review successful! You're review will appear after the supplier confirms it.");
            }
        }
    });
}

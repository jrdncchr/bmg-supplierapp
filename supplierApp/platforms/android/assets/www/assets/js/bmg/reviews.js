var activityList;
function initLeaveReview() {
    $('body').scrollTop(0);
//    $('#lr-activity-title').html("[" + activity.code + "] " + activity.title);
    getActivitiesList(function() {
        var options;
        for (i = 0; i < activityList.length; i++) {
            if (activityList[i].id === localStorage.getItem('listing_id')) {
                localStorage.setItem('listing_title', activityList[i].title);
                options += "<option value='" + activityList[i].id + "' selected>" + activityList[i].title + "</option>";
            } else {
                options += "<option value='" + activityList[i].id + "'>" + activityList[i].title + "</option>";
            }
        }
        $('#lr-activity-title').html(options);
        $('#lr-activity-title').change(function() {
            localStorage.setItem('listing_id', $(this).val());
            localStorage.setItem('listing_title', $("#lr-activity-title option:selected").text());
        });
    });

    $('#email-btn').off('click').click(function() {
        app.navigate("#public_html/reviews_leave_review_later.html");
    });
    $('#written-btn').off('click').click(function() {
        app.navigate("#public_html/reviews_leave_review_now.html");
    });
}

var reviewCategory = "new";
var newReviews = new Array();
var allReviews = new Array();

function setupReviews() {
    $('body').scrollTop(0);
    reviewCategory = "new";
    $('.topnav2 td').removeClass('topnav-active');
    $('#reviews-new').addClass('topnav-active');
    readProfile();
    getReviews();
    activateReviewEvents();
}

function activateReviewEvents() {
    $('.reviews-nav td').off('click').click(function() {
        $('.topnav2 td').removeClass('topnav-active');
        $(this).addClass('topnav-active');
        reviewCategory = $(this).attr('id').split('-')[1];
        getReviews();
    });
}

var reviewsList;
function setupReviewInfo() {
    $('body').scrollTop(0);
    if (parseInt(review.is_new)) {
        updateReviewAsSeen(review.id, review.activity_code.substring(1));
    }
    $('#review-activity-image').css({'background-image': "url(" + review.activity_image['680x325'] + ")"});
    $('#review-activity-code').html(review.activity_code);
    $('#review-activity-country').html(review.activity_country);
    $('#review-activity-type').html(review.activity_type);
    $('#review-activity-title').html(review.activity_title);
    $('#review-count').html(review.review_count);
    $('#review-average-score').html(review.review_average_score + "/5");
    reviewsList = new Array();
    for (key in review.reviews.reverse()) {
        reviewsList.push(review.reviews[key]);
    }
    getReviewsList(4);
    $('#review-ask-review').click(function() {
        app.navigate("#public_html/reviews_leave_review.html")
    });
}

function getReviewsList(n) {
    var template = kendo.template($("#review-detailed-template").html());
    var dataSource = new kendo.data.DataSource({
        data: reviewsList,
        pageSize: n,
        change: function() {
            $("#reviews-list-detailed").html(kendo.render(template, this.view()));
        }
    });
    dataSource.read();
    $("#reviews-list-detailed").find('.review-rate').each(function() {
        var rate = $(this).html();
        if (rate > 2) {
            $(this).parent().addClass('review-li-rate-green');
        } else {
            $(this).parent().addClass('review-li-rate-red');
        }
    });
}

var lrn_ratings = 2.5;
function initLeaveReviewNow() {
    $('body').scrollTop(0);
    $('#lrn-ratings').val(2.5);
    $('#lrn-activity-title').html(localStorage.getItem('listing_title'));
    $('#lrn-ratings').change(function() {
        lrn_ratings = parseFloat($('#lrn-ratings').val());
        $('#bmg-lrnow-rate').html(lrn_ratings);
        if (lrn_ratings === .5) {
            $('#bmg-lrnow-ratemsg').html("It was poor");
        } else if (lrn_ratings === 1) {
            $('#bmg-lrnow-ratemsg').html("It was poor");
        } else if (lrn_ratings === 1.5) {
            $('#bmg-lrnow-ratemsg').html("It was OK");
        } else if (lrn_ratings === 2) {
            $('#bmg-lrnow-ratemsg').html("It was OK");
        } else if (lrn_ratings === 2.5) {
            $('#bmg-lrnow-ratemsg').html("It was good!");
        } else if (lrn_ratings === 3) {
            $('#bmg-lrnow-ratemsg').html("It was good!");
        } else if (lrn_ratings === 3.5) {
            $('#bmg-lrnow-ratemsg').html("It was great!");
        } else if (lrn_ratings === 4) {
            $('#bmg-lrnow-ratemsg').html("It was great!");
        } else if (lrn_ratings === 4.5) {
            $('#bmg-lrnow-ratemsg').html("It was amazing!");
        } else if (lrn_ratings === 5) {
            $('#bmg-lrnow-ratemsg').html("It was amazing!");
        }
    });
}

function clearReviewNow() {
    $('body').scrollTop(0);
    $('#bmg-lrnow-add-photo').removeClass('bmg-lrnow-add-photo').addClass('bmg-lrnow-add-photo');
    $('#bmg-lrnow-add-photo').html('<div style="padding-top: 8px;"><img src="assets/img/reviews/camera_icon.png" height="20" width="25" />Add some pictures!</div>');
    $('body').scrollTop(0);
    ratings = 0;
    $('#bmg-lrnow-rate').html("2.5");
    $('#bmg-lrnow-ratemsg').html("It was good!");
    $('#lrn-name').val("");
    $('#lrn-review').val("");
    $('#lrn-email').val("");

    $('#leave-review-now-submitBtn').off('click').click(function() {
        if (validateEmail($('#lrn-email').val())) {
            var data = {
                'name': $('#lrn-name').val(),
                'email': $('#lrn-email').val(),
                'review': $('#lrn-review').val(),
                'rating': lrn_ratings,
                'api_key': localStorage.getItem('api_key'),
                'listing_id': localStorage.getItem('listing_id')
            };
            addReview(data);
        } else {
            alert("Invalid Email");
        }
    });
}

function reviewOnCapturePhoto(fileURI) {
    var win = function(r) {
        clearCache();
        retries = 0;
//        alert("Code: " + r.responseCode + "\n Response: " + r.response + "\n Sent: " + r.bytesSent);
        kendo.mobile.application.hideLoading();
        app.navigate("#public_html/activities.html");
        show_success("Submitting review successful! You're review will appear after the supplier confirms it.");
    };

    var fail = function(error) {
        if (retries === 0) {
            retries++;
            setTimeout(function() {
                reviewOnCapturePhoto(fileURI);
            }, 1000);
        } else {
            retries = 0;
            clearCache();
            alert('Ups. Something wrong happens!' + error);
            kendo.mobile.application.hideLoading();
        }
    };

    var options = new FileUploadOptions();
    options.fileKey = "review_image";
    options.fileName = fileURI.substr(fileURI.lastIndexOf('/') + 1);
    options.mimeType = "image/jpeg";
    options.chunkedMode = false;
    options.params = {
        'name': $('#lrn-name').val(),
        'email': $('#lrn-email').val().replace(/\s+/g, ''),
        'review': $('#lrn-review').val(),
        'rating': lrn_ratings,
        'api_key': localStorage.getItem('api_key'),
        'listing_id': localStorage.getItem('listing_id')
    };
    $("#review-modal-add-image").kendoMobileModalView("close");
    $('#bmg-lrnow-add-photo').html("<div class='image lrl-photo' style='background-image: url(" + fileURI + ");'></div><span class='text-success lrl-photo-success'>Selfie added!</span>");
    $('#bmg-lrnow-add-photo').removeClass('bmg-lrnow-add-photo');
    $('#leave-review-now-submitBtn').off('click').click(function() {
        if (validateEmail($('#lrn-email').val())) {
            var ft = new FileTransfer();
            kendo.mobile.application.showLoading();
            $("#review-modal-add-image").data("kendoMobileModalView").close();
            ft.upload(fileURI, encodeURI(api_url + "reviews/add_review"), win, fail, options);
        } else {
            alert("Invalid Email");
        }
    });
}

function addReviewImage(option) {
    if (option === "capture") {
        navigator.camera.getPicture(reviewOnCapturePhoto, addReviewImageFail, {
            quality: 100,
            destinationType: Camera.DestinationType.FILE_URI
        });
    } else if (option === "existing") {
        navigator.camera.getPicture(reviewOnCapturePhoto, addReviewImageFail, {
            quality: 100,
            destinationType: Camera.DestinationType.FILE_URI,
            sourceType: Camera.PictureSourceType.PHOTOLIBRARY
        });
    }
}

function addReviewImageFail() {
    alert("Uploading Image failed.");
}

function initLeaveReviewEmail() {
    $('body').scrollTop(0);
    refresLeaveReviewEmails();
    $('#lrl-title').html(localStorage.getItem('listing_title'));
    $('#lrl-add-email').off('click').click(function() {
        var clone = $('#lrl-email-temp').clone();
        clone.removeAttr('id');
        clone.addClass('clone');
        $('#lrl-email-list').append(clone);
        clone.find('.lrl-remove-email').click(function() {
            $('#lrl-email-list').find(clone).remove();
        });
        clone.show();
    });
    $('#lrl-send-review').off('click').click(function() {
        var emails = [];
        var valid = true;
        $('#lrl-email-list').find('.email-input').each(function() {
            var e = $(this).val();
            if (e !== "") {
                if (validateEmail(e)) {
                    emails.push(e);
                } else {
                    $(this).addClass('review-email-error');
                    $('.review-email-error').off('click').keyup(function() {
                        if (validateEmail($(this).val())) {
                            $(this).removeClass('review-email-error');
                        }
                    });
                    valid = false;
                }
            }
        });
        if (valid) {
            if (emails.length > 0) {
                emails = JSON.stringify(emails);
                sendEmailReview(emails);
            } else {
                alert("Please enter an email address.");
            }
        }

    });
}

function refresLeaveReviewEmails() {
    $('.clone').remove();
}
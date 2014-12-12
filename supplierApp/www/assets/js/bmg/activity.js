/* ================= Activities List Functions ================ */
function setupActivitiesLayout(e) {
    var navOverflowModel = kendo.observable({
        showAtyOverflow: function(x) {
            x.preventDefault();
            $("#activity-overflow").toggle();
        },
        deleteActivity: function(x) {
            x.preventDefault();
            var ok = confirm("Are you sure you want to delete this activity?");
            if (ok) {
                delete_activity();
            }
        },
        disableActivity: function(x) {
            x.preventDefault();
            alert("This feature is not yet available.");
        }
    });
    kendo.bind(e.layout.element.find("#aty-overflow-btn"), navOverflowModel);
    kendo.bind(e.layout.element.find("#activity-delete-btn"), navOverflowModel);
    kendo.bind(e.layout.element.find("#activity-disable-btn"), navOverflowModel);
}

function hideActivityDetail() {
    $("#activity-overflow").hide();
}


var activity_status = "active";
var showAllActivities = true;

function setupActivities() {
    $('body').scrollTop(0);
    activity_status = "active";
    $('.topnav2 td').removeClass('topnav-active');
    $('#topnav-active').addClass('topnav-active');
    readProfile();
    showAllActivities = true;
    getActivities('all', "active");
    activateActivityEvents();

    try {
        pictureSource = navigator.camera.PictureSourceType;
        destinationType = navigator.camera.DestinationType;
    } catch (e) {
        alert("This error occured because you are viewing this on a browser.");
    }

}


function activateActivityEvents() {
    $('.activities-nav td').off('click').click(function() {
        showAllActivities = true;
        $('.topnav2 td').removeClass('topnav-active');
        $(this).addClass('topnav-active');
        $('#activities-empty').hide();
        activity_status = $(this).attr('id').split('-')[1];
        $('#activity-empty-status').html(activity_status);
        getActivities(4, activity_status);
    });
}

/* ================= Activities Info Functions ================ */
var atyImageLength = 0;
var currentPage = 0;
function setupActivityInfo(cb) {
    $('body').scrollTop(0);
    var pictures = new Array();
    for (key in activity.pictures) {
        pictures.push(activity.pictures[key]['image']['680x325']);
    }
    currentPage = 0;
    var i = 0;
    $('.photo').show();
    $("#activity-pictures").find('.photo').each(function() {
        if (i === pictures.length) {
            $(this).hide();
        } else {
            $(this).css({'background-image': "url(" + pictures[i] + ")"});
            i++;
        }
    });
    i--;
    atyImageLength = i;
    activateScrollViewEvents();

    $('#activity-status').removeClass().addClass('aty-img-cover-status aty-' + activity_status).html(activity_status);
    $('#activity-code').html(activity.code);
    $('#activity-country').html(activity.country);
    $('#activity-type').html(activity.type);
    $('#activity-title').html(activity.title);
    $('#activity-description').html(activity.description);
    $('#activity-review-count').html(activity.review_count);
    $('#activity-review-average').html(activity.review_average_score);
    if (parseInt(activity.review_count) === 0) {
        $('#activity-review').addClass('aty-no-review');
    } else {
        $('#activity-review').off('click').click(function() {
            var id = activity.code.substring(1);
            localStorage.setItem('listing_id', id);
            getActivityReviews(id);
        });
    }
    if (activity_status !== "active") {
        $('#activity-share-btn').hide();
    }
    $('#activity-share-btn').off('click').click(function() {
        window.plugins.socialsharing.share('Message and link', null, null, activity.deep_link);
    });

    $('#aty-ask-review').off('click').click(function() {
        app.navigate("#public_html/reviews_leave_review.html");
        localStorage.setItem('listing_id', activity.code.substring(1));
//        alert("This function is not yet implemented.");
    });
    if (cb) {
        cb(i);
    }
}

function activateScrollViewEvents() {
    $('#aty-img-right').off('click').click(function() {
        var scrollview = $("#activity-pictures").data("kendoMobileScrollView");
        currentPage++;
        scrollview.scrollTo(currentPage);
        checkScrollMaxMin(currentPage);
    });
    $('#aty-img-left').off('click').click(function() {
        var scrollview = $("#activity-pictures").data("kendoMobileScrollView");
        currentPage--;
        scrollview.scrollTo(currentPage);
        checkScrollMaxMin(currentPage);
    });
}

function atyScrollViewChangingEvent(e) {
    currentPage = e.nextPage;
    checkScrollMaxMin(e.nextPage);
}

function checkScrollMaxMin(nextPage) {
    if (nextPage >= atyImageLength) {
        $('#aty-img-right').hide();
    } else {
        $('#aty-img-right').show();
    }

    if (nextPage <= 0) {
        $('#aty-img-left').hide();
    } else {
        $('#aty-img-left').show();
    }
}

function activityOnCapturePhoto(fileURI) {
    var win = function(r) {
        clearCache();
        retries = 0;
        var id = activity.code.substring(1);
        getActivityDetails(id, function() {
            setupActivityInfo(function(i) {
                var scrollview = $("#activity-pictures").data("kendoMobileScrollView");
                scrollview.refresh();
//        alert("Code: " + r.responseCode + "\n Response: " + r.response + "\n Sent: " + r.bytesSent);
                show_success("Uploading image successful!");
                // set current image in the new uploaded image
                scrollview.scrollTo(i);
                kendo.mobile.application.hideLoading();
            });

        });
    };

    var fail = function(error) {
        if (retries === 0) {
            retries++;
            setTimeout(function() {
                onCapturePhoto(fileURI);
            }, 1000);
        } else {
            retries = 0;
            clearCache();
            alert('Ups. Something wrong happens!');
            kendo.mobile.application.hideLoading();
        }
    };

    var options = new FileUploadOptions();
    options.fileKey = "images_add_val_1";
    options.fileName = fileURI.substr(fileURI.lastIndexOf('/') + 1);
    options.mimeType = "image/jpeg";
    options.chunkedMode = false;
    options.params = {
        'images_add_txt_1': "",
        'api_key': localStorage.getItem('api_key'),
        'activity_id': localStorage.getItem('activity_id')
    };
//    alert(options.fileName);
    var ft = new FileTransfer();
    kendo.mobile.application.showLoading();
    $("#modal-add-image").data("kendoMobileModalView").close();
    ft.upload(fileURI, encodeURI(api_url + "activities/add_activity_images"), win, fail, options);
}

function addActivityImage(option) {
    if (option === "capture") {
        navigator.camera.getPicture(activityOnCapturePhoto, onFail, {
            quality: 100,
            destinationType: Camera.DestinationType.FILE_URI
        });
    } else if (option === "existing") {
        navigator.camera.getPicture(activityOnCapturePhoto, onFail, {
            quality: 100,
            destinationType: Camera.DestinationType.FILE_URI,
            sourceType: Camera.PictureSourceType.PHOTOLIBRARY
        });
    }
}
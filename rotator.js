/*
 Get cookie
 */
function get_cookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function get_query_param(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

/*
 Set cookie
 */
function set_cookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

/*
 This function return variation.
 If user first time on page, take variation by random, else take variation index from cookie
 */
function get_variation(experiment_name, allocation, variations) {

    var param_variation_index = get_query_param(experiment_name);
    if (param_variation_index) {
        return variations[param_variation_index];
    }
 
    var cookie_variation_index = get_cookie(experiment_name);
    if (cookie_variation_index) {
        return variations[cookie_variation_index];
    }

    var count = allocation.length > variations.length ? variations.length : allocation.length;

    var sum = 0;
    for (var i = 0; i < count; i++) {
        sum += allocation[i];
    }

    var rand = Math.floor(Math.random() * 100) + 1;

    for (var j = 0; j < count; j++) {
        rand -= allocation[j];

        if (rand <= 0) {
            set_cookie(experiment_name, j, 7);
            return variations[j];
        }
    }
}

/*
 Function for QA, change variation & refresh page
 */
function change_variation(experiment_name, variation_name, refresh) {
    var experiment = window.registered_experiments[experiment_name];

    if (experiment) {
        for (var i = 0; i < experiment.variations.length; i++) {
            if (experiment.variations[i].name == variation_name) {
                set_cookie(experiment_name, i);

                if (refresh) location.reload();
                return true;
            }
        }
    }

    set_cookie(experiment_name, 0);

    if (refresh) location.reload();
    return false;
}

/*
    Defer function for jquery
 */
function defer(method) {
    if (window.jQuery) {
        method();
    } else {
        setTimeout(function() { defer(method) }, 50);
    }
}

/*
 Main function for experiment registration

 */
function register_experiment(options) {

    // Detect device
    var run = false;
    window.device = window.device || new MobileDetect(window.navigator.userAgent);

    if (typeof options.devices == 'string') {
        options.devices = [options.devices];
    }

    if (window.device.tablet() && options.devices.indexOf('TB') !== -1) { run = true; options.device = 'TB'; }
    else if (window.device.mobile() && options.devices.indexOf('MB') !== -1 && !window.device.tablet()) { run = true; options.device = 'MB'; }
    else if (!window.device.mobile() && options.devices.indexOf('DT') !== -1) { run = true; options.device = 'DT'; }


    window.registered_experiments = window.registered_experiments || [];
    window.registered_experiments[options.name+'_'+options.device] = options;

    // if device detected
    if (run) {
        var variation = get_variation(options.name+'_'+options.device, options.allocation, options.variations);

        if (variation && (options.mode == 'production' || get_query_param('qa_mode') == 'true')) {

            defer(function(){
                if (options.beforeCallback) options.beforeCallback(options, variation);
                variation.callback();
                if (options.afterCallback) options.afterCallback(options, variation);
            });

            console.log('[ROTATOR] Experiment (', options.name+'_'+options.device+'_'+variation.name, ') started');
        }
    }
}

window.experiments = window.experiments || [];

// start experiment loaded before rotator
for (var i = 0; i < window.experiments.length; i++) {
    register_experiment(window.experiments[i]);
}

// replace push function for start new experiments
window.experiments.push = function(e) {
    register_experiment(e);
    Array.prototype.push.call(window.experiments, e);
};


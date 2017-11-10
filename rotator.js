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

        console.log(rand);


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
    var experiment = window.experiments[experiment_name];

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
    Main function for experiment registration

 */
function register_experiment(options) {
    window.experiments = window.experiments || [];
    window.experiments[options.name+'_'+options.device] = options;


    // Detect device
    var run = false;
    window.device = window.device || new MobileDetect(window.navigator.userAgent);

    if (window.device.tablet() && options.device == 'TB') { run = true; }
    else if (window.device.mobile() && options.device == 'MB' && !window.device.tablet()) { run = true; }
    else if (options.device == 'DT') { run = true; }


    // if device detected
    if (run) {
        var variation = get_variation(options.name+'_'+options.device, options.allocation, options.variations);

        if (variation) {
            options.beforeCallback(variation);
            variation.callback();
            options.afterCallback(variation);

            console.log('[ROTATOR] Experiment (', options.name+'_'+options.device+'_'+variation.name, ') started');
        }
    }
}


register_experiment({
    name: 'TST96',                      // experiment name
    device: 'MB',                       // experiment device, possible values MB TB DT
    allocation: [50, 50],               // experiment traffic allocation
    variations: [{                      // experiment variations
        name: 'O',                      // variation name

        callback: function() {          // variation code here
            document.write('original');
        }
    },{
        name: 'V1',                     // variation name

        callback: function() {          // variation code here
            document.write('variation1');
        }
    }],
    beforeCallback: function(variation) { // callback before variation runs
        console.log('before')
    },
    afterCallback: function(variation) {  // callback after variation runs
        console.log('after')
    }
});

function defer(method) {
    if (window.jQuery) {
        method();
    } else {
        setTimeout(function() { defer(method) }, 50);
    }
}

function main() {
    defer(render_console);
}

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

function render_console() {
    if (!window.registered_experiments) return false;


    var $checkbox = $('<input type="checkbox" name="qa_mode">');

    if (get_query_param('qa_mode')) {
        $checkbox.prop('checked', true);
    }

    $('body').append(
        $('<div class="experiment_console">').append(
            $('<div class="row" id="qa_mode">').append(
                $('<label>').append(
                    'QA Mode',
                    $checkbox.change(on_qa_mode_toggle)
                )
            ),
            $('<div class="row" id="variation_selects">')
        )
    );


    for (var experiment_name in window.registered_experiments) {
        if (window.registered_experiments.hasOwnProperty(experiment_name)) {
            var experiment = window.registered_experiments[experiment_name];

            var $variations = [];

            for (var j = 0; j < experiment.variations.length; j++) {
                var $options = $('<option value="'+experiment.variations[j].name+'">').text(experiment.variations[j].name);

                if (get_cookie(experiment_name) == j) {
                    $options.prop('selected', true);
                }

                $variations.push(
                    $options
                )
            }

            $('#variation_selects').append(
                $('<label>').append(
                    experiment_name,
                    $('<select class="variation_select">').append(
                        $variations
                    ).change(on_variation_selected).data('experiment-name', experiment_name)
                )
            )
        }
    }
}
function removeURLParameter(url, parameter) {
    //prefer to use l.search if you have a location/link object
    var urlparts= url.split('?');
    if (urlparts.length>=2) {

        var prefix= encodeURIComponent(parameter)+'=';
        var pars= urlparts[1].split(/[&;]/g);

        //reverse iteration as may be destructive
        for (var i= pars.length; i-- > 0;) {
            //idiom for string.startsWith
            if (pars[i].lastIndexOf(prefix, 0) !== -1) {
                pars.splice(i, 1);
            }
        }

        url= urlparts[0] + (pars.length > 0 ? '?' + pars.join('&') : "");
        return url;
    } else {
        return url;
    }
}

function addParameterToURL(param){
    _url = location.href;
    _url += (_url.split('?')[1] ? '&':'?') + param;
    return _url;
}

function on_qa_mode_toggle(e) {
    if ($(this).is(':checked')) {
        location.href = addParameterToURL('qa_mode=true');
    } else {
        location.href = removeURLParameter(location.href, 'qa_mode');
    }
}
function on_variation_selected(e) {
    change_variation($(this).data('experiment-name'), $(this).val(), true);
}
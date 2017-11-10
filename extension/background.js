$.get(chrome.extension.getURL('/injected.js'), function(data) {
    var script = document.createElement("script");
    script.setAttribute("type", "text/javascript");
    script.setAttribute("id", "experiment_console_js");
    script.innerHTML = data;
    document.getElementsByTagName("head")[0].appendChild(script);
    document.getElementsByTagName("body")[0].setAttribute("onLoad", "main();");

});

$.get(chrome.extension.getURL('/console.css'),function(data){

    var style = document.createElement("style");
    style.setAttribute("id", "experiment_console_css");
    style.innerHTML = data;
    document.getElementsByTagName("head")[0].appendChild(style);
});
function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) == variable) {
            return decodeURIComponent(pair[1]);
        }
    }
    /* No need to log, since I handle empty variable*/
    /* console.log('Query variable %s not found', variable); */
}

var sketcher = null;

$(document).ready(function(e) {
	type = getQueryVariable('style');
	sketcher = new Sketcher( "sketch", type );
        document.getElementsByName('nTiles')[0].value = sketcher.getNTiles();
});

var KEY_UP = 38, KEY_RIGHT = 39;
var KEY_DOWN = 40;
var KEY_LEFT = 37;
var KEY_SPACE = 32;
var KEY_ENTER = 13;
var KEY_ESCAPE = 27;


var KEY_STATE = [];
for (var i = 0; i < 256; ++i) {
    KEY_STATE[i] = 0;
}

window.addEventListener('keyup', function(e) {
    KEY_STATE[e.keyCode] = 0;
});

window.addEventListener('keydown', function(e) {
    KEY_STATE[e.keyCode] = 1;
});



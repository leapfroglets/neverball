function LevelEditor(id) {
    var main = document.getElementById(id);
    var w = 30, h = 30;
    var rows = 20;
    var cols = 20;
    var self = this;
    var tools = [];
    var COLOR_FILL = 1;
    var PICKER = 2;
    var NONE = -1;
    var cursel = NONE;

    var lmanager = new LevelManager();

    var createColorFill = function() {
        var colorpicker;
        colorpicker = document.createElement('input');
        colorpicker.style.display = "block";
        colorpicker.type = "color";
        colorpicker.onmousedown = function() {
            cursel = COLOR_FILL;
        }
        return colorpicker;
    }

    var createPicker = function() {
        var obj = document.createElement('div');
        obj.style.display = "block";
        obj.innerText = "PICKER";
        obj.style.background = "grey";
        obj.style.color = "white";
        obj.style.padding = "5px";
        obj.style.cursor = "pointer";
        obj.onmousedown = function() {
            cursel = PICKER;
        }
        return obj;
    }

    var get = function(row, col) {
        var div = document.createElement('div');
        div.id = "cell" + row * cols + col;
        div.style.position = "absolute";
        div.style.width = w + "px";
        div.style.cursor = "pointer";
        div.style.height = h + "px";
        var border = "1px solid black";
        div.style.borderLeft = border;
        if (col == cols - 1) {
            div.style.borderRight = border;
        }
        div.style.borderTop = border;
        if (row == rows - 1) {
            div.style.borderBottom = border;
        }
        div.style.top = row * h + "px";
        div.style.left = col * w + "px";
        return div;
    }

    var divs = {};
    var map = {};

    var mouseDown = function(row, col) {
        switch (cursel) {
            case COLOR_FILL:
                {
                    map[row][col]["color"] = tools[COLOR_FILL].value;
                    divs[row][col].style.backgroundColor = tools[COLOR_FILL].value;
                }
                break;
            case PICKER:
                {
                    if ("color" in map[row][col]) {
                        tools[COLOR_FILL].value = map[row][col]["color"];
                        cursel = COLOR_FILL;
                    }
                }
                break;
            case NONE:
                break;
            default:
                console.log("Invalid switch case");
                break;
        }
    }

    var createTools = function() {
        tools[COLOR_FILL] = createColorFill();
        tools[PICKER] = createPicker();

        var tools_div;
        tools_div = document.createElement('div');
        tools_div.style.position = "absolute";
        tools_div.style.left = cols * w + 10 + "px";  
        main.appendChild(tools_div);
        for (var i in tools) {
            tools_div.appendChild(tools[i]);
        }

    }

    var down = 0;

    var createCells = function() {
        divs = {};
        map = {};
        for (var i = 0; i < rows; ++i) {
            divs[i] = {};
            map[i] = {};
            for (var j = 0; j < cols; ++j) {
                divs[i][j] = get(i, j);
                main.appendChild(divs[i][j]);
                map[i][j] = {};
            }
        }

        for (var i = 0; i < rows; ++i) {
            for (var j = 0; j < cols; ++j) {
                var o = function(i, j) {
                    divs[i][j].onmousedown = function() {
                        down = 1;
                        mouseDown(i, j);
                    }
                    divs[i][j].onmousemove = function() {
                        if (down) mouseDown(i, j);
                    }

                    divs[i][j].onmouseup = function() {
                        down = 0;
                    }
                }
                o(i, j);
            }
        }
    }

    this.getLevel = function() {
        var r = {meta : {rows : rows, cols : cols}, map : map};
        return r;
    }

    this.save = function(name) {
        lmanager.save(name, this.getLevel());
    }

    var createSaveTools = function() {
        var s = document.createElement('div');
        s.style.position = "absolute";
        s.style.top = rows * h + 10 + "px";  
        main.appendChild(s);
        var save_btn = document.createElement('div');
        save_btn.style.padding = "5px";
        save_btn.style.border = "1px solid black";
        save_btn.innerText = "SAVE";
        save_btn.style.cursor = "pointer";
        save_btn.onclick = function() {
            self.save("mylevel");
            alert("saved");
        }
        s.appendChild(save_btn);
    }

    this.init = function() {
        main.style.position = "relative";
        createCells();
        createTools();
        createSaveTools();
    }
}

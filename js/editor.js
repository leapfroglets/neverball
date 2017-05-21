function LevelEditor(id) {
    var main = document.getElementById(id);
    var w = 30, h = 30;
    var rows = 20;
    var cols = 20;
    var self = this;
    var tools = [];

    var NONE = 0;
    var COLOR_FILL = 1;
    var PICKER = 2;
    var COIN_FILL = 3;
    var DELETE = 4;
    var CUBE = 5;

    var cursel = COLOR_FILL;

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
        obj.className = "btn";
        obj.innerText = "PICKER";
        obj.onmousedown = function() {
            cursel = PICKER;
        }
        return obj;
        
    }
    
    var createCube = function() {
        var obj = document.createElement('div');
        obj.className = "btn";
        obj.innerText = "CUBE";
        obj.onmousedown = function() {
            cursel = CUBE;
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

    var addCoin = function(row, col) {
        var coin = document.createElement('div');
        coin.className = 'coin';
        coin.style.width = w + "px";
        coin.style.height = h + "px";
        divs[row][col].appendChild(coin);
    }
    
    var addCube = function(row, col) {
        var cube = document.createElement('div');
        cube.className = 'cube';
        divs[row][col].appendChild(cube);
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
            case COIN_FILL:
                {
                    var has = 'coin' in map[row][col] || 'cube' in map[row][col];
                    if (!has) {
                        map[row][col]['coin'] = 1;
                        addCoin(row, col);
                    }
                }
                break;
            case CUBE:
                {
                    var has = 'coin' in map[row][col] || 'cube' in map[row][col];
                    if (!has) {
                        map[row][col]['cube'] = 1;
                        addCube(row, col);
                    }
                }
                break;
            case DELETE:
                {
                    if ('coin' in map[row][col]) {
                        delete map[row][col]['coin'];
                        divs[row][col].removeChild(divs[row][col].getElementsByClassName('coin')[0]);
                    } else if ('cube' in map[row][col]) {
                        delete map[row][col]['cube'];
                        divs[row][col].removeChild(divs[row][col].getElementsByClassName('cube')[0]);
                    } else {
                        map[row][col] = {};
                        divs[row][col].style.background = "none";
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

    var createCoinFill = function() {
        var div = document.createElement('div');
        div.className = "coin";
        div.onclick = function() {
            cursel = COIN_FILL;
        }
        return div;
    }

    var createDelete = function() {
        var div = document.createElement('div');
        div.className = "btn";
        div.innerText = "DELETE";
        div.onclick = function() {
            cursel = DELETE;
        }
        return div;
    }

    var createTools = function() {
        tools[PICKER] = createPicker();
        tools[DELETE] = createDelete();
        tools[CUBE] = createCube();
        tools[COLOR_FILL] = createColorFill();
        tools[COIN_FILL] = createCoinFill();

        var toolbox = main.getElementsByClassName('toolbox')[0];
        for (var i in tools) {
            toolbox.appendChild(tools[i]);
        }

    }

    var down = 0;

    var createCells = function() {
        divs = {};
        map = {};
        var grid = main.getElementsByClassName('grid')[0];
        grid.style.position = "relative";
        grid.style.width = cols * w + "px";
        grid.style.height = rows * h + "px";
        grid.innerHTML = "";

        for (var i = 0; i < rows; ++i) {
            divs[i] = {};
            map[i] = {};
            for (var j = 0; j < cols; ++j) {
                divs[i][j] = get(i, j);
                grid.appendChild(divs[i][j]);
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
        lmanager.addLevel(name, this.getLevel());
        lmanager.save();
    }

    var editLevel = function(name) {
        var inp = main.getElementsByClassName('save_level_name')[0];
        inp.value = name;
        var level = lmanager.getLevel(name);
        rows = level.meta.rows;
        cols = level.meta.cols;
        createCells();
        map = level.map;
        for (var i = 0; i < rows; ++i) {
            for (var j = 0; j < cols; ++j) {
                divs[i][j].style.background = "none";
                divs[i][j].innerHTML = "";
                if ('color' in map[i][j]) {
                    divs[i][j].style.background = map[i][j]['color'];
                }
                if ('coin' in map[i][j]) {
                    addCoin(i, j);
                }
                if ('cube' in map[i][j]) {
                    addCube(i, j);
                }
            }
        }
    }

    var displayLevels = function() {
        var obj = main.getElementsByTagName('ul')[0];
        var levels = lmanager.getLevels();
        obj.innerHTML = "";
        for (var i in levels) {
            var li = document.createElement('li');
            li.innerText = i;
            var o = function(li, i) {
                li.onclick = function() {
                    editLevel(i);
                }
            };
            o(li, i);
            obj.appendChild(li);

        }
    }


    var createSaveTools = function() {
        var save_btn = main.getElementsByClassName('save_btn')[0];
        save_btn.onclick = function() {
            var inp = main.getElementsByClassName('save_level_name')[0];
            self.save(inp.value);
            displayLevels();
        }
    }

    this.init = function() {
        main.style.position = "relative";
        createCells();
        createTools();
        createSaveTools();
        displayLevels();
    }
}

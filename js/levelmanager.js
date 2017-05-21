function LevelManager() {
    var levels = {};

    this.loadLevels = function() {
        if (localStorage.neverball) {
            levels = JSON.parse(localStorage.neverball);
        } else {
            levels = {};
            console.log("not stored, maybe first run");
        }
    }

    this.getLevels = function() {
        return levels;
    }

    this.init = function() {
        this.loadLevels();
    }

    this.init();

    this.addLevel = function(name, level) {
        levels[name] = level;
    }

    this.save = function() {
        localStorage.setItem("neverball", JSON.stringify(levels));
    }

    this.getLevel = function(name) {
        if (name in levels) {
            return levels[name];
        } else return -1; //not found
    }

}

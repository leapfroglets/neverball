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
        this.loadLevels();
        return levels;
    }

    this.addLevel = function(name, level) {
        levels[name] = level;
    }

    this.deleteLevel = function(name) {
        delete levels[name];
        this.save();
        this.loadLevels();
    }

    this.save = function() {
        localStorage.setItem("neverball", JSON.stringify(levels));
    }

    this.getLevel = function(name) {
        this.getLevels();
        if (name in levels) {
            return levels[name];
        } else return -1; //not found
    }

}

function LevelManager() {

    this.save = function(name, level) {
        localStorage.setItem("level", JSON.stringify(level));
    }

    this.load = function(name) {
        return JSON.parse(localStorage.level);
    }

}

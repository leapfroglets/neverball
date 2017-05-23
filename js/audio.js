function SoundManager() {
    var sounds = [];
    sounds["coin"] = "audio/coin.mp3";
    sounds["wall"] = "audio/wall.mp3";

    this.playSound = function(name, volume = 1) {
        var snd = new Audio(sounds[name]);
        snd.volume = volume;
        snd.play();
    }

}


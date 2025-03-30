class MusicManager {
    constructor(scene) {
        this.scene = scene;
        this.music = null;
    }

    play(key = "bgm", config = {}) {
        if (this.music) return; // Already playing

        this.music = this.scene.sound.add(key, {
            loop: true,
            volume: 0.4,
            ...config,
        });

        this.music.play();
    }

    stop() {
        if (this.music) {
            this.music.stop();
            this.music = null;
        }
    }

    setVolume(value) {
        if (this.music) {
            this.music.setVolume(value);
        }
    }

    mute() {
        if (this.music) this.music.setMute(true);
    }

    unmute() {
        if (this.music) this.music.setMute(false);
    }

    isPlaying() {
        return this.music && this.music.isPlaying;
    }
}

export default MusicManager;

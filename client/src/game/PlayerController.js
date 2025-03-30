export default class PlayerController {
    constructor(player, keys, speed) {
        this.player = player;
        this.keys = keys;
        this.speed = speed;
    }

    update() {
        if (!this.player || !this.keys) return;

        let velocityX = 0;
        let velocityY = 0;

        // Horizontal movement
        if (this.keys.A.isDown) {
            velocityX = -this.speed;
            this.player.setFlipX(true); // Flip sprite to face left
        } else if (this.keys.D.isDown) {
            velocityX = this.speed;
            this.player.setFlipX(false); // Default facing right
        }

        // Vertical movement
        if (this.keys.W.isDown) {
            velocityY = -this.speed;
        } else if (this.keys.S.isDown) {
            velocityY = this.speed;
        }

        // Apply movement
        this.player.setVelocity(velocityX, velocityY);
        this.player.body.velocity.normalize().scale(this.speed);

        // Prioritize horizontal animation
        if (velocityX !== 0) {
            this.player.anims.play("walk-right", true);
        } else if (velocityY < 0) {
            this.player.anims.play("walk-up", true);
        } else if (velocityY > 0) {
            this.player.anims.play("walk-down", true);
        } else {
            this.player.play("idle", true);
        }
    }
}

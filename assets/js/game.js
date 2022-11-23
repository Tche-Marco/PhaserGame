let game
let gameOptions = {
  platformGapRange: [200, 400],
  platformWidthRange: [50, 150],
  platformHeight: 600,
  playerWidth: 32,
  playerHeight: 64,
  poleWidth: 8,
  growTime: 500,
  rotateTime: 500,
  walkTime: 3,
  fallTime: 500,
  scrollTime: 250
}

let firstPlay = true

const IDLE = 0
const WAITING = 1
const GROWING = 2
const WALKING = 3
window.onload = function () {
  let gameConfig = {
    type: Phaser.AUTO,
    width: 750,
    height: 1334,
    scene: [playGame]
  }
  game = new Phaser.Game(gameConfig)
  window.focus()
  resize()
  window.addEventListener('resize', resize, false)
}
class playGame extends Phaser.Scene {
  constructor() {
    super('PlayGame')
  }
  preload() {
    this.load.spritesheet('player', 'assets/imgs/player.png', {
      frameWidth: 24,
      frameHeight: 48
    })
    this.load.spritesheet('coin', 'assets/imgs/coin.png', {
      frameWidth: 20,
      frameHeight: 20
    })

    this.load.spritesheet('cloud', 'assets/imgs/cloud.png', {
      frameWidth: 512,
      frameHeight: 512
    })

    this.load.spritesheet('mountain', 'assets/imgs/mountain.png', {
      frameWidth: 512,
      frameHeight: 512
    })

    this.load.image('diamondparticle', 'assets/imgs/diamondparticle.png')
    this.load.image('bridge', 'assets/imgs/bridge.png')
    this.load.image('sky', 'assets/imgs/sky.png')
    this.load.image('tile', 'assets/imgs/tile.png')
    this.load.image('tap', 'assets/imgs/tap.png')
    this.load.image('pillar', 'assets/imgs/pillar.png')

    this.load.bitmapFont('font', 'assets/imgs/font.png', 'assets/imgs/font.fnt')
  }
  create() {
    this.anims.create({
      key: 'rotate',
      frames: this.anims.generateFrameNumbers('coin', { start: 0, end: 5 }),
      frameRate: 15,
      repeat: -1
    })

    this.sky = this.add.image(300, 1200, 'sky')
    this.sky.setScale(2, 4, 5, 5)

    this.particles = this.add.particles('diamondparticle')

    this.cloudGroup = this.add.group()
    this.mountainGroup = this.add.group()

    this.addCoin()
    this.addPlatforms()
    this.addPlayer()
    this.addPole()
    this.addClouds()
    this.addMountains()

    this.startTutorial()
    this.input.on('pointerdown', this.grow, this)
    this.input.on('pointerup', this.stop, this)
  }
  startTutorial() {
    if (firstPlay) {
      this.createMenu('CONSTRUIR', 'Deixe pressionado para construir', 240, 350)

      setTimeout(() => {
        this.destroyMenu()
        this.createMenu(
          'MOEDAS',
          'Press durante a travessia \npara pegar as moedas',
          200,
          280,
          100
        )
        setTimeout(() => {
          this.destroyMenu()
        }, 3500)
      }, 2500)
      firstPlay = false
    }
  }

  createMenu(title, text, titleX, textX, tapY = 150) {
    this.box = this.add
      .sprite(
        this.game.renderer.width / 2 - 150,
        this.game.renderer.height - 300,
        'tile'
      )
      .setDepth(2)
    this.box.setDisplaySize(1200, 300)
    this.box.alpha = 0.5
    this.tap = this.add
      .sprite(
        this.game.renderer.width / 2,
        this.game.renderer.height - tapY,
        'tap'
      )
      .setDepth(2)
    this.tweens.add({
      targets: [this.tap],
      alpha: 0,
      duration: 2000,
      loop: -1,
      ease: 'Cubic.easeIn'
    })
    this.titleText = this.add
      .bitmapText(
        this.game.renderer.width / 2 - titleX,
        this.game.renderer.height - 150 - 240,
        'font',
        title,
        100
      )
      .setDepth(2)
    this.titleText.setTintFill(0xfffff)

    this.tapText = this.add
      .bitmapText(
        this.game.renderer.width / 2 - textX,
        this.game.renderer.height - 150 - 150,
        'font',
        text,
        50
      )
      .setDepth(2)
    this.tapText.setTintFill(0xffffff)
  }
  destroyMenu() {
    this.box.destroy()
    this.tap.destroy()
    this.tapText.destroy()
    this.titleText.destroy()
  }
  addPlatforms() {
    this.mainPlatform = 0
    this.platforms = []
    this.platforms.push(this.addPlatform(0))
    this.platforms.push(this.addPlatform(game.config.width))
    this.tweenPlatform()
  }
  addPlatform(posX) {
    let platform = this.add.sprite(
      posX,
      game.config.height - gameOptions.platformHeight,
      'pillar'
    )
    platform.displayWidth =
      (gameOptions.platformWidthRange[0] + gameOptions.platformWidthRange[1]) /
      2
    platform.displayHeight = gameOptions.platformHeight
    platform.setOrigin(0, 0)
    return platform
  }
  addCoin() {
    this.coin = this.add.sprite(
      0,
      game.config.height -
        gameOptions.platformHeight +
        gameOptions.playerHeight / 2,
      'coin'
    )
    this.coin.visible = false
    this.coin.anims.play('rotate')
  }
  addClouds() {
    let rightmostCloud = this.getRightmostCloud()
    if (rightmostCloud < game.config.width * 5) {
      let cloud = this.add.sprite(
        rightmostCloud + Phaser.Math.Between(100, 350),
        Phaser.Math.Between(200, 400),
        'cloud'
      )
      this.cloudGroup.add(cloud)
      if (Phaser.Math.Between(0, 1)) {
        cloud.setDepth(1)
      }
      cloud.setOrigin(0.2, 0.5)
      this.addClouds()
    }
  }
  addMountains() {
    let rightmostMountain = this.getRightmostMountain()
    if (rightmostMountain < game.config.width * 2) {
      let mountain = this.add.sprite(
        rightmostMountain + Phaser.Math.Between(0, 350),
        game.config.height + Phaser.Math.Between(0, 100),
        'mountain'
      )
      mountain.setOrigin(0.07, 1)
      this.mountainGroup.add(mountain)
      if (Phaser.Math.Between(0, 1)) {
        mountain.setDepth(1)
      }
      mountain.setFrame(Phaser.Math.Between(0, 3))
      this.addMountains()
    }
  }
  getRightmostMountain() {
    let rightmostMountain = -200
    this.mountainGroup.getChildren().forEach(function (mountain) {
      rightmostMountain = Math.max(rightmostMountain, mountain.x)
    })
    return rightmostMountain
  }
  placeCoin() {
    this.coin.x = Phaser.Math.Between(
      this.platforms[this.mainPlatform].getBounds().right + 10,
      this.platforms[1 - this.mainPlatform].getBounds().left - 10
    )
    this.coin.visible = true
  }
  tweenPlatform() {
    let destination =
      this.platforms[this.mainPlatform].displayWidth +
      Phaser.Math.Between(
        gameOptions.platformGapRange[0],
        gameOptions.platformGapRange[1]
      )
    let size = Phaser.Math.Between(
      gameOptions.platformWidthRange[0],
      gameOptions.platformWidthRange[1]
    )
    this.tweens.add({
      targets: [this.platforms[1 - this.mainPlatform]],
      x: destination,
      displayWidth: size,
      duration: gameOptions.scrollTime,
      callbackScope: this,
      onComplete: function () {
        this.gameMode = WAITING
        this.placeCoin()
      }
    })
  }
  addPlayer() {
    this.player = this.add.sprite(
      this.platforms[this.mainPlatform].displayWidth - gameOptions.poleWidth,
      game.config.height - gameOptions.platformHeight,
      'player'
    )
    this.player.setOrigin(1, 1)
  }
  addPole() {
    this.pole = this.add.sprite(
      this.platforms[this.mainPlatform].displayWidth,
      game.config.height - gameOptions.platformHeight,
      'bridge'
    )
    this.pole.setOrigin(1, 1)
    this.pole.displayWidth = gameOptions.poleWidth
    this.pole.displayHeight = gameOptions.playerHeight / 4
  }
  getRightmostCloud() {
    let rightmostCloud = -200
    this.cloudGroup.getChildren().forEach(function (cloud) {
      rightmostCloud = Math.max(rightmostCloud, cloud.x)
    })
    return rightmostCloud
  }
  grow() {
    if (this.gameMode == WAITING) {
      this.gameMode = GROWING
      this.growTween = this.tweens.add({
        targets: [this.pole],
        displayHeight:
          gameOptions.platformGapRange[1] + gameOptions.platformWidthRange[1],
        duration: gameOptions.growTime
      })
    }
    if (this.gameMode == WALKING) {
      if (this.player.flipY) {
        this.player.flipY = false
        this.player.y = game.config.height - gameOptions.platformHeight
      } else {
        this.player.flipY = true
        this.player.y =
          game.config.height -
          gameOptions.platformHeight +
          gameOptions.playerHeight -
          gameOptions.poleWidth -
          10
        let playerBound = this.player.getBounds()
        let platformBound = this.platforms[1 - this.mainPlatform].getBounds()
        if (
          Phaser.Geom.Rectangle.Intersection(playerBound, platformBound)
            .width != 0
        ) {
          this.player.flipY = false
          this.player.y = game.config.height - gameOptions.platformHeight
        }
      }
    }
  }
  stop() {
    if (this.gameMode == GROWING) {
      this.gameMode = IDLE
      this.growTween.stop()
      if (
        this.pole.displayHeight >
        this.platforms[1 - this.mainPlatform].x - this.pole.x
      ) {
        this.tweens.add({
          targets: [this.pole],
          angle: 90,
          duration: gameOptions.rotateTime,
          ease: 'Bounce.easeOut',
          callbackScope: this,
          onComplete: function () {
            this.gameMode = WALKING
            if (
              this.pole.displayHeight <
              this.platforms[1 - this.mainPlatform].x +
                this.platforms[1 - this.mainPlatform].displayWidth -
                this.pole.x
            ) {
              this.walkTween = this.tweens.add({
                targets: [this.player],
                x:
                  this.platforms[1 - this.mainPlatform].x +
                  this.platforms[1 - this.mainPlatform].displayWidth -
                  this.pole.displayWidth,
                duration: gameOptions.walkTime * this.pole.displayHeight,
                callbackScope: this,
                onComplete: function () {
                  this.coin.visible = false
                  this.tweens.add({
                    targets: [
                      this.player,
                      this.pole,
                      this.platforms[1 - this.mainPlatform],
                      this.platforms[this.mainPlatform]
                    ],
                    props: {
                      x: {
                        value: '-= ' + this.platforms[1 - this.mainPlatform].x
                      }
                    },
                    duration: gameOptions.scrollTime,
                    callbackScope: this,
                    onComplete: function () {
                      this.prepareNextMove()
                    }
                  })
                }
              })
            } else {
              //ponte superior ao tamanho do 2 pilar
              this.fallAndDie()
            }
          }
        })
      } else {
        this.platformTooShort()
      }
    }
  }
  platformTooShort() {
    this.tweens.add({
      targets: [this.pole],
      angle: 90,
      duration: gameOptions.rotateTime,
      ease: 'Cubic.easeIn',
      callbackScope: this,
      onComplete: function () {
        this.gameMode = WALKING
        this.tweens.add({
          targets: [this.player],
          x: this.pole.x + this.pole.displayHeight,
          duration: gameOptions.walkTime * this.pole.displayHeight,
          callbackScope: this,
          onComplete: function () {
            this.tweens.add({
              targets: [this.pole],
              angle: 180,
              duration: gameOptions.rotateTime,
              ease: 'Cubic.easeIn'
            })
            this.fallAndDie()
          }
        })
      }
    })
  }
  fallAndDie() {
    this.gameMode = IDLE
    this.tweens.add({
      targets: [this.player],
      y: game.config.height + this.player.displayHeight * 2,
      duration: gameOptions.fallTime,
      ease: 'Cubic.easeIn',
      callbackScope: this,
      onComplete: function () {
        this.shakeAndRestart()
      }
    })
  }
  prepareNextMove() {
    this.player.anims.stop()

    this.gameMode = IDLE
    this.platforms[this.mainPlatform].x = game.config.width
    this.mainPlatform = 1 - this.mainPlatform
    this.tweenPlatform()
    this.pole.angle = 0
    this.pole.x = this.platforms[this.mainPlatform].displayWidth
    this.pole.displayHeight = gameOptions.poleWidth
  }
  shakeAndRestart() {
    this.cameras.main.shake(400, 0.008)
    this.time.addEvent({
      delay: 800,
      callbackScope: this,
      callback: function () {
        this.scene.start('PlayGame')
      }
    })
  }
  update() {
    if (this.player.flipY) {
      let playerBound = this.player.getBounds()
      let coinBound = this.coin.getBounds()
      let platformBound = this.platforms[1 - this.mainPlatform].getBounds()
      if (
        Phaser.Geom.Rectangle.Intersection(playerBound, platformBound).width !=
        0
      ) {
        this.walkTween.stop()
        this.gameMode = IDLE
        this.shakeAndRestart()
      }
      if (
        this.coin.visible &&
        Phaser.Geom.Rectangle.Intersection(playerBound, coinBound).width != 0
      ) {
        let emitter = this.particles.createEmitter({
          speed: 65,
          frequency: 25,
          scale: { start: 1, end: 0 },
          blendMode: 'ADD'
        })
        emitter.setAlpha(0.4, 0.6)
        emitter.setScale(0.4, 0.6, 0.4, 0.6)
        emitter.x.propertyValue = this.coin.x
        emitter.y.propertyValue = this.coin.y

        setTimeout(() => {
          emitter.stop()
        }, 250)

        this.coin.visible = false
      }
    }
  }
}
function resize() {
  let canvas = document.querySelector('canvas')
  let windowWidth = window.innerWidth
  let windowHeight = window.innerHeight
  let windowRatio = windowWidth / windowHeight
  let gameRatio = game.config.width / game.config.height
  if (windowRatio < gameRatio) {
    canvas.style.width = windowWidth + 'px'
    canvas.style.height = windowWidth / gameRatio + 'px'
  } else {
    canvas.style.width = windowHeight * gameRatio + 'px'
    canvas.style.height = windowHeight + 'px'
  }
}

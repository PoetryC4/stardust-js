import {ParticleApp} from "../scripts/particle.js";
import {PIXI_FILTERS, reverseEaseIn, reverseEaseOut} from "../scripts/basic_value.js";

export const fireworkInit = async () => {
    const particleApp = new ParticleApp()
    await particleApp.init("hello_view", {
        background: 0x000000,
        forceCanvas: true
    })
    const fireworkCenterEmitter = await particleApp.addEmitter("fireworkCenterEmitter", {
        type: "rectangle",
        emitterArea: {leftTop: {x: 200, y: 200}, rightBottom: {x: 900, y: 700}},
        particlesPerSecond: 0.3,
        particleBirthChance: 0.6
    })
    const positionTurbulence = particleApp.getMotionEffect().applyPositionTurbulence(1, 20)
    const gravityMotion = particleApp.getMotionEffect().applyOneAcceleration(-Math.PI / 2, 1)
    const flickerFunc = particleApp.getParticleUtils().createFlickerCurve(1)
    const flickerOpacity = (options, lifeRatio, delta) => {
        options.compositeOpacity = flickerFunc(lifeRatio)
    }
    fireworkCenterEmitter.addParticleEmit("fireworkStart", {
        particleType: "circle",
        size: 3,
        speedRange: [0.6, 0.9],
        directionRange: [2 * Math.PI, 2 * Math.PI],
        particleLifeRange: [120, 200],
        scaleRange: [0.3, 0.6],
        opacityRange: [0, 0],
        zIndex: 1,
        colorOption: {type: "hsbRange", value: {hue: [10, 70], saturation: [0.6, 0.6], brightness: [0.963, 0.973]}}
    })
    fireworkCenterEmitter.addParticleEmit("fireworkStart2", {
        particleType: "circle",
        size: 3,
        speedRange: [0.6, 0.9],
        directionRange: [2 * Math.PI, 2 * Math.PI],
        particleLifeRange: [120, 200],
        scaleRange: [0.3, 0.6],
        opacityRange: [0, 0],
        zIndex: 1,
        colorOption: {type: "hsbRange", value: {hue: [10, 70], saturation: [0.6, 0.6], brightness: [0.963, 0.973]}}
    })
    const fireSparkEmitter = fireworkCenterEmitter.addAuxiliaryEmitter("fireSparkEmitter", "fireworkStart", {
        particlesPerSecond: 200,
        particleBirthChance: 1
    })
    fireSparkEmitter.addParticleEmit("fireSpark", {
            particleType: "circle",
            size: 10,
            speedRange: [1, 3.6],
            particleLifeRange: [3000, 3700],
            scaleRange: [0.9, 1.2],
            directionRange: [0, 2 * Math.PI],
            colorOption: {type: "hsbRange", value: {hue: [0, 360], saturation: [0.6, 0.7], brightness: [0.99, 0.99]}}
        },
        [easeInSize, easeOutSpeed, gravityMotion, positionTurbulence, fireSparkColorChange],
        [{type: PIXI_FILTERS.BLUR_FILTER, options: {strength: 1}},
            {
                type: PIXI_FILTERS.GLOW_FILTER,
                options: {distance: 15, outerStrength: 2}
            }],
        {
            size: 0.9,
            life: 0,
            speed: 0.5,
            color: 0.8,
        })
    const fireSpark2Emitter = fireworkCenterEmitter.addAuxiliaryEmitter("fireSpark2Emitter", "fireworkStart2", {
        particlesPerSecond: 900,
        particleBirthChance: 1,
        seed: 1213
    })
    fireSpark2Emitter.addParticleEmit("fireSpark2", {
            particleType: "circle",
            size: 8,
            speedRange: [1, 3.6],
            particleLifeRange: [3000, 3700],
            scaleRange: [0.7, 0.8],
            directionRange: [0, 2 * Math.PI],
            colorOption: {type: "hsbRange", value: {hue: [0, 360], saturation: [0.6, 0.7], brightness: [0.99, 0.99]}}
        },
        [easeInSize, easeOutSpeed, gravityMotion, flickerOpacity, fireSparkColorChange],
        [{type: PIXI_FILTERS.BLUR_FILTER, options: {strength: 1}},
            {
                type: PIXI_FILTERS.GLOW_FILTER,
                options: {distance: 12, outerStrength: 2, color: 0x000000}
            }],
        {
            size: 0.6,
            life: 0,
            speed: 0.5,
            color: 0.8,
        })
    const fireSparkTrailEmitter = fireSparkEmitter.addAuxiliaryEmitter("fireSparkTrailEmitter", "fireSpark", {
        particlesPerSecond: 6,
        particleBirthChance: 1
    })
    fireSparkTrailEmitter.addParticleEmit("fireSparkTrail", {
            particleType: "circle",
            size: 6,
            speedRange: [0.01, 0.01],
            particleLifeRange: [2500, 2600],
            scaleRange: [0.5, 0.7],
            directionRange: [0, 2 * Math.PI],
            colorOption: {type: "hsbRange", value: {hue: [0, 360], saturation: [0.6, 0.7], brightness: [0.99, 0.99]}},
        },
        [easeInSize, easeOutSpeed, gravityMotion, fireSparkColorChange],
        [{type: PIXI_FILTERS.BLUR_FILTER, options: {strength: 1}},
            {
                type: PIXI_FILTERS.GLOW_FILTER,
                options: {distance: 7, outerStrength: 2, color: 0x000000}
            }],
        {
            size: 0.99,
            life: 0,
            speed: 0.01,
            color: 0.96,
        })

    setTimeout(() => {
        fireworkCenterEmitter.setParticlePerSecond(0)
    }, 30000)
}

const easeInSize = (options, lifeRatio, delta) => {
    options.compositeScale = reverseEaseIn(lifeRatio)
}

const easeOutSpeed = (options, lifeRatio, delta) => {
    options.compositeSpeed = reverseEaseOut(lifeRatio)
}

const fireSparkColorChange = (options, lifeRatio, delta) => {
    options.filters = [{
        idx: 1, options: {
            color: options.color
        }
    }]
}

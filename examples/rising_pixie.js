import {ParticleApp} from "../scripts/particle.js";
import {easeOut, mountainCurve, PIXI_FILTERS, reverseEaseIn} from "../scripts/basic_value.js";

export const risingPixieInit = async () => {
    const particleApp = new ParticleApp()
    await particleApp.init("hello_view", {
        background: 0x000000,
        forceCanvas: true
    })
    const pixieEmitter = await particleApp.addEmitter("pixieEmitter", {
        type: "rectangle",
        emitterArea: {leftTop: {x: 0, y: 800}, rightBottom: {x: 1920, y: 800}},
        particlesPerSecond: 1
    })
    const twistMove1 = particleApp.getMotionEffect().applyTwistMove(5, 0.75)
    const twistMove2 = particleApp.getMotionEffect().applyTwistMove(5, 1, Math.PI * 5 / 6)
    pixieEmitter.addParticleEmit("twistParticle", {
        particleType: "circle",
        size: 10,
        speedRange: [2.2, 3.3],
        particleLifeRange: [3000, 3300],
        scaleRange: [0.8, 1.1],
        directionRange: [Math.PI * 3 / 2, Math.PI * 3 / 2],
        zIndex: 2,
        colorOption: {type: "hsbRange", value: {hue: [0, 360], saturation: [0.2, 0.2], brightness: [0.95, 0.95]}},
    }, [easeInSize, easeInOpacity, mountainGlow], [{
        type: PIXI_FILTERS.BLUR_FILTER,
        options: {strength: 2}
    }, {type: PIXI_FILTERS.GLOW_FILTER, options: {distance: 15, outerStrength: 2}}])
    const twistReplicaEmitter = pixieEmitter.addReplicaEmitter("twistReplicaEmitter", "twistParticle", {
        particleBirthChance: 1
    })
    twistReplicaEmitter.addParticleEmit("twistReplicaParticle", {
        particleType: "circle",
        size: 10,
        speedRange: [0.001, 0.001],
        particleLifeRange: [1500, 1500],
        scaleRange: [0.6, 0.6],
        rotationRange: [0, 2 * Math.PI],
        directionRange: [0, Math.PI],
        opacityRange: [0, 0],
        colorOption: {type: "hsbRange", value: {hue: [0, 360], saturation: [0.2, 0.2], brightness: [0.95, 0.95]}},
    }, [easeOutSize, twistMove1], [], {
        type: "line",
        replicaProperty: {
            count: 1, offset: 0, gap: 0
        },
        inheritOption: {
            size: 0,
            life: 1,
            speed: 1,
            color: 1,
        }
    })
    const AuxTwistEmitter = twistReplicaEmitter.addAuxiliaryEmitter("AuxTwistEmitter", "twistReplicaParticle", {
        particlesPerSecond: 16,
        particleBirthChance: 1
    })
    AuxTwistEmitter.addParticleEmit("twistAuxParticle", {
            particleType: "circle",
            size: 7,
            speedRange: [0, 0],
            particleLifeRange: [1500, 1500],
            scaleRange: [1, 1],
            rotationRange: [0, 2 * Math.PI],
            directionRange: [0, Math.PI],
            colorOption: {type: "hsbRange", value: {hue: [0, 360], saturation: [0.2, 0.2], brightness: [0.95, 0.95]}}
        },
        [easeOutSize, easeInOpacity, mountainGlow], [{
            type: PIXI_FILTERS.BLUR_FILTER,
            options: {strength: 1}
        }, {
            type: PIXI_FILTERS.GLOW_FILTER,
            options: {distance: 15, outerStrength: 2}
        }],
        {
            size: 0.7,
            life: 0,
            speed: 0.01,
            color: 1,
        })


    twistReplicaEmitter.addParticleEmit("twistReplicaParticle2", {
        particleType: "circle",
        size: 10,
        speedRange: [0.001, 0.001],
        particleLifeRange: [1500, 1500],
        scaleRange: [0.6, 0.6],
        rotationRange: [0, 2 * Math.PI],
        directionRange: [0, Math.PI],
        opacityRange: [0, 0],
        colorOption: {type: "hsbRange", value: {hue: [0, 360], saturation: [0.2, 0.2], brightness: [0.95, 0.95]}},
    }, [easeOutSize, twistMove2], [], {
        type: "line",
        replicaProperty: {
            count: 1, offset: 0, gap: 0
        },
        inheritOption: {
            size: 0,
            life: 1,
            speed: 1,
            color: 1,
        }
    })
    const AuxTwistEmitter2 = twistReplicaEmitter.addAuxiliaryEmitter("AuxTwistEmitter2", "twistReplicaParticle2", {
        particlesPerSecond: 16,
        particleBirthChance: 1
    })
    AuxTwistEmitter2.addParticleEmit("twistAuxParticle", {
            particleType: "circle",
            size: 7,
            speedRange: [0, 0],
            particleLifeRange: [1500, 1500],
            scaleRange: [1, 1],
            rotationRange: [0, 2 * Math.PI],
            directionRange: [0, Math.PI],
            colorOption: {type: "hsbRange", value: {hue: [0, 360], saturation: [0.2, 0.2], brightness: [0.95, 0.95]}},
        },
        [easeOutSize, easeInOpacity, mountainGlow], [{
            type: PIXI_FILTERS.BLUR_FILTER,
            options: {strength: 1}
        }, {
            type: PIXI_FILTERS.GLOW_FILTER,
            options: {distance: 15, outerStrength: 2}
        }],
        {
            size: 0.7,
            life: 0,
            speed: 0.01,
            color: 1,
        })


    setTimeout(() => {
        pixieEmitter.setParticlePerSecond(0)
    }, 30000)
}
const easeInSize = (options, lifeRatio, delta) => {
    options.compositeScale = reverseEaseIn(lifeRatio)
}
const easeOutSize = (options, lifeRatio, delta) => {
    options.compositeScale = easeOut(lifeRatio)
}

const easeInOpacity = (options, lifeRatio, delta) => {
    options.compositeOpacity = reverseEaseIn(lifeRatio)
}

const mountainGlow = (options, lifeRatio, delta) => {
    options.filters = [{
        idx: 1, options: {
            distance: 15 * mountainCurve(lifeRatio),
            outerStrength: 3 * mountainCurve(lifeRatio)
        }
    }]
}
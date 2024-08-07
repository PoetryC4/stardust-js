import {ParticleApp} from "../scripts/particle.js";
import {mountainCurve, PIXI_FILTERS} from "../scripts/basic_value.js";

export const starTrailsInit = async () => {
    const particleApp = new ParticleApp()
    await particleApp.init("hello_view", {
        background: 0x000000,
        forceCanvas: false
    })
    const starEmitter = await particleApp.addEmitter("starEmitter", {
        type: "ring",
        emitterArea: {x: 500, y: 280, innerRadius: 210, outerRadius: 300},
        particlesPerSecond: 0.3
    })
    const fixedRotation = particleApp.getMotionEffect().applyFixedRotation(500, 250)
        starEmitter.addParticleEmit("star", {
        particleType: "circle",
        size: 4,
        speedRange: [1, 1.2],
        particleLifeRange: [6000, 7000],
        scaleRange: [0.11, 0.11],
        zIndex: 2,
        opacityRange: [0, 0],
        colorOption: {type: "hsbRange", value: {hue: [30, 100], saturation: [0.2, 0.2], brightness: [0.99, 0.99]}},
    }, [mountainSize, fixedRotation], [{type: PIXI_FILTERS.BLUR_FILTER, options: {strength: 0.4}}])
    const starAuxEmitter = starEmitter.addAuxiliaryEmitter("starAuxEmitter", "star", {
        particlesPerSecond: 60,
        particleBirthChance: 1
    })
    starAuxEmitter.addParticleEmit("starTrails", {
            particleType: "circle",
            size: 40,
            speedRange: [0, 0],
            particleLifeRange: [5000, 5000],
            scaleRange: [0.6, 0.6],
            blendMode: "screen"
        },
        [mountainOpacity], [
            {type: PIXI_FILTERS.BLUR_FILTER, options: {strength: 2.3}},
            {
                type: PIXI_FILTERS.GLOW_FILTER,
                options: {distance: 15, outerStrength: 2}
            }],
        {
            size: 1,
            life: 0,
            speed: 0,
            color: 1,
        })

    setTimeout(() => {
        starEmitter.setParticlePerSecond(0)
    }, 30000)
}
const mountainSize = (options, lifeRatio, delta) => {
    options.compositeScale = mountainCurve(lifeRatio) / 2
}

const mountainOpacity = (options, lifeRatio, delta) => {
    options.compositeOpacity = mountainCurve(lifeRatio)
}

import {ParticleApp} from "../scripts/particle.js";
import {PIXI_FILTERS, reverseEaseOut} from "../scripts/basic_value.js";
import {BlurFilter} from "pixi.js";

export const clickEffectInit = async () => {
    const particleApp = new ParticleApp()
    await particleApp.init("hello_view", {
        background: 0x000000,
        forceCanvas: true
    })
    const clickEmitter = await particleApp.addEventEmitter("clickEmitter", {
        particlesPerSecond: 3,
        maxParticles: 10
    })
    const blackHoleStrengthFunc = particleApp.getParticleUtils().createMultiCurveFunc([[0, 0], [0.25, 0.1], [0.35, 0.9], [1, 1]])
    const blackHoleMotion = particleApp.getMotionEffect().applyBlackHoleGravity(100, 100, 0.02, blackHoleStrengthFunc)
    clickEmitter.addParticleEmit("clickParticle", {
        particleType: "circle",
        size: 7,
        speedRange: [1.7, 2],
        particleLifeRange: [3000, 4000],
        scaleRange: [0.8, 1.1],
        directionRange: [0, 2 * Math.PI],
        zIndex: 1,
        colorOption: {type: "hsbRange", value: {hue: [0, 360], saturation: [0.2, 0.2], brightness: [0.95, 0.95]}},
    }, [easeOutSize, blackHoleMotion], [{type: PIXI_FILTERS.BLUR_FILTER, options: {strength: 0.4}}], "click")
    const clickAuxEmitter = clickEmitter.addAuxiliaryEmitter("clickAuxEmitter", "clickParticle", {
        particlesPerSecond: 20,
        particleBirthChance: 1
    })
    clickAuxEmitter.addParticleEmit("auxClickParticle", {
            particleType: "circle",
            size: 10,
            speedRange: [0, 0],
            particleLifeRange: [1500, 1500],
            scaleRange: [0.6, 0.6],
            directionRange: [0, 2 * Math.PI],
        },
        [easeOutSize],
        [{type: PIXI_FILTERS.BLUR_FILTER, options: {strength: 0.4}}],
        {
            size: 0,
            life: 0,
            speed: 0.3,
            color: 1,
        })
}

const easeOutSize = (options, lifeRatio, delta) => {
    options.compositeScale = reverseEaseOut(lifeRatio)
}

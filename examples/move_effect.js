import {ParticleApp} from "../scripts/particle.js";
import {PIXI_FILTERS, reverseEaseOut} from "../scripts/basic_value.js";

export const movingEffectInit = async () => {
    const particleApp = new ParticleApp()
    await particleApp.init("hello_view", {
        background: 0x000000,
        forceCanvas: true
    })
    const moveEmitter = await particleApp.addEventEmitter("moveEmitter", {
        particlesPerSecond: 1,
        maxParticles: 150
    })
    const gravityMotion = particleApp.getMotionEffect().applyOneAcceleration(-Math.PI / 2, 9.8)
    moveEmitter.addParticleEmit("moveParticle", {
        particleType: "cloud",
        size: 5,
        speedRange: [1, 1.2],
        particleLifeRange: [3000, 4000],
        scaleRange: [0.8, 1.1],
        directionRange: [Math.PI * 5 / 4, Math.PI * 7 / 4],
        zIndex: 1,
        colorOption: {
            type: "timeFunc", value: () => {
                const hue = Date.now() / 6 % 360
                return particleApp.getParticleUtils().hsbToHex(hue, 0.2, 0.95)
            }
        },
    }, [easeOutSize, gravityMotion], [{type: PIXI_FILTERS.BLUR_FILTER, options: {strength: 0.4}}], "mousemove")
}

const easeOutSize = (options, lifeRatio, delta) => {
    options.compositeScale = reverseEaseOut(lifeRatio)
}



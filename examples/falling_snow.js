import {ParticleApp} from "../scripts/particle.js";

export const fallingSnowflakeInit = async () => {
    const particleApp = new ParticleApp()
    await particleApp.init("hello_view", {
        background: 0x000000,
        forceCanvas: true
    })
    const gravityMotion = particleApp.getMotionEffect().applyOneAcceleration(-Math.PI / 2, 0.7)
    const mouseRepel = particleApp.getMotionEffect().applyMouseRepel(300, 0.08)
    const snowEmitter = await particleApp.addEmitter("snowEmitter", {
        type: "rectangle",
        emitterArea: {leftTop: {x: 0, y: 0}, rightBottom: {x: 1920, y: 0}},
        particlesPerSecond: 10
    })
    snowEmitter.addParticleEmit("snowflake", {
        particleType: "sprite",
        sprite_texture: "./assets/snowflake.png",
        size: 1,
        speedRange: [2, 3],
        particleLifeRange: [10000, 12000],
        scaleRange: [0.2, 0.33],
        rotationRange: [0, 2 * Math.PI],
        rotationSpeedRange: [-Math.PI / 300, Math.PI / 300],
        directionRange: [Math.PI * 5 / 8, Math.PI * 7 / 8]
    }, [gravityMotion, mouseRepel])
    setTimeout(() => {
        snowEmitter.setParticlePerSecond(0)
    }, 30000)
}
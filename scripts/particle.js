import * as PIXI from 'pixi.js';

class Particle {
    constructor(...args) {
        this.functionArray = []
    }

    getParticle() {
        return this.particle_
    }

    async init(options, randomGenerator, particleUtils) {
        this.propertiesToSync = {
            speed: "speed",
            position: {
                x: "x",
                y: "y"
            },
            life: "life",
            scale: {
                x: "x",
                y: "y"
            },
            opacity: "alpha",
            direction: "direction",
            rotation: "rotation",
            mask: "mask",
            anchor: "anchor",
            filters: "filters",
        }
        this.particleUtils = particleUtils
        this.createTime = this.particleUtils.getTimestamp()

        if (options?.particleType === "sprite") {
            const texture = await PIXI.Assets.load(options?.sprite_texture)
            this.particle_ = new PIXI.Sprite(texture)
            this.particle_.width = texture.orig.width * (options?.size ?? 50) / 50
            this.particle_.height = texture.orig.height * (options?.size ?? 50) / 50
            // 锚点
            this.particle_.anchor.set(options?.anchor ?? 0.5)
        } else if (options?.particleType === "square") {
            this.particle_ = this.createBasicPattern_(options, "square")
        } else if (options?.particleType === "circle") {
            this.particle_ = this.createBasicPattern_(options, "circle")
        } else if (options?.particleType === "polyfill") {
            this.particle_ = this.createBasicPattern_(options, "polyfill")
        } else if (options?.particleType === "polygon") {
            this.particle_ = this.createBasicPattern_(options, "polygon")
        } else if (options?.particleType === "cloud") {
            this.particle_ = this.createBasicPattern_(options, "cloud")
        } else {
            console.error(`invalid particleType: ${options?.particleType}`)
        }
        // 颜色(非sprite才有)
        this.color = options?.color ?? 0xFFFFFF
        // 大小
        this.size = options?.size ?? 50
        // 生命(毫秒)
        this.life = options?.life ?? 3000
        // 位置
        this.particle_.position.x = options?.position?.x ?? 0
        this.particle_.position.y = options?.position?.y ?? 0
        // 放缩
        this.particle_.scale.x = options?.scale?.x ?? 1
        this.particle_.scale.y = options?.scale?.y ?? 1
        // 不透明度
        this.particle_.alpha = options?.opacity ?? 1
        // 速度大小
        this.particle_.speed = options?.speed ?? 10
        // 速度方向
        this.particle_.direction = options?.direction ?? 0
        // 图层
        this.particle_.zIndex = options?.zIndex ?? 1
        // 旋转
        this.particle_.rotation = options?.rotation ?? 0
        // 旋转速度
        this.rotationSpeed = options?.rotationSpeed ?? 0
        // 叠加方式
        this.particle_.blendMode = options?.blendMode ?? "normal"
        // 遮罩(mask)
        if (options?.mask != undefined) {
            this.particle_.mask = this.createBasicPattern_(options?.mask, options?.mask?.particleType)
        }
        // 滤镜
        if (Array.isArray(options?.filters)) {
            this.particle_.filters = options?.filters;
        }
        this.extraInfo = {}
        this.originalOptions = {...options, ...this.getCurrentState()}
    }

    setAnimationProperty_(options) {
        if (options?.direction || options?.direction === 0) {
            this.particle_.direction = options?.direction
        }
        if (options?.turnSpeed || options?.turnSpeed === 0) {
            this.particle_.turnSpeed = options?.turnSpeed
        }
        if (options?.compositeSpeed || options?.compositeSpeed === 0) {
            this.particle_.speed = (this.originalOptions?.speed ?? 10) * options.compositeSpeed
        }
        if (options?.rotation || options?.rotation === 0) {
            this.particle_.rotation = options?.rotation
        }
        if (options?.position?.x || options?.position?.x === 0) {
            this.particle_.position.x = options?.position.x
        }
        if (options?.position?.y || options?.position?.y === 0) {
            this.particle_.position.y = options?.position.y
        }
        if (options?.rotation || options?.rotation === 0) {
            this.particle_.rotation = options?.rotation
        }
        if (options?.compositeScale || options?.compositeScale === 0) {
            this.particle_.scale.x = (this.originalOptions?.scale?.x ?? 1) * options.compositeScale
            this.particle_.scale.y = (this.originalOptions?.scale?.y ?? 1) * options.compositeScale
        }
        if (options?.compositeOpacity || options?.compositeOpacity === 0) {
            this.particle_.alpha = (this.originalOptions?.opacity ?? 1) * options?.compositeOpacity
        }
        if (options?.filters && typeof options?.filters === 'object') {
            // 第idx个filter的options改为options
            if (Array.isArray(options?.filters)) {
                for (const newFilterChange of options.filters) {
                    if (newFilterChange.idx >= this.particle_.filters.length) {
                        continue
                    }
                    for (const key in newFilterChange.options) {
                        this.particle_.filters[newFilterChange.idx][key] = newFilterChange.options[key]
                    }
                }
            } else {
                if (newFilterChange.idx < this.particle_.filters.length) {
                    for (const key in options?.filters) {
                        this.particle_.filters[options?.filters.idx][key] = options?.filters.options[key]
                    }
                }
            }
        }
        // 额外信息, 一般用作标记
        if (options?.extraInfo && typeof options.extraInfo === 'object' && !Array.isArray(options.extraInfo)) {
            this.extraInfo = {...this.extraInfo, ...options.extraInfo}
        }
    }

    // 返回值表示该粒子是否还存活
    doAnimate(delta) {
        const newOptions = this.getCurrentState()
        const lifeRatio = (this.particleUtils.getTimestamp() - this.createTime) / this.life
        if (lifeRatio > 1) {
            return false
        }
        for (const functionArrayElement of this.functionArray) {
            functionArrayElement(newOptions, lifeRatio, delta)
        }
        this.setAnimationProperty_(newOptions)
        return true
    }

    addPropertyFunction(TransFunc) {
        this.functionArray.push(TransFunc)
    }

    getCurrentState() {
        const tmpOption = {}
        for (const key in this.propertiesToSync) {
            if (typeof this.propertiesToSync[key] === 'object') {
                tmpOption[key] = {}
                for (const key2 in this.propertiesToSync[key]) {
                    tmpOption[key][key2] = this.particle_[key][this.propertiesToSync[key][key2]]
                }
            } else {
                tmpOption[key] = this.particle_[this.propertiesToSync[key]]
            }
        }
        tmpOption.rotationSpeed = this.rotationSpeed
        tmpOption.size = this.size
        tmpOption.life = this.life
        tmpOption.color = this.color
        tmpOption.extraInfo = this.extraInfo ?? {}
        return tmpOption
    }


    createBasicPattern_(options, patternType) {
        const pattern = new PIXI.Graphics();
        // 描边
        pattern.setStrokeStyle(options?.strokeWidth ?? 0, options?.strokeColor ?? 0x000000)
        if (patternType === "square") {
            const size = options?.size ?? 100
            pattern.rect(-size / 2, -size / 2, size, size);
        } else if (patternType === "circle") {
            pattern.circle(0, 0, options?.size ?? 50)
        } else if (patternType === "polyfill") {
            const centerX = 0, centerY = 0;
            const points = Math.max(3, options?.points ?? 3)
            const radius = options?.size ?? 100

            let angle = 2 * Math.PI / points;
            // 绘制弧线
            if (options?.curveFactor != undefined) {
                const curveFactor = options?.curveFactor ?? 1
                const pointsPosition = [];
                for (let i = 0; i < points; i++) {
                    const x = centerX + radius * Math.cos(i * angle);
                    const y = centerY + radius * Math.sin(i * angle);
                    pointsPosition.push({x, y});
                }
                for (let i = 0; i < points; i++) {
                    const start = pointsPosition[i];
                    const end = pointsPosition[(i + 1) % points];
                    const midX = (start.x + end.x) / 2;
                    const midY = (start.y + end.y) / 2;
                    const controlX = centerX + (midX - centerX) * curveFactor;
                    const controlY = centerY + (midY - centerY) * curveFactor;

                    pattern.moveTo(start.x, start.y);
                    pattern.quadraticCurveTo(controlX, controlY, end.x, end.y);
                }
            }
            pattern.moveTo(centerX + radius * Math.cos(0), centerY - radius * Math.sin(0));

            for (let i = 1; i <= points; i++) {
                let x = centerX + radius * Math.cos(i * angle);
                let y = centerY - radius * Math.sin(i * angle);
                pattern.lineTo(x, y);
            }
            pattern.closePath();
        } else if (patternType === "polygon") {
            const centerX = 0, centerY = 0;
            const points = Math.max(3, options?.points ?? 3)
            const size = options?.size ?? 50
            const outerRadius = (options?.outerRadius ?? 2) * size
            const innerRadius = (options?.innerRadius ?? 1) * size

            let angle = Math.PI / points;
            // 绘制弧线
            if (options?.curveFactor != undefined) {
                const curveFactor = options?.curveFactor ?? 1
                const pointsPosition = [];
                for (let i = 1; i <= 2 * points; i++) {
                    let radius = i % 2 === 0 ? outerRadius : innerRadius;
                    const x = centerX + radius * Math.cos(i * angle);
                    const y = centerY + radius * Math.sin(i * angle);
                    pointsPosition.push({x, y});
                }
                for (let i = 0; i < 2 * points; i++) {
                    const start = pointsPosition[i];
                    const end = pointsPosition[(i + 1) % (2 * points)];
                    const midX = (start.x + end.x) / 2;
                    const midY = (start.y + end.y) / 2;
                    const controlX = centerX + (midX - centerX) * curveFactor;
                    const controlY = centerY + (midY - centerY) * curveFactor;

                    pattern.moveTo(start.x, start.y);
                    pattern.quadraticCurveTo(controlX, controlY, end.x, end.y);
                }
            }
            pattern.moveTo(centerX + outerRadius * Math.cos(0), centerY - outerRadius * Math.sin(0));

            for (let i = 1; i <= 2 * points; i++) {
                let radius = i % 2 === 0 ? outerRadius : innerRadius;
                let x = centerX + radius * Math.cos(i * angle);
                let y = centerY - radius * Math.sin(i * angle);
                pattern.lineTo(x, y);
            }

            pattern.closePath();
        } else if (patternType === "cloud") {
            const size = options?.size ?? 100
            const randomAngle = this.particleUtils.getRandomNumberBetween(0, 2 * Math.PI)
            // 绘制云朵的各个部分
            for (let i = 0; i < 3; i++) {
                pattern.circle(size * Math.cos(i * Math.PI * 2 / 3 + randomAngle) * 0.7, size * Math.sin(i * Math.PI * 2 / 3 + randomAngle) * 0.5, size * (0.5 + this.particleUtils.getRandomNumberBetween(0.7, 1)));
            }
            pattern.ellipse(0, 0, size * 1.1, size * 0.7);
        } else {
            console.error("patternType must be in ['square', 'circle', 'polyfill', 'polygon']")
            return null
        }
        // 颜色(pixijs不支持渐变色)
        pattern.fill(options?.color ?? 0x000000);
        return pattern
    }
}

class ParticleEmitter {
    constructor(...args) {
    }

    init(pixiApp, options, randomGenerator, particleUtils) {
        // TODO 支持预渲染x秒
        // 发射器类型，支持point, rectangle, circle, ring
        this.type = options?.type || "point"
        // point: {x: x, y: y}
        // rectangle: {leftTop: {x: x, y: y}, rightBottom: {x: x, y: y}}
        // circle: {x: x, y: y, radius: radius}
        // ring: {x: x, y: y, innerRadius: innerRadius, outerRadius: outerRadius}
        this.emitterArea = options?.emitterArea ?? {x: 0, y: 0}
        this.commonInit(pixiApp, options, randomGenerator, particleUtils)
    }

    commonInit(pixiApp, options, randomGenerator, particleUtils) {
        this.pixiApp = pixiApp
        this.randomGenerator = randomGenerator
        this.particleUtils = particleUtils
        this.particlesPerSecond = options?.particlesPerSecond ?? 100
        this.particleBirthChance = options?.particleBirthChance ?? 1  // 0 ~ 1
        this.particleEmits = {}
        this.particleAuxiliaryEmitters = {}
        this.particleReplicaEmitters = {}
        this.pushParticleDelay = 15 // 延迟一段时间后才把粒子添加到数组, 保证粒子属性初始化, 单位ms
        if (options?.fps) {
            this.fps = options?.fps

            this.pixiApp.ticker.maxFPS = this.fps;
            this.pixiApp.ticker.minFPS = Math.min(this.pixiApp.ticker.minFPS, this.fps);
        }
        this.tickerFunc = (time) => {
            for (const particleName in this.particleEmits) {
                for (let i = 0; i < this.particleEmits[particleName].particles.length;) {
                    if (!this.particleEmits[particleName].particles[i].doAnimate(time.deltaTime)) {
                        // console.log("移除粒子", this.particleEmits[particleName].options)
                        // 生命到期了, 就可以结束了
                        this.pixiApp.stage.removeChild(this.particleEmits[particleName].particles[i].getParticle())
                        this.particleEmits[particleName].particles[i].getParticle().destroy()
                        this.particleEmits[particleName].particles.splice(i, 1)
                    } else {
                        i++;
                    }
                }
            }
        }
        // 解决fps过小无法正常生效的问题
        if (options?.fps && this.fps < 10) {
            let lastTime = Date.now();
            const interval = 1000 / this.fps;
            this.pixiApp.ticker.add((time) => {
                const currentTime = Date.now();
                if (currentTime - lastTime >= interval) {
                    this.tickerFunc({deltaTime: 60 / this.fps})
                    lastTime = currentTime;
                }
            });
        } else {
            this.pixiApp.ticker.add(this.tickerFunc);
        }
    }

    async addParticleEmit(particleId, particleOptions, particlePropertyFunction, particleFilters) {
        this.particleEmits[particleId] = {signalEnd: false, options: particleOptions, particles: []}
        while (!this.particleEmits[particleId].signalEnd) {
            if (this.particlesPerSecond === 0) {
                await this.particleUtils.sleep(10)
                continue
            }
            if (this.randomGenerator.nextFloat() < this.particleBirthChance) {
                const newParticleOptions = this.particleUtils.deepClone(particleOptions)
                newParticleOptions.position = this.getBirthPosition()
                const newParticle = await this.addParticleEmitCommon(newParticleOptions, particlePropertyFunction, particleFilters)
                // 保证上面添加的变化函数在初始时就起作用
                newParticle.doAnimate(0.01)
                this.pixiApp.stage.addChild(newParticle.getParticle())
                setTimeout(() => {
                    this.particleEmits[particleId].particles.push(newParticle)
                }, this.pushParticleDelay)
            }
            await this.particleUtils.sleep(1000 / this.particlesPerSecond)
        }
    }

    async addParticleEmitCommon(newParticleOptions, particlePropertyFunction, particleFilters) {
        const speedRange = newParticleOptions?.speedRange ?? [10, 10]
        const directionRange = newParticleOptions?.directionRange ?? [0, 0]
        const particleLifeRange = newParticleOptions?.particleLifeRange ?? [3, 3]
        const scaleRange = newParticleOptions?.scaleRange ?? [1, 1]
        const rotationRange = newParticleOptions?.rotationRange ?? [0, 0]
        const rotationSpeedRange = newParticleOptions?.rotationSpeedRange ?? [0, 0]
        const opacityRange = newParticleOptions?.opacityRange ?? [1, 1]
        const colorOption = newParticleOptions?.colorOption ?? {type: "fixed", value: 0xFFFFFF}
        const isScaleSeparate = !!newParticleOptions?.scaleSeparate
        newParticleOptions.life = this.particleUtils.getRandomNumberBetween(particleLifeRange[0], particleLifeRange[1])
        newParticleOptions.speed = this.particleUtils.getRandomNumberBetween(speedRange[0], speedRange[1])
        newParticleOptions.direction = this.particleUtils.getRandomNumberBetween(directionRange[0], directionRange[1])
        newParticleOptions.rotation = this.particleUtils.getRandomNumberBetween(rotationRange[0], rotationRange[1])
        newParticleOptions.rotationSpeed = this.particleUtils.getRandomNumberBetween(rotationSpeedRange[0], rotationSpeedRange[1])
        newParticleOptions.opacity = this.particleUtils.getRandomNumberBetween(opacityRange[0], opacityRange[1])
        newParticleOptions.color = this.getParticleColor(colorOption)
        if (!isScaleSeparate) {
            const scale = this.particleUtils.getRandomNumberBetween(scaleRange[0], scaleRange[1])
            newParticleOptions.scale = {
                x: scale,
                y: scale
            }
        } else {
            newParticleOptions.scale = {
                x: this.particleUtils.getRandomNumberBetween(scaleRange[0], scaleRange[1]),
                y: this.particleUtils.getRandomNumberBetween(scaleRange[0], scaleRange[1])
            }
        }
        // console.log带有一定的延迟问题, 这里的life等属性点开看是undefined, 但是是有值的
        // console.log("添加了粒子", newParticleOptions)
        const newParticle = new Particle()
        // 添加自定义属性修改函数
        // 比如透明度随时间变化，又比如做抛物运动的特殊曲线
        if (Array.isArray(particlePropertyFunction)) {
            for (const func of particlePropertyFunction) {
                newParticle.addPropertyFunction(func)
            }
        }
        if (Array.isArray(particleFilters)) {
            newParticleOptions.filters = []
            for (const filter of particleFilters) {
                const filterInstance = this.particleUtils.newFilter(filter.type, filter.options)
                newParticleOptions.filters.push(filterInstance)
            }
        }
        newParticle.addPropertyFunction(this.particleUtils.manualMoveGraphics)
        if (newParticleOptions.rotationSpeed !== 0) {
            newParticle.addPropertyFunction(this.particleUtils.manualRotateParticle)
        }
        await newParticle.init(newParticleOptions, this.randomGenerator, this.particleUtils)
        return newParticle
    }

    async addParticleEmitInheritCommon(newParticleOptions, particlePropertyFunction, particleFilters, parentParticleOptions, inheritOption) {
        const speedRange = newParticleOptions?.speedRange ?? [10, 10]
        const directionRange = newParticleOptions?.directionRange ?? [0, 0]
        const particleLifeRange = newParticleOptions?.particleLifeRange ?? [3, 3]
        const scaleRange = newParticleOptions?.scaleRange ?? [1, 1]
        const rotationRange = newParticleOptions?.rotationRange ?? [0, 0]
        const rotationSpeedRange = newParticleOptions?.rotationSpeedRange ?? [0, 0]
        const opacityRange = newParticleOptions?.opacityRange ?? [1, 1]
        const colorOption = newParticleOptions?.colorOption ?? {type: "fixed", value: 0xFFFFFF}
        const isScaleSeparate = !!newParticleOptions?.scaleSeparate
        newParticleOptions.life = this.particleUtils.mixTwoNumbers(this.particleUtils.getRandomNumberBetween(particleLifeRange[0], particleLifeRange[1]), parentParticleOptions.life, inheritOption.life)
        newParticleOptions.speed = this.particleUtils.mixTwoNumbers(this.particleUtils.getRandomNumberBetween(speedRange[0], speedRange[1]), parentParticleOptions.speed, inheritOption.speed)
        newParticleOptions.direction = this.particleUtils.mixTwoNumbers(this.particleUtils.getRandomNumberBetween(directionRange[0], directionRange[1]), parentParticleOptions.direction, inheritOption.speed)
        newParticleOptions.rotation = this.particleUtils.getRandomNumberBetween(rotationRange[0], rotationRange[1])
        newParticleOptions.rotationSpeed = this.particleUtils.getRandomNumberBetween(rotationSpeedRange[0], rotationSpeedRange[1])
        newParticleOptions.color = this.getParticleColor(colorOption, inheritOption, parentParticleOptions)
        newParticleOptions.opacity = this.particleUtils.getRandomNumberBetween(opacityRange[0], opacityRange[1])
        if (!isScaleSeparate) {
            const scale = this.particleUtils.mixTwoNumbers(this.particleUtils.getRandomNumberBetween(scaleRange[0], scaleRange[1]), parentParticleOptions.scale.x, inheritOption.size)
            newParticleOptions.scale = {
                x: scale,
                y: scale
            }
        } else {
            newParticleOptions.scale = {
                x: this.particleUtils.mixTwoNumbers(this.particleUtils.getRandomNumberBetween(scaleRange[0], scaleRange[1]), parentParticleOptions.scale.x, inheritOption.size),
                y: this.particleUtils.mixTwoNumbers(this.particleUtils.getRandomNumberBetween(scaleRange[0], scaleRange[1]), parentParticleOptions.scale.y, inheritOption.size)
            }
        }
        // console.log带有一定的延迟问题, 这里的life等属性点开看是undefined, 但是是有值的
        // console.log("添加了粒子", newParticleOptions)
        const newParticle = new Particle()
        // 添加自定义属性修改函数
        // 比如透明度随时间变化，又比如做抛物运动的特殊曲线
        if (Array.isArray(particlePropertyFunction)) {
            for (const func of particlePropertyFunction) {
                newParticle.addPropertyFunction(func)
            }
        }
        if (Array.isArray(particleFilters)) {
            newParticleOptions.filters = []
            for (const filter of particleFilters) {
                const filterInstance = this.particleUtils.newFilter(filter.type, filter.options)
                newParticleOptions.filters.push(filterInstance)
            }
        }
        newParticle.addPropertyFunction(this.particleUtils.manualMoveGraphics)
        if (newParticleOptions.rotationSpeed !== 0) {
            newParticle.addPropertyFunction(this.particleUtils.manualRotateParticle)
        }
        await newParticle.init(newParticleOptions, this.randomGenerator, this.particleUtils)
        return newParticle
    }

    finishParticleEmit(particleName) {
        if (!particleName in this.particleEmits) {
            console.error(`${particleName} not exist!`)
            return false
        }
        this.particleEmits[particleName].signalEnd = true
        return true
    }

    addAuxiliaryEmitter(auxEmitterId, particleId, auxEmitterOptions) {
        if (auxEmitterId in this.particleAuxiliaryEmitters) {
            console.error(`${auxEmitterId} already exist!`)
            return
        }
        if (!particleId in this.particleEmits) {
            console.error(`${particleId} not exist!`)
            return
        }
        const auxEmitter = new ParticleAuxiliaryEmitter()
        auxEmitter.init(this.pixiApp, auxEmitterOptions, this.randomGenerator, this.particleUtils, this.particleEmits[particleId])
        this.particleAuxiliaryEmitters[auxEmitterId] = auxEmitter
        return this.particleAuxiliaryEmitters[auxEmitterId]
    }

    getAuxiliaryEmitter(auxEmitterId) {
        if (!auxEmitterId in this.particleAuxiliaryEmitters) {
            console.error(`${auxEmitterId} not exist!`)
            return null;
        }
        return this.particleAuxiliaryEmitters[auxEmitterId]
    }

    getReplicaEmitter(replicaEmitterId) {
        if (!replicaEmitterId in this.particleReplicaEmitters) {
            console.error(`${replicaEmitterId} not exist!`)
            return null;
        }
        return this.particleReplicaEmitters[replicaEmitterId]
    }

    addReplicaEmitter(replicaEmitterId, particleId, replicaEmitterOptions) {
        if (replicaEmitterId in this.particleReplicaEmitters) {
            console.error(`${replicaEmitterId} already exist!`)
            return
        }
        if (!particleId in this.particleEmits) {
            console.error(`${particleId} not exist!`)
            return
        }
        const replicaEmitter = new ParticleReplicaEmitter()
        replicaEmitter.init(this.pixiApp, replicaEmitterOptions, this.randomGenerator, this.particleUtils, this.particleEmits[particleId])
        this.particleAuxiliaryEmitters[replicaEmitterId] = replicaEmitter
        return this.particleAuxiliaryEmitters[replicaEmitterId]
    }


    getBirthPosition() {
        if (this.type === "point") {
            return {x: this.emitterArea.x, y: this.emitterArea.y}
        }
        if (this.type === "rectangle") {
            return {
                x: this.particleUtils.getRandomNumberBetween(this.emitterArea.leftTop.x, this.emitterArea.rightBottom.x),
                y: this.particleUtils.getRandomNumberBetween(this.emitterArea.leftTop.y, this.emitterArea.rightBottom.y)
            }
        }
        if (this.type === "circle") {
            const angle = this.randomGenerator.nextFloat() * Math.PI * 2
            const radius = this.emitterArea.radius * this.particleUtils.getTriangleDist()
            return {
                x: this.emitterArea.x + Math.cos(angle) * radius,
                y: this.emitterArea.y + Math.sin(angle) * radius,
            }
        }
        if (this.type === "ring") {
            const angle = this.randomGenerator.nextFloat() * Math.PI * 2
            const radius = (this.emitterArea.outerRadius - this.emitterArea.innerRadius) * this.particleUtils.getLadderDist() + this.emitterArea.innerRadius
            return {
                x: this.emitterArea.x + Math.cos(angle) * radius,
                y: this.emitterArea.y + Math.sin(angle) * radius,
            }
        }
        return {
            x: 0,
            y: 0
        }
    }

    getParticleColor(colorOption) {
        // type: fixed, value: 固定rgb值
        // type: rgbRange, value: [rgb边界1, rgb边界2]
        // type: hsbRange, value: {hue: [hue边界1, hue边界2], saturation: [sat边界1, sat边界2], brightness: [亮度边界1, 亮度边界2]}
        // type: timeFunc, value: 一个rgb返回值随时间变化的函数
        if (colorOption.type === "fixed") {
            return colorOption.value
        }
        if (colorOption.type === "rgbRange") {
            const color1 = new PIXI.Color(colorOption.value[0]), color2 = new PIXI.Color(colorOption.value[1])
            const red = this.particleUtils.getRandomNumberBetween(color1.red, color2.red)
            const green = this.particleUtils.getRandomNumberBetween(color1.green, color2.green)
            const blue = this.particleUtils.getRandomNumberBetween(color1.blue, color2.blue)
            return this.particleUtils.rgbToHex(red, green, blue)
        }
        if (colorOption.type === "hsbRange") {
            const hue = this.particleUtils.getRandomNumberBetween(colorOption.value.hue[0], colorOption.value.hue[1])
            const saturation = this.particleUtils.getRandomNumberBetween(colorOption.value.saturation[0], colorOption.value.saturation[1])
            const brightness = this.particleUtils.getRandomNumberBetween(colorOption.value.brightness[0], colorOption.value.brightness[1])
            return this.particleUtils.hsbToHex(hue, saturation, brightness)
        }
        if (colorOption.type === "timeFunc") {
            return colorOption.value()
        }
        return 0xFFFFFF
    }

    setParticlePerSecond(newParticlePerSecond) {
        this.particlesPerSecond = Math.max(newParticlePerSecond, 0)
    }
}

class ParticleReplicaEmitter extends ParticleEmitter {
    constructor(...args) {
        super();
    }

    init(pixiApp, options, randomGenerator, particleUtils, parentParticleInfo) {
        this.type = "replica"
        this.parentParticleInfo = parentParticleInfo
        // 10ms检测一次
        this.checkInterval = 10
        super.commonInit(pixiApp, options, randomGenerator, particleUtils)
    }

    async addParticleEmit(particleId, particleOptions, particlePropertyFunction, particleFilters, replicaOptions) {
        this.particleEmits[particleId] = {
            signalEnd: false,
            options: particleOptions,
            particles: [],
            replicaOptions: replicaOptions
        }
        // 支持line, area
        const replicaType = replicaOptions?.type ?? "line"
        // line-replicaOptions?.replicaProperty: {count: count, offset: offset, gap: gap, rotation: rotation}
        // area-replicaOptions?.replicaProperty: {row: {count: count, offset: offset, gap: gap}, column: {count: count, offset: offset, gap: gap}, rotation: rotation}
        const inheritOption = replicaOptions?.inheritOption ?? {}
        const replicaProperty = replicaOptions?.replicaProperty ?? {count: 1, offset: 0, gap: 100}
        const rowCount = replicaType === "line" ? 1 : replicaProperty.row.count
        const columnCount = replicaType === "line" ? replicaProperty.count : replicaProperty.column.count
        const columnGap = replicaType === "line" ? replicaProperty.gap : replicaProperty.column.gap
        const rowGap = replicaType === "line" ? 0 : replicaType.row.gap
        const rotation = replicaProperty?.rotation ?? 0

        const doReplica = async (parentParticle, i, j) => {
            if (this.randomGenerator.nextFloat() < this.particleBirthChance) {
                const parentParticleOptions = parentParticle.getCurrentState()
                const newParticleOptions = this.particleUtils.deepClone(particleOptions)

                newParticleOptions.position = this.getBirthPosition(parentParticleOptions, replicaProperty, i, j, rowGap, columnGap, rotation)
                const newParticle = await super.addParticleEmitInheritCommon(newParticleOptions, particlePropertyFunction, particleFilters, parentParticleOptions, inheritOption)
                // 保证上面添加的变化函数在初始时就起作用
                newParticle.doAnimate(0.01)
                this.pixiApp.stage.addChild(newParticle.getParticle())
                setTimeout(() => {
                    this.particleEmits[particleId].particles.push(newParticle)
                }, this.pushParticleDelay)
            }
        }

        while (!this.particleEmits[particleId].signalEnd) {
            for (const parentParticle of this.parentParticleInfo.particles) {
                // 检查该粒子是否已经复制过了
                if (parentParticle?.extraInfo?.replicaParticles != undefined && particleId in parentParticle?.extraInfo?.replicaParticles) {
                    continue
                }
                for (let i = 0; i < rowCount; i++) {
                    for (let j = 0; j < columnCount; j++) {
                        doReplica(parentParticle, i, j)
                    }
                }
                // 打好标记, 表示已经复制过
                if (parentParticle.extraInfo === undefined) {
                    parentParticle.extraInfo = {}
                }
                if (parentParticle.extraInfo.replicaParticles === undefined) {
                    parentParticle.extraInfo.replicaParticles = {}
                }
                parentParticle.extraInfo.replicaParticles[particleId] = true
            }
            await this.particleUtils.sleep(this.checkInterval)
        }
    }

    finishParticleEmit(particleName) {
        return super.finishParticleEmit(particleName)
    }

    addAuxiliaryEmitter(auxEmitterId, particleId, auxEmitterOptions) {
        return super.addAuxiliaryEmitter(auxEmitterId, particleId, auxEmitterOptions)
    }

    getAuxiliaryEmitter(auxEmitterId) {
        return super.getAuxiliaryEmitter(auxEmitterId)
    }

    getReplicaEmitter(replicaEmitterId) {
        return super.getReplicaEmitter()
    }

    addReplicaEmitter(replicaEmitterId, particleId, replicaEmitterOptions) {
        return super.addReplicaEmitter()
    }

    getBirthPosition(parentParticleOptions, replicaProperty, i, j, rowGap, columnGap, rotation) {
        const replicaType = replicaProperty?.type ?? "line"
        const rowOffsetted = i + (replicaType === "line" ? 0 : replicaProperty.row.offset)
        const columnOffsetted = j + (replicaType === "line" ? replicaProperty.offset : replicaProperty.column.offset)
        const gapVertical = rowOffsetted * rowGap
        const gapHorizontal = columnOffsetted * columnGap
        return {
            x: gapHorizontal * Math.cos(rotation) - gapVertical * Math.sin(rotation) + parentParticleOptions.position.x,
            y: gapHorizontal * Math.sin(rotation) + gapVertical * Math.cos(rotation) + parentParticleOptions.position.y
        }
    }

    getParticleColor(colorOption, inheritOptions, parentParticleOption) {
        const selfColor = new PIXI.Color(super.getParticleColor(colorOption))
        const parentColor = new PIXI.Color(parentParticleOption.color)
        const colorInherit = inheritOptions?.color ?? 1
        return this.particleUtils.rgbToHex(
            this.particleUtils.mixTwoNumbers(selfColor.red, parentColor.red, colorInherit),
            this.particleUtils.mixTwoNumbers(selfColor.green, parentColor.green, colorInherit),
            this.particleUtils.mixTwoNumbers(selfColor.blue, parentColor.blue, colorInherit)
        )
    }

    setParticlePerSecond(newParticlePerSecond) {
        super.setParticlePerSecond(newParticlePerSecond)
    }
}

class ParticleEventEmitter extends ParticleEmitter {
    constructor(...args) {
        super();
    }

    init(pixiApp, options, randomGenerator, particleUtils, elementId) {
        this.type = "event"
        this.elementId = elementId
        this.eventSupport = ["click", "dblclick", "mousedown", "mouseup", "mousemove", "mouseover", "mouseout", "mouseenter", "mouseleave", "contextmenu"]
        // 同时在场的最大粒子数
        this.maxParticles = options?.maxParticles ?? 200

        super.commonInit(pixiApp, options, randomGenerator, particleUtils)
    }

    async addParticleEmit(particleId, particleOptions, particlePropertyFunction, particleFilters, eventType) {
        if (!eventType in this.eventSupport) {
            console.error(`${eventType} not supported, supported types are ${this.eventSupport}`)
            return
        }
        const element = document.getElementById(this.elementId)
        if (!element) {
            console.error(`${this.elementId} cannot be found`)
            return
        }
        this.particleEmits[particleId] = {
            signalEnd: false,
            options: particleOptions,
            particles: [],
            eventType: eventType
        }
        window.addEventListener(eventType, async (event) => {
            if (this.particleEmits[particleId].signalEnd) {
                return
            }
            if (this.randomGenerator.nextFloat() < this.particleBirthChance) {
                for (let i = 0; i < this.particlesPerSecond ?? 1; i++) {
                    if (this.particleEmits[particleId].particles.length < this.maxParticles) {
                        const newParticleOptions = this.particleUtils.deepClone(particleOptions)
                        newParticleOptions.position = this.getBirthPosition(event)
                        const newParticle = await super.addParticleEmitCommon(newParticleOptions, particlePropertyFunction, particleFilters)
                        // 保证上面添加的变化函数在初始时就起作用
                        newParticle.doAnimate(0.01)
                        this.pixiApp.stage.addChild(newParticle.getParticle())
                        setTimeout(() => {
                            this.particleEmits[particleId].particles.push(newParticle)
                        }, this.pushParticleDelay)
                    }
                }
            }
        });
    }

    finishParticleEmit(particleName) {
        return super.finishParticleEmit(particleName)
    }

    addAuxiliaryEmitter(auxEmitterId, particleId, auxEmitterOptions) {
        return super.addAuxiliaryEmitter(auxEmitterId, particleId, auxEmitterOptions)
    }

    getAuxiliaryEmitter(auxEmitterId) {
        return super.getAuxiliaryEmitter(auxEmitterId)
    }

    getReplicaEmitter(replicaEmitterId) {
        return super.getReplicaEmitter()
    }

    addReplicaEmitter(replicaEmitterId, particleId, replicaEmitterOptions) {
        return super.addReplicaEmitter()
    }

    getBirthPosition(event) {
        return {
            x: event.clientX ?? 0,
            y: event.clientY ?? 0
        }
    }

    getParticleColor(colorOption) {
        return super.getParticleColor(colorOption)
    }

    setParticlePerSecond(newParticlePerSecond) {
        super.setParticlePerSecond(newParticlePerSecond)
    }
}

class ParticleAuxiliaryEmitter extends ParticleEmitter {
    constructor(...args) {
        super();
    }

    init(pixiApp, options, randomGenerator, particleUtils, parentParticleInfo) {
        // TODO 支持预渲染x秒
        this.type = "auxiliary"

        this.parentParticleInfo = parentParticleInfo

        super.commonInit(pixiApp, options, randomGenerator, particleUtils)
    }

    async addParticleEmit(particleId, particleOptions, particlePropertyFunction, particleFilters, inheritOption) {
        // 继承选项inheritOption: 支持继承百分比, 包括速度, 颜色, 大小, 生命
        if (inheritOption != undefined) {
            inheritOption = {life: 0, color: 0, speed: 0, size: 0, ...inheritOption}
        } else {
            inheritOption = {life: 0, color: 0, speed: 0, size: 0}
        }
        this.particleEmits[particleId] = {
            signalEnd: false,
            options: particleOptions,
            particles: [],
            inheritOption: inheritOption
        }
        while (!this.particleEmits[particleId].signalEnd) {
            if (this.particlesPerSecond === 0) {
                await this.particleUtils.sleep(10)
                continue
            }
            for (const parentParticle of this.parentParticleInfo.particles) {
                if (this.randomGenerator.nextFloat() < this.particleBirthChance || this.particleUtils.getTimestamp() - parentParticle.createTime < 20) {
                    const parentParticleOptions = parentParticle.getCurrentState()
                    const newParticleOptions = this.particleUtils.deepClone(particleOptions)
                    newParticleOptions.position = this.getBirthPosition(parentParticleOptions)
                    const newParticle = await super.addParticleEmitInheritCommon(newParticleOptions, particlePropertyFunction, particleFilters, parentParticleOptions, inheritOption)
                    await newParticle.init(newParticleOptions, this.randomGenerator, this.particleUtils)
                    // 保证上面添加的变化函数在初始时就起作用
                    newParticle.doAnimate(0.01)
                    this.pixiApp.stage.addChild(newParticle.getParticle())
                    setTimeout(() => {
                        this.particleEmits[particleId].particles.push(newParticle)
                    }, this.pushParticleDelay)
                }
            }
            await this.particleUtils.sleep(1000 / this.particlesPerSecond)
        }
    }

    finishParticleEmit(particleName) {
        super.finishParticleEmit(particleName)
    }

    addAuxiliaryEmitter(auxEmitterId, particleId, auxEmitterOptions) {
        return super.addAuxiliaryEmitter(auxEmitterId, particleId, auxEmitterOptions)
    }

    getAuxiliaryEmitter(auxEmitterId) {
        return super.getAuxiliaryEmitter(auxEmitterId)
    }

    getReplicaEmitter(replicaEmitterId) {
        return super.getReplicaEmitter()
    }

    addReplicaEmitter(replicaEmitterId, particleId, replicaEmitterOptions) {
        return super.addReplicaEmitter()
    }

    getBirthPosition(parentParticleOption) {
        return parentParticleOption.position
    }

    getParticleColor(colorOption, inheritOption, parentParticleOption) {
        const selfColor = new PIXI.Color(super.getParticleColor(colorOption))
        const parentColor = new PIXI.Color(parentParticleOption.color)
        const colorInherit = inheritOption?.color ?? 0
        return this.particleUtils.rgbToHex(
            this.particleUtils.mixTwoNumbers(selfColor.red, parentColor.red, colorInherit),
            this.particleUtils.mixTwoNumbers(selfColor.green, parentColor.green, colorInherit),
            this.particleUtils.mixTwoNumbers(selfColor.blue, parentColor.blue, colorInherit)
        )
    }

    setParticlePerSecond(newParticlePerSecond) {
        super.setParticlePerSecond(newParticlePerSecond)
    }
}

export class ParticleApp {
    constructor(...args) {
    }

    async init(elementId, options) {
        this.pixiApp = new PIXI.Application();
        if (options != undefined) {
            await this.pixiApp.init({
                resizeTo: window,
                antialias: true,
                forceCanvas: true,
                backgroundAlpha: 0,
                autoDensity: true,
                ...options
            })
        } else {
            await this.pixiApp.init({
                resizeTo: window,
                antialias: true,
                forceCanvas: true,
                backgroundAlpha: 0,
                autoDensity: true
            })
        }
        this.pixiApp.stage.sortableChildren = true;
        this.seed = options?.seed || 10000
        this.randomGenerator = new SeededRandom()
        this.randomGenerator.init(this.seed)
        this.particleUtils = new ParticleUtils()
        await this.particleUtils.init(this.randomGenerator)
        this.motionEffect = new ParticleMotionEffect()
        this.motionEffect.init(this.randomGenerator, this.particleUtils)
        this.elementId = elementId
        document.getElementById(elementId).appendChild(this.pixiApp.canvas);

        this.emitterIds = {}
    }

    getPixiApp() {
        return this.pixiApp
    }

    async addEmitter(emitterId, emitterOptions) {
        if (emitterId in this.emitterIds) {
            console.error(`${emitterId} already exist!`)
            return
        }
        const newEmitter = new ParticleEmitter()
        newEmitter.init(this.pixiApp, emitterOptions, this.randomGenerator, this.particleUtils)
        this.emitterIds[emitterId] = newEmitter
        return this.emitterIds[emitterId]
    }

    async addEventEmitter(emitterId, emitterOptions) {
        if (emitterId in this.emitterIds) {
            console.error(`${emitterId} already exist!`)
            return
        }
        const newEventEmitter = new ParticleEventEmitter()
        newEventEmitter.init(this.pixiApp, emitterOptions, this.randomGenerator, this.particleUtils, this.elementId)
        this.emitterIds[emitterId] = newEventEmitter
        return this.emitterIds[emitterId]
    }

    getEmitter(emitterId) {
        if (!emitterId in this.emitterIds) {
            return null;
        }
        return this.emitterIds[emitterId]
    }

    getMotionEffect() {
        return this.motionEffect
    }

    getParticleUtils() {
        return this.particleUtils
    }
}

class ParticleMotionEffect {
    constructor(...args) {
    }

    init(randomGenerator, particleUtils) {
        this.randomGenerator = randomGenerator
        this.particleUtils = particleUtils
    }

    applyPositionTurbulence(frequency, amplitude) {
        const randomGenerator = this.randomGenerator
        return function (options, ratio, delta) {
            // 计算随机的抖动值
            const randomValue = randomGenerator.nextFloat() * 2 - 1; // 生成 -1 到 1 之间的随机数
            // 计算 wiggle 值
            const wiggleRadius = amplitude * Math.sin(2 * Math.PI * frequency * (options.direction + options.speed % 10 + randomValue / 100)) / 40;
            const wiggleDirection = 2 * Math.PI * Math.sin(frequency * (options.direction + options.speed % 10 - randomValue / 100))
            // 根据速度和方向更新位置
            options.position.x += wiggleRadius * Math.cos(wiggleDirection) * delta;
            options.position.y += wiggleRadius * Math.sin(wiggleDirection) * delta;
        }
    }

    applyBlackHoleGravity(blackHoleX, blackHoleY, strength, strengthFunction) {
        // strength表示黑洞力度，为负表示为排斥
        return function (options, ratio, delta) {
            const curX = options.position.x, curY = options.position.y
            let targetX = curX * (1 - ratio) + (blackHoleX) * ratio,
                targetY = curY * (1 - ratio) + (blackHoleY) * ratio
            if (typeof strengthFunction === 'function') {
                const composedStrength = strength * strengthFunction(ratio)
                targetX = curX * (1 - composedStrength) + (targetX) * composedStrength
                targetY = curY * (1 - composedStrength) + (targetY) * composedStrength
                options.speed *= Math.sqrt((1 - ratio) * Math.abs(1 - composedStrength))
            } else {
                targetX = curX * (1 - strength) + (targetX) * strength
                targetY = curY * (1 - strength) + (targetY) * strength
                options.speed *= Math.sqrt((1 - ratio) * Math.abs(1 - strength))
            }
            // 根据速度和方向更新位置
            options.position.x = targetX;
            options.position.y = targetY;
        }
    }

    applyOneAcceleration(accDirection, accValue, strengthFunction) {
        return function (options, ratio, delta) {
            const timeFactor = ratio * options.life / 5000
            let deltaDist = timeFactor * accValue
            if (typeof strengthFunction === 'function') {
                deltaDist *= strengthFunction(ratio)
            }
            // 根据速度和方向更新位置
            options.position.x += deltaDist * Math.cos(accDirection) * delta;
            options.position.y += deltaDist * Math.sin(-accDirection) * delta;
        }
    }

    applyFixedRotation(centerX, centerY) {
        const particleUtils = this.particleUtils
        return function (options, ratio, delta) {
            const curAngle = particleUtils.calculateAngle(centerX, centerY, options.position.x, options.position.y)
            const curveLength = delta * options.speed / 2  // 除以2为速度调整
            const radius = particleUtils.getEuclideanDist(centerX, centerY, options.position.x, options.position.y)
            const deltaAngle = curveLength / radius
            options.direction = (curAngle + deltaAngle / 2) + Math.PI / 2
            options.position.x = radius * Math.cos(curAngle + deltaAngle) + centerX;
            options.position.y = radius * Math.sin(curAngle + deltaAngle) + centerY;
        }
    }

    applyMouseRepel(repelRadius, repelStrength) {
        const particleUtils = this.particleUtils
        return function (options, ratio, delta) {
            const mousePosition = particleUtils.getCurMousePosition()
            const dist = particleUtils.getEuclideanDist(mousePosition.x, mousePosition.y, options.position.x, options.position.y)
            const distRatio = dist / repelRadius
            if (distRatio > 1) {
                return
            }
            const curAngle = particleUtils.calculateAngle(mousePosition.x, mousePosition.y, options.position.x, options.position.y)
            const repelDist = (1 - distRatio) * (1 - distRatio) * dist * delta * repelStrength
            options.position.x += repelDist * Math.cos(curAngle);
            options.position.y += repelDist * Math.sin(curAngle);
        }
    }

    applyTwistMove(twistFrequency, twistAmplitude, offset) {
        // 矫正twistAmplitude
        twistAmplitude *= twistFrequency
        return function (options, ratio, delta) {
            const timePassed = options?.life * ratio
            const dist = Math.cos(twistFrequency * timePassed / 1000 + (offset === undefined ? 0 : offset)) * twistAmplitude
            const verticalAngle = options.direction + Math.PI / 2
            options.position.x += dist * Math.cos(verticalAngle) * delta;
            options.position.y += dist * Math.sin(verticalAngle) * delta;
        }
    }
}

class ParticleUtils {
    constructor(...args) {
    }

    async init(randomGenerator) {
        this.randomGenerator = randomGenerator
        this.mouseX = 0
        this.mouseY = 0
        window.addEventListener("mousemove", (event) => {
            this.mouseX = event.clientX
            this.mouseY = event.clientY
        })
        await this.getFilterClasses()
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    getRandomNumberBetween(a, b) {
        return this.randomGenerator.nextFloat() * (a - b) + b
    }

    getTimestamp() {
        return Date.now();
    }

    // 获取取到0的概率最小, 1的概率最大的三角分布
    getTriangleDist() {
        const rand = this.randomGenerator.nextFloat() + this.randomGenerator.nextFloat()
        return rand < 1 ? rand : 2 - rand;
    }

    // 获取取到0的概率, 1的概率的比率为ratio的梯形分布
    getLadderDist(ratio) {
        if (this.randomGenerator.nextFloat() < ratio) {
            return this.randomGenerator.nextFloat()
        }
        return this.getTriangleDist()
    }

    // 解决Graphic物体不受speed和direction自动移动的问题
    manualMoveGraphics(options, ratio, delta) {
        const speed = options.speed
        const direction = options.direction
        // 根据速度和方向更新位置
        options.position.x += speed * Math.cos(direction) * delta;
        options.position.y += speed * Math.sin(direction) * delta;
    }

    manualRotateParticle(options, ratio, delta) {
        const rotationSpeed = options.rotationSpeed
        options.rotation += rotationSpeed * delta;
    }

    // 无法克隆函数
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }
        if (obj instanceof Date) {
            return new Date(obj.getTime());
        }
        if (Array.isArray(obj)) {
            const arrCopy = [];
            for (let i = 0; i < obj.length; i++) {
                arrCopy[i] = this.deepClone(obj[i]);
            }
            return arrCopy;
        }
        const objCopy = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                objCopy[key] = this.deepClone(obj[key]);
            }
        }
        return objCopy;
    }

    rgbToHex(red, green, blue) {
        let r = red;
        let g = green;
        let b = blue;
        if (r < 1) {
            r = Math.round(r * 255);
        }
        if (g < 1) {
            g = Math.round(g * 255);
        }
        if (b < 1) {
            b = Math.round(b * 255);
        }

        // 将整数转换为两位的16进制字符串
        const rHex = r.toString(16).padStart(2, '0');
        const gHex = g.toString(16).padStart(2, '0');
        const bHex = b.toString(16).padStart(2, '0');

        // 拼接成完整的16进制颜色代码
        return `0x${rHex}${gHex}${bHex}`;
    }

    hsbToHex(h, s, b) {
        // 将 HSB 转换为 RGB
        // h: [0, 360]
        // s: [0, 1]
        // b: [0, 1]

        let k = (n) => (n + h / 60) % 6;
        let f = (n) => b * (1 - s * Math.max(Math.min(k(n), 4 - k(n), 1), 0));

        let red = Math.round(255 * f(5));
        let green = Math.round(255 * f(3));
        let blue = Math.round(255 * f(1));

        // 将 RGB 转换为十六进制
        let toHex = (x) => x.toString(16).padStart(2, '0');

        return `0x${toHex(red)}${toHex(green)}${toHex(blue)}`;
    }

    mixTwoNumbers(originalNumber, newNumber, newRatio) {
        return originalNumber * (1 - newRatio) + newNumber * newRatio
    }

    calculateAngle(x1, y1, x2, y2) {
        const deltaY = y2 - y1;
        const deltaX = x2 - x1;
        let angleInRadians = Math.atan2(deltaY, deltaX);
        if (angleInRadians < 0) {
            angleInRadians += Math.PI * 2;
        }

        return angleInRadians;
    }

    getEuclideanDist(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2))
    }

    getCurMousePosition() {
        return {
            x: this.mouseX,
            y: this.mouseY
        }
    }

    createMultiLineFunc(coordinates) {
        const sortedCoordinates = coordinates.sort((a, b) => a[0] - b[0]);
        return function (x) {
            // 如果x小于第一个点的x值，则返回第一个点的y值
            if (x <= sortedCoordinates[0][0]) {
                return sortedCoordinates[0][1];
            }
            // 如果x大于最后一个点的x值，则返回最后一个点的y值
            if (x >= sortedCoordinates[sortedCoordinates.length - 1][0]) {
                return sortedCoordinates[sortedCoordinates.length - 1][1];
            }
            // 否则返回直线上的一点的y坐标
            for (let i = 0; i < sortedCoordinates.length - 1; i++) {
                const [x0, y0] = sortedCoordinates[i];
                const [x1, y1] = sortedCoordinates[i + 1];

                if (x >= x0 && x <= x1) {
                    // 计算线性插值
                    const t = (x - x0) / (x1 - x0);
                    return y0 + t * (y1 - y0);
                }
            }
        };
    }

    // 三次样条插值设定曲线
    createMultiCurveFunc(coordinates) {
        coordinates.sort((a, b) => a[0] - b[0]);

        const n = coordinates.length;
        const xs = coordinates.map(point => point[0]);
        const ys = coordinates.map(point => point[1]);

        const a = ys.slice();
        const b = new Array(n).fill(0);
        const d = new Array(n).fill(0);
        const h = new Array(n - 1);
        const alpha = new Array(n - 1);
        const c = new Array(n).fill(0);
        const l = new Array(n).fill(1);
        const mu = new Array(n).fill(0);
        const z = new Array(n).fill(0);

        for (let i = 0; i < n - 1; i++) {
            h[i] = xs[i + 1] - xs[i];
            alpha[i] = (3 / h[i]) * (a[i + 1] - a[i]) - (3 / h[i - 1]) * (a[i] - a[i - 1]);
        }

        for (let i = 1; i < n - 1; i++) {
            l[i] = 2 * (xs[i + 1] - xs[i - 1]) - h[i - 1] * mu[i - 1];
            mu[i] = h[i] / l[i];
            z[i] = (alpha[i] - h[i - 1] * z[i - 1]) / l[i];
        }

        for (let j = n - 2; j >= 0; j--) {
            c[j] = z[j] - mu[j] * c[j + 1];
            b[j] = (a[j + 1] - a[j]) / h[j] - h[j] * (c[j + 1] + 2 * c[j]) / 3;
            d[j] = (c[j + 1] - c[j]) / (3 * h[j]);
        }
        return function (x) {
            if (x <= xs[0]) {
                return ys[0];
            } else if (x >= xs[n - 1]) {
                return ys[n - 1];
            } else {
                let i = 0;
                while (i < n - 1 && x > xs[i + 1]) {
                    i++;
                }
                const dx = x - xs[i];
                return a[i] + b[i] * dx + c[i] * dx * dx + d[i] * dx * dx * dx;
            }
        };
    }

    // 创建一个闪烁函数，开始和结束部分均为山形，中间为跳跃形
    createFlickerCurve(flickerIntensity, flickerPercent) {
        const randomGenerator = this.randomGenerator
        if (flickerPercent === undefined) {
            flickerPercent = 0.3
        }

        function mountainCurve(t) {
            return -4 * Math.pow((t - 0.5), 2) + 1;
        }

        return function (t) {
            const startValue = 0;
            const endValue = 0;

            let flickerValue;
            if (t === 0 || t === 1) {
                flickerValue = 0;
            } else {
                flickerValue = randomGenerator.nextFloat() * flickerIntensity;
            }
            const flickerRatio = Math.max(0, mountainCurve(t) - flickerPercent)

            return mountainCurve(t) * (1 - flickerRatio) + flickerValue * flickerRatio;
        }
    }

    async getFilterClasses() {
        let filters = {};
        let PIXI = {};
        try {
            filters = await import('pixi-filters');
        } catch (error) {
            console.warn('pixi-filters is not installed, using empty object as fallback.');
        }
        try {
            PIXI = await import('pixi.js');
        } catch (error) {
            console.warn('pixijs is not installed, using empty object as fallback.');
        }
        const pixiFilters = Object.keys(PIXI);
        const pluginFilters = Object.keys(filters);
        const allFilters = {};
        for (const filterName of pixiFilters) {
            if (filterName.endsWith("Filter")) {
                allFilters[filterName] = PIXI[filterName]
            }
        }
        for (const filterName of pluginFilters) {
            if (filterName.endsWith("Filter")) {
                allFilters[filterName] = filters[filterName]
            }
        }
        this.pixiFilters = allFilters
    }

    newFilter(filterName, filterOptions) {
        if (!filterName in this.pixiFilters) {
            console.error(`${filterName} not exist!`)
            return null
        }
        return new this.pixiFilters[filterName](filterOptions)
    }
}

class SeededRandom {
    constructor(...args) {
    }

    init(seed) {
        this.seed = seed;
        this.m = 0x80000000; // 2**31
        this.a = 1103515245;
        this.c = 12345;
        this.state = seed ? seed : Math.floor(Math.random() * (this.m - 1));
    }

    nextInt() {
        this.state = (this.a * this.state + this.c) % this.m;
        return this.state;
    }

    nextFloat() {
        // Returns a float in [0, 1)
        return this.nextInt() / (this.m - 1);
    }

    nextRange(start, end) {
        // Returns an integer in [start, end)
        const range = end - start;
        return start + Math.floor(this.nextFloat() * range);
    }

    nextBoolean() {
        // Returns a boolean
        return this.nextInt() % 2 === 0;
    }
}
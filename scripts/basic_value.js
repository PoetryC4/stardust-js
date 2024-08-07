// 输入和输出都在0~1上的动画曲线函数

// 缓入 (ease-in)
export function easeIn(t) {
    return t * t;
}

// 缓出 (ease-out)
export function easeOut(t) {
    return t * (2 - t);
}

// 缓入缓出 (ease-in-out)
export function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

// 线性 (linear)
export function linear(t) {
    return t;
}

export function reverseEaseIn(t) {
    return 1 - easeIn(t);
}

export function reverseEaseOut(t) {
    return 1 - easeOut(t);
}

export function reverseEaseInOut(t) {
    return 1 - easeInOut(t);
}

export function reverseLinear(t) {
    return 1 - linear(t)
}

export function mountainCurve(t) {
    return -4 * Math.pow((t - 0.5), 2) + 1;
}

export function valleyCurve(t) {
    return 1 - mountainCurve(t);
}

export const PIXI_FILTERS = {
    ADJUSTMENT_FILTER: "AdjustmentFilter",
    ADVANCED_BLOOM_FILTER: "AdvancedBloomFilter",
    ALPHA_FILTER: "AlphaFilter",
    ASCII_FILTER: "AsciiFilter",
    BACKDROP_BLUR_FILTER: "BackdropBlurFilter",
    BEVEL_FILTER: "BevelFilter",
    BLEND_MODE_FILTER: "BlendModeFilter",
    BLOOM_FILTER: "BloomFilter",
    BLUR_FILTER: "BlurFilter",
    BULGE_PINCH_FILTER: "BulgePinchFilter",
    COLOR_GRADIENT_FILTER: "ColorGradientFilter",
    COLOR_MAP_FILTER: "ColorMapFilter",
    COLOR_MATRIX_FILTER: "ColorMatrixFilter",
    COLOR_OVERLAY_FILTER: "ColorOverlayFilter",
    COLOR_REPLACE_FILTER: "ColorReplaceFilter",
    CONVOLUTION_FILTER: "ConvolutionFilter",
    CROSS_HATCH_FILTER: "CrossHatchFilter",
    C_R_T_FILTER: "CRTFilter",
    DISPLACEMENT_FILTER: "DisplacementFilter",
    DOT_FILTER: "DotFilter",
    DROP_SHADOW_FILTER: "DropShadowFilter",
    EMBOSS_FILTER: "EmbossFilter",
    FILTER: "Filter",
    GLITCH_FILTER: "GlitchFilter",
    GLOW_FILTER: "GlowFilter",
    GODRAY_FILTER: "GodrayFilter",
    GRAYSCALE_FILTER: "GrayscaleFilter",
    HSL_ADJUSTMENT_FILTER: "HslAdjustmentFilter",
    KAWASE_BLUR_FILTER: "KawaseBlurFilter",
    MASK_FILTER: "MaskFilter",
    MIPMAP_SCALE_MODE_TO_GL_FILTER: "mipmapScaleModeToGlFilter",
    MOTION_BLUR_FILTER: "MotionBlurFilter",
    MULTI_COLOR_REPLACE_FILTER: "MultiColorReplaceFilter",
    NOISE_FILTER: "NoiseFilter",
    OLD_FILM_FILTER: "OldFilmFilter",
    OUTLINE_FILTER: "OutlineFilter",
    PIXELATE_FILTER: "PixelateFilter",
    RADIAL_BLUR_FILTER: "RadialBlurFilter",
    REFLECTION_FILTER: "ReflectionFilter",
    R_G_B_SPLIT_FILTER: "RGBSplitFilter",
    SCALE_MODE_TO_GL_FILTER: "scaleModeToGlFilter",
    SHOCKWAVE_FILTER: "ShockwaveFilter",
    SIMPLE_LIGHTMAP_FILTER: "SimpleLightmapFilter",
    TILT_SHIFT_AXIS_FILTER: "TiltShiftAxisFilter",
    TILT_SHIFT_FILTER: "TiltShiftFilter",
    TWIST_FILTER: "TwistFilter",
    ZOOM_BLUR_FILTER: "ZoomBlurFilter",
}
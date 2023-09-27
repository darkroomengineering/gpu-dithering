import { BLEND } from 'libs/webgl/utils/blend'
import { Effect } from 'postprocessing'
import { Color, Vector2, Vector4 } from 'three'

// http://alex-charlton.com/posts/Dithering_on_the_GPU/
// https://surma.dev/things/ditherpunk/
// https://offscreencanvas.com/issues/glsl-dithering/

const fragmentShader = `
    ${BLEND.NORMAL}

    uniform float uGammaCorrection;
    uniform float uOpacity;
    uniform vec3 uColor;
    uniform float uMatrix;
    uniform sampler2D uMatrixTexture;
    uniform vec2 uMatrixTextureSize;
    uniform bool uRandom;
    uniform float uGranularity;
    uniform vec4 d;



    float indexValue() {
      vec2 coords = mod(gl_FragCoord.xy / uGranularity, uMatrixTextureSize) / uMatrixTextureSize;

      return texture2D(uMatrixTexture, coords).r;
    }


    float dither(float value) {
        float threshold = uRandom ? rand(gl_FragCoord.xy * 10.) : indexValue();

        // value *= 0.985; // hot fix for correct dithering
        return (value <= threshold) ? 0. : 1.;
    }


    float gammaCorrection(float value, float gamma) {
        return pow(value, 1.0 / gamma);
    }

    float luminance(vec3 color) {
        return (color.r + color.g + color.b) / 3.;
    }


    // https://github.com/pmndrs/postprocessing/blob/main/src/effects/glsl/pixelation.frag
    vec2 pixelation(vec2 uv) {
      return d.xy * (floor((uv) * d.zw) + 0.5);
    }



    void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
        vec2 pixelsUv = pixelation(uv);
        vec3 rgb = texture2D(inputBuffer, pixelsUv).rgb;
        float grayscaled = luminance(rgb);
        
        vec3 grayscaledColor = vec3(grayscaled);

        float dithered = dither(gammaCorrection(grayscaled, uGammaCorrection));
        vec3 ditheredColor = vec3(dithered);

        vec3 color = blendNormal(grayscaledColor * uColor, ditheredColor + uColor, uOpacity);

        outputColor = vec4(color, inputColor.a);

        // outputColor = vec4(inputColor.rgb, 1.);
    }
`

export class DitheringEffect extends Effect {
  constructor({
    gammaCorrection = 0.6,
    color = new Color(1, 1, 1),
    opacity = 1,
    granularity = 1,
  } = {}) {
    super('DitheringEffect', fragmentShader, {
      uniforms: new Map([
        ['uGammaCorrection', { value: gammaCorrection }],
        ['uOpacity', { value: opacity }],
        ['uColor', { value: color }],
        ['uMatrixTexture', { value: null }],
        ['uMatrixTextureSize', { value: new Vector2() }],
        ['uRandom', { value: false }],
        ['uGranularity', { value: granularity }],
        ['d', { value: new Vector4() }],
      ]),
    })

    // https://github.com/pmndrs/postprocessing/blob/main/src/effects/PixelationEffect.js

    this.resolution = new Vector2()
    this._granularity = 0
    this.granularity = granularity
  }

  set gammaCorrection(value) {
    this.uniforms.get('uGammaCorrection').value = value
  }

  set matrixTexture(value) {
    this.uniforms.get('uMatrixTexture').value = value
  }

  set matrixTextureSize(value) {
    this.uniforms.get('uMatrixTextureSize').value.copy(value)
  }

  set random(value) {
    this.uniforms.get('uRandom').value = Boolean(value)
  }

  set color(value) {
    this.uniforms.get('uColor').value.copy(value)
  }

  get granularity() {
    return this._granularity
  }

  set opacity(value) {
    this.uniforms.get('uOpacity').value = value
  }

  set granularity(value) {
    let d = Math.floor(value)
    d = Math.max(1, d)

    this._granularity = d
    this.setSize(this.resolution.width, this.resolution.height)
  }

  setSize(width, height) {
    const resolution = this.resolution
    resolution.set(width, height)

    const d = this.granularity
    const x = d / resolution.x
    const y = d / resolution.y
    const w = 1.0 / x
    const z = 1.0 / y

    this.uniforms.get('d').value.set(x, y, w, z)
    this.uniforms.get('uGranularity').value = d
  }
}

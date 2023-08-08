import { Effect } from 'postprocessing'
import { Color, Vector2 } from 'three'

// http://alex-charlton.com/posts/Dithering_on_the_GPU/
// https://surma.dev/things/ditherpunk/
// https://offscreencanvas.com/issues/glsl-dithering/

const fragmentShader = `

    uniform vec3 uLuminanceFilter;
    uniform float uGammaCorrection;
    uniform sampler2D uMatrixTexture;
    uniform vec2 uMatrixTextureSize;
    uniform bool uRandom;


    float indexValue() {
      float x = mod(gl_FragCoord.x, uMatrixTextureSize.x) / uMatrixTextureSize.x;
      float y = mod(gl_FragCoord.y, uMatrixTextureSize.y) / uMatrixTextureSize.y;

      return texture2D(uMatrixTexture, vec2(x,y)).r;
    }


    float dither(float value) {
        float threshold = uRandom ? rand(gl_FragCoord.xy * 10.) : indexValue();

        return (value <= threshold) ? 0. : 1.;
    }


    float gammaCorrection(float value, float gamma) {
        return pow(value, 1.0 / gamma);
    }

    float luminance(vec3 color) {
        return (color.r + color.g + color.b) / 3.;
    }



    void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
        float grayscaled = luminance(inputColor.rgb);
        
        vec3 grayscaledColor = vec3(grayscaled);

        float dithered = dither(gammaCorrection(grayscaled, uGammaCorrection));
        vec3 ditheredColor = vec3(dithered);

        outputColor = vec4(ditheredColor, inputColor.a);
    }
`

export class DitheringEffect extends Effect {
  constructor({
    luminanceFilter = new Color(0.2126, 0.7152, 0.0722),
    gammaCorrection = 0.6,
    // matrix = 4,
  } = {}) {
    super('DitheringEffect', fragmentShader, {
      uniforms: new Map([
        ['uLuminanceFilter', { value: luminanceFilter }],
        ['uGammaCorrection', { value: gammaCorrection }],
        ['uMatrixTexture', { value: null }],
        ['uMatrixTextureSize', { value: new Vector2() }],
        ['uRandom', { value: false }],
      ]),
    })
  }

  set luminanceFilter([x, y, z]) {
    this.uniforms.get('uLuminanceFilter').value.set(x, y, z)
  }

  set gammaCorrection(value) {
    this.uniforms.get('uGammaCorrection').value = value
  }

  // set matrix(value) {
  //   this.uniforms.get('uMatrix').value = value
  // }

  set matrixTexture(value) {
    this.uniforms.get('uMatrixTexture').value = value
  }

  set matrixTextureSize(value) {
    this.uniforms.get('uMatrixTextureSize').value.copy(value)
  }

  set random(value) {
    this.uniforms.get('uRandom').value = Boolean(value)
  }
}

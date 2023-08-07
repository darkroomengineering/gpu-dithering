import { BLEND } from 'libs/webgl/utils/blend'
import { Effect } from 'postprocessing'
import { Color, Vector2 } from 'three'

// http://alex-charlton.com/posts/Dithering_on_the_GPU/
// https://surma.dev/things/ditherpunk/
// https://offscreencanvas.com/issues/glsl-dithering/

const fragmentShader = `
${BLEND.NORMAL}

uniform vec3 uLuminanceFilter;
uniform float uGammaCorrection;
// uniform int uMatrix;
uniform sampler2D uMatrixTexture;
uniform vec2 uMatrixTextureSize;

const int BayerMatrix4x4[16] = int[](0,  8,  2,  10,
                                     12, 4,  14, 6,
                                     3,  11, 1,  9,
                                     15, 7,  13, 5);

const int BayerMatrix8x8[64] = int[](0,  32, 8,  40, 2,  34, 10, 42,
                                     48, 16, 56, 24, 50, 18, 58, 26,
                                     12, 44, 4,  36, 14, 46, 6,  38,
                                     60, 28, 52, 20, 62, 30, 54, 22,
                                     3,  35, 11, 43, 1,  33, 9,  41,
                                     51, 19, 59, 27, 49, 17, 57, 25,
                                     15, 47, 7,  39, 13, 45, 5,  37,
                                     63, 31, 55, 23, 61, 29, 53, 21);


const int ClusteredDotDiagonal8x8[64] = int[](24, 10, 12, 26, 35, 47, 49, 37,
                                             8, 0, 2, 14, 45, 59, 61, 51,
                                             22, 6, 4, 16, 43, 57, 63, 53,
                                             30, 20, 18, 28, 33, 41, 55, 39,
                                             34, 46, 48, 36, 25, 11, 13, 27,
                                             44, 58, 60, 50, 9, 1, 3, 15,
                                             42, 56, 62, 52, 23, 7, 5, 17,
                                             32, 40, 54, 38, 31, 21, 19, 29);

float indexValue() {
  float x = mod(gl_FragCoord.x, uMatrixTextureSize.x) / uMatrixTextureSize.x;
  float y = mod(gl_FragCoord.y, uMatrixTextureSize.y) / uMatrixTextureSize.y;

  return texture2D(uMatrixTexture, vec2(x,y)).r;
}


float dither(float value) {
    float threshold = indexValue();
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
        outputColor.rgb = outputColor.rgb;
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
        // ['uMatrix', { value: matrix }],
        ['uMatrixTexture', { value: null }],
        ['uMatrixTextureSize', { value: new Vector2() }],
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
}

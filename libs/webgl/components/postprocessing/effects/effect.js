import { BLEND } from 'libs/webgl/utils/blend'
import { Effect } from 'postprocessing'
import { Color } from 'three'

// http://alex-charlton.com/posts/Dithering_on_the_GPU/
// https://surma.dev/things/ditherpunk/
// https://offscreencanvas.com/issues/glsl-dithering/

const fragmentShader = `
${BLEND.NORMAL}

uniform vec3 uLuminanceFilter;
uniform float uGammaCorrection;
uniform int uMatrix;

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

float indexValue(int size) {
  int x = int(gl_FragCoord.x) % size;
  int y = int(gl_FragCoord.y) % size;
  int index = x + (y * size);
  int length = size * size;

  if(size == 4) {
    return float(BayerMatrix4x4[index]) / float(length);
  } else if(size == 8) {
    return float(BayerMatrix8x8[index]) / float(length);
  }
}

// float steps = 15.;

//     float quantize(float color) {
//         float barWidth = 1. / steps;
//         float x = floor(color / barWidth) / (steps-1.);
//         return x;
//     }


float dither(float value) {
    // // float closestColor = color == 0.5 ? ((color < 0.5) ? 0. : 1.) : 1.;
    // // float closestColor = color < 0.5 ? 0. : 1.;

    // float closestColor = round(color);
    // // return round(color);
    
    // float secondClosestColor = 1. - closestColor;
    // float d = indexValue(uMatrix);
    // float distance = abs(closestColor - color);
    //   return (distance <= d) ? closestColor : secondClosestColor;


    float threshold = indexValue(uMatrix);
    return (value <= threshold) ? 0. : 1.;
    
}


float gammaCorrection(float value, float gamma) {
    return pow(value, 1.0 / gamma);
}

    float luminance(vec3 color) {
        // float g = dot(color, uLuminanceFilter);
        // return g;

        return (color.r + color.g + color.b) / 3.;
    }



    void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
        float grayscaled = luminance(inputColor.rgb);
        
        vec3 grayscaledColor = vec3(grayscaled);

        // if(uv.y > 0.9) {
        //     float x = uv.x;
        //     outputColor = vec4( x, x, x, 1.);
        // } else if(uv.y > 0.8) {
        //     float barWidth = resolution.x / steps;
        //     float x = floor(gl_FragCoord.x / barWidth) / (steps-1.);
        //     outputColor = vec4( x, x, x, 1.);
        // } else if(uv.y > 0.6) {
        //     float color = quantize(grayscaled);

        //     outputColor = vec4(vec3(color), inputColor.a);
        // } else if(uv.y > 0.4) {
        //     outputColor = vec4(vec3(dither(grayscaled)), inputColor.a);
        //     // outputColor = vec4(vec3(indexValue()), inputColor.a);
        // } else {
        //     outputColor = inputColor;
        // }

        float dithered = dither(gammaCorrection(grayscaled, uGammaCorrection));
        vec3 ditheredColor = vec3(dithered);


        // vec3 color = blendNormal(grayscaledColor, ditheredColor, 0.35);

        // outputColor = vec4(color, inputColor.a);

        outputColor = vec4(ditheredColor, inputColor.a);

        // outputColor = vec4(ditheredColor, inputColor.a);

        // outputColor = vec4(grayscaledColor,1.0);

        // outputColor = vec4(inputColor.rgb, 1.0);

        
    }
`

export class DitheringEffect extends Effect {
  constructor({
    luminanceFilter = new Color(0.2126, 0.7152, 0.0722),
    gammaCorrection = 0.6,
    matrix = 4,
  } = {}) {
    super('DitheringEffect', fragmentShader, {
      uniforms: new Map([
        ['uLuminanceFilter', { value: luminanceFilter }],
        ['uGammaCorrection', { value: gammaCorrection }],
        ['uMatrix', { value: matrix }],
      ]),
    })
  }

  set luminanceFilter([x, y, z]) {
    this.uniforms.get('uLuminanceFilter').value.set(x, y, z)
  }

  set gammaCorrection(value) {
    this.uniforms.get('uGammaCorrection').value = value
  }

  set matrix(value) {
    this.uniforms.get('uMatrix').value = value
  }
}

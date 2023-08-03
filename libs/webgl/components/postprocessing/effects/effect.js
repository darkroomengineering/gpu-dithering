import { BLEND } from 'libs/webgl/utils/blend'
import { Effect } from 'postprocessing'

const fragmentShader = `
${BLEND.NORMAL}

const int indexMatrix4x4[16] = int[](0,  8,  2,  10,
                                     12, 4,  14, 6,
                                     3,  11, 1,  9,
                                     15, 7,  13, 5);

const int indexMatrix8x8[64] = int[](0,  32, 8,  40, 2,  34, 10, 42,
                                     48, 16, 56, 24, 50, 18, 58, 26,
                                     12, 44, 4,  36, 14, 46, 6,  38,
                                     60, 28, 52, 20, 62, 30, 54, 22,
                                     3,  35, 11, 43, 1,  33, 9,  41,
                                     51, 19, 59, 27, 49, 17, 57, 25,
                                     15, 47, 7,  39, 13, 45, 5,  37,
                                     63, 31, 55, 23, 61, 29, 53, 21);

float indexValue() {
    int x = int(gl_FragCoord.x) % 4;
    int y = int(gl_FragCoord.y) % 4;
    return float(indexMatrix4x4[(x + y * 4)]) / 16.;

    // int x = int(mod(gl_FragCoord.x, 8.));
    // int y = int(mod(gl_FragCoord.y, 8.));
    // int index = x + (y * 8);
    // return float(indexMatrix8x8[index]) / 64.;
}

float steps = 15.;

    float quantize(float color) {
        float barWidth = 1. / steps;
        float x = floor(color / barWidth) / (steps-1.);
        return x;
    }


float dither(float color) {
    float closestColor = (color < 0.5) ? 0. : 1.;
    float secondClosestColor = 1. - closestColor;
    float d = indexValue();
    float distance = abs(closestColor - color);
    return (distance <= d) ? closestColor : secondClosestColor;
}


float gammaCorrection(float value, float gamma) {
    return pow(value, 1.0 / gamma);
}

    float greyscale(vec3 color) {
        float g = dot(color, vec3(0.2126, 0.7152, 0.0722));
        return g;
    }



    void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
        float grayscaled = greyscale(inputColor.rgb);
        
        vec3 grayscaleColor = vec3(grayscaled);

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

        float dithered = dither(gammaCorrection(grayscaled, 0.60));
        vec3 ditheredColor = vec3(dithered);


        vec3 color = blendNormal(grayscaleColor, ditheredColor, 0.35);

        outputColor = vec4(color, inputColor.a);

        // outputColor = vec4(ditheredColor, inputColor.a);

        // outputColor = vec4(grayscaleColor,1.0);

        // outputColor = vec4(inputColor.rgb, 1.0);

        
    }
`

export class DitheringEffect extends Effect {
  constructor() {
    super('DitheringEffect', fragmentShader, {
      uniforms: new Map([]),
    })
  }
}

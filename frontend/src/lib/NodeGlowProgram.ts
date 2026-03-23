/**
 * Custom Sigma.js v3 node program — Neon Glow effect
 * Renders nodes as bright circles with an exponentially-fading color halo.
 */
import { NodeDisplayData, RenderParams } from 'sigma/types';
import { NodeProgram } from 'sigma/rendering';
import { ProgramInfo } from 'sigma/rendering';
import { floatColor } from 'sigma/utils';

const VERTEX_SHADER_SOURCE = /* glsl */ `
attribute vec4 a_id;
attribute vec4 a_color;
attribute vec2 a_position;
attribute float a_size;

uniform float u_sizeRatio;
uniform float u_pixelRatio;
uniform mat3 u_matrix;

varying vec4 v_color;

const float bias = 255.0 / 254.0;

void main() {
  float size = a_size * u_sizeRatio * u_pixelRatio;
  gl_PointSize = size * 5.0;
  gl_Position = vec4(
    (u_matrix * vec3(a_position, 1)).xy,
    0,
    1
  );
  v_color = a_color;
  v_color.a *= bias;
}
`;

const FRAGMENT_SHADER_SOURCE = /* glsl */ `
precision mediump float;

varying vec4 v_color;

const float HALF = 0.5;

void main(void) {
  vec2 m = gl_PointCoord - vec2(HALF, HALF);
  float dist = length(m);

  float coreR = HALF / 2.5;

  if (dist < coreR * 0.8) {
    // Bright center
    float center = 1.0 - smoothstep(0.0, coreR * 0.8, dist);
    vec3 bright = v_color.rgb + vec3(0.2) * center;
    gl_FragColor = vec4(bright, 1.0);
  } else if (dist < coreR) {
    // Core AA edge
    float a = 1.0 - smoothstep(coreR * 0.8, coreR, dist);
    gl_FragColor = vec4(v_color.rgb, a);
  } else if (dist < HALF) {
    // Neon glow halo
    float t = (dist - coreR) / (HALF - coreR);
    float glow = exp(-t * 2.8) * 0.5;
    gl_FragColor = vec4(v_color.rgb, glow);
  } else {
    discard;
  }
}
`;

const { UNSIGNED_BYTE, FLOAT } = WebGLRenderingContext;
const UNIFORMS = ['u_sizeRatio', 'u_pixelRatio', 'u_matrix'] as const;

export default class NodeGlowProgram extends NodeProgram<(typeof UNIFORMS)[number]> {
  getDefinition() {
    return {
      VERTICES: 1,
      VERTEX_SHADER_SOURCE,
      FRAGMENT_SHADER_SOURCE,
      METHOD: WebGLRenderingContext.POINTS as 0,
      UNIFORMS,
      ATTRIBUTES: [
        { name: 'a_position', size: 2, type: FLOAT },
        { name: 'a_size', size: 1, type: FLOAT },
        { name: 'a_color', size: 4, type: UNSIGNED_BYTE, normalized: true },
        { name: 'a_id', size: 4, type: UNSIGNED_BYTE, normalized: true },
      ],
    };
  }

  processVisibleItem(nodeIndex: number, startIndex: number, data: NodeDisplayData) {
    const array = this.array;
    array[startIndex++] = data.x;
    array[startIndex++] = data.y;
    array[startIndex++] = data.size;
    array[startIndex++] = floatColor(data.color);
    array[startIndex++] = nodeIndex;
  }

  setUniforms({ sizeRatio, pixelRatio, matrix }: RenderParams, { gl, uniformLocations }: ProgramInfo) {
    const { u_sizeRatio, u_pixelRatio, u_matrix } = uniformLocations;
    gl.uniform1f(u_sizeRatio, sizeRatio);
    gl.uniform1f(u_pixelRatio, pixelRatio);
    gl.uniformMatrix3fv(u_matrix, false, matrix);
  }
}

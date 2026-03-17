uniform sampler2D uTexture1;
uniform sampler2D uTexture2;
uniform float uTexture1Aspect;
uniform float uTexture2Aspect;
uniform float uPlaneAspect;
uniform float uProgress;
uniform vec3 uGradeShadow;
uniform vec3 uGradeMid;
uniform vec3 uGradeHigh;
varying vec2 vUv;

const float smoothness = .1;
const vec2 direction = vec2(-1., 0.);
const vec2 center = vec2(.5, .5);

// scales uv to fill the plane while preserving aspect ratio
vec2 coverUv(vec2 uv, float imageAspect, float planeAspect) {
  vec2 ratio = vec2(
    min(planeAspect / imageAspect, 1.),
    min(imageAspect / planeAspect, 1.)
  );
  return vec2(
    uv.x * ratio.x + (1. - ratio.x) * .5,
    uv.y * ratio.y + (1. - ratio.y) * .5
  );
}

vec4 getFromColor(vec2 uv) {
  return texture2D(uTexture1, coverUv(uv, uTexture1Aspect, uPlaneAspect));
}

vec4 getToColor(vec2 uv) {
  return texture2D(uTexture2, coverUv(uv, uTexture2Aspect, uPlaneAspect));
}

// ref: https://gl-transitions.com/editor/directionalwarp
vec4 transition(vec2 uv) {
  vec2 v = normalize(direction);
  v /= abs(v.x) + abs(v.y);
  float d = v.x * center.x + v.y * center.y;
  float m = 1.0 - smoothstep(-smoothness, 0.0, v.x * uv.x + v.y * uv.y - (d - 0.5 + uProgress * (1.0 + smoothness)));

  // from: slides out, to: slides in
  vec2 fromUv = uv - v * (uProgress * .3);
  vec2 toUv   = uv - v * ((uProgress - 1.) * .3);

  return mix(getFromColor((fromUv - 0.5) * (1.0 - m) + 0.5), getToColor((toUv - 0.5) * m + 0.5), m);
}

vec3 blueGrade(vec3 color) {
  // luminance
  float l = dot(color, vec3(.2126, .7152, .0722));
  l = pow(l, .5);

  vec3 graded;
  if (l < .5) {
    graded = mix(uGradeShadow, uGradeMid, l / .5);
  } else {
    graded = mix(uGradeMid, uGradeHigh, (l - .5) / .5);
  }

  return graded;
}

void main() {
  vec4 texture = transition(vUv);
  vec3 graded = blueGrade(texture.rgb);
  vec3 color = mix(graded * .9, texture.rgb, .25);

  gl_FragColor = vec4(color, texture.a);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}

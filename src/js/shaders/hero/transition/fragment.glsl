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

vec4 transition(vec2 uv) {
  float smoothness = .1;
  vec2 direction = vec2(-1., 0.);

  vec2 v = normalize(direction);
  v /= abs(v.x) + abs(v.y); // L1 norm
  float d = dot(v, uv);
  float d_min = min(0., v.x) + min(0., v.y); // subtracting d_min shifts d to [0,1] for any direction
  float m = 1. - smoothstep(-smoothness, 0., d - d_min - (1. + smoothness) * uProgress);

  vec2 proj = v * d; // projection
  vec2 perp = uv - proj; // perpendicular
  vec2 uvFrom = perp + proj * (1.0 - m);
  vec2 uvTo   = perp + proj * m;

  return mix(getFromColor(uvFrom), getToColor(uvTo), m);
}

float luma(vec3 color) {
  return dot(color, vec3(.2126, .7152, .0722));
}

vec3 colorGrade(vec3 color) {
  float l = luma(color);
  l = pow(l, .5);

  vec3 graded;
  if (l < .5) {
    graded = mix(uGradeShadow, uGradeMid, l / .5);
  } else {
    graded = mix(uGradeMid, uGradeHigh, (l - .5) / .5);
  }

  return graded;
}

vec3 adjustSaturation(vec3 color, float saturation) {
  float l = luma(color);
  vec3 gray = vec3(l);
  return mix(gray, color, saturation);
}

void main() {
  vec4 texture = transition(vUv);
  vec3 graded = colorGrade(texture.rgb);
  graded = adjustSaturation(graded, 2.);
  vec3 color = mix(graded, texture.rgb, .3);

  gl_FragColor = vec4(color, texture.a);
  #include <colorspace_fragment>
}

uniform float uTime;
uniform vec2 uResolution;
uniform float uDeltaZ;
varying float vPositionZ;

void main() {
  vec3 newPosition = position;

  newPosition.x = mod(newPosition.x -  .01 * uTime, 1.) - .5;
  newPosition.z = mod(newPosition.z + uDeltaZ, 1.);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);

  gl_PointSize = .25 * min(uResolution.x, uResolution.y) * newPosition.z;

  vPositionZ = newPosition.z;
}

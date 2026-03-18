uniform vec3 uColor;
varying float vDistanceZ;

void main() {
  float d = length(gl_PointCoord - .5);
  float alpha = smoothstep(.5, .2, d) * vDistanceZ * .25;

  gl_FragColor = vec4(uColor, alpha);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}

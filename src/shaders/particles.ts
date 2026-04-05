export const vertexShader = `
  uniform float uTime;
  uniform float uGravityScale;
  uniform float uNoiseScale;
  uniform float uSpeed;
  uniform float uBloomOverride;
  uniform vec2 uMouse;
  uniform float uAspect;

  attribute vec3 aRandom;     // Instanced randomness

  varying float vVelocity;

  // Ashima 3D Simplex Noise
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  
  float snoise(vec3 v) { 
      const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
      const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

      vec3 i  = floor(v + dot(v, C.yyy) );
      vec3 x0 = v - i + dot(i, C.xxx) ;

      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min( g.xyz, l.zxy );
      vec3 i2 = max( g.xyz, l.zxy );

      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;

      i = mod289(i); 
      vec4 p = permute( permute( permute( 
                  i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
                + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

      float n_ = 0.142857142857;
      vec3  ns = n_ * D.wyz - D.xzx;

      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_ );

      vec4 x = x_ *ns.x + ns.yyyy;
      vec4 y = y_ *ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);

      vec4 b0 = vec4( x.xy, y.xy );
      vec4 b1 = vec4( x.zw, y.zw );

      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));

      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

      vec3 p0 = vec3(a0.xy,h.x);
      vec3 p1 = vec3(a0.zw,h.y);
      vec3 p2 = vec3(a1.xy,h.z);
      vec3 p3 = vec3(a1.zw,h.w);

      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
      p0 *= norm.x;
      p1 *= norm.y;
      p2 *= norm.z;
      p3 *= norm.w;

      vec4 m = max(0.5 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
  }

  void main() {
    float rawT = (uTime * uSpeed);
    float t = rawT + (aRandom.x * 20.0); // Offset each particle's internal clock randomly
    // Map instance seed to a wide initial position space to heavily de-blob the visual center
    // We intentionally keep this mathematically larger than the maximum noise displacement (10 units logic) 
    // to preserve the empty Black Hole, but small enough to fit natively in the screen.
    float radius = 24.0;
    
    // 1. Parametric Orbit (Continuous over time)
    float angle = t * (aRandom.x * 0.5 + 0.1) + (aRandom.z * 10.0);
    float r = radius * (0.5 + aRandom.y);
    vec3 orbitPos = vec3(
        cos(angle) * r, 
        sin(angle) * r, 
        (aRandom.z - 0.5) * 40.0 * sin(t*0.5)
    );
    
    // 2. Parametric Noise Flow Offset (Creates the squirming fluid math curves)
    vec3 noisePos = orbitPos * uNoiseScale + vec3(t * 0.2);
    vec3 noiseOffset = vec3(
        snoise(noisePos),
        snoise(noisePos + vec3(100.0)),
        snoise(noisePos + vec3(-100.0))
    ) * 20.0;
    
    // VVelocity drives color mapped to how quickly Noise shifts the particle
    vVelocity = length(noiseOffset) * 0.1 + (aRandom.y * 0.5);
    vec3 finalPos = orbitPos + noiseOffset;
    
    // Gravity influence pulls the orbit inward (creates topological density)
    finalPos = mix(finalPos, vec3(0.0), clamp(uGravityScale * 0.25, 0.0, 0.8));

    vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // ==========================================
    // INTERACTIVE SCREEN-SPACE MOUSE REPULSION
    // ==========================================
    if (uMouse.x > -999.0) {
        vec2 ndcPos = gl_Position.xy / gl_Position.w;
        vec2 aspectNdcPos = vec2(ndcPos.x * uAspect, ndcPos.y);
        vec2 aspectMouse = vec2(uMouse.x * uAspect, uMouse.y);
        
        float distNdc = length(aspectNdcPos - aspectMouse);
        float repelScale = 1.0 - smoothstep(0.0, 0.35, distNdc); // Tighter, localized influence radius to form a beautiful local vortex
        
        vVelocity += repelScale * 4.0; // Gentle, slower color shift when interacting
        
        if (repelScale > 0.0) {
            // Fluid Dynamics: Curl Vortex and Slight Attraction (Local Order)
            vec2 toParticle = aspectNdcPos - aspectMouse;
            vec2 radialDir = normalize(toParticle);
            vec2 swirlDir = vec2(-radialDir.y, radialDir.x); // Perpendicular tangent
            
            // 70% Swirl, 30% Pull (creates a spiraling vortex of ordered information)
            vec2 vortexDir = normalize(swirlDir * 0.7 - radialDir * 0.3);
            
            // Apply controlled fluid offset based on depth (w)
            gl_Position.x += (vortexDir.x / uAspect) * repelScale * gl_Position.w * 0.4;
            gl_Position.y += vortexDir.y * repelScale * gl_Position.w * 0.4;
        } else {
            // GLOBAL ENTROPY RADIATION
            // The further away from the local order vortex you are, the more chaotic the noise becomes.
            // This visually proves the 2nd Law of Thermodynamics: creating local order radiates heat!
            float environmentalChaos = smoothstep(0.70, 1.5, distNdc);
            
            // Generate smooth environmental warping driven by the Dark Energy scale
            float warpX = sin(ndcPos.y * 15.0 + uTime * 3.0) * cos(ndcPos.x * 10.0 - uTime * 2.0);
            float warpY = cos(ndcPos.x * 15.0 - uTime * 3.0) * sin(ndcPos.y * 10.0 + uTime * 2.0);
            
            gl_Position.x += warpX * environmentalChaos * uBloomOverride * 0.15 * gl_Position.w;
            gl_Position.y += warpY * environmentalChaos * uBloomOverride * 0.15 * gl_Position.w;
            
            vVelocity += environmentalChaos * uBloomOverride * 3.0; // Boosts color to represent radiated heat
        }
    }
    
    // Size the particles dynamically based on depth
    gl_PointSize = clamp(45.0 / gl_Position.w, 4.0, 22.0);
    // Expand sizes slightly based on dark energy bloom and random seed
    gl_PointSize *= (1.0 + uBloomOverride * 0.5) * (0.5 + aRandom.z);
  }
`;

export const fragmentShader = `
  uniform float uBloomOverride;
  varying float vVelocity;

  void main() {
    // Circular shaping: discard pixels outside the center of the gl_Point box
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    if (dist > 0.5) discard;
    
    // Soft vignette glow on each particle
    float alpha = smoothstep(0.5, 0.2, dist);

    // Cosmic Soup Thermodynamics Colors
    // Red = High Heat/Speed, Blue/Purple = Low Heat/Speed
    vec3 colorCold = vec3(0.0, 0.2, 0.8);      // Deep freezing blue
    vec3 colorWarm = vec3(0.9, 0.2, 0.5);      // Magenta warmth
    vec3 colorHot = vec3(1.0, 0.8, 0.1);       // Yellow/White blazing heat
    vec3 colorBurst = vec3(1.0, 1.0, 1.0);     // Pure White interaction burst
    
    float normVel = clamp(vVelocity * 0.35, 0.0, 1.0);
    
    vec3 finalColor;
    if (normVel < 0.5) {
        finalColor = mix(colorCold, colorWarm, normVel * 2.0);
    } else {
        finalColor = mix(colorWarm, colorHot, (normVel - 0.5) * 2.0);
    }
    
    // Extreme heat flashes white
    finalColor = mix(finalColor, colorBurst, pow(normVel, 4.0));
    
    float bloomMultiplier = 1.0 + (uBloomOverride * 1.5);
    gl_FragColor = vec4(finalColor, clamp(alpha * bloomMultiplier, 0.0, 1.0));
  }
`;

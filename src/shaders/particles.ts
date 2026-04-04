export const vertexShader = `
  uniform float uTime;
  uniform float uGravityScale;
  uniform float uNoiseScale;
  uniform float uSpeed;
  uniform float uBloomOverride;
  uniform vec2 uMouse;
  uniform float uAspect;

  attribute float aLineIndex; // 0.0 (head) to 1.0 (tail)
  attribute vec3 aRandom;     // Instanced randomness

  varying float vLife;
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
    // The "head" of the tendril runs at current uTime. 
    // The "tail" stretches backwards in time to draw a trail!
    float trailLength = 1.2; // How far back in time the tail exists
    float rawT = (uTime * uSpeed);
    float t = rawT - (aLineIndex * trailLength);
    
    // Map instance seed to a wide initial position space to heavily de-blob the visual center
    float radius = 55.0;
    
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
    vLife = 1.0 - aLineIndex; // 1.0 = head, 0.0 = tail
    
    vec3 finalPos = orbitPos + noiseOffset;
    
    // Gravity influence collapses the orbit to 0,0,0
    finalPos = mix(finalPos, vec3(0.0), clamp(uGravityScale * 0.5, 0.0, 1.0));

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
        float repelScale = 1.0 - smoothstep(0.0, 0.70, distNdc); // Massively expanded 70% influence radius
        
        vVelocity += repelScale * 5.0;
        
        if (repelScale > 0.0) {
            // Fluid Dynamics: Curl Vortex and Slight Attraction
            vec2 toParticle = aspectNdcPos - aspectMouse;
            vec2 radialDir = normalize(toParticle);
            vec2 swirlDir = vec2(-radialDir.y, radialDir.x); // Perpendicular tangent
            
            // 70% Swirl, 30% Pull (creates a spiraling vortex)
            vec2 vortexDir = normalize(swirlDir * 0.7 - radialDir * 0.3);
            
            // Apply fluid offset based on depth (w)
            gl_Position.x += (vortexDir.x / uAspect) * repelScale * gl_Position.w * 0.7;
            gl_Position.y += vortexDir.y * repelScale * gl_Position.w * 0.7;
        }
    }
  }
`;

export const fragmentShader = `
  uniform float uBloomOverride;
  varying float vVelocity;
  varying float vLife; // 1.0 at head, 0.0 at tail

  void main() {
    // Fade out towards the tail
    float alpha = smoothstep(0.0, 0.8, vLife); 

    // Chrome Experiment "Bioluminescence"
    vec3 colorTail = vec3(0.1, 0.0, 0.4);      // Deep void tail
    vec3 colorMid = vec3(0.56, 0.0, 1.0);      // Electric Violet
    vec3 colorHead = vec3(0.0, 1.0, 1.0);      // Cyan Head
    vec3 colorBurst = vec3(1.0, 1.0, 1.0);     // Pure White interaction burst
    
    float normVel = clamp(vVelocity * 0.25, 0.0, 1.0);
    
    vec3 finalColor;
    // Map colors across the tendril length (vLife) and velocity
    if (vLife < 0.5) {
        finalColor = mix(colorTail, colorMid, vLife * 2.0);
    } else {
        finalColor = mix(colorMid, colorHead, (vLife - 0.5) * 2.0);
    }
    
    // Add velocity boost to make the heads flash wildly when high energy
    finalColor = mix(finalColor, colorBurst, pow(normVel, 2.0) * vLife);
    
    // Taper the alpha out linearly, boosting opacity natively by the Bloom slider proxy
    float bloomMultiplier = 1.0 + (uBloomOverride * 1.5);
    gl_FragColor = vec4(finalColor, clamp(alpha * 0.8 * bloomMultiplier, 0.0, 1.0));
  }
`;

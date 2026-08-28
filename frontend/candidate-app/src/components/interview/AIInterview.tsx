import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { VRMLoaderPlugin, VRM } from "@pixiv/three-vrm";

// Renders the 3D AI interviewer inside a Three.js scene - The VRM avatar is loaded into the scene and rendered continuously using the browser's animation loop 

export function AIInterviewer() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    // Create the Three.js scene.
    const scene = new THREE.Scene();

    // Create the camera used to view the avatar.
    const camera = new THREE.PerspectiveCamera(
      30,
      container.clientWidth / container.clientHeight,
      0.1,
      100,
    );

    camera.position.set(0, 1.4, 3);

    // Create the WebGL renderer.
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(
      container.clientWidth,
      container.clientHeight,
    );

    container.appendChild(renderer.domElement);

    // Add soft lighting for the interviewer.
    const ambientLight = new THREE.AmbientLight(
      0xffffff,
      2,
    );

    scene.add(ambientLight);

    // Load the VRM avatar.
    const loader = new GLTFLoader();

    loader.register(
      (parser) => new VRMLoaderPlugin(parser),
    );

    let vrm: VRM | undefined;

    loader.load(
      "/avatars/interviewer.vrm",
      (gltf) => {
        vrm = gltf.userData.vrm;

        if (!vrm) return;

        scene.add(vrm.scene);

        // Rotate the avatar to face the camera.
        vrm.scene.rotation.y = Math.PI;
      },
      undefined,
      (error) => {
        console.error(
          "Failed to load AI interviewer avatar:",
          error,
        );
      },
    );

    // Handle browser/container resizing.
    const handleResize = () => {
      if (!container) return;

      camera.aspect =
        container.clientWidth / container.clientHeight;

      camera.updateProjectionMatrix();

      renderer.setSize(
        container.clientWidth,
        container.clientHeight,
      );
    };

    window.addEventListener("resize", handleResize);

    // Render the scene continuously.
    const clock = new THREE.Clock();

    const animate = () => {
      const deltaTime = clock.getDelta();

      if (vrm) {
        vrm.update(deltaTime);
      }

      renderer.render(scene, camera);

      requestAnimationFrame(animate);
    };

    animate();

    // Clean up Three.js resources when the component unmounts.
    return () => {
      window.removeEventListener(
        "resize",
        handleResize,
      );

      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="h-full w-full overflow-hidden rounded-2xl"
    />
  );
}
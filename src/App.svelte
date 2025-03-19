<script>
  import { onMount, onDestroy } from 'svelte';
  import * as THREE from 'three';
	import Hud from './HUD.svelte';
	import { generateChunk } from './world';

  // Scene setup
  let scene, camera, renderer, drone;
  const CHUNK_SIZE = 20; // Size of each chunk in world units
  let playerPosition = { x: 0, y: 5, z: 0 }; // Drone starts above ground
  let loadedChunks = new Set();

  onMount(() => {
    // Initialize Three.js
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Create drone (simple sphere)
    drone = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xff0000 })
    );
    drone.position.set(playerPosition.x, playerPosition.y, playerPosition.z);
    scene.add(drone);

    // Add basic lighting
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 10, 5);
    scene.add(light);

    // Load initial chunks
    loadInitialChunks();

    // Game loop
    function animate() {
      requestAnimationFrame(animate);
      updateDronePosition();
      camera.position.set(drone.position.x, drone.position.y + 1, drone.position.z - 5);
      camera.lookAt(drone.position);
      manageChunks();
      renderer.render(scene, camera);
    }
    animate();

    // Handle window resize
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  });

  onDestroy(() => {
    renderer.dispose();
  });

  // Drone movement (basic controls)
  let velocity = { x: 0, z: 0 };
  function updateDronePosition() {
    document.addEventListener('keydown', (event) => {
      const speed = 0.1;
      switch (event.key) {
        case 'ArrowUp': velocity.z = -speed; break;
        case 'ArrowDown': velocity.z = speed; break;
        case 'ArrowLeft': velocity.x = -speed; break;
        case 'ArrowRight': velocity.x = speed; break;
      }
    });
    document.addEventListener('keyup', () => {
      velocity.x = 0;
      velocity.z = 0;
    });
    drone.position.x += velocity.x;
    drone.position.z += velocity.z;
    playerPosition = drone.position;
  }

  // Chunk management
  function loadInitialChunks() {
    const startChunkX = Math.floor(playerPosition.x / CHUNK_SIZE);
    const startChunkZ = Math.floor(playerPosition.z / CHUNK_SIZE);
    for (let x = startChunkX - 1; x <= startChunkX + 1; x++) {
      for (let z = startChunkZ - 1; z <= startChunkZ + 1; z++) {
        loadChunk(x, z);
      }
    }
  }

  function manageChunks() {
    const currentChunkX = Math.floor(playerPosition.x / CHUNK_SIZE);
    const currentChunkZ = Math.floor(playerPosition.z / CHUNK_SIZE);
    const loadDistance = 1;
    for (let x = currentChunkX - loadDistance; x <= currentChunkX + loadDistance; x++) {
      for (let z = currentChunkZ - loadDistance; z <= currentChunkZ + loadDistance; z++) {
        if (!loadedChunks.has(`${x},${z}`)) {
          loadChunk(x, z);
        }
      }
    }
    const unloadDistance = 2;
    loadedChunks.forEach(chunkKey => {
      const [x, z] = chunkKey.split(',').map(Number);
      if (Math.abs(x - currentChunkX) > unloadDistance || Math.abs(z - currentChunkZ) > unloadDistance) {
        unloadChunk(x, z);
      }
    });
  }

  function loadChunk(x, z) {
    const chunk = generateChunk(x, z);
    chunk.name = `${x},${z}`;
    scene.add(chunk);
    loadedChunks.add(`${x},${z}`);
  }

  function unloadChunk(x, z) {
    const chunkKey = `${x},${z}`;
    const chunk = scene.getObjectByName(chunkKey);
    if (chunk) {
      scene.remove(chunk);
      chunk.traverse(obj => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) obj.material.dispose();
      });
      loadedChunks.delete(chunkKey);
    }
  }
</script>

<Hud {playerPosition} />

<style>
	:global(body) {
		padding: 0;
	}
  canvas {
    position: absolute;
    top: 0;
    left: 0;
  }
</style>
<script>
  import { onMount, onDestroy } from 'svelte';
  import * as THREE from 'three';
  import { generateChunk } from './world.js'; // Assuming world.js handles chunk generation
	import Hud from './HUD.svelte';
  // Scene setup
  let scene, camera, renderer, drone;
  const CHUNK_SIZE = 20; // Size of each chunk in world units
  let playerPosition = { x: 0, y: 5, z: 0 }; // Start above ground
  let loadedChunks = new Set();
  let velocity = new THREE.Vector3(0, 0, 0); // 3D velocity for x, y, z movement

  // Track key states
  let keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    [" "]: false,
    Shift: false // Use ShiftLeft for down movement
  };

  onMount(() => {
    // Initialize Three.js scene
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Create drone (a simple red sphere)
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

    // Load initial chunks (assuming this function exists)
    loadInitialChunks();

    // Add event listeners for key presses
    window.addEventListener('keydown', keydownHandler);
    window.addEventListener('keyup', keyupHandler);

    // Animation loop
    function animate() {
      requestAnimationFrame(animate);
      updateDronePosition();
      camera.position.set(drone.position.x, drone.position.y + 1, drone.position.z - 5);
      camera.lookAt(drone.position);
      manageChunks(); // Assuming this manages world chunks
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
    // Clean up event listeners and renderer
    window.removeEventListener('keydown', keydownHandler);
    window.removeEventListener('keyup', keyupHandler);
    renderer.dispose();
  });

  // Key event handlers
  function keydownHandler(event) {
		console.log(event.key)
    if (keys.hasOwnProperty(event.key)) {
      keys[event.key] = true;
			console.log(`Key down: ${event.key}`);
    }
  }

  function keyupHandler(event) {
    if (keys.hasOwnProperty(event.key)) {
      keys[event.key] = false;
			console.log(`Key up: ${event.key}`);
    }
  }

  // Update drone position based on key states
  function updateDronePosition() {
    const speed = 0.1; // Movement speed
    velocity.set(0, 0, 0); // Reset velocity each frame

    // Horizontal movement
    if (keys.ArrowUp) velocity.z -= speed; // Forward
    if (keys.ArrowDown) velocity.z += speed; // Backward
    if (keys.ArrowLeft) velocity.x -= speed; // Left
    if (keys.ArrowRight) velocity.x += speed; // Right

    // Vertical movement
    if (keys[" "]) velocity.y += speed; // Up
    if (keys.Shift) velocity.y -= speed; // Down

    // Apply velocity to drone position
    drone.position.add(velocity);
		velocity.multiplyScalar(0.9)

    // Prevent drone from going below ground (y = 0.5 is the drone's radius)
    if (drone.position.y < 0.5) drone.position.y = 0.5;

    // Update player position for chunk management
    playerPosition = drone.position;
  }

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

  function loadChunk(chunkX, chunkZ) {
    const chunkId = `${chunkX},${chunkZ}`;
    if (!loadedChunks.has(chunkId)) {
      const chunk = generateChunk(chunkX * CHUNK_SIZE, chunkZ * CHUNK_SIZE);
      scene.add(chunk);
      loadedChunks.add(chunkId);
    }
  }

  function unloadChunk(chunkX, chunkZ) {
    const chunkId = `${chunkX},${chunkZ}`;
    if (loadedChunks.has(chunkId)) {
      const chunk = scene.getObjectByName(chunkId);
      if (chunk) scene.remove(chunk);
      loadedChunks.delete(chunkId);
    }
  }
</script>

<Hud {playerPosition} />

<style>
	:global(body) {
		padding: 0;
	}
  :global(canvas) {
    position: absolute;
    top: 0;
    left: 0;
  }
</style>
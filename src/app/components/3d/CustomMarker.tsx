// CustomMarker.tsx
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import mapboxgl from 'mapbox-gl';

export class Custom3DMarker {
  private element: HTMLDivElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private model: THREE.Object3D | null = null;

  constructor() {
    // Create marker element
    this.element = document.createElement('div');
    this.element.className = 'custom-marker';
    this.element.style.width = '50px';
    this.element.style.height = '50px';

    // Set up Three.js scene
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ 
      alpha: true,
      antialias: true 
    });
    
    this.renderer.setSize(50, 50);
    this.element.appendChild(this.renderer.domElement);

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    this.scene.add(ambientLight, directionalLight);

    // Position camera
    this.camera.position.z = 5;

    // Load 3D model
    this.loadModel();

    // Start animation
    this.animate();
  }

  private async loadModel() {
    const loader = new GLTFLoader();
    try {
      const gltf = await loader.loadAsync('/models/trophy.glb'); // Make sure to add your 3D model
      this.model = gltf.scene;
      this.model.scale.set(1, 1, 1);
      this.scene.add(this.model);
    } catch (error) {
      console.error('Error loading 3D model:', error);
    }
  }

  private animate = () => {
    requestAnimationFrame(this.animate);
    
    if (this.model) {
      this.model.rotation.y += 0.01;
    }
    
    this.renderer.render(this.scene, this.camera);
  };

  getElement(): HTMLDivElement {
    return this.element;
  }

  remove() {
    this.renderer.dispose();
    if (this.model) {
      this.scene.remove(this.model);
    }
    this.element.remove();
  }
}

// Export function to create marker
export function create3DMarker(coordinates: [number, number], map: mapboxgl.Map): mapboxgl.Marker {
  const custom3DMarker = new Custom3DMarker();
  
  return new mapboxgl.Marker({
    element: custom3DMarker.getElement(),
    anchor: 'bottom'
  })
    .setLngLat(coordinates)
    .addTo(map);
}
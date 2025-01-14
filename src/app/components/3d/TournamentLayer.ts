import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import mapboxgl from 'mapbox-gl';
import { Tournament } from '@/app/data/tournaments';

export class TournamentLayer {
  private scene: THREE.Scene;
  private camera: THREE.Camera;
  private renderer: THREE.WebGLRenderer | null = null;
  private map: mapboxgl.Map;
  private tournaments: Tournament[];

  constructor(map: mapboxgl.Map, tournaments: Tournament[]) {
    this.map = map;
    this.tournaments = tournaments;
    this.scene = new THREE.Scene();
    this.camera = new THREE.Camera();

    // Add lights
    const directionalLight1 = new THREE.DirectionalLight(0xffffff);
    directionalLight1.position.set(0, -70, 100).normalize();
    this.scene.add(directionalLight1);

    const directionalLight2 = new THREE.AmbientLight(0xffffff);
    directionalLight2.position.set(0, 70, 100).normalize();
    this.scene.add(directionalLight2);

    // Load models for each tournament
    this.loadTournamentModels();
  }

  private loadTournamentModels() {
    const loader = new GLTFLoader();
    
    this.tournaments.forEach(tournament => {
      const modelOrigin = [tournament.location.lng, tournament.location.lat];
      const modelAltitude = 0;
      const modelRotate = [Math.PI / 2, 0, 0];

      const modelAsMercatorCoordinate = mapboxgl.MercatorCoordinate.fromLngLat(
        modelOrigin as [number, number],
        modelAltitude
      );

      const modelTransform = {
        translateX: modelAsMercatorCoordinate.x,
        translateY: modelAsMercatorCoordinate.y,
        translateZ: modelAsMercatorCoordinate.z,
        rotateX: modelRotate[0],
        rotateY: modelRotate[1],
        rotateZ: modelRotate[2],
        /* Multiply by a scale factor to make the model visible */
        scale: modelAsMercatorCoordinate.meterInMercatorCoordinateUnits() * 150
      };

      loader.load(
        '/models/tennis/scene.gltf',
        (gltf) => {
          gltf.scene.userData.transform = modelTransform;
          this.scene.add(gltf.scene);
          console.log('Model loaded successfully:', {
            transform: modelTransform,
            model: gltf.scene
          });
        },
        (xhr) => {
          console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        (error) => {
          console.error('Error loading model:', error);
        }
      );
    });
  }

  public createLayer() {
    return {
      id: '3d-tournaments',
      type: 'custom',
      renderingMode: '3d',
      onAdd: () => {
        this.renderer = new THREE.WebGLRenderer({
          canvas: this.map.getCanvas(),
          context: this.map.painter.context.gl,
          antialias: true
        });
        this.renderer.autoClear = false;
      },
      render: (gl: WebGLRenderingContext, matrix: number[]) => {
        if (!this.renderer) return;

        // Update each model's transform
        this.scene.traverse((node) => {
          if (node instanceof THREE.Object3D && node.userData.transform) {
            const transform = node.userData.transform;

            const rotationX = new THREE.Matrix4().makeRotationAxis(
              new THREE.Vector3(1, 0, 0),
              transform.rotateX
            );
            const rotationY = new THREE.Matrix4().makeRotationAxis(
              new THREE.Vector3(0, 1, 0),
              transform.rotateY
            );
            const rotationZ = new THREE.Matrix4().makeRotationAxis(
              new THREE.Vector3(0, 0, 1),
              transform.rotateZ
            );

            const m = new THREE.Matrix4().fromArray(matrix);
            const l = new THREE.Matrix4()
              .makeTranslation(
                transform.translateX,
                transform.translateY,
                transform.translateZ
              )
              .scale(
                new THREE.Vector3(
                  transform.scale,
                  -transform.scale,
                  transform.scale
                )
              )
              .multiply(rotationX)
              .multiply(rotationY)
              .multiply(rotationZ);

            this.camera.projectionMatrix = m.multiply(l);
          }
        });

        this.renderer.resetState();
        this.renderer.render(this.scene, this.camera);
        this.map.triggerRepaint();
      }
    };
  }
}
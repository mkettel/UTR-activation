import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import mapboxgl from 'mapbox-gl';
import { Tournament } from '@/app/data/tournaments';
import * as ReactDOMServer from 'react-dom/server';
import TournamentPopup from '@/app/components/ui/TournamentPopup';
import type { FC } from 'react';

// Define the popup component type
type TournamentPopupType = FC<{ tournament: Tournament }>;

export class TournamentLayer {
  private scene: THREE.Scene;
  private camera: THREE.Camera;
  private renderer: THREE.WebGLRenderer | null = null;
  private map: mapboxgl.Map;
  private tournaments: Tournament[];
  private markers: mapboxgl.Marker[] = [];

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

    // Load 3D models and create invisible markers
    this.loadTournamentModels();
    this.createInteractionMarkers();
  }

  private createInteractionMarkers() {
    // Clear any existing markers
    this.markers.forEach(marker => marker.remove());
    this.markers = [];

    this.tournaments.forEach(tournament => {
      // Create an invisible clickable element
      const el = document.createElement('div');
      el.className = 'cursor-pointer';
      el.style.width = '40px';  // Make click target reasonably sized
      el.style.height = '40px';
      el.style.opacity = '0';   // Make it invisible
      
      // Create the marker
      const marker = new mapboxgl.Marker({
        element: el,
        anchor: 'center'
      })
        .setLngLat([tournament.location.lng, tournament.location.lat])
        .setPopup(
          new mapboxgl.Popup({
            offset: 25,
            closeButton: true,
            maxWidth: '320px'
          }).setHTML(
            ReactDOMServer.renderToString(
              (TournamentPopup as TournamentPopupType)({ tournament })
            )
          )
        )
        .addTo(this.map);

      this.markers.push(marker);
    });
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

  public cleanup() {
    // Remove all markers when cleaning up
    this.markers.forEach(marker => marker.remove());
    this.markers = [];
  }
}
import {
  AmbientLight,
  BoxGeometry,
  DirectionalLight,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Scene,
  TorusGeometry,
  WebGLRenderer,
} from 'three'

export interface HeroTwinSceneHandle {
  dispose: () => void
}

export function mountHeroTwinScene(container: HTMLDivElement): HeroTwinSceneHandle {
  const width = container.clientWidth
  const height = container.clientHeight

  const scene = new Scene()
  const camera = new PerspectiveCamera(45, width / height, 0.1, 1000)
  camera.position.set(2.5, 2.2, 3.8)

  const renderer = new WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  container.appendChild(renderer.domElement)

  const mainBlock = new Mesh(
    new BoxGeometry(1.2, 1.8, 1.2),
    new MeshStandardMaterial({ color: '#1e3a8a', metalness: 0.4, roughness: 0.2 }),
  )

  const tower = new Mesh(
    new BoxGeometry(0.45, 2.6, 0.45),
    new MeshStandardMaterial({ color: '#3b82f6', emissive: '#1d4ed8', emissiveIntensity: 0.18 }),
  )
  tower.position.set(-0.8, 0.4, 0)

  const ring = new Mesh(
    new TorusGeometry(1.6, 0.04, 12, 70),
    new MeshStandardMaterial({ color: '#10b981', emissive: '#10b981', emissiveIntensity: 0.2 }),
  )
  ring.rotation.x = Math.PI / 2
  ring.position.y = -0.4

  const ambientLight = new AmbientLight('#ffffff', 0.5)
  const directionalLight = new DirectionalLight('#ffffff', 1)
  directionalLight.position.set(3, 4, 2)

  scene.add(mainBlock, tower, ring, ambientLight, directionalLight)

  let animationFrame = 0

  const draw = () => {
    mainBlock.rotation.y += 0.01
    tower.rotation.y -= 0.008
    ring.rotation.z += 0.012
    renderer.render(scene, camera)
    animationFrame = requestAnimationFrame(draw)
  }

  draw()

  const onResize = () => {
    const updatedWidth = container.clientWidth
    const updatedHeight = container.clientHeight
    camera.aspect = updatedWidth / updatedHeight
    camera.updateProjectionMatrix()
    renderer.setSize(updatedWidth, updatedHeight)
  }

  window.addEventListener('resize', onResize)

  return {
    dispose() {
      window.removeEventListener('resize', onResize)
      cancelAnimationFrame(animationFrame)
      renderer.dispose()
      renderer.domElement.remove()
    },
  }
}
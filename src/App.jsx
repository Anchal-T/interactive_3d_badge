import { Canvas } from "@react-three/fiber";
import { useGLTF, OrbitControls } from "@react-three/drei";
import { Model } from "./components/Model";
import { Band } from "./components/Band";
import { Physics } from "@react-three/rapier";
function App(){
    return(
        <Canvas camera={{position: [0, 0, 10], fov : 75}}>
            <ambientLight intensity={1} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <Physics>
                <Model />
                <Band />
            </Physics>
            <OrbitControls />
        </Canvas>
    )
}

export default App;
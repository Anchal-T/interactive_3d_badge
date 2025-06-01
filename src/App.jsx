import { Canvas } from "@react-three/fiber";
import { useGLTF, OrbitControls } from "@react-three/drei";
import { Model } from "./Model";

function App(){
    return(
        <Canvas camera={{position: [0, 0, 5], fov : 75}}>
            <ambientLight intensity={0.5}></ambientLight>
            <pointLight position={[10, 10, 10]}></pointLight>
            <Model />
            <OrbitControls></OrbitControls>
        </Canvas>
    )
}

export default App
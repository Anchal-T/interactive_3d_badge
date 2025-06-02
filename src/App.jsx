import { Canvas } from "@react-three/fiber";
import { useGLTF, OrbitControls } from "@react-three/drei";
import { Model } from "./components/Model";
import { Band } from "./components/Band";
import { Physics } from "@react-three/rapier";
import { useRef } from "react"; 
import { useControls } from 'leva'

function App(){
    const cardModelRef = useRef();
    const { debug } = useControls({ debug: true })

    return(
        <Canvas camera={{position: [0, 0, 12], fov : 15}}>
            <ambientLight intensity={Math.PI} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <Physics debug={debug} interpolate gravity={[0, -40, 0]} timeStep={1 / 60}>
                <Model ref={cardModelRef} position={[0, 0, 0]}/> 
                <Band cardRef={cardModelRef} />
            </Physics>
            <OrbitControls />
        </Canvas>
    )
}

export default App;
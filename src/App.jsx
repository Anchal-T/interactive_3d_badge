import { Canvas } from "@react-three/fiber";
import { useGLTF, OrbitControls } from "@react-three/drei";
import { Model } from "./components/Model";
import { Band } from "./components/Band";
import { Physics } from "@react-three/rapier";
import { useRef } from "react"; 

function App(){
    const cardModelRef = useRef();

    return(
        <Canvas camera={{position: [0, 0, 10], fov : 75}}>
            <ambientLight intensity={1} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <Physics gravity={[0, -9.81, 0]}>
                <Model ref={cardModelRef} position={[0, 0, 0]}/> 
                <Band cardRef={cardModelRef} />
            </Physics>
            <OrbitControls />
        </Canvas>
    )
}

export default App;
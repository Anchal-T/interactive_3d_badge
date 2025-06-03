import { Canvas } from "@react-three/fiber";
import { useGLTF, OrbitControls, Environment, Lightformer } from "@react-three/drei";
import { Model } from "./components/Model";
import { Band } from "./components/Band";
import { Physics } from "@react-three/rapier";
import { useRef } from "react"; 
import { useControls } from 'leva'

function App(){
    const cardModelRef = useRef();
    // const { debug } = useControls({ debug: true })

    return(
        <Canvas camera={{position: [0, 0, 13], fov : 15}}>
            <ambientLight intensity={Math.PI} />
            <pointLight position={[10, 10, 10]} intensity={4.5} />
            <Physics interpolate gravity={[0, -40, 0]} timeStep={1 / 60}>
                <Band cardRef={cardModelRef} />
                <Model ref={cardModelRef} position={[0, 0, 0]}/> 
            </Physics>
            <Environment background blur={0.75}>
                <color attach="background" args={['#393E46']} />
                <Lightformer intensity={2} color="white" position={[0, -1, 5]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
                <Lightformer intensity={3} color="white" position={[-1, -1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
                <Lightformer intensity={3} color="white" position={[1, 1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
                <Lightformer intensity={10} color="white" position={[-10, 0, 14]} rotation={[0, Math.PI / 2, Math.PI / 3]} scale={[100, 10, 1]} />
            </Environment>
            {/* <OrbitControls /> */}
        </Canvas>
    )
}

export default App;
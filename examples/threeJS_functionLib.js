import * as THREE from 'three';
import * as Main from './threeJS_main.js';

export function handleButtons(myList, spawn) {
    console.log("spawning", spawn)
    if (spawn) {
        myList.forEach((collider) => Main.scene.add(collider));
        myList.forEach((collider) => Main.CaseModel.add(collider));
    }
    else {
        myList.forEach((collider) => collider.parent.remove(collider));
    }
}




export function rotate(model, duration, rotation, isRotated) {
    const startRotation = model.quaternion.clone(); // Anfangsrotation speichern
    const targetRotation = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI * rotation); // Zielrotation berechnen

    const startTime = performance.now(); // Startzeit der Animation
    const endTime = startTime + duration; // Endzeit der Animation

    function animate() {
        const now = performance.now(); // Aktuelle Zeit
        const progress = (now - startTime) / duration; // Fortschritt der Animation

        if (progress >= 1) {
            // Animation abgeschlossen
            model.setRotationFromQuaternion(targetRotation);
            if (rotation = 0.5) {
                isRotated = true;
            }
            else { isRotated = false }
        } else {
            // Animation läuft noch
            // Easing-Funktion anwenden (hier: einfache lineare Interpolation)
            const easedProgress = Math.sin(progress * Math.PI / 2); // Beispiel-Easing (sinusförmige Interpolation)
            const interpolatedQuaternion = new THREE.Quaternion().copy(startRotation).slerp(targetRotation, easedProgress);
            model.setRotationFromQuaternion(interpolatedQuaternion);
            requestAnimationFrame(animate); // Nächsten Frame anfordern
        }
    }

    animate(); // Starten der Animation

}

export function createVideoTexture(src) {
    //Video

    const video = document.createElement('video');
    video.src = src;
    video.autoplay = true;
    video.loop = true;
    video.muted = true; // Stelle sicher, dass das Video stummgeschaltet ist, da Audio in Three.js nicht unterstützt wird
    //video.crossOrigin = 'anonymous'; // Falls das Video von einem anderen Ursprung geladen wird

    // Erstelle eine Video-Textur
    const videoTexture = new THREE.VideoTexture(video);
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    //videoTexture.format = THREE.sRGBFormat; // Format auf RGB setzen
    videoTexture.encoding = THREE.sRGBEncoding;



    video.play();

    // Erstelle eine Schleife zur Aktualisierung der Videotextur
    function updateVideoTexture() {
        requestAnimationFrame(updateVideoTexture);
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            videoTexture.needsUpdate = true;
        }
    }
    updateVideoTexture();

    // Erstelle ein Material mit der Video-Textur
    return [videoTexture, video]
}


export function createColliders() {
    //---------------------
    //Hitboxes
    // Erstelle eine Box-Geometrie für den unsichtbaren Kollider
    var hitboxSize = 4
    var z_index = 0.2

    const colliderGeometry = new THREE.BoxGeometry(hitboxSize, hitboxSize, 0.1); // Größe anpassen

    // Erstelle ein Material, das keine Sichtbarkeit hat (z. B. transparent mit einer niedrigen Opazität)
    const colliderMaterial = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.25 });


    //bottom
    const colliderMesh_menu1 = new THREE.Mesh(colliderGeometry, colliderMaterial);
    colliderMesh_menu1.position.set(0, -22.5, z_index)
    Main.colliders_bottom.push(colliderMesh_menu1)
    const colliderMesh_menu2 = new THREE.Mesh(colliderGeometry, colliderMaterial);
    colliderMesh_menu2.position.set(-7, -22.5, z_index)
    Main.colliders_bottom.push(colliderMesh_menu2)

    //main_screen


    const colliderMesh_main1 = new THREE.Mesh(colliderGeometry, colliderMaterial);
    colliderMesh_main1.position.set(-5, 11, z_index)
    Main.colliders_main_menu.push(colliderMesh_main1)

    const colliderMesh_main2 = new THREE.Mesh(colliderGeometry, colliderMaterial);
    colliderMesh_main2.position.set(0, 11, z_index)
    Main.colliders_main_menu.push(colliderMesh_main2)

    const colliderMesh_main3 = new THREE.Mesh(colliderGeometry, colliderMaterial);
    colliderMesh_main3.position.set(5, 11, z_index)
    Main.colliders_main_menu.push(colliderMesh_main3)

    Main.colliders_bottom.forEach((collider) => Main.scene.add(collider))
    //colliders_main_menu.forEach((collider) => scene.add(collider))

    const burgerButton = new THREE.Mesh(colliderGeometry, colliderMaterial);
    burgerButton.position.set(8.5, 20.5, z_index)
    Main.colliders_burger_buttons.push(burgerButton)


    var burger_offset = 0.7

    const burgerIdea = new THREE.Mesh(colliderGeometry, colliderMaterial);
    burgerIdea.position.set(0, 12, z_index - burger_offset)
    burgerIdea.scale.set(5, 3.5)
    Main.colliders_burger_buttons.push(burgerIdea)

    const burgerDocument = new THREE.Mesh(colliderGeometry, colliderMaterial);
    burgerDocument.position.set(0, -1.5, z_index - burger_offset)
    burgerDocument.scale.set(5, 3)
    Main.colliders_burger_buttons.push(burgerDocument)

    const burgerModel = new THREE.Mesh(colliderGeometry, colliderMaterial);
    burgerModel.position.set(0, -14, z_index - burger_offset)
    burgerModel.scale.set(5, 3)
    Main.colliders_burger_buttons.push(burgerModel)

    Main.colliders_burger_buttons.slice(0, 1).forEach((collider) => Main.scene.add(collider))
    //---------------------

}




export function changeHologram(object, startRotation, endRotation, duration, first, newMaterial) {

    if (first == false)
    {
        object.rotation.set(0,Math.PI*3,0)
        //console.log("second")
    }
    const startQuaternion = new THREE.Quaternion().setFromEuler(startRotation);
    const endQuaternion = new THREE.Quaternion().setFromEuler(endRotation);

    const startTime = performance.now();
    const endTime = startTime + duration;

    function animate() {
        //console.log("asdf")

        

        const now = performance.now();
        const progress = Math.min((now - startTime) / duration, 1); // Begrenzen des Fortschritts auf 1

        if (first)
        {
            object.material.opacity = 0.5 - progress
        }
        else{
            object.material.opacity = progress
        }

        const easedProgress = easeInOut(progress);
        const interpolatedQuaternion = new THREE.Quaternion().copy(startQuaternion).slerp(endQuaternion, easedProgress);
        
        object.setRotationFromQuaternion(interpolatedQuaternion);

        if (progress < 1) {
            requestAnimationFrame(animate);
        }
        else if (first == true){
            object.material = newMaterial
            changeHologram(object, new THREE.Euler(0, Math.PI * 3, 0),new THREE.Euler(0, Math.PI * 1.8, 0),duration,false);
            return;
        }
        else {
            //console.log("done");
            return;
        }
    }

    animate();

    // Easing-Funktion (ease-in-out)
    function easeInOut(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }
}

export function hoverHologram(object,duration,x,y,z){
    let startPosition = new THREE.Vector3(x,y,z);
    let endPosition = new THREE.Vector3(x,-y,z);
    const easingFunction = t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // Ease-In-Out

    const animate = () => {
        const startTime = performance.now();
        const endTime = startTime + duration;

        const loop = (time) => {
            const now = time || performance.now();
            const progress = (now - startTime) / duration;
            const easedProgress = easingFunction(Math.min(progress, 1));

            const newPosition = new THREE.Vector3().lerpVectors(startPosition, endPosition, easedProgress);
            object.position.copy(newPosition);

            if (now < endTime) {
                requestAnimationFrame(loop);
            } else {
                let copy = startPosition
                startPosition = endPosition;
                endPosition = copy;
                // Starte den Loop erneut, wenn die Animation beendet ist
                animate();
            }
        };

        loop(startTime);
    };

    // Starte die Animation
    animate();
}

export function createCanvasMaterial(color, size) {
    var matCanvas = document.createElement('canvas');
    matCanvas.width = matCanvas.height = size;
    var matContext = matCanvas.getContext('2d');
    // create exture object from canvas.
    var texture = new THREE.Texture(matCanvas);
    // Draw a circle
    var center = size / 2;
    matContext.beginPath();
    matContext.arc(center, center, size/2, 0, 2 * Math.PI, false);
    matContext.closePath();
    matContext.fillStyle = color;
    matContext.fill();
    // need to set needsUpdate
    texture.needsUpdate = true;
    // return a texture made from the canvas
    return texture;
  }
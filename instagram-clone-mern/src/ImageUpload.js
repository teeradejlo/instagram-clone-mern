import React, { useState } from "react";
import { Button } from "@material-ui/core";
import { storage, db } from "./firebase"; 
import firebase from "firebase";
import "./ImageUpload.css";
import axios from "./axios";

function ImageUpload( { username } ) {
    const [caption, setCaption] = useState("");
    const [image, setImage] = useState(null);
    const [progress, setProgress] = useState(0);

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setImage(e.target.files[0]);
        }
    };

    const handleUpload = () => {
        if (image) {
            const uploadTask = storage.ref(`images/${image.name}`).put(image);
            uploadTask.on(
                "state_changed",
                (snapshot) => {
                    //progress function...
                    const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                    setProgress(progress);
                },
                (error) => {
                    //error function...
                    alert(error.message);
                },
                () => {
                    //complete function...
                    storage.ref("images")
                            .child(image.name)
                            .getDownloadURL()
                            .then(url => {

                                axios.post("/upload", {
                                    caption: caption,
                                    image: url,
                                    user: username,
                                });
                                
                                /*
                                    //post image to db
                                    db.collection("posts").add({
                                        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                                        caption: caption,
                                        imgUrl: url,
                                        username: username
                                    });
                                */

                                setProgress(0);
                                setCaption("");
                                setImage(null);
                            })
                }
            )
        } else {
            alert("No file chosen..");
        }
    };

    return (
        <div className = "imageupload">
            <progress value = {progress} max = "100"/>
            <input type = "text" placeholder = "Enter a caption" value = {caption} onChange = {(e) => setCaption(e.target.value)}/>
            <div className="imageupload__fileAndButton">
                <input type = "file" onChange = {handleFileChange}/>
                <Button onClick = {handleUpload} variant="outlined">Upload</Button>
            </div>
        </div>
    )
}

export default ImageUpload

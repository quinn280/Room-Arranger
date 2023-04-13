import React, { useState } from "react";
import { useParams } from "react-router-dom";

const Editor = () => {
    let { file } = useParams();

    return (
        <div>    
            <p>{file}</p>
        </div>
    )
}

export default Editor;
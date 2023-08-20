import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function PostPage() {
    const [postInfo,setPostInfo] = useState(null);
    const {id} = useParams();

    useEffect(() => {
        fetch(`http://localhost:3000/post/${id}`)
        .then(response => {
            response.json().then(postInfo => {
                setPostInfo(postInfo);
            })
        })
    },[]);
    return(
        <div>
            Post Page loaded
        </div>
    );
}
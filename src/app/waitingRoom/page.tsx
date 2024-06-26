'use client'
import socket from "../utils/socket/socketIndex";
import Peer from "peerjs";
import { useEffect, useRef, useContext} from "react";
import { useRouter } from "next/navigation";
import ReactPlayer from "react-player";
import { useState } from "react"
import { Button } from "antd";
import { v4 } from "uuid";
import { RoomContext, RoomProvider } from "../context/RoomContext";
import { UserContext, UserProvider } from "../context/UserContext";
import Video from "../components/Video";
import VideosCanva from "../components/VideoCanvaFull";
import Controls from "../components/Control";
// get peer Id

// const peer = new Peer(undefined, {host:"/", port: "9000"});
// const id = v4();
interface Offer{
    userId: string,
    profile: any
}
export default function VideoCall(){
    const router = useRouter();
    const {userId, setUserId, interests, setInterests} = useContext(UserContext);
    const {setRoomId, setConnect} = useContext(RoomContext);
    const count = useRef(1);
    const id = useRef("");
    // condition to re-route to homepage
    const profile = useRef({});
    useEffect(() => {
        profile.current = {
            name: localStorage.getItem("name"),
            gender: +localStorage.getItem("gender"),
            sexualInterests: +localStorage.getItem("sexualInterest"),
            language: +localStorage.getItem("language"),
            interests: JSON.parse(localStorage.getItem("interests"))
        }
    }, []);
    useEffect(() => {   
        if (count.current == 1){
            id.current = v4();   
        }
        const offer: Offer = {
            userId: id.current,
            "profile": profile.current
        }
        // check for connection to peerjs server
        socket.on("peer-fail", () => {
            console.log("unable to connect to peerjs server")
        })

        // check for connection to other peer
        socket.on("connection-ebstablished", () => {
            console.log("successfully ebstablished connection");
            // try to reconnect
            router.push("/videoCall")
        })
        socket.on("connection-failed", () => {
            console.log("connection-failed, reconnect");
            setConnect(e => false);
            socket.emit("reconnect", socket.id);
        })

        // set userID -> start myStream
        if (count.current == 1){
            socket.emit("match-user", offer);
            setUserId(userId => id.current);  
        }
        // if found a peer
        socket.on("found-peer", (roomId:string, name:string) => {
            socket.on("peer-success", () => {
                // create an offer
                console.log("connected to peerjs server");
                socket.emit("join-room", roomId, id.current);
            })
            setConnect(e => true);
            console.log("found peer");
            if (localStorage){
                console.log("peer name", name);
                localStorage.setItem("peerName", name);
            }
            setRoomId(id => roomId);
            // join room
            socket.on("reconnect", () => {
                setConnect(e => true);
            });
        });
        count.current = 2
        // change to room id
        return (() => {
            socket.off("peer-fail");
            socket.off("peer-success");
            socket.off("found-peer");
            socket.off("connection-ebstablished");
            socket.off("connection-failed");
            socket.off("reconnect");
        })
  }, [])
  // move match to another page
    return(
    <>
        <div role="status" className="flex flex-col justify-center items-center h-full gap-3.5">
    <svg aria-hidden="true" className="w-20 h-20 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
    </svg>
    <div className="text-4xl mt-6">Matching...</div>
</div>
    </>
    )
}
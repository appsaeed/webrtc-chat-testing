import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import { useState } from "react";
import AnswerButton from "./components/AnswerButton";
import ButtonPrimary from "./components/ButtonPrimary";
import ChatCennel from "./components/ChatCennel";
import WebcamVideo from "./components/WebcamVideo";

const firebaseConfig = {
  apiKey: "AIzaSyDRCZidO9ybmPdTWIT2CBWkouMYsJ0BFFk",
  authDomain: "ftooler-630c7.firebaseapp.com",
  databaseURL: "https://ftooler-630c7-default-rtdb.firebaseio.com",
  projectId: "ftooler-630c7",
  storageBucket: "ftooler-630c7.appspot.com",
  messagingSenderId: "1074227367723",
  appId: "1:1074227367723:web:2e186834af58a592223f6e",
  measurementId: "G-J07YV6PCNZ",
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const firestore = firebase.firestore();

const servers = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
  iceCandidatePoolSize: 10,
};

const App = () => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [roomid, setRoomid] = useState("");
  const [pc] = useState(new RTCPeerConnection(servers));
  const [chatChannel, setChatChannel] = useState<RTCDataChannel>();
  const [typeingChannel, setTypeChannel] = useState<RTCDataChannel>();

  const handleWebcamButtonClick = async () => {
    //getting media stream src ojbect forl local stream
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    //setting media stream to local state
    setLocalStream(stream);

    //create a new media stream for remoteStream
    const remoteStream = new MediaStream();

    //tracks stream to pc
    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream);
    });

    //peer listening for getting remote stream
    pc.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        remoteStream.addTrack(track);
      });
      setRemoteStream(remoteStream);
    };

    //create data channel on peer connection
    const chatChannel = pc.createDataChannel("chatChannel");
    const typeChannel = pc.createDataChannel("typeingChannel");
    setChatChannel(chatChannel);
    setTypeChannel(typeChannel);
  };

  const handleCallButtonClick = async () => {
    const callDoc = firestore.collection("rooms").doc(Date.now().toString());
    const offerCandidates = callDoc.collection("offerCandidates");
    const answerCandidates = callDoc.collection("answerCandidates");

    setRoomid(callDoc.id);

    pc.onicecandidate = (event) => {
      event.candidate && offerCandidates.add(event.candidate.toJSON());
    };

    const offerDescription = await pc.createOffer();
    await pc.setLocalDescription(offerDescription);

    const offer = {
      sdp: offerDescription.sdp,
      type: offerDescription.type,
    };

    await callDoc.set({ offer });

    callDoc.onSnapshot((snapshot) => {
      const data = snapshot.data();
      if (!pc.currentRemoteDescription && data?.answer) {
        const answerDescription = new RTCSessionDescription(data.answer);
        pc.setRemoteDescription(answerDescription);
      }
    });

    answerCandidates.onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const candidate = new RTCIceCandidate(change.doc.data());
          pc.addIceCandidate(candidate);
        }
      });
    });
  };

  const onAnswerCall = async (remoteCallid: string) => {
    const callDoc = firestore.collection("rooms").doc(remoteCallid);
    const answerCandidates = callDoc.collection("answerCandidates");
    const offerCandidates = callDoc.collection("offerCandidates");

    pc.onicecandidate = (event) => {
      event.candidate && answerCandidates.add(event.candidate.toJSON());
    };

    const callData = (await callDoc.get()).data();

    const offerDescription = callData?.offer;
    await pc.setRemoteDescription(new RTCSessionDescription(offerDescription));

    const answerDescription = await pc.createAnswer();
    await pc.setLocalDescription(answerDescription);

    const answer = {
      type: answerDescription.type,
      sdp: answerDescription.sdp,
    };

    await callDoc.update({ answer });

    //firebase listener for lesting sender peerConnection data
    offerCandidates.onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          let data = change.doc.data();
          pc.addIceCandidate(new RTCIceCandidate(data));
        }
      });
    });
  };

  const roomlink = location.href.replace(/\?.*/g, "") + "?roomid=" + roomid;

  return (
    <div className="container">
      <div className="row mt-4">
        <div className="col-md-4">
          <div className="d-flex justify-content-between action-area">
            <ButtonPrimary
              name="start"
              classs={"px-4"}
              onClick={handleWebcamButtonClick}
              disabled={Boolean(localStream)}
            />
            <ButtonPrimary
              name="Call"
              classs={"px-4"}
              onClick={handleCallButtonClick}
              disabled={!localStream}
            />
          </div>
          <div className="my-4 local-response">
            roomid:{" "}
            {roomid && (
              <>
                <a href={roomlink} target="_blank">
                  open with new tab{" "}
                </a>
                and share
              </>
            )}
          </div>

          <WebcamVideo controls stream={localStream} />
        </div>
        <div className="col-md-8">
          <AnswerButton onAnswerCall={onAnswerCall} disabled={!localStream} />
          <WebcamVideo controls stream={remoteStream} />
        </div>
      </div>
      <ChatCennel
        peerConnection={pc}
        chatChannel={chatChannel}
        typeingChannel={typeingChannel}
      />
    </div>
  );
};

export default App;

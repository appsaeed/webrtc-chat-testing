import { useState } from "react";

export default function ChatCennel({
  peerConnection,
  chatChannel,
  typeingChannel,
}: {
  peerConnection: RTCPeerConnection;
  chatChannel: RTCDataChannel | undefined;
  typeingChannel: RTCDataChannel | undefined;
}) {
  const [received, setReceived] = useState<any[]>([]);
  const [sending, setSending] = useState<any[]>([]);
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [typeing, setTypeing] = useState<boolean>(false);

  //add chatconnection
  peerConnection.onconnectionstatechange = () => {
    console.log("state changeing");
  };

  peerConnection.ondatachannel = function (ev) {
    if (ev.channel.label == "chatChannel") {
      chatChannelReceiver(ev.channel);
    }

    if (ev.channel.label == "typeingChannel") {
      const typeLabel = ev.channel;
      typeLabel.onmessage = (data) => {
        let timer = null;
        if (data.data == "typeing") {
          setTypeing(true);
          timer = setTimeout(() => {
            setTypeing(false);
          }, 2000);
          timer = null;
        }
      };
    }
  };

  //getting chat channel data
  function chatChannelReceiver(chat: RTCDataChannel) {
    chat.onopen = function () {
      setLoading(false);
    };

    chat.onmessage = function (data) {
      setReceived((p) => [...p, data.data]);
    };

    chat.onclose = function () {
      setLoading(true);
    };

    chat.onerror = function () {
      setLoading(true);
    };
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.currentTarget.reset();
    chatChannel?.send(message);
    setSending((prev) => {
      return [...prev, message];
    });
  };

  return (
    <div className="row mb-4">
      <div className="col-md-8">
        <h4>received</h4>
        {received.map((message, i) => (
          <div key={i}>
            <b>{message}</b>
            <br />
          </div>
        ))}
      </div>

      <div className="col-md-4">
        <h4>Sender message</h4>
        {sending.map((message, i) => (
          <div key={i}>
            <b>{message}</b>
            <br />
          </div>
        ))}
        <form className="row mt-4" onSubmit={handleSubmit}>
          <p className="my-2">{typeing && "typeing.."}</p>
          <input
            onChange={(e) => {
              setMessage(e.target.value);
              typeingChannel?.send("typeing");
            }}
            type="text"
            className="form-control bg-dark text-white mb-2"
          />
          <button disabled={loading} className="btn btn-primary">
            send
          </button>
        </form>
      </div>
    </div>
  );
}

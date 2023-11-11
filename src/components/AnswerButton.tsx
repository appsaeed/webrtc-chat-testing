import { useEffect, useState } from "react";
import { searchParams } from "../utils/browser";
type AnswerButtonProps = {
  onAnswerCall: (roomid: string) => void;
  disabled?: boolean;
};
const AnswerButton = ({ onAnswerCall, disabled }: AnswerButtonProps) => {
  const [roomid, setRoomid] = useState<string>("");
  useEffect(() => {
    const params = searchParams();
    if (params && params?.roomid) {
      setRoomid(params.roomid);
    }
  }, []);
  return (
    <div className="">
      <form
        className="w-100 d-flex justify-content-between"
        onSubmit={(e) => e.preventDefault()}
      >
        <input
          name="roomid"
          value={roomid}
          onChange={(e) => setRoomid(e.target.value)}
          placeholder="Enter call ID"
          className="form-control bg-dark text-white w-50"
        />
        <button
          disabled={disabled}
          onClick={() => onAnswerCall(roomid)}
          className="btn btn-primary"
        >
          Answer
        </button>
      </form>
    </div>
  );
};

export default AnswerButton;

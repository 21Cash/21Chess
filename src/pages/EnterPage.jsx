import React from "react";
import { useNavigate } from "react-router-dom";
import EnterBox from "../components/EnterBox";

function EnterPage() {
  const navigate = useNavigate();
  return (
    <div>
      <EnterBox />
    </div>
  );
}

export default EnterPage;

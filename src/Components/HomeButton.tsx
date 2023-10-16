// HomeButton.tsx
import React from "react";
import { useNavigate } from "react-router-dom";

function HomeButton() {
  const navigate = useNavigate();

  const handleHomeClick = () => {
    navigate("/"); // Redirects user to the home page
  };

  return (
    <button className="homeButton" onClick={handleHomeClick}>
      GO TO HOME PAGE
    </button>
  );
}

export default HomeButton;

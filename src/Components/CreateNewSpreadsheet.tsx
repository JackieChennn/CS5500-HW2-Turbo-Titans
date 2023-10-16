// Create a new spreadsheet component that when user clicks on create new spreadsheet
// will be used to create a new spreadsheet
// and save it to the database.
// The user will be able to name the spreadsheet.
// CreateNewSheet.tsx
import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

interface CreateNewSheetProps {
  onCreate: (name: string) => void; // This function should create a new document
}

const CreateNewSheet: React.FC<CreateNewSheetProps> = ({ onCreate }) => {
  const [sheetName, setSheetName] = useState("");
  const navigate = useNavigate();

  const handleCreateAndNavigate = () => {
    if (sheetName.trim() === "") {
      alert("Please enter a name for the spreadsheet.");
      return;
    }

    onCreate(sheetName); // Create the new document with the given name
    navigate(`/${sheetName}`); // Navigate to the new document's page
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Enter spreadsheet name"
        value={sheetName}
        onChange={(e) => setSheetName(e.target.value)}
        style={{ width: "300px", fontSize: "16px", padding: "10px" }}
      />
      <button
        className="CreateNewSpreadsheet"
        onClick={handleCreateAndNavigate}
      >
        Create New Spreadsheet
      </button>
    </div>
  );
};

export default CreateNewSheet;

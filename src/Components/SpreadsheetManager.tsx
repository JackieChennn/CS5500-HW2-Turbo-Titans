import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
type Spreadsheet = {
  id: string;
  name: string;
};
const SpreadsheetManager = () => {
  const [username, setUsername] = useState("");
  const [spreadsheets, setSpreadsheets] = useState<Spreadsheet[]>([]);

  // 定义后端API的基础URL
  const BASE_URL = "http://localhost:YOUR_SERVER_PORT"; // 请替换YOUR_SERVER_PORT为您的服务器端口

  useEffect(() => {
    // 获取所有电子表格
    const fetchSpreadsheets = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/documents`);
        setSpreadsheets(response.data);
      } catch (error) {
        console.error("Error fetching spreadsheets:", error);
      }
    };
    fetchSpreadsheets();
  }, []);

  const createNewSpreadsheet = async () => {
    if (!username) {
      alert("Please enter a username before creating a spreadsheet.");
      return;
    }

    try {
      const response = await axios.put(`${BASE_URL}/documents/${username}`, {
        userName: username,
      });
      setSpreadsheets([...spreadsheets, response.data]);
    } catch (error) {
      console.error("Error creating spreadsheet:", error);
    }
  };
  const navigate = useNavigate();

  const editSpreadsheet = (id: string) => {
    console.log("edit spreadsheet");
    console.log(id);
    navigate(`/spreadsheet/${id}`);
  };

  const deleteSpreadsheet = async (id: string) => {
    console.log("delete spreadsheet");
    console.log(id);

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this spreadsheet?"
    );
    if (confirmDelete) {
      try {
        await axios.delete(`${BASE_URL}/documents/${id}`);
        // 更新前端的状态
        const updatedSpreadsheets = spreadsheets.filter(
          (sheet) => sheet.id !== id
        );
        setSpreadsheets(updatedSpreadsheets);
      } catch (error) {
        console.error("Error deleting spreadsheet:", error);
      }
    }
  };

  return (
    <div>
      <button onClick={createNewSpreadsheet}>Create New Spreadsheet</button>
      <input
        type="text"
        placeholder="Enter username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      {spreadsheets.map((sheet) => (
        <div key={sheet.id}>
          <span>{sheet.name}</span>
          <button onClick={() => editSpreadsheet(sheet.id)}>Edit</button>
          <button onClick={() => deleteSpreadsheet(sheet.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
};

export default SpreadsheetManager;

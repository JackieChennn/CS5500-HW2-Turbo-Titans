import React, { useState } from "react";
import axios from "axios";
const SpreadsheetManager = () => {
  return (
    <div>
      <button onClick={createNewSpreadsheet}>Create New Spreadsheet</button>
      <input
        type="text"
        placeholder="Enter username"
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
const editSpreadsheet = (id: string) => {
  console.log("edit spreadsheet");
  console.log(id);
};

const deleteSpreadsheet = (id: string) => {
  console.log("delete spreadsheet");
  console.log(id);
};

const [username, setUsername] = useState("");
// 定义后端API的基础URL
const BASE_URL = "http://localhost:YOUR_SERVER_PORT"; // 请替换YOUR_SERVER_PORT为您的服务器端口

// 创建新的spreadsheet
const createNewSpreadsheet = async (name, userName) => {
  try {
    const response = await axios.put(`${BASE_URL}/documents/${name}`, {
      userName: userName,
    });
    const document = response.data;
    // 处理返回的数据，例如更新前端UI
  } catch (error) {
    console.error("Error creating spreadsheet:", error);
  }
};

export default SpreadsheetManager;

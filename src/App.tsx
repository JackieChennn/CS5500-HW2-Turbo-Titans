import { useState, useEffect } from "react";
import "./App.css";
import SpreadSheet from "./Components/SpreadSheet";
import DocumentList from "./Components/DocumentList";
import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import HomeButton from "./Components/HomeButton";
import CreateNewSheet from "./Components/CreateNewSpreadsheet";
import { FaCommentDots } from "react-icons/fa";
import ChatComponent from "./Components/ChatComponent";

function getDocumentNameFromWindow() {
  const href = window.location.href;

  // remove the protocol
  const protoEnd = href.indexOf("//");
  // find the beginning of the path
  const pathStart = href.indexOf("/", protoEnd + 2);

  if (pathStart < 0) {
    // there is no path
    return "";
  }
  // get the first part of the path
  const docEnd = href.indexOf("/", pathStart + 1);
  if (docEnd < 0) {
    // there is no other slash
    return href.substring(pathStart + 1);
  }
  // there is a slash
  return href.substring(pathStart + 1, docEnd);
}

function App() {
  const [documentName, setDocumentName] = useState(getDocumentNameFromWindow());

  useEffect(() => {
    if (window.location.href) {
      setDocumentName(getDocumentNameFromWindow());
    }
  }, []);

  function resetURL(documentName: string) {
    // get the current URL
    const currentURL = window.location.href;
    // remove anything after the last slash
    const index = currentURL.lastIndexOf("/");
    const newURL = currentURL.substring(0, index + 1) + documentName;
    // set the URL
    window.history.pushState({}, "", newURL);
    // 删除 window.location.reload() 以避免页面重新加载
  }

  useEffect(() => {
    if (documentName === "") {
      setDocumentName("test_default");
      resetURL("test_default");
    }
  }, [documentName]);

  function handleDocumentClick(documentName: string) {
    setDocumentName(documentName);
    resetURL(documentName);
  }
  function handleCreateNewSheet(newSheetName: string) {
    setDocumentName(newSheetName);
    resetURL(newSheetName);
  }

  // when user clicks on a document, routes to the document page,
  // when user clicks on go to home button, routes to the home page
  // HomeButton not display on the home page, but another pages
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <HomeButton />
          <CreateNewSheet onCreate={handleCreateNewSheet} />

          <Routes>
            <Route
              path="/"
              element={<DocumentList onDocumentClick={handleDocumentClick} />}
            />
            <Route
              path="/:documentName"
              element={<SpreadSheet documentName={documentName} />}
            />
          </Routes>
        </header>
      </div>
    </Router>
  );
}
export default App;

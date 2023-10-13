/**
 * @jest-environment jsdom
 */

import { useState, useEffect, useCallback } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import SpreadSheet from "./Components/SpreadSheet";
import SpreadsheetManager from "./Components/SpreadsheetManager"; // 请替换为您的SpreadsheetManager.tsx的路径

function App() {
  const getDocumentNameFromWindow = useCallback(() => {
    const href = window.location.href;

    // remove  the protocol
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
  }, []);

  const [documentName, setDocumentName] = useState(getDocumentNameFromWindow());

  useEffect(() => {
    if (window.location.href) {
      setDocumentName(getDocumentNameFromWindow());
    }
  }, [getDocumentNameFromWindow]);

  //callback function to reset the current URL to have the document name
  function resetURL(documentName: string) {
    // get the current URL
    const currentURL = window.location.href;
    // remove anything after the last slash
    const index = currentURL.lastIndexOf("/");
    const newURL = currentURL.substring(0, index + 1) + documentName;
    // set the URL
    window.history.pushState({}, "", newURL);
    // now reload the page
    window.location.reload();
  }

  if (documentName === "") {
    setDocumentName("test");
    resetURL("test");
  }

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <Routes>
            <Route path="/spreadsheet/:id">
              <SpreadSheet documentName={documentName} />
            </Route>
            <Route path="/">
              <SpreadsheetManager />
            </Route>
          </Routes>
        </header>
      </div>
    </Router>
  );
}

export default App;

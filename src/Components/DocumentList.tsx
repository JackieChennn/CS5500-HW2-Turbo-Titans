import React, { useState, useEffect } from "react";
import { PortsGlobal, LOCAL_SERVER_URL } from "../ServerDataDefinitions";

interface DocumentListProps {
  onDocumentClick: (documentName: string) => void;
}

function DocumentList({ onDocumentClick }: DocumentListProps) {
  const serverPort = PortsGlobal.serverPort;
  const baseURL = `${LOCAL_SERVER_URL}:${serverPort}`;

  const [documents, setDocuments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, []);

  async function fetchDocuments() {
    try {
      const response = await fetch(`${baseURL}/documents`);
      const data: string[] = await response.json();
      setDocuments(data);
    } catch (error) {
      console.error("Error fetching the documents:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleDocumentClick(doc: string) {
    onDocumentClick(doc); // Notify the parent component
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Available Documents</h1>
      <ul>
        {documents.map((doc) => (
          <li key={doc} onClick={() => handleDocumentClick(doc)}>
            <a href="#">{doc}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default DocumentList;

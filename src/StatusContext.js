import React, { createContext, useState, useEffect } from 'react';

export const StatusContext = createContext();

export const StatusProvider = ({ children }) => {
  const [statuses, setStatuses] = useState({
    app1: false,
    app2: false,
    app3: false,
  });

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:4000');

    ws.onopen = () => {
      console.log('Connected to WebSocket server');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setStatuses((prevStatuses) => ({
        ...prevStatuses,
        app1: data.app1 !== undefined ? data.app1 : prevStatuses.app1,
        app2: data.app2 !== undefined ? data.app2 : prevStatuses.app2,
        app3: data.app3 !== undefined ? data.app3 : prevStatuses.app3,
      }));
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <StatusContext.Provider value={{ statuses, setStatuses }}>
      {children}
    </StatusContext.Provider>
  );
};

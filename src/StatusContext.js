import React, { createContext, useState, useEffect } from 'react';

export const StatusContext = createContext();

export const StatusProvider = ({ children }) => {
  const [statuses, setStatuses] = useState({
    app1: false,
    app2: false,
    app3: false,
  });

  const [powerConsumptions, setPowerConsumptions] = useState({
    app1: { lastOn: 0, today: 0, last7Days: 0, last30Days: 0 },
    app2: { lastOn: 0, today: 0, last7Days: 0, last30Days: 0 },
    app3: { lastOn: 0, today: 0, last7Days: 0, last30Days: 0 },
  });

  useEffect(() => {
    const ws = new WebSocket('ws://13.210.151.196:4000');

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
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  const fetchPowerConsumption = async (appId) => {
    try {
      await delay(1000);

      const response = await fetch(`http://13.210.151.196:4000/power-consumption/${appId}`); // Replace with your backend API URL
      const data = await response.json();

      const convertWsToWh = (ws) => ws / 3600;

      setPowerConsumptions((prev) => ({
        ...prev,
        [appId]: {
          lastOn: convertWsToWh(data.total_consumption_lastOn) || 0,
          today: convertWsToWh(data.total_consumption_today) || 0,
          last7Days: convertWsToWh(data.total_consumption_7Days) || 0,
          last30Days: convertWsToWh(data.total_consumption_30Days) || 0,
        },
      }));
    } catch (error) {
      console.error('Error fetching power consumption data:', error);
    }
  };

  return (
    <StatusContext.Provider value={{ statuses, setStatuses, powerConsumptions, setPowerConsumptions, fetchPowerConsumption }}>
      {children}
    </StatusContext.Provider>
  );
};

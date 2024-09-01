import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button, Typography, ThemeProvider } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import './Application.css';
import { StatusContext } from './StatusContext';

const theme = createTheme({
  typography: {
    fontFamily: [
      'Open Sans',
      'sans-serif',
    ].join(','),
  },
});

const App2 = () => {
  const { statuses, setStatuses, powerConsumptions, setPowerConsumptions, fetchPowerConsumption } = useContext(StatusContext);
  const app2Status = statuses.app2;
  const app2PowerConsumption = powerConsumptions.app2;

  useEffect(() => {
    let intervalId;

    if (app2Status) {
      // Set up a timer to fetch power consumption data every second
      intervalId = setInterval(() => {
        fetchPowerConsumption('app2');
      }, 10000); // 1000 milliseconds = 1 second

      // Fetch data immediately on mount if the appliance is on
      fetchPowerConsumption('app2');
    } else {
      // Clear the interval if the appliance is turned off
      clearInterval(intervalId);
    }

    // Clean up the interval on component unmount or status change
    return () => clearInterval(intervalId);
  }, [app2Status, fetchPowerConsumption]);

  const handleToggleApp2 = () => {
    const newStatus = !app2Status;
    setStatuses((prevStatuses) => ({
      ...prevStatuses,
      app2: newStatus,
    }));

    const ws = new WebSocket('ws://13.210.151.196:4000');
    ws.onopen = () => {
      ws.send(JSON.stringify({ app2: newStatus }));
      ws.close();
    };

    // If turning off, manually clear power consumption values
    if (!newStatus) {
      setPowerConsumptions((prev) => ({
        ...prev,
        app2: {
          lastOn: 0,
          today: 0,
          last7Days: 0,
          last30Days: 0,
        },
      }));
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <div className="container">
        <div className="contentContainer">
          <div className="formContainer">
            <div className="formHeaderContainer">
              <Typography variant="button" className="formHeader">
                <span style={{ fontWeight: 'bold', color: '#FFFFFF' }}>Appliance 2</span>
              </Typography>
            </div>

            <div className="formContentContainer">
              <div className="buttonContainer">
                <Button
                  onClick={handleToggleApp2}
                  variant="contained"
                  style={{ backgroundColor: '#1e2b33' }}
                  className={`statusButton ${app2Status ? 'on' : 'off'}`}
                >
                  {app2Status ? 'On' : 'Off'}
                </Button>

                <div className="powerConsumptionContainer">
                  <div className="powerConsumptionTitle">Power Consumption</div>
                  <ul className="powerConsumptionList">
                    <li className="powerConsumptionListItem">
                      <span>Since Last On:</span>
                      <span>{app2PowerConsumption.lastOn.toFixed(5)} Wh</span>
                    </li>
                    <li className="powerConsumptionListItem">
                      <span>Today:</span>
                      <span>{app2PowerConsumption.today.toFixed(5)} Wh</span>
                    </li>
                    <li className="powerConsumptionListItem">
                      <span>Last 7 Days:</span>
                      <span>{app2PowerConsumption.last7Days.toFixed(5)} Wh</span>
                    </li>
                    <li className="powerConsumptionListItem">
                      <span>Last 30 Days:</span>
                      <span>{app2PowerConsumption.last30Days.toFixed(5)} Wh</span>
                    </li>
                  </ul>
                </div>

                <Link to="/" className="link">
                  <Button variant="contained" className="homeButton" style={{ backgroundColor: '#1e2b33' }}>
                    Home
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default App2;

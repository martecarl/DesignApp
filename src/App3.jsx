import React, { useContext, useEffect } from 'react';
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

const App3 = () => {
  const { statuses, setStatuses, powerConsumptions, setPowerConsumptions, fetchPowerConsumption } = useContext(StatusContext);
  const app3Status = statuses.app3;
  const app3PowerConsumption = powerConsumptions.app3;

  useEffect(() => {
    let intervalId;

    if (app3Status) {
      // Set up a timer to fetch power consumption data every second
      intervalId = setInterval(() => {
        fetchPowerConsumption('app3');
      }, 10000); // 1000 milliseconds = 1 second

      // Fetch data immediately on mount if the appliance is on
      fetchPowerConsumption('app3');
    } else {
      // Clear the interval if the appliance is turned off
      clearInterval(intervalId);
    }

    // Clean up the interval on component unmount or status change
    return () => clearInterval(intervalId);
  }, [app3Status, fetchPowerConsumption]);

  const handleToggleApp3 = () => {
    const newStatus = !app3Status;
    setStatuses((prevStatuses) => ({
      ...prevStatuses,
      app3: newStatus,
    }));

    const ws = new WebSocket('ws://13.210.151.196:4000');
    ws.onopen = () => {
      ws.send(JSON.stringify({ app3: newStatus }));
      ws.close();
    };

    // If turning off, manually clear power consumption values
    if (!newStatus) {
      setPowerConsumptions((prev) => ({
        ...prev,
        app3: {
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
                <span style={{ fontWeight: 'bold', color: '#FFFFFF' }}>Appliance 1</span>
              </Typography>
            </div>

            <div className="formContentContainer">
              <div className="buttonContainer">
                <Button
                  onClick={handleToggleApp3}
                  variant="contained"
                  style={{ backgroundColor: '#1e2b33' }}
                  className={`statusButton ${app3Status ? 'on' : 'off'}`}
                >
                  {app3Status ? 'On' : 'Off'}
                </Button>

                <div className="powerConsumptionContainer">
                  <div className="powerConsumptionTitle">Power Consumption</div>
                  <ul className="powerConsumptionList">
                    <li className="powerConsumptionListItem">
                      <span>Since Last On:</span>
                      <span>{app3PowerConsumption.lastOn.toFixed(5)} Wh</span>
                    </li>
                    <li className="powerConsumptionListItem">
                      <span>Today:</span>
                      <span>{app3PowerConsumption.today.toFixed(5)} Wh</span>
                    </li>
                    <li className="powerConsumptionListItem">
                      <span>Last 7 Days:</span>
                      <span>{app3PowerConsumption.last7Days.toFixed(5)} Wh</span>
                    </li>
                    <li className="powerConsumptionListItem">
                      <span>Last 30 Days:</span>
                      <span>{app3PowerConsumption.last30Days.toFixed(5)} Wh</span>
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

export default App3;

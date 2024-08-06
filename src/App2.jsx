import React, { useContext, useState } from 'react';
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
  const { statuses, setStatuses } = useContext(StatusContext);
  const app2Status = statuses.app2;
  const [powerConsumption, setPowerConsumption] = useState({
    lastOn: 0,
    today: 0,
    last7Days: 0,
    last30Days: 0,
  });

  const handleToggleApp2 = () => {
    const newStatus = !app2Status;
    setStatuses((prevStatuses) => ({
      ...prevStatuses,
      app2: newStatus,
    }));

    const ws = new WebSocket('ws://[2001:4450:81d5:5300:70df:e9f6:7c02:873c]:4000');
    ws.onopen = () => {
      ws.send(JSON.stringify({ app2: newStatus }));
      ws.close();
    };

    const newPowerConsumption = newStatus
      ? { lastOn: 10, today: 20, last7Days: 50, last30Days: 200 }
      : { lastOn: 0, today: 0, last7Days: 0, last30Days: 0 };
    setPowerConsumption(newPowerConsumption);
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
                      <span>{powerConsumption.lastOn} kWh</span>
                    </li>
                    <li className="powerConsumptionListItem">
                      <span>Today:</span>
                      <span>{powerConsumption.today} kWh</span>
                    </li>
                    <li className="powerConsumptionListItem">
                      <span>Last 7 Days:</span>
                      <span>{powerConsumption.last7Days} kWh</span>
                    </li>
                    <li className="powerConsumptionListItem">
                      <span>Last 30 Days:</span>
                      <span>{powerConsumption.last30Days} kWh</span>
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

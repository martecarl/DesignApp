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

const App3 = () => {
  const { statuses, setStatuses } = useContext(StatusContext);
  const app3Status = statuses.app3;
  const [powerConsumption, setPowerConsumption] = useState({
    lastOn: 0,
    today: 0,
    last7Days: 0,
    last30Days: 0,
  });

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
                <span style={{ fontWeight: 'bold', color: '#FFFFFF' }}>Appliance 3</span>
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

export default App3;

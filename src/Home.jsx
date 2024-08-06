import React, { useContext } from "react";
import { Typography, Box, ThemeProvider } from "@mui/material";
import { Link } from 'react-router-dom';
import { createTheme } from '@mui/material/styles';
import './Home.css';
import { StatusContext } from "./StatusContext";

const theme = createTheme({
  typography: {
    fontFamily: [
      'Poppins',
      'sans-serif',
    ].join(','),
  },
});

const Home = () => {
  const { statuses } = useContext(StatusContext);

  return (
    <ThemeProvider theme={theme}>
      <Box className="homepage-container" style={{ backgroundColor: '#FFFFFF' }}>
        <Box className="content-container">
          <Typography variant="h6" gutterBottom>
            <span style={{ fontWeight: 'bold' }}>Smart Home Automation Monitoring Application</span>
          </Typography>

          <Typography variant="h5" gutterBottom className="choose" style={{ marginTop: '20px', color: '#054646' }}>
            <span style={{ fontWeight: 'normal' }}>Appliances Status</span>
          </Typography>

          <div className="status-container">
            <div className="status-item">
              <span>App 1</span>
              <span className={`status ${statuses.app1 ? 'on' : 'off'}`}>{statuses.app1 ? 'On' : 'Off'}</span>
            </div>
            <div className="status-item">
              <span>App 2</span>
              <span className={`status ${statuses.app2 ? 'on' : 'off'}`}>{statuses.app2 ? 'On' : 'Off'}</span>
            </div>
            <div className="status-item">
              <span>App 3</span>
              <span className={`status ${statuses.app3 ? 'on' : 'off'}`}>{statuses.app3 ? 'On' : 'Off'}</span>
            </div>
          </div>

          <div className="button-container">
            <Link to="/App1" className="button">
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>APP 1</span>
            </Link>
          
            <Link to="/App2" className="button">
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>APP 2</span>
            </Link>

            <Link to="/App3" className="button">
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>APP 3</span>
            </Link>
          </div>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Home;

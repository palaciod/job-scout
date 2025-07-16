import React, { useState, useEffect } from "react";
import { 
  Button, 
  CircularProgress, 
  Box, 
  Chip, 
  Tooltip,
  Alert,
  Snackbar
} from "@mui/material";
import { 
  PlayArrow, 
  Stop, 
  SmartToy, 
  Warning,
  CheckCircle 
} from "@mui/icons-material";

const API_BASE_URL = 'http://localhost:3000';

const StartBotButton = () => {
  const [botStatus, setBotStatus] = useState('stopped');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const checkBotStatus = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/bot/status`);
        const data = await response.json();
        if (data.success) {
          setBotStatus(data.status);
        }
      } catch (err) {
        console.error('Failed to check bot status:', err);
      }
    };

    checkBotStatus();
    const interval = setInterval(checkBotStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleStartBot = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/bot/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        setBotStatus('running');
        setSuccessMessage('Bot started successfully! 🚀');
      } else {
        setError(data.message || 'Failed to start bot');
      }
    } catch (err) {
      setError(`Error starting bot: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopBot = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/bot/stop`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        setBotStatus('stopped');
        setSuccessMessage('Bot stopped successfully! ⏹️');
      } else {
        setError(data.message || 'Failed to stop bot');
      }
    } catch (err) {
      setError(`Error stopping bot: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmergencyStop = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/bot/emergency-stop`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        setBotStatus('stopped');
        setSuccessMessage('Bot emergency stopped! 🛑');
      } else {
        setError(data.message || 'Failed to emergency stop bot');
      }
    } catch (err) {
      setError(`Error during emergency stop: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = () => {
    switch (botStatus) {
      case 'running': return 'success';
      case 'starting': return 'warning';
      case 'stopping': return 'warning';
      case 'stopped': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = () => {
    switch (botStatus) {
      case 'running': return <CheckCircle />;
      case 'starting': return <CircularProgress size={16} />;
      case 'stopping': return <CircularProgress size={16} />;
      case 'stopped': return <SmartToy />;
      default: return <SmartToy />;
    }
  };

  const isRunning = botStatus === 'running';
  const isTransitioning = botStatus === 'starting' || botStatus === 'stopping';

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Chip
        icon={getStatusIcon()}
        label={`Bot ${botStatus.charAt(0).toUpperCase() + botStatus.slice(1)}`}
        color={getStatusColor()}
        size="small"
        variant="outlined"
      />
      {!isRunning ? (
        <Tooltip title="Start the LinkedIn automation bot">
          <Button
            variant="contained"
            color="primary"
            startIcon={isLoading ? <CircularProgress size={16} /> : <PlayArrow />}
            onClick={handleStartBot}
            disabled={isLoading || isTransitioning}
            sx={{
              minWidth: 120,
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #1976D2 30%, #1E88E5 90%)',
              }
            }}
          >
            {isLoading ? 'Starting...' : 'Start Bot'}
          </Button>
        </Tooltip>
      ) : (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Stop the automation bot gracefully">
            <Button
              variant="contained"
              color="warning"
              startIcon={isLoading ? <CircularProgress size={16} /> : <Stop />}
              onClick={handleStopBot}
              disabled={isLoading}
              sx={{ minWidth: 100 }}
            >
              {isLoading ? 'Stopping...' : 'Stop'}
            </Button>
          </Tooltip>
          <Tooltip title="Force stop the bot immediately">
            <Button
              variant="outlined"
              color="error"
              startIcon={<Warning />}
              onClick={handleEmergencyStop}
              disabled={isLoading}
              size="small"
            >
              Emergency
            </Button>
          </Tooltip>
        </Box>
      )}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={4000}
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSuccessMessage('')} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setError(null)} 
          severity="error" 
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default StartBotButton;
import React, { useState, useEffect } from 'react';
import { Snackbar, Button } from '@mui/material';
import SystemUpdateIcon from '@mui/icons-material/SystemUpdate';

function UpdateNotification() {
  const [showReload, setShowReload] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState(null);

  useEffect(() => {
    // Check if service workers are supported
    if ('serviceWorker' in navigator) {
      // Listen for new service worker installation
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/serviceWorker.js').then(registration => {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
          
          registration.addEventListener('updatefound', () => {
            // A new service worker is available
            const newWorker = registration.installing;
            
            newWorker.addEventListener('statechange', () => {
              // New service worker is installed and waiting
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setShowReload(true);
                setWaitingWorker(newWorker);
              }
            });
          });
        }).catch(registrationError => {
          console.log('ServiceWorker registration failed: ', registrationError);
        });
        
        // Check for updates every hour
        setInterval(() => {
          if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({ type: 'CHECK_FOR_UPDATES' });
          }
        }, 60 * 60 * 1000); // 1 hour in milliseconds
      });
    }
  }, []);

  const handleUpdate = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    }
    setShowReload(false);
    window.location.reload();
  };

  const handleClose = () => {
    setShowReload(false);
  };

  return (
    <Snackbar
      open={showReload}
      message="A new version is available!"
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      action={
        <Button 
          color="secondary" 
          size="small" 
          onClick={handleUpdate}
          startIcon={<SystemUpdateIcon />}
        >
          Update
        </Button>
      }
      onClose={handleClose}
    />
  );
}

export default UpdateNotification; 
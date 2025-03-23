import React, { useState, useEffect } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import GetAppIcon from '@mui/icons-material/GetApp';

function InstallPWA() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [platform, setPlatform] = useState('unknown');
  
  // Detect platform
  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    if (/android/i.test(userAgent)) {
      setPlatform('android');
    } else if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
      setPlatform('ios');
    } else if (/windows|win32|win64|mac|macintel/i.test(userAgent)) {
      setPlatform('desktop');
    }
  }, []);
  
  // Listen for the beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setInstallPrompt(e);
      console.log('App can be installed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (platform === 'ios') {
      // iOS doesn't support the beforeinstallprompt event
      setDialogOpen(true);
    } else if (installPrompt) {
      // Show the install prompt
      installPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      installPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        // Clear the saved prompt since it can't be used again
        setInstallPrompt(null);
      });
    } else {
      // The app is likely already installed or the browser doesn't support PWA
      setDialogOpen(true);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  // Don't show the button if the app is already in standalone mode (installed)
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return null;
  }

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        startIcon={<GetAppIcon />}
        onClick={handleInstallClick}
        size="small"
      >
        Install App
      </Button>
      
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Install eNotebook</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {platform === 'ios' ? (
              <>
                To install on iOS:
                <ol>
                  <li>Tap the share icon in Safari</li>
                  <li>Scroll down and tap "Add to Home Screen"</li>
                  <li>Tap "Add" in the top-right corner</li>
                </ol>
              </>
            ) : platform === 'android' ? (
              <>
                To install on Android:
                <ol>
                  <li>Tap the menu (⋮) in Chrome</li>
                  <li>Tap "Add to Home screen"</li>
                </ol>
              </>
            ) : (
              <>
                To install on your desktop:
                <ol>
                  <li>Look for the install icon (⊕) in the address bar</li>
                  <li>Click "Install"</li>
                </ol>
                <p>If you don't see the install option, this browser may not support PWA installation or the app is already installed.</p>
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default InstallPWA; 
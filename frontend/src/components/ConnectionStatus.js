import React, { useContext, useState, useEffect } from 'react';
import { NoteContext } from '../context/notes/NoteContext';
import { 
    IconButton, 
    Tooltip, 
    Badge, 
    Popover, 
    Typography,
    Box,
    List,
    ListItem,
    ListItemText,
    Button,
    CircularProgress
} from '@mui/material';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import SyncIcon from '@mui/icons-material/Sync';
import WarningIcon from '@mui/icons-material/Warning';

function ConnectionStatus() {
    const { notes, apiAvailable, syncing, syncTemporarySubNotes } = useContext(NoteContext);
    const [anchorEl, setAnchorEl] = useState(null);
    const [temporaryNoteCount, setTemporaryNoteCount] = useState(0);
    
    // Count temporary notes
    useEffect(() => {
        let count = 0;
        notes.forEach(note => {
            if (Array.isArray(note.subNotes)) {
                count += note.subNotes.filter(subNote => subNote.isTemporary).length;
            }
        });
        setTemporaryNoteCount(count);
    }, [notes]);
    
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    
    const handleClose = () => {
        setAnchorEl(null);
    };
    
    const handleSync = async () => {
        await syncTemporarySubNotes();
        // Don't close the popover to show the updated status
    };
    
    const open = Boolean(anchorEl);
    const id = open ? 'connection-status-popover' : undefined;
    
    const getStatusIcon = () => {
        if (!apiAvailable) {
            return (
                <Badge badgeContent={temporaryNoteCount} color="warning" overlap="circular">
                    <CloudOffIcon color="error" />
                </Badge>
            );
        }
        
        if (temporaryNoteCount > 0) {
            return (
                <Badge badgeContent={temporaryNoteCount} color="warning" overlap="circular">
                    <WarningIcon color="warning" />
                </Badge>
            );
        }
        
        return <CloudDoneIcon color="success" />;
    };
    
    const getStatusText = () => {
        if (!apiAvailable) {
            return "Offline - Server unavailable";
        }
        
        if (temporaryNoteCount > 0) {
            return `Online - ${temporaryNoteCount} notes need syncing`;
        }
        
        return "Online - All notes synced";
    };
    
    return (
        <>
            <Tooltip title={getStatusText()}>
                <IconButton 
                    aria-describedby={id} 
                    onClick={handleClick}
                    size="small"
                    color={apiAvailable ? (temporaryNoteCount > 0 ? "warning" : "success") : "error"}
                >
                    {getStatusIcon()}
                </IconButton>
            </Tooltip>
            
            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
            >
                <Box sx={{ p: 2, maxWidth: 300 }}>
                    <Typography variant="h6" gutterBottom>
                        Connection Status
                    </Typography>
                    
                    <List dense>
                        <ListItem>
                            <ListItemText 
                                primary="Server Connection" 
                                secondary={apiAvailable ? "Connected" : "Disconnected"} 
                                secondaryTypographyProps={{ 
                                    color: apiAvailable ? "success.main" : "error.main",
                                    fontWeight: 'bold'
                                }}
                            />
                        </ListItem>
                        
                        <ListItem>
                            <ListItemText 
                                primary="Pending Changes" 
                                secondary={
                                    temporaryNoteCount === 0 
                                        ? "None" 
                                        : `${temporaryNoteCount} sub-note${temporaryNoteCount !== 1 ? 's' : ''} pending sync`
                                }
                                secondaryTypographyProps={{ 
                                    color: temporaryNoteCount > 0 ? "warning.main" : "text.secondary",
                                    fontWeight: temporaryNoteCount > 0 ? 'bold' : 'normal'
                                }}
                            />
                        </ListItem>
                    </List>
                    
                    {temporaryNoteCount > 0 && (
                        <Button 
                            variant="contained"
                            color="warning"
                            fullWidth
                            startIcon={syncing ? <CircularProgress size={16} color="inherit" /> : <SyncIcon />}
                            onClick={handleSync}
                            disabled={syncing || !apiAvailable}
                            sx={{ mt: 1 }}
                        >
                            {syncing ? 'Syncing...' : 'Sync Now'}
                        </Button>
                    )}
                    
                    {!apiAvailable && temporaryNoteCount > 0 && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                            Your changes are saved locally and will sync automatically when the server becomes available.
                        </Typography>
                    )}
                </Box>
            </Popover>
        </>
    );
}

export default ConnectionStatus; 
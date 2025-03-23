import React, { useState, useContext, useEffect } from 'react';
import { NoteContext } from '../context/notes/NoteContext';
import { AlertContext } from '../context/AlertContext';
import { 
    TextField, 
    Button, 
    List, 
    ListItem, 
    ListItemText, 
    Checkbox, 
    IconButton, 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions,
    Typography,
    Divider,
    CircularProgress,
    Paper,
    Badge,
    Tooltip,
    Chip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SyncIcon from '@mui/icons-material/Sync';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import CloudDoneIcon from '@mui/icons-material/CloudDone';

const SubNotes = ({ noteId }) => {
    const { activeNote, setActiveNote, addSubNote, updateSubNote, deleteSubNote, syncTemporarySubNotes } = useContext(NoteContext);
    const { showAlert } = useContext(AlertContext);
    
    const [newSubNote, setNewSubNote] = useState({ title: '', content: '' });
    const [editingSubNote, setEditingSubNote] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    
    const subNotes = Array.isArray(activeNote?.subNotes) ? activeNote.subNotes : [];
    
    // Count temporary sub-notes
    const temporaryCount = subNotes.filter(subNote => subNote.isTemporary).length;
    
    // Manual sync function
    const handleSync = async () => {
        if (isSyncing) return;
        
        setIsSyncing(true);
        try {
            await syncTemporarySubNotes();
            showAlert('Synchronization completed', 'success');
        } catch (error) {
            console.error("Error syncing notes:", error);
            showAlert('Failed to synchronize notes', 'error');
        } finally {
            setIsSyncing(false);
        }
    };
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewSubNote({ ...newSubNote, [name]: value });
    };
    
    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditingSubNote({ ...editingSubNote, [name]: value });
    };
    
    const handleAddSubNote = async (e) => {
        e.preventDefault();
        if (!newSubNote.title || !newSubNote.content) {
            showAlert('Sub-note title and content are required', 'error');
            return;
        }
        
        setIsLoading(true);
        try {
            const result = await addSubNote(noteId, newSubNote);
            if (result) {
                setNewSubNote({ title: '', content: '' });
                showAlert('Sub-note added successfully', 'success');
            } else {
                showAlert('Failed to add sub-note', 'error');
            }
        } catch (error) {
            console.error("Error in SubNotes component:", error);
            showAlert('An error occurred while adding the sub-note', 'error');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleToggleComplete = async (subNoteId, completed) => {
        try {
            await updateSubNote(noteId, subNoteId, { completed: !completed });
        } catch (error) {
            console.error("Error toggling completion status:", error);
            showAlert('Failed to update sub-note status', 'error');
        }
    };
    
    const handleOpenDialog = (subNote) => {
        setEditingSubNote(subNote);
        setOpenDialog(true);
    };
    
    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingSubNote(null);
    };
    
    const handleUpdateSubNote = async () => {
        if (!editingSubNote.title || !editingSubNote.content) {
            showAlert('Sub-note title and content are required', 'error');
            return;
        }
        
        setIsLoading(true);
        try {
            const result = await updateSubNote(noteId, editingSubNote._id, {
                title: editingSubNote.title,
                content: editingSubNote.content
            });
            
            if (result) {
                setOpenDialog(false);
                setEditingSubNote(null);
                showAlert('Sub-note updated successfully', 'success');
            } else {
                showAlert('Failed to update sub-note', 'error');
            }
        } catch (error) {
            console.error("Error updating sub-note:", error);
            showAlert('An error occurred while updating the sub-note', 'error');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDeleteSubNote = async (subNoteId) => {
        if (window.confirm('Are you sure you want to delete this sub-note?')) {
            setIsLoading(true);
            try {
                const result = await deleteSubNote(noteId, subNoteId);
                if (result) {
                    showAlert('Sub-note deleted successfully', 'success');
                } else {
                    showAlert('Failed to delete sub-note', 'error');
                }
            } catch (error) {
                console.error("Error deleting sub-note:", error);
                showAlert('An error occurred while deleting the sub-note', 'error');
            } finally {
                setIsLoading(false);
            }
        }
    };
    
    const renderSubNotes = () => {
        if (subNotes.length === 0) {
            return (
                <Typography variant="body2" sx={{ my: 2, fontStyle: 'italic', textAlign: 'center' }}>
                    No sub-notes yet. Add one above.
                </Typography>
            );
        }

        return (
            <List sx={{ width: '100%' }}>
                {subNotes.map((subNote) => (
                    <ListItem 
                        key={subNote._id} 
                        sx={{ 
                            borderLeft: subNote.isTemporary ? '3px solid orange' : 'none',
                            bgcolor: subNote.isTemporary ? 'rgba(255, 165, 0, 0.05)' : 'inherit'
                        }}
                        secondaryAction={
                            <div>
                                {subNote.isTemporary && (
                                    <Tooltip title="This sub-note is stored locally and will sync when server is available">
                                        <IconButton edge="end" aria-label="temporary" sx={{ color: 'orange' }}>
                                            <CloudOffIcon />
                                        </IconButton>
                                    </Tooltip>
                                )}
                                <IconButton edge="end" aria-label="edit" onClick={() => handleOpenDialog(subNote)}>
                                    <EditIcon />
                                </IconButton>
                                <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteSubNote(subNote._id)}>
                                    <DeleteIcon />
                                </IconButton>
                            </div>
                        }
                    >
                        <Checkbox
                            edge="start"
                            checked={subNote.completed || false}
                            onChange={() => handleToggleComplete(subNote._id, subNote.completed)}
                        />
                        <ListItemText
                            primary={
                                <Typography 
                                    variant="subtitle1" 
                                    style={{ 
                                        textDecoration: subNote.completed ? 'line-through' : 'none',
                                        opacity: subNote.completed ? 0.6 : 1
                                    }}
                                >
                                    {subNote.title}
                                    {subNote.isTemporary && (
                                        <Chip 
                                            size="small" 
                                            label="pending sync" 
                                            color="warning" 
                                            variant="outlined"
                                            icon={<CloudOffIcon />}
                                            sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
                                        />
                                    )}
                                </Typography>
                            }
                            secondary={
                                <Typography 
                                    variant="body2" 
                                    style={{ 
                                        textDecoration: subNote.completed ? 'line-through' : 'none',
                                        opacity: subNote.completed ? 0.6 : 1
                                    }}
                                >
                                    {subNote.content}
                                </Typography>
                            }
                        />
                    </ListItem>
                ))}
            </List>
        );
    };
    
    if (!activeNote) {
        return <Typography variant="body1">Select a note to view or add sub-notes</Typography>;
    }
    
    return (
        <div style={{ padding: '10px' }}>
            {!activeNote ? (
                <Typography variant="body1" sx={{ textAlign: 'center', my: 3 }}>
                    Select a note to view and manage its sub-notes.
                </Typography>
            ) : (
                <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <Typography variant="h6">
                            Sub-notes for {activeNote.title}
                        </Typography>
                        {temporaryCount > 0 && (
                            <Tooltip title="Synchronize temporary notes with server">
                                <Button 
                                    variant="outlined" 
                                    color="warning" 
                                    size="small"
                                    startIcon={isSyncing ? <CircularProgress size={16} /> : <SyncIcon />}
                                    onClick={handleSync}
                                    disabled={isSyncing}
                                >
                                    Sync {temporaryCount} {temporaryCount === 1 ? 'note' : 'notes'}
                                </Button>
                            </Tooltip>
                        )}
                    </div>
                    
                    <form onSubmit={handleAddSubNote}>
                        <TextField
                            label="Title"
                            name="title"
                            value={newSubNote.title}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                            size="small"
                            required
                        />
                        <TextField
                            label="Content"
                            name="content"
                            value={newSubNote.content}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                            size="small"
                            multiline
                            rows={2}
                            required
                        />
                        <Button 
                            type="submit" 
                            variant="contained" 
                            color="primary" 
                            disabled={isLoading}
                            sx={{ mt: 1 }}
                        >
                            {isLoading ? <CircularProgress size={24} /> : 'Add Sub-note'}
                        </Button>
                    </form>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    {renderSubNotes()}
                    
                    <Dialog open={openDialog} onClose={handleCloseDialog}>
                        <DialogTitle>Edit Sub-note</DialogTitle>
                        <DialogContent>
                            <TextField
                                label="Title"
                                name="title"
                                value={editingSubNote?.title || ''}
                                onChange={handleEditInputChange}
                                fullWidth
                                margin="normal"
                                required
                            />
                            <TextField
                                label="Content"
                                name="content"
                                value={editingSubNote?.content || ''}
                                onChange={handleEditInputChange}
                                fullWidth
                                margin="normal"
                                multiline
                                rows={3}
                                required
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseDialog}>Cancel</Button>
                            <Button onClick={handleUpdateSubNote} color="primary">
                                Update
                            </Button>
                        </DialogActions>
                    </Dialog>
                </>
            )}
        </div>
    );
};

export default SubNotes; 
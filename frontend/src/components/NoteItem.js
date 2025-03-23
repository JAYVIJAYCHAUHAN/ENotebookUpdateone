import React, { useContext, memo } from 'react'
import { IconButton, Badge } from '@mui/material';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditIcon from '@mui/icons-material/Edit';
import ListAltIcon from '@mui/icons-material/ListAlt';
import { NoteContext } from '../context/notes/NoteContext';
import { Dialog, Button, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from '@mui/material';
import useInputState from "../hooks/useInputState"
import useToggleState from '../hooks/useToggleState';




function NoteItem({ note }) {

    const { remove, edit, setActiveNote } = useContext(NoteContext)

    const [open, toggleOpen] = useToggleState(false)

    const [title, updateTitle] = useInputState(note.title)
    const [description, updateDescription] = useInputState(note.description)
    const [tag, updateTag] = useInputState(note.tag)

    // Safely check if subNotes exists and is an array before accessing length
    const subNoteCount = Array.isArray(note?.subNotes) ? note.subNotes.length : 0;

    const handleClickOpen = () => {
        toggleOpen()
    };

    const handleClose = () => {
        toggleOpen()
    };

    const handleSubmit = (evt) => {
        evt.preventDefault()
        edit(title, description, tag, note._id)
    }

    const handleViewSubNotes = () => {
        setActiveNote(note);
    }

    return (
        <div className="col-12 col-sm-6 col-md-4 col-lg-3 mt-2 mb-2">
            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
                <DialogTitle style={{ fontFamily: "'Poppins', sans-serif", fontWeight: "bold", fontSize: "1.8rem", paddingBottom: "0rem" }}>Edit Note</DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent style={{ paddingTop: "0.5rem" }}>
                        <DialogContentText style={{ fontFamily: "'Poppins', sans-serif", fontSize: "1rem", marginBottom: "0.5rem" }}>
                            Edit your note. edit the field that you want to edit in note
                        </DialogContentText>
                        <TextField inputProps={{minlength:3}} autoFocus required color="secondary" margin="dense" value={title} onChange={updateTitle} label="Title" type="text" fullWidth variant="standard" />
                        <TextField inputProps={{minlength:3}} autoFocus required color="secondary" margin="dense" value={description} onChange={updateDescription} label="Description" type="text" fullWidth variant="standard" />
                        <TextField inputProps={{minlength:3}} autoFocus required color="secondary" margin="dense" value={tag} label="tag" onChange={updateTag} type="text" fullWidth variant="standard" />
                    </DialogContent>
                    <DialogActions>
                        <Button variant="outlined" color="secondary" onClick={handleClose} style={{ textTransform: "none", fontFamily: "'Poppins', sans-serif", fontSize: "1rem" }}>Cancel</Button>
                        <Button disabled={title.length < 3 || description.length < 3 || tag.length < 3 } variant="contained" color="secondary" type="submit" onClick={handleClose} style={{ textTransform: "none", fontFamily: "'Poppins', sans-serif", fontSize: "1rem" }}>Edit {note.title}</Button>
                    </DialogActions>
                </form>
            </Dialog>

            <div className="card h-100 shadow-sm">
                <div className="card-body d-flex flex-column">
                    <div className="d-flex align-items-center mb-2">
                        <h5 className="card-title text-truncate mb-0" title={note.title}>{note.title}</h5>
                        <div className="ms-auto d-flex">
                            <IconButton 
                                onClick={handleViewSubNotes} 
                                size="small"
                                className="me-1" 
                                color="primary"
                            >
                                <Badge badgeContent={subNoteCount} color="primary">
                                    <ListAltIcon fontSize={window.innerWidth < 768 ? 'small' : 'medium'} />
                                </Badge>
                            </IconButton>
                            <IconButton 
                                onClick={() => { remove(note._id) }} 
                                size="small"
                                className="me-1" 
                                color="secondary"
                            >
                                <DeleteOutlineOutlinedIcon fontSize={window.innerWidth < 768 ? 'small' : 'medium'} color="secondary" />
                            </IconButton>
                            <IconButton 
                                size="small" 
                                color="secondary" 
                                onClick={handleClickOpen}
                            >
                                <EditIcon fontSize={window.innerWidth < 768 ? 'small' : 'medium'} color="secondary" />
                            </IconButton>
                        </div>
                    </div>
                    <h6 className="card-subtitle mb-2 text-muted text-truncate" title={note.tag}>{note.tag}</h6>
                    <p className="card-text flex-grow-1" style={{ 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        display: '-webkit-box', 
                        WebkitLineClamp: 4, 
                        WebkitBoxOrient: 'vertical',
                        fontSize: '0.9rem'
                    }}>
                        {note.description}
                    </p>
                    <div className="d-flex justify-content-end mt-2">
                        <small className="text-muted">
                            {note.createdAt ? new Date(note.createdAt).toLocaleDateString() : 'No date'}
                        </small>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default memo(NoteItem)

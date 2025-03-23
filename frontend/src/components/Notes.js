import React, { useContext, useEffect, } from 'react'
import { NoteContext } from '../context/notes/NoteContext';
import NoteItem from './NoteItem';
import empty from '../images/empty.svg'
import { useNavigate } from "react-router-dom";
import { AlertContext } from '../context/AlertContext';
import ErrorBoundary from './ErrorBoundary';

function Notes() {

    const { notes, getNotes } = useContext(NoteContext)
    const navigate = useNavigate()
    const { showAlert } = useContext(AlertContext)

    useEffect(() => {
        if (localStorage.getItem('token')) {
            getNotes()
            console.log(notes)
        } else {
            navigate('/about')
            showAlert("You need to signed in first", "error")
        }
        // eslint-disable-next-line
    }, [])

    // Ensure notes is always an array
    const notesArray = Array.isArray(notes) ? notes : [];

    const renderNotes = () => {
        if (notesArray.length === 0) {
            return (
                <div className="d-flex ">
                    <p style={{position: "absolute", left: "35%", bottom: "-10%"}}>Create your first note :) !!!!!</p>
                    <img className="img-fluid ms-5 mt-3" src={empty} alt="empty" style={{width: "30%", opacity: "0.5"}} />
                </div>
            );
        }
        
        return notesArray.map(note => (
            <ErrorBoundary key={note._id} showDetails={false}>
                <NoteItem note={note} />
            </ErrorBoundary>
        ));
    };

    return (
        <div className="container-fluid px-2 px-md-4 mt-4 mb-1">
            <h1 className="display-6 mb-3">Your Notes</h1>
            <div className="row g-3">
                <ErrorBoundary showDetails={false}>
                    {renderNotes()}
                </ErrorBoundary>
            </div>
        </div>
    )
}

export default Notes

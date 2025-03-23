import React, { useContext } from 'react'
import noteImg from '../images/inotebook.svg'
import { Link } from "react-router-dom";
import { Button, Divider, Paper } from '@mui/material';
import "../styles/home.css"
import Notes from './Notes';
import Navbar from "./Navbar";
import Alertss from "./Alertss";
import SubNotes from './SubNotes';
import { NoteContext } from '../context/notes/NoteContext';

function Home() {
    const { activeNote } = useContext(NoteContext);

    return (
        <>
            <Navbar />
            <Alertss />
            <div className="container-fluid" >
                <div className="row">
                    <div className="col-md-5">
                        <h1 className="display-1 pt-5 ps-5 respo"><span style={{ color: "#9C27B0" }}>e</span>Notebook</h1>
                        <p className="ps-5 respo" style={{ fontSize: "1.7rem", fontWeight: "bold" }}>Your notebook on cloud - safe and secure</p>
                        <p className="ps-5 mt-3 respo" style={{ fontSize: "1rem" }}>An online web platform where you can create, edit, upload, delete your notes/information privately and securely without any disturbancee. For more info you can checkout our <Link to="/about">About Page</Link>  </p>
                        <div className="d-flex justify-content-center">
                            <Button component={Link} to="/new" variant="contained" color="secondary" style={{ color: "White", textTransform: "none", fontFamily: "'Poppins', sans-serif", fontSize: "1.3rem" }}>Create New Note</Button>
                        </div>
                    </div>
                    <div className="col-md-7 d-flex flex-column align-items-center">
                        <img className="img-fluid" style={{width: "75%"}} src={noteImg} alt="iNotebook" />
                    </div>
                </div>

                <div className="row mt-4">
                    <div className={activeNote ? "col-md-7" : "col-md-12"}>
                        <Notes />
                    </div>
                    {activeNote && (
                        <div className="col-md-5">
                            <Paper elevation={3} className="p-4 mb-4">
                                <SubNotes noteId={activeNote._id} />
                            </Paper>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

export default Home

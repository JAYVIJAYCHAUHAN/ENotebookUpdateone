const express = require("express");
const {
    fetchAllNotes, 
    addNote, 
    updateNote, 
    deleteNote, 
    addSubNote, 
    updateSubNote, 
    deleteSubNote
} = require("../controllers/notes")
const {fetchUser, validateNewNote, validateSubNote} = require("../middlewares")
const catchAsync = require("../utils/catchAsync")

const router = express.Router()

// Get all the notes using : GET /api/notes/
router.get('/', fetchUser, catchAsync(fetchAllNotes))

// Get all the notes using : POST /api/notes/
router.post('/', fetchUser, validateNewNote, catchAsync(addNote))

// Update the notes using: PUT /api/notes
router.put('/:id', fetchUser, validateNewNote, catchAsync(updateNote))

// Delete the notes using: PUT /api/notes
router.delete('/:id', fetchUser, catchAsync(deleteNote))

// DEBUG: Simple endpoint for testing sub-notes functionality
router.get('/debug/:noteId', fetchUser, catchAsync(async (req, res) => {
    const { noteId } = req.params;
    const userId = req.user.id;
    
    console.log(`DEBUG: Checking note ${noteId} for user ${userId}`);
    
    const note = await require('../models/Notes').findById(noteId);
    if (!note) {
        return res.status(404).json({ message: 'Note not found' });
    }
    
    if (note.user.toString() !== userId) {
        return res.status(401).json({ message: 'Unauthorized access' });
    }
    
    // Return note with its sub-notes
    res.json({
        note,
        subNotesCount: note.subNotes ? note.subNotes.length : 0,
        message: 'Debug endpoint working correctly'
    });
}));

// Sub-notes routes
// Add a sub-note to a note
router.post('/:noteId/subnotes', fetchUser, validateSubNote, catchAsync(addSubNote))

// Update a sub-note
router.put('/:noteId/subnotes/:subNoteId', fetchUser, validateSubNote, catchAsync(updateSubNote))

// Delete a sub-note
router.delete('/:noteId/subnotes/:subNoteId', fetchUser, catchAsync(deleteSubNote))

module.exports = router
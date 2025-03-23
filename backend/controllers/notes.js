const Notes = require("../models/Notes")
const ExpressError = require("../utils/ExpressError")

module.exports.fetchAllNotes = async (req, res) => {
    const { id } = req.user
    const notes = await Notes.find({ user: id })
    res.status(201).json(notes)
}

module.exports.addNote = async (req, res) => {
    const { id } = req.user
    const { title, description, tag } = req.body
    const notes = new Notes({
        title, description, tag, user: id
    })
    const resp = await notes.save()
    res.status(201).json(resp)
}

module.exports.updateNote = async (req, res) => {
    const { id } = req.params
    const  userId  = req.user.id
    const note = await Notes.findById(id)
    if (!note) {
        // return res.status(400).json({ message: "Note not found !" })
        throw new ExpressError("Note not found", 404)
    }
    if (note.user.toString() !== userId) {
        throw new ExpressError("Unauthorized access", 401)
    }
    const updatedNote = await Notes.findByIdAndUpdate(id, { ...req.body }, { new: true, runValidators: true })
    res.status(201).json(updatedNote)
}

module.exports.deleteNote = async (req, res) => {
    const { id } = req.params
    const  userId  = req.user.id
    const note = await Notes.findById(id)
    if (!note) {
        throw new ExpressError("Note not found", 404)
    }
    if (note.user.toString() !== userId) {
        throw new ExpressError("Unauthorized access", 401)
    }
    const deletedNote = await Notes.findByIdAndDelete(id)
    res.status(201).json({message: `${deletedNote.title} deleted successfully`, note: deletedNote})
}

// Sub-notes controllers
module.exports.addSubNote = async (req, res) => {
    try {
        const { noteId } = req.params
        const userId = req.user.id
        const { title, content } = req.body
        
        console.log(`Processing sub-note creation for note ID: ${noteId}, user ID: ${userId}`);
        console.log(`Request body:`, req.body);
        
        if (!title || !content) {
            return res.status(400).json({ success: false, message: "Title and content are required for sub-notes" });
        }
        
        const note = await Notes.findById(noteId)
        if (!note) {
            console.log(`Note not found with ID: ${noteId}`);
            return res.status(404).json({ success: false, message: "Note not found" });
        }
        
        if (note.user.toString() !== userId) {
            console.log(`Unauthorized access: User ${userId} trying to access note owned by ${note.user}`);
            return res.status(401).json({ success: false, message: "Unauthorized access" });
        }
        
        // Add the sub-note to the note
        note.subNotes.push({ title, content })
        await note.save()
        
        console.log(`Sub-note added successfully to note ID: ${noteId}`);
        res.status(201).json(note)
    } catch (error) {
        console.error('Error in addSubNote controller:', error);
        res.status(500).json({ success: false, message: "Server error while adding sub-note", error: error.message });
    }
}

module.exports.updateSubNote = async (req, res) => {
    const { noteId, subNoteId } = req.params
    const userId = req.user.id
    const { title, content, completed } = req.body
    
    const note = await Notes.findById(noteId)
    if (!note) {
        throw new ExpressError("Note not found", 404)
    }
    if (note.user.toString() !== userId) {
        throw new ExpressError("Unauthorized access", 401)
    }
    
    // Find the sub-note
    const subNote = note.subNotes.id(subNoteId)
    if (!subNote) {
        throw new ExpressError("Sub-note not found", 404)
    }
    
    // Update the sub-note
    if (title) subNote.title = title
    if (content) subNote.content = content
    if (completed !== undefined) subNote.completed = completed
    
    await note.save()
    
    res.status(200).json(note)
}

module.exports.deleteSubNote = async (req, res) => {
    const { noteId, subNoteId } = req.params
    const userId = req.user.id
    
    const note = await Notes.findById(noteId)
    if (!note) {
        throw new ExpressError("Note not found", 404)
    }
    if (note.user.toString() !== userId) {
        throw new ExpressError("Unauthorized access", 401)
    }
    
    // Remove the sub-note
    note.subNotes.pull(subNoteId)
    await note.save()
    
    res.status(200).json({ message: "Sub-note deleted successfully", note })
}
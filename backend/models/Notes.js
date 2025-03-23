const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the subNote schema
const subNoteSchema = new Schema({
    title: {
        type: String,
        required: true,
        min: 3,
    },
    content: {
        type: String,
        required: true,
        min: 3,
    },
    completed: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Main notes schema
const notesSchema = new Schema({
    title: {
        type: String,
        required: true,
        min: 3,
    },
    description: {
        type: String,
        required: true,
        min: 3,
    },
    tag: {
        type: String,
        default: "General",
        min: 3,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    subNotes: [subNoteSchema] // Array of sub-notes

}, { timestamps: true })

module.exports = mongoose.model('Notes', notesSchema)
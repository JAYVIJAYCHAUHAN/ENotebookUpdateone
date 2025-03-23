import { createContext, useState } from "react"

export const NoteContext = createContext()

export function NoteProvider(props) {

    const HOST = process.env.REACT_APP_API_URL || "https://enotebookupdateone-production.up.railway.app"

    const initialNotes = []

    const [notes, setNotes] = useState(initialNotes)

    const getNotes = async () => {
        try {
            const response = await fetch(`${HOST}/notes/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token' : localStorage.getItem('token')
                },
            })
            const json = await response.json()
            // Ensure we always set an array to notes
            setNotes(Array.isArray(json) ? json : [])
        } catch (error) {
            console.error("Error fetching notes:", error)
            setNotes([])
        }
    }

    const add = async (newNotes) => {
        try {
            const response = await fetch(`${HOST}/notes/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token' : localStorage.getItem('token')
                },
                body: JSON.stringify(newNotes),
            })
            const json = await response.json()
            // Make sure notes is treated as an array before spreading
            const currentNotes = Array.isArray(notes) ? notes : []
            setNotes([...currentNotes, newNotes])
            console.log(json)
        } catch (error) {
            console.error("Error adding note:", error)
        }
    }

    const remove = async (removeId) => {
        try {
            const response = await fetch(`${HOST}/notes/${removeId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token' : localStorage.getItem('token')
                },
            })
            const json = await response.json()
            // Make sure notes is treated as an array before filtering
            const currentNotes = Array.isArray(notes) ? notes : []
            setNotes(currentNotes.filter(note => (
                note._id !== removeId
            )))
            console.log(json)
        } catch (error) {
            console.error("Error removing note:", error)
        }
    }

    const edit = async (title, description, tag, id) => {
        try {
            const response = await fetch(`${HOST}/notes/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token' : localStorage.getItem('token')
                },
                body: JSON.stringify({ title, description, tag })
            })
            const json = await response.json()
            // Make sure notes is treated as an array before mapping
            const currentNotes = Array.isArray(notes) ? notes : []
            setNotes(currentNotes.map(note => (
                note._id === id ? { ...note, title, description, tag } : note
            )))
            console.log(json)
        } catch (error) {
            console.error("Error editing note:", error)
        }
    } 

    return (
        <NoteContext.Provider value={{ notes, add, remove, edit, getNotes}}>
            {props.children}
        </NoteContext.Provider>
    )

}
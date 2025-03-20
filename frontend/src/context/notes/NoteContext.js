import { createContext, useState } from "react"

export const NoteContext = createContext()

export function NoteProvider(props) {

    const HOST = process.env.REACT_APP_API_URL || "https://enotebookupdateone-production.up.railway.app"

    const initialNotes = []

    const [notes, setNotes] = useState(initialNotes)

    const getNotes = async () => {
        const response = await fetch(`${HOST}/notes/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'auth-token' : localStorage.getItem('token')
            },
        })
        const json = await response.json()
        setNotes(json)
    }

    const add = async (newNotes) => {
        const response = await fetch(`${HOST}/notes/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'auth-token' : localStorage.getItem('token')
            },
            body: JSON.stringify(newNotes),
        })
        const json = await response.json()
        setNotes([...notes, newNotes])
        console.log(json)
    }

    const remove = async (removeId) => {
        const response = await fetch(`${HOST}/notes/${removeId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'auth-token' : localStorage.getItem('token')
            },
        })
        const json = await response.json()
        setNotes(notes.filter(note => (
            note._id !== removeId
        )))
        console.log(json)
    }

    const edit = async (title, description, tag, id) => {
        const response = await fetch(`${HOST}/notes/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'auth-token' : localStorage.getItem('token')
            },
            body: JSON.stringify({ title, description, tag })
        })
        const json = await response.json()
        setNotes(notes.map(note => (
            note._id === id ? { ...note, title, description, tag } : note
        )))
        console.log(json)
    } 

    return (
        <NoteContext.Provider value={{ notes, add, remove, edit, getNotes}}>
            {props.children}
        </NoteContext.Provider>
    )

}
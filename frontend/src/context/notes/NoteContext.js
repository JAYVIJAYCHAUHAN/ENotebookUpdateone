import { createContext, useState, useEffect } from "react"

export const NoteContext = createContext()

// Utility function to check backend health and configuration
async function checkBackendHealth(baseUrl) {
  const results = {
    serverAvailable: false,
    authWorking: false,
    notesEndpointWorking: false,
    apiVersion: "unknown",
    serverTime: null,
    errors: []
  };
  
  try {
    // Check if server is reachable
    const rootResponse = await fetch(baseUrl.replace(/\/api$/, ''));
    results.serverAvailable = rootResponse.ok;
    
    if (rootResponse.ok) {
      const data = await rootResponse.json();
      console.log("Server root response:", data);
      if (data.serverTime) {
        results.serverTime = new Date(data.serverTime);
      }
      if (data.version) {
        results.apiVersion = data.version;
      }
    }
  } catch (error) {
    results.errors.push(`Root endpoint error: ${error.message}`);
  }
  
  // Check if notes endpoint is working
  if (localStorage.getItem('token')) {
    try {
      const notesResponse = await fetch(`${baseUrl}/notes`, {
        headers: {
          'Content-Type': 'application/json',
          'auth-token': localStorage.getItem('token'),
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      results.notesEndpointWorking = notesResponse.ok;
      results.authWorking = notesResponse.status !== 401;
      
      if (notesResponse.ok) {
        const notes = await notesResponse.json();
        results.notesCount = Array.isArray(notes) ? notes.length : 0;
      } else {
        results.errors.push(`Notes endpoint error: ${notesResponse.status} ${notesResponse.statusText}`);
      }
    } catch (error) {
      results.errors.push(`Notes endpoint error: ${error.message}`);
    }
  }
  
  return results;
}

// Add a helper function at the top of the file to generate headers consistently
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'auth-token': token,
        'Authorization': `Bearer ${token}`
    };
};

export function NoteProvider(props) {

    // The HOST might already include '/api' in the URL
    const HOST = process.env.REACT_APP_API_URL || "https://enotebookupdateone-production.up.railway.app"
    
    // Check if HOST already ends with /api and create base URL accordingly
    const BASE_URL = HOST.endsWith('/api') ? HOST : `${HOST}/api`;

    const [notes, setNotes] = useState([])
    const [activeNote, setActiveNote] = useState(null)
    const [apiAvailable, setApiAvailable] = useState(false)
    const [syncing, setSyncing] = useState(false)
    
    // Debug information for API configuration
    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            console.log("API Configuration:");
            console.log("HOST:", HOST);
            console.log("BASE_URL:", BASE_URL);
            console.log("Environment:", process.env.NODE_ENV);
            console.log("REACT_APP_API_URL:", process.env.REACT_APP_API_URL);
            
            // Check backend health
            checkBackendHealth(BASE_URL)
              .then(health => {
                console.log("Backend Health Check Results:", health);
                if (health.errors.length > 0) {
                  console.warn("Backend Health Check Errors:", health.errors);
                }
                setApiAvailable(health.serverAvailable && health.notesEndpointWorking);
              })
              .catch(error => {
                console.error("Backend Health Check Failed:", error);
                setApiAvailable(false);
              });
        }
    }, [HOST, BASE_URL]);
    
    // Periodic health check to detect when API becomes available
    useEffect(() => {
        const checkInterval = setInterval(() => {
            checkBackendHealth(BASE_URL)
                .then(health => {
                    const newStatus = health.serverAvailable && health.notesEndpointWorking;
                    
                    // If API was down but is now available, trigger sync
                    if (!apiAvailable && newStatus) {
                        console.log("API is now available! Attempting to sync temporary notes...");
                        syncTemporarySubNotes();
                    }
                    
                    setApiAvailable(newStatus);
                })
                .catch(() => setApiAvailable(false));
        }, 60000); // Check every minute
        
        return () => clearInterval(checkInterval);
    }, [apiAvailable, notes]);
    
    // Function to synchronize temporary sub-notes with the server
    const syncTemporarySubNotes = async () => {
        if (syncing) return; // Prevent multiple syncs running simultaneously
        
        try {
            setSyncing(true);
            console.log("Starting synchronization of temporary sub-notes...");
            
            // Get all notes with temporary sub-notes
            const notesWithTemporary = notes.filter(note => 
                Array.isArray(note.subNotes) && 
                note.subNotes.some(subNote => subNote.isTemporary)
            );
            
            if (notesWithTemporary.length === 0) {
                console.log("No temporary sub-notes to synchronize.");
                setSyncing(false);
                return;
            }
            
            console.log(`Found ${notesWithTemporary.length} notes with temporary sub-notes.`);
            
            // For each note with temporary sub-notes
            for (const note of notesWithTemporary) {
                const tempSubNotes = note.subNotes.filter(subNote => subNote.isTemporary);
                console.log(`Note ${note._id} has ${tempSubNotes.length} temporary sub-notes.`);
                
                // Try to upload each temporary sub-note
                for (const tempSubNote of tempSubNotes) {
                    console.log(`Attempting to upload temporary sub-note: ${tempSubNote._id}`);
                    
                    // Create sub-note data for upload (omitting client-side properties)
                    const { _id, isTemporary, ...subNoteData } = tempSubNote;
                    
                    // Try to add the sub-note to the server
                    try {
                        const encodedNoteId = encodeURIComponent(note._id);
                        const url = `${BASE_URL}/notes/${encodedNoteId}/subnotes`;
                        
                        const response = await fetch(url, {
                            method: 'POST',
                            headers: getAuthHeaders(),
                            body: JSON.stringify(subNoteData),
                        });
                        
                        if (response.ok) {
                            console.log(`Successfully uploaded temporary sub-note: ${tempSubNote._id}`);
                        } else {
                            console.error(`Failed to upload temporary sub-note: ${tempSubNote._id}`);
                        }
                    } catch (error) {
                        console.error(`Error uploading temporary sub-note: ${tempSubNote._id}`, error);
                    }
                }
            }
            
            // Refresh notes to get the server's version with proper IDs
            await getNotes();
            console.log("Synchronization completed.");
        } catch (error) {
            console.error("Error during synchronization:", error);
        } finally {
            setSyncing(false);
        }
    };

    const getNotes = async () => {
        try {
            setSyncing(true);
            const response = await fetch(`${BASE_URL}/notes/`, {
                method: 'GET',
                headers: getAuthHeaders()
            })
            const json = await response.json()
            console.log(json)
            // Ensure we always set an array to notes
            setNotes(Array.isArray(json) ? json : [])
        } catch (error) {
            console.error("Error fetching notes:", error)
            setNotes([])
        }
    }

    const add = async (newNotes) => {
        try {
            // Debug token format
            const token = localStorage.getItem('token');
            console.log('Token Debug Info:');
            console.log('- Token exists:', !!token);
            console.log('- Token length:', token ? token.length : 0);
            console.log('- Token format:', token ? (token.split('.').length === 3 ? 'Valid JWT (3 parts)' : `Invalid JWT (${token.split('.').length} parts)`) : 'No token');
            console.log('- First 10 chars:', token ? token.substring(0, 10) + '...' : 'N/A');
            
            const response = await fetch(`${BASE_URL}/notes/`, {
                method: 'POST',
                headers: getAuthHeaders(),
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
            const response = await fetch(`${BASE_URL}/notes/${removeId}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
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
            const response = await fetch(`${BASE_URL}/notes/${id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
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

    // Sub-notes functions
    const addSubNote = async (noteId, subNote) => {
        try {
            if (!noteId) {
                console.error("Error adding sub-note: Note ID is undefined");
                return null;
            }

            // Ensure noteId is properly formatted for URL
            const encodedNoteId = encodeURIComponent(noteId.toString().trim());
            
            // Log basic details
            console.log(`----- Sub-note API Request Details -----`);
            console.log(`Method: POST`);
            console.log(`Full Note ID: ${noteId}`);
            console.log(`Encoded Note ID: ${encodedNoteId}`);
            console.log(`Body:`, subNote);
            console.log(`Token:`, localStorage.getItem('token') ? "Present" : "Missing");
            
            // Check API health first
            console.log("Checking API health...");
            let apiFormat = "unknown";
            try {
                const healthResponse = await fetch(`${HOST}/api/health`);
                if (healthResponse.ok) {
                    const healthData = await healthResponse.json();
                    console.log("API Health:", healthData);
                    
                    // Determine API format from health data
                    if (healthData.apiRoutes?.notes?.subNotes) {
                        apiFormat = healthData.apiRoutes.notes.subNotes.includes(":noteId") ? "noteId" : "id";
                        console.log(`Detected API format: using parameter :${apiFormat}`);
                    }
                } else {
                    console.log(`Health endpoint not available: ${healthResponse.status}`);
                }
            } catch (error) {
                console.error("Health check failed:", error);
            }
            
            // Try both URL formats
            const formats = [
                { param: "id", url: `${BASE_URL}/notes/${encodedNoteId}/subnotes` },
                { param: "noteId", url: `${BASE_URL}/notes/${encodedNoteId}/subnotes` }
            ];
            
            // If we detected the format from health check, prioritize that one
            if (apiFormat !== "unknown") {
                formats.sort((a, b) => a.param === apiFormat ? -1 : 1);
            }
            
            let success = false;
            let updatedNote = null;
            
            // Try each format until one works
            for (const format of formats) {
                console.log(`Trying ${format.param} format URL: ${format.url}`);
                
                try {
                    const response = await fetch(format.url, {
                        method: 'POST',
                        headers: getAuthHeaders(),
                        body: JSON.stringify(subNote),
                    });
                    
                    console.log(`Response status (${format.param} format): ${response.status}`);
                    
                    if (response.ok) {
                        updatedNote = await response.json();
                        console.log(`Success with ${format.param} format!`, updatedNote);
                        success = true;
                        break;
                    } else {
                        const errorText = await response.text();
                        console.error(`${format.param} format failed (${response.status}): ${errorText}`);
                    }
                } catch (error) {
                    console.error(`Error with ${format.param} format:`, error);
                }
            }
            
            if (success && updatedNote) {
                // Make sure updatedNote is valid and has expected structure
                if (!updatedNote || typeof updatedNote !== 'object') {
                    console.error("Invalid response format from server:", updatedNote);
                    return null;
                }
                
                // Update the notes array with the new sub-note
                const currentNotes = Array.isArray(notes) ? notes : [];
                const updatedNotes = currentNotes.map(note => (
                    note._id === noteId ? updatedNote : note
                ));
                setNotes(updatedNotes);
                
                // Update the active note if it's the one being edited
                if (activeNote && activeNote._id === noteId) {
                    setActiveNote(updatedNote);
                }
                
                return updatedNote;
            } else {
                // Debugging the server routes
                console.log("⚠️ All API attempts failed. Diagnosing routing issue:");
                console.log(`- Check if backend is running at ${HOST}`);
                console.log(`- Check server logs for more details about the 404 error`);
                console.log(`- Verify the server has been redeployed with latest route changes`);
                
                // TEMPORARY WORKAROUND: Create a client-side sub-note until backend is fixed
                console.log("⚠️ USING TEMPORARY WORKAROUND: Creating a client-side sub-note");
                return createTemporarySubNote(noteId, subNote);
            }
        } catch (error) {
            console.error("Error adding sub-note:", error);
            return null;
        }
    };

    // Helper function to create a temporary client-side sub-note
    const createTemporarySubNote = (noteId, subNote) => {
        // Get the current note
        const currentNotes = Array.isArray(notes) ? notes : [];
        const currentNote = currentNotes.find(note => note._id === noteId);
        
        if (currentNote) {
            // Create a temporary sub-note with a client-generated ID
            const tempId = `temp-${Date.now()}`;
            const tempSubNote = {
                _id: tempId,
                title: subNote.title,
                content: subNote.content,
                completed: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                isTemporary: true // Flag to identify client-side notes
            };
            
            // Add the sub-note to the current note's subNotes array
            const updatedNote = {
                ...currentNote,
                subNotes: Array.isArray(currentNote.subNotes) 
                    ? [...currentNote.subNotes, tempSubNote] 
                    : [tempSubNote]
            };
            
            // Update the notes array with the modified note
            const updatedNotes = currentNotes.map(note => (
                note._id === noteId ? updatedNote : note
            ));
            
            setNotes(updatedNotes);
            
            // Update the active note if it's the one being edited
            if (activeNote && activeNote._id === noteId) {
                setActiveNote(updatedNote);
            }
            
            console.log("Created temporary client-side sub-note:", tempSubNote);
            return updatedNote;
        }
        
        return null;
    };

    const updateSubNote = async (noteId, subNoteId, updates) => {
        try {
            if (!noteId || !subNoteId) {
                console.error("Error updating sub-note: Note ID or Sub-note ID is undefined");
                return null;
            }
            
            // Check if this is a temporary client-side sub-note
            if (subNoteId.toString().startsWith('temp-')) {
                console.log(`Updating temporary client-side sub-note: ${subNoteId}`);
                return updateTemporarySubNote(noteId, subNoteId, updates);
            }
            
            // Ensure IDs are properly formatted for URL
            const encodedNoteId = encodeURIComponent(noteId.toString().trim());
            const encodedSubNoteId = encodeURIComponent(subNoteId.toString().trim());
            
            console.log(`----- Sub-note Update API Request Details -----`);
            console.log(`Method: PUT`);
            console.log(`Full Note ID: ${noteId}`);
            console.log(`Full Sub-note ID: ${subNoteId}`);
            console.log(`Body:`, updates);
            
            // Try both URL formats (with :id and :noteId parameter names)
            const formats = [
                { 
                    param: "id", 
                    url: `${BASE_URL}/notes/${encodedNoteId}/subnotes/${encodedSubNoteId}` 
                },
                { 
                    param: "noteId", 
                    url: `${BASE_URL}/notes/${encodedNoteId}/subnotes/${encodedSubNoteId}` 
                }
            ];
            
            let success = false;
            let updatedNote = null;
            
            // Try each format until one works
            for (const format of formats) {
                console.log(`Trying ${format.param} format URL: ${format.url}`);
                
                try {
                    const response = await fetch(`${BASE_URL}/notes/${encodedNoteId}/subnotes/${encodedSubNoteId}`, {
                        method: 'PUT',
                        headers: getAuthHeaders(),
                        body: JSON.stringify(updates),
                    });
                    
                    console.log(`Response status (${format.param} format): ${response.status}`);
                    
                    if (response.ok) {
                        updatedNote = await response.json();
                        console.log(`Success with ${format.param} format!`, updatedNote);
                        success = true;
                        break;
                    } else {
                        const errorText = await response.text();
                        console.error(`${format.param} format failed (${response.status}): ${errorText}`);
                    }
                } catch (error) {
                    console.error(`Error with ${format.param} format:`, error);
                }
            }
            
            if (success && updatedNote) {
                // Update the notes array with the updated sub-note
                const currentNotes = Array.isArray(notes) ? notes : [];
                setNotes(currentNotes.map(note => (
                    note._id === noteId ? updatedNote : note
                )));
                
                // Update the active note if it's the one being edited
                if (activeNote && activeNote._id === noteId) {
                    setActiveNote(updatedNote);
                }
                
                return updatedNote;
            } else {
                console.log("⚠️ All API attempts failed. Unable to update sub-note on server.");
                return null;
            }
        } catch (error) {
            console.error("Error updating sub-note:", error);
            return null;
        }
    };

    // Helper function to update a temporary client-side sub-note
    const updateTemporarySubNote = (noteId, subNoteId, updates) => {
        // Get the current note
        const currentNotes = Array.isArray(notes) ? notes : [];
        const currentNote = currentNotes.find(note => note._id === noteId);
        
        if (currentNote && Array.isArray(currentNote.subNotes)) {
            // Find the sub-note to update
            const updatedSubNotes = currentNote.subNotes.map(subNote => {
                if (subNote._id === subNoteId) {
                    return { ...subNote, ...updates, updatedAt: new Date().toISOString() };
                }
                return subNote;
            });
            
            // Create updated note
            const updatedNote = {
                ...currentNote,
                subNotes: updatedSubNotes
            };
            
            // Update the notes array
            const updatedNotes = currentNotes.map(note => (
                note._id === noteId ? updatedNote : note
            ));
            
            setNotes(updatedNotes);
            
            // Update the active note if it's the one being edited
            if (activeNote && activeNote._id === noteId) {
                setActiveNote(updatedNote);
            }
            
            console.log("Updated temporary client-side sub-note:", subNoteId);
            return updatedNote;
        }
        
        return null;
    };

    const deleteSubNote = async (noteId, subNoteId) => {
        try {
            if (!noteId || !subNoteId) {
                console.error("Error deleting sub-note: Note ID or Sub-note ID is undefined");
                return null;
            }
            
            // Check if this is a temporary client-side sub-note
            if (subNoteId.toString().startsWith('temp-')) {
                console.log(`Deleting temporary client-side sub-note: ${subNoteId}`);
                return deleteTemporarySubNote(noteId, subNoteId);
            }
            
            // Ensure IDs are properly formatted for URL
            const encodedNoteId = encodeURIComponent(noteId.toString().trim());
            const encodedSubNoteId = encodeURIComponent(subNoteId.toString().trim());
            
            console.log(`----- Sub-note Delete API Request Details -----`);
            console.log(`Method: DELETE`);
            console.log(`Full Note ID: ${noteId}`);
            console.log(`Full Sub-note ID: ${subNoteId}`);
            
            // Try both URL formats (with :id and :noteId parameter names)
            const formats = [
                { 
                    param: "id", 
                    url: `${BASE_URL}/notes/${encodedNoteId}/subnotes/${encodedSubNoteId}` 
                },
                { 
                    param: "noteId", 
                    url: `${BASE_URL}/notes/${encodedNoteId}/subnotes/${encodedSubNoteId}` 
                }
            ];
            
            let success = false;
            let result = null;
            
            // Try each format until one works
            for (const format of formats) {
                console.log(`Trying ${format.param} format URL: ${format.url}`);
                
                try {
                    const response = await fetch(format.url, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                            'auth-token': localStorage.getItem('token')
                        }
                    });
                    
                    console.log(`Response status (${format.param} format): ${response.status}`);
                    
                    if (response.ok) {
                        result = await response.json();
                        console.log(`Success with ${format.param} format!`, result);
                        success = true;
                        break;
                    } else {
                        const errorText = await response.text();
                        console.error(`${format.param} format failed (${response.status}): ${errorText}`);
                    }
                } catch (error) {
                    console.error(`Error with ${format.param} format:`, error);
                }
            }
            
            if (success && result) {
                // Update the notes array after deleting the sub-note
                const currentNotes = Array.isArray(notes) ? notes : [];
                setNotes(currentNotes.map(note => (
                    note._id === noteId ? result.note : note
                )));
                
                // Update the active note if it's the one being edited
                if (activeNote && activeNote._id === noteId) {
                    setActiveNote(result.note);
                }
                
                return result;
            } else {
                console.log("⚠️ All API attempts failed. Unable to delete sub-note on server.");
                return null;
            }
        } catch (error) {
            console.error("Error deleting sub-note:", error);
            return null;
        }
    };

    // Helper function to delete a temporary client-side sub-note
    const deleteTemporarySubNote = (noteId, subNoteId) => {
        // Get the current note
        const currentNotes = Array.isArray(notes) ? notes : [];
        const currentNote = currentNotes.find(note => note._id === noteId);
        
        if (currentNote && Array.isArray(currentNote.subNotes)) {
            // Filter out the sub-note to delete
            const updatedSubNotes = currentNote.subNotes.filter(subNote => 
                subNote._id !== subNoteId
            );
            
            // Create updated note
            const updatedNote = {
                ...currentNote,
                subNotes: updatedSubNotes
            };
            
            // Update the notes array
            const updatedNotes = currentNotes.map(note => (
                note._id === noteId ? updatedNote : note
            ));
            
            setNotes(updatedNotes);
            
            // Update the active note if it's the one being edited
            if (activeNote && activeNote._id === noteId) {
                setActiveNote(updatedNote);
            }
            
            console.log("Deleted temporary client-side sub-note:", subNoteId);
            return { success: true, note: updatedNote };
        }
        
        return null;
    };

    return (
        <NoteContext.Provider value={{ 
            notes, 
            activeNote,
            setActiveNote,
            add, 
            remove, 
            edit, 
            getNotes,
            addSubNote,
            updateSubNote,
            deleteSubNote,
            syncTemporarySubNotes,
            apiAvailable,
            syncing
        }}>
            {props.children}
        </NoteContext.Provider>
    )
}
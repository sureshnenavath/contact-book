import React, { useState, useEffect } from 'react';
import Form from './components/Form';
import ContactList from './components/ContactList';
import Pagination from './components/Pagination';
import DarkModeToggle from './components/DarkModeToggle';
import './App.css';

const API_BASE_URL = 'http://localhost:5000';

function App() {
  const [contacts, setContacts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalContacts, setTotalContacts] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  const CONTACTS_PER_PAGE = 10;

  // Fetch contacts
  const fetchContacts = async (page = 1) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(
        `${API_BASE_URL}/contacts?page=${page}&limit=${CONTACTS_PER_PAGE}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setContacts(data.contacts);
      setTotalPages(data.totalPages);
      setCurrentPage(data.currentPage);
      setTotalContacts(data.total);
    } catch (err) {
      console.error('Error fetching contacts:', err);
      setError('Failed to fetch contacts. Please check if the server is running.');
    } finally {
      setLoading(false);
    }
  };

  // Add contact
  const addContact = async (contactData) => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch(`${API_BASE_URL}/contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (data.details) {
          throw new Error(JSON.stringify(data.details));
        }
        throw new Error(data.error || 'Failed to add contact');
      }
      
      setSuccess('Contact added successfully!');
      // Refresh contacts and go to first page if we added a new contact
      await fetchContacts(1);
      setCurrentPage(1);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
      
      return true;
    } catch (err) {
      console.error('Error adding contact:', err);
      try {
        const validationErrors = JSON.parse(err.message);
        throw validationErrors;
      } catch {
        setError(err.message);
        return false;
      }
    } finally {
      setLoading(false);
    }
  };

  // Delete contact
  const deleteContact = async (id) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) {
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch(`${API_BASE_URL}/contacts/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete contact');
      }
      
      setSuccess('Contact deleted successfully!');
      
      // If we deleted the last contact on current page and we're not on page 1
      if (contacts.length === 1 && currentPage > 1) {
        await fetchContacts(currentPage - 1);
      } else {
        await fetchContacts(currentPage);
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error deleting contact:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle page change
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      fetchContacts(page);
    }
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', JSON.stringify(newMode));
  };

  // Clear messages
  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    document.body.className = darkMode ? 'dark-mode' : 'light-mode';
  }, [darkMode]);

  return (
    <div className={`app ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      <header className="app-header">
        <div className="header-content">
          <h1>Contact Book</h1>
          <DarkModeToggle darkMode={darkMode} onToggle={toggleDarkMode} />
        </div>
      </header>

      <main className="app-main">
        <div className="container">
          {(error || success) && (
            <div className="message-container">
              {error && (
                <div className="message error">
                  <span>{error}</span>
                  <button 
                    className="message-close" 
                    onClick={clearMessages}
                    aria-label="Close message"
                  >
                    ×
                  </button>
                </div>
              )}
              {success && (
                <div className="message success">
                  <span>{success}</span>
                  <button 
                    className="message-close" 
                    onClick={clearMessages}
                    aria-label="Close message"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          )}

          <section className="form-section">
            <Form onSubmit={addContact} loading={loading} />
          </section>

          <section className="contacts-section">
            <div className="section-header">
              <h2>Contacts ({totalContacts})</h2>
            </div>
            
            {loading && (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading...</p>
              </div>
            )}

            {!loading && contacts.length === 0 && (
              <div className="empty-state">
                <h3>No contacts yet</h3>
                <p>Add your first contact using the form above.</p>
              </div>
            )}

            {!loading && contacts.length > 0 && (
              <>
                <ContactList 
                  contacts={contacts} 
                  onDelete={deleteContact}
                  loading={loading}
                />
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    loading={loading}
                  />
                )}
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;
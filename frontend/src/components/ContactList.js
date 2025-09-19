import React from 'react';

const ContactList = ({ contacts, onDelete, loading }) => {
  if (!contacts || contacts.length === 0) {
    return null;
  }

  return (
    <div className="contact-list">
      <div className="table-container">
        <table className="contacts-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact) => (
              <tr key={contact.id}>
                <td data-label="Name">{contact.name}</td>
                <td data-label="Email">{contact.email}</td>
                <td data-label="Phone">{contact.phone}</td>
                <td data-label="Actions">
                  <button
                    className="delete-button"
                    onClick={() => onDelete(contact.id)}
                    disabled={loading}
                    aria-label={`Delete ${contact.name}`}
                  >
                    {loading ? '...' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ContactList;
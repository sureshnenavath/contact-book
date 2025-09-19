import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDb, getContacts, addContact, deleteContact } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors({
  origin: [
    "http://localhost:3000",                       // local React dev server
    "https://contactsmanagerapp.netlify.app"      
  ],
  methods: ["GET", "POST", "DELETE"],
  credentials: true
}));

app.use(express.json());

// ------------------ Validation ------------------
const validateContact = (contact) => {
  const errors = {};
  
  if (!contact.name || contact.name.trim() === '') {
    errors.name = 'Name is required';
  }
  
  if (!contact.email || !contact.email.match(/^\S+@\S+\.\S+$/)) {
    errors.email = 'Valid email is required';
  }
  
  if (!contact.phone || !contact.phone.match(/^\d{10}$/)) {
    errors.phone = 'Phone must be exactly 10 digits';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// ------------------ Routes ------------------
app.get('/', (req, res) => {
  res.json({ message: "Welcome to Contact Book API" });
});

app.get('/contacts', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    if (page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({ error: 'Invalid pagination parameters' });
    }
    
    const result = await getContacts(page, limit);
    res.json(result);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

app.post('/contacts', async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    
    // Validate input
    const validation = validateContact({ name, email, phone });
    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.errors
      });
    }
    
    const contact = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim()
    };
    
    const newContact = await addContact(contact);
    res.status(201).json(newContact);
  } catch (error) {
    console.error('Error adding contact:', error);
    if (error.message.includes('UNIQUE constraint')) {
      res.status(400).json({ error: 'Contact already exists' });
    } else {
      res.status(500).json({ error: 'Failed to add contact' });
    }
  }
});

app.delete('/contacts/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (!id || id < 1) {
      return res.status(400).json({ error: 'Invalid contact ID' });
    }
    
    const result = await deleteContact(id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({ error: 'Failed to delete contact' });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ------------------ Error Handling ------------------
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// ------------------ Start Server ------------------
const startServer = async () => {
  try {
    await initializeDb();
    console.log('Database initialized successfully');
    
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

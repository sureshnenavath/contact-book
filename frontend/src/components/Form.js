import React, { useState } from 'react';

const Form = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Phone must be exactly 10 digits';
    }
    
    return newErrors;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setIsSubmitting(true);
    setErrors({});
    
    try {
      // Clean phone number (remove any non-digits)
      const cleanedData = {
        ...formData,
        phone: formData.phone.replace(/\D/g, '')
      };
      
      const result = await onSubmit(cleanedData);
      
      if (result === true) {
        // Success - clear form
        setFormData({ name: '', email: '', phone: '' });
      }
    } catch (err) {
      // Handle validation errors from server
      if (typeof err === 'object') {
        setErrors(err);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDisabled = loading || isSubmitting;

  return (
    <div className="form-container">
      <h2>Add New Contact</h2>
      <form onSubmit={handleSubmit} className="contact-form">
        <div className="form-group">
          <label htmlFor="name">Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={errors.name ? 'error' : ''}
            disabled={isDisabled}
            placeholder="Enter full name"
            autoComplete="name"
          />
          {errors.name && <span className="error-message">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={errors.email ? 'error' : ''}
            disabled={isDisabled}
            placeholder="Enter email address"
            autoComplete="email"
          />
          {errors.email && <span className="error-message">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="phone">Phone *</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={errors.phone ? 'error' : ''}
            disabled={isDisabled}
            placeholder="Enter 10-digit phone number"
            autoComplete="tel"
          />
          {errors.phone && <span className="error-message">{errors.phone}</span>}
        </div>

        <button 
          type="submit" 
          className="submit-button"
          disabled={isDisabled}
        >
          {isSubmitting ? (
            <span className="button-content">
              <span className="loading-spinner small"></span>
              Adding...
            </span>
          ) : (
            'Add Contact'
          )}
        </button>
      </form>
    </div>
  );
};

export default Form;
import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import styles from './PhoneNumberModal.module.css';

const PhoneNumberModal = ({ isOpen, onClose, onSubmit, mode, googleData }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber)) {
      setError('Please enter a valid phone number');
      return;
    }
    
    onSubmit({
      mode,
      phoneNumber,
      ...(mode === 'code' ? { code: googleData.code } : { credential: googleData.credential })
    });
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3>Complete Your Profile</h3>
          <FaTimes className={styles.closeIcon} onClick={onClose} />
        </div>
        <div className={styles.modalBody}>
          <div className={styles.formGroup}>
            <label>Phone Number</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+201012345678"
              className={error ? styles.error : ''}
            />
            {error && <span className={styles.errorMessage}>{error}</span>}
          </div>
          <button onClick={handleSubmit} className={styles.submitButton}>
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhoneNumberModal;
document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const saveButton = document.getElementById('save-button');
    const payButton = document.getElementById('pay-button');
    const statusMessage = document.getElementById('status-message');
    
    // Form data object
    const formData = {
      payerName: '',
      payerAddress: '',
      payerEmail: '',
      payerPhone: '',
      recipientName: '',
      recipientAddress: '',
      recipientPhone: ''
    };
    
    // Error fields
    const errorFields = {
      payerName: document.getElementById('payer-name-error'),
      payerAddress: document.getElementById('payer-address-error'),
      payerEmail: document.getElementById('payer-email-error'),
      payerPhone: document.getElementById('payer-phone-error'),
      recipientName: document.getElementById('recipient-name-error'),
      recipientAddress: document.getElementById('recipient-address-error'),
      recipientPhone: document.getElementById('recipient-phone-error')
    };
    
    // Input fields
    const inputFields = {
      payerName: document.getElementById('payer-name'),
      payerAddress: document.getElementById('payer-address'),
      payerEmail: document.getElementById('payer-email'),
      payerPhone: document.getElementById('payer-phone'),
      recipientName: document.getElementById('recipient-name'),
      recipientAddress: document.getElementById('recipient-address'),
      recipientPhone: document.getElementById('recipient-phone')
    };
    
    // Initialize Firebase with a working configuration
    // IMPORTANT: Replace these values with your actual Firebase project credentials
    const firebaseConfig = {
        apiKey: "AIzaSyAnsttUGEs_o7vDHOOVBOL3Fh-4_KlmGSM",
        authDomain: "paymentgateway-d6566.firebaseapp.com",
        databaseURL: "https://paymentgateway-d6566-default-rtdb.firebaseio.com",
        projectId: "paymentgateway-d6566",
        storageBucket: "paymentgateway-d6566.firebasestorage.app",
        messagingSenderId: "100193414423",
        appId: "1:100193414423:web:1ae131c75b9a223fa01b52"
    };
    
    // Initialize Firebase
    let database;
    try {
      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }
      database = firebase.database();
      console.log("Firebase initialized successfully");
    } catch (error) {
      console.error("Firebase initialization error:", error);
      showStatus('Firebase connection failed. Please try again later.', 'error');
    }
    
    // Add event listeners to input fields
    Object.keys(inputFields).forEach(field => {
      const input = inputFields[field];
      if (input) {
        input.addEventListener('input', function() {
          formData[field] = input.value;
          clearError(field);
        });
      } else {
        console.error(`Input field not found: ${field}`);
      }
    });
    
    // Save button event listener
    if (saveButton) {
      saveButton.addEventListener('click', function() {
        if (validateForm()) {
          if (database) {
            saveToFirebase(formData)
              .then(() => {
                showStatus('Your information has been saved. Ready for payment!', 'success');
              })
              .catch(error => {
                console.error('Error saving to Firebase:', error);
                showStatus('Failed to save information. Please try again.', 'error');
              });
          } else {
            showStatus('Unable to connect to database. Please try again later.', 'error');
          }
        }
      });
    } else {
      console.error('Save button not found');
    }
    
    // Pay button event listener
    if (payButton) {
      payButton.addEventListener('click', function() {
        if (validateForm()) {
          initiatePayment();
        }
      });
    } else {
      console.error('Pay button not found');
    }
    
    // Validate form function
    function validateForm() {
      let isValid = true;
      
      // Clear all previous errors
      clearAllErrors();
      
      // Validate payer name
      if (!formData.payerName.trim()) {
        showError('payerName', 'Full name is required');
        isValid = false;
      }
      
      // Validate payer address
      if (!formData.payerAddress.trim()) {
        showError('payerAddress', 'Address is required');
        isValid = false;
      }
      
      // Validate payer email
      if (!formData.payerEmail.trim()) {
        showError('payerEmail', 'Email is required');
        isValid = false;
      } else if (!/^\S+@\S+\.\S+$/.test(formData.payerEmail)) {
        showError('payerEmail', 'Invalid email format');
        isValid = false;
      }
      
      // Validate payer phone
      if (!formData.payerPhone.trim()) {
        showError('payerPhone', 'Phone is required');
        isValid = false;
      } else if (!/^\d{10}$/.test(formData.payerPhone.replace(/\D/g, ''))) {
        showError('payerPhone', 'Phone must be 10 digits');
        isValid = false;
      }
      
      // Validate recipient name
      if (!formData.recipientName.trim()) {
        showError('recipientName', 'Recipient name is required');
        isValid = false;
      }
      
      // Validate recipient address
      if (!formData.recipientAddress.trim()) {
        showError('recipientAddress', 'Recipient address is required');
        isValid = false;
      }
      
      // Validate recipient phone
      if (!formData.recipientPhone.trim()) {
        showError('recipientPhone', 'Recipient phone is required');
        isValid = false;
      } else if (!/^\d{10}$/.test(formData.recipientPhone.replace(/\D/g, ''))) {
        showError('recipientPhone', 'Phone must be 10 digits');
        isValid = false;
      }
      
      if (!isValid) {
        showStatus('Please fix the errors in the form.', 'error');
      }
      
      return isValid;
    }
    
    // Helper functions
    function showError(field, message) {
      if (errorFields[field]) {
        errorFields[field].textContent = message;
      } else {
        console.error(`Error field not found: ${field}`);
      }
    }
    
    function clearError(field) {
      if (errorFields[field]) {
        errorFields[field].textContent = '';
      }
    }
    
    function clearAllErrors() {
      Object.keys(errorFields).forEach(field => {
        if (errorFields[field]) {
          errorFields[field].textContent = '';
        }
      });
    }
    
    function showStatus(message, type) {
      if (statusMessage) {
        statusMessage.textContent = message;
        statusMessage.className = `status-message status-${type}`;
        statusMessage.classList.remove('hidden');
      } else {
        console.error('Status message element not found');
      }
    }
    
    function hideStatus() {
      if (statusMessage) {
        statusMessage.classList.add('hidden');
      }
    }
    
    // Save data to Firebase
    function saveToFirebase(data) {
      console.log('Attempting to save to Firebase:', data);
      return new Promise((resolve, reject) => {
        if (!database) {
          reject(new Error('Firebase database not initialized'));
          return;
        }
        
        try {
          const ordersRef = database.ref('orders');
          const newOrderRef = ordersRef.push();
          newOrderRef.set({
            ...data,
            timestamp: new Date().toISOString(),
            status: 'saved'
          }).then(() => {
            console.log('Data saved successfully to Firebase');
            resolve();
          }).catch(error => {
            console.error('Firebase set error:', error);
            reject(error);
          });
        } catch (error) {
          console.error('Firebase save error:', error);
          reject(error);
        }
      });
    }
    
    // Razorpay integration
    function initiatePayment() {
      showStatus('Initiating payment with Razorpay...', 'info');
      
      // In a real application, you would make an API call to your server here
      // to create a Razorpay order and get an order ID
      
      const options = {
        key: "rzp_test_DnoUM7sqNW0Cxo", // Replace with your Razorpay key
        amount: 10000, // Amount in paisa (100 INR)
        currency: "INR",
        name: "Forever Day",
        description: "Forever Day Blossom Gift",
        image: "https://lovable.dev/opengraph-image-p98pqg.png",
        prefill: {
          name: formData.payerName,
          email: formData.payerEmail,
          contact: formData.payerPhone
        },
        notes: {
          recipientName: formData.recipientName,
          recipientAddress: formData.recipientAddress,
          recipientPhone: formData.recipientPhone
        },
        theme: {
          color: "#9370DB"
        },
        handler: function(response) {
          // Payment successful
          const paymentId = response.razorpay_payment_id;
          if (database) {
            savePaymentToFirebase(paymentId)
              .then(() => {
                showStatus('Payment successful! Your Forever Day gift will be delivered soon.', 'success');
              })
              .catch(error => {
                console.error('Error saving payment to Firebase:', error);
                showStatus('Payment was successful, but we could not save the record. Our team will contact you.', 'info');
              });
          } else {
            showStatus('Payment successful! Your Forever Day gift will be delivered soon.', 'success');
          }
        },
        modal: {
          ondismiss: function() {
            showStatus('Payment cancelled. You can try again when ready.', 'info');
          }
        }
      };
      
      try {
        const rzp = new Razorpay(options);
        rzp.open();
      } catch (error) {
        console.error('Error initializing Razorpay:', error);
        showStatus('Unable to initialize payment. Please try again later.', 'error');
      }
    }
    
    // Save payment data to Firebase
    function savePaymentToFirebase(paymentId) {
      console.log('Attempting to save payment to Firebase:', paymentId);
      return new Promise((resolve, reject) => {
        if (!database) {
          reject(new Error('Firebase database not initialized'));
          return;
        }
        
        try {
          const paymentsRef = database.ref('payments');
          const newPaymentRef = paymentsRef.push();
          newPaymentRef.set({
            paymentId: paymentId,
            amount: 100, // Amount in INR
            currency: 'INR',
            payerName: formData.payerName,
            payerEmail: formData.payerEmail,
            payerPhone: formData.payerPhone,
            payerAddress: formData.payerAddress,
            recipientName: formData.recipientName,
            recipientAddress: formData.recipientAddress,
            recipientPhone: formData.recipientPhone,
            timestamp: new Date().toISOString(),
            status: 'paid'
          }).then(() => {
            console.log('Payment data saved successfully to Firebase');
            resolve();
          }).catch(error => {
            console.error('Firebase payment save error:', error);
            reject(error);
          });
        } catch (error) {
          console.error('Firebase payment save error:', error);
          reject(error);
        }
      });
    }
  });
  
const express = require('express');
const router = express.Router();
const contactController = require('../controller/Contact-Controller.js');


router.post('/create-contact', contactController.createContactForm);
router.get('/get-all-contacts', contactController.getAllContacts);
router.delete('/single-delete-contact/:id', contactController.deleteSingleContact);



module.exports = router;

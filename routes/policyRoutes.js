const express = require('express');
const router = express.Router();
const multer = require('multer');
const policyController = require('../controllers/policyController');

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // The directory where files will be stored temporarily
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Use the original file name
  }
});
const upload = multer({ storage: storage });

// route:   POST /api/policy/upload
router.post('/upload', upload.single('csvFile'), policyController.uploadPolicies);

// route:   GET /api/policy/search/:username
router.get('/search/:username', policyController.searchPoliciesByUsername);

// route:   GET /api/policy/aggregate/by-user
router.get('/aggregate/by-user', policyController.getAggregatedPolicies);

module.exports = router;
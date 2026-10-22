const mongoose = require('mongoose');
const User = require('../models/User');
const { uploadToCloudinary } = require('../config/cloudinary');
const {
  findUserById: findLiveUserById,
  updateUser: updateLiveUser,
} = require('../utils/liveStore');
const {
  findMockUserById,
  updateMockUser,
} = require('../utils/mockStore');

/**
 * @desc    Submit KYC documents for identity verification
 * @route   POST /api/verification/submit
 * @access  Private
 */
const submitVerification = async (req, res, next) => {
  try {
    const userId = req.user.userId || req.user.id;

    if (!req.files || (!req.files.drivingLicense && !req.files.idProof)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both your driving license and ID proof documents',
      });
    }

    const dlFile = req.files.drivingLicense ? req.files.drivingLicense[0] : null;
    const idFile = req.files.idProof ? req.files.idProof[0] : null;

    if (!dlFile || !idFile) {
      return res.status(400).json({
        success: false,
        message: 'Both driving license and government ID proof are required for verification',
      });
    }

    // Upload files via Cloudinary buffer stream (or DataURI fallback)
    const [drivingLicenseUrl, idProofUrl] = await Promise.all([
      uploadToCloudinary(dlFile.buffer, dlFile.originalname, 'smartfleet/licenses'),
      uploadToCloudinary(idFile.buffer, idFile.originalname, 'smartfleet/id_proofs'),
    ]);

    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected && !userId.startsWith('demo-')) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      user.drivingLicense = drivingLicenseUrl;
      user.idProof = idProofUrl;
      user.verificationStatus = 'pending';
      await user.save();

      return res.status(200).json({
        success: true,
        message: 'KYC documents submitted successfully. Status is now pending review.',
        data: {
          verificationStatus: user.verificationStatus,
          drivingLicense: user.drivingLicense,
          idProof: user.idProof,
        },
      });
    }

    // Offline / Demo fallback
    updateLiveUser(userId, {
      drivingLicense: drivingLicenseUrl,
      idProof: idProofUrl,
      verificationStatus: 'pending',
    });

    updateMockUser(userId, {
      drivingLicense: drivingLicenseUrl,
      idProof: idProofUrl,
      verificationStatus: 'pending',
    });

    return res.status(200).json({
      success: true,
      message: 'KYC documents submitted successfully. Status is now pending review.',
      data: {
        verificationStatus: 'pending',
        drivingLicense: drivingLicenseUrl,
        idProof: idProofUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current user's KYC verification status
 * @route   GET /api/verification/status
 * @access  Private
 */
const getVerificationStatus = async (req, res, next) => {
  try {
    const userId = req.user.userId || req.user.id;
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected && !userId.startsWith('demo-')) {
      const user = await User.findById(userId).select('verificationStatus drivingLicense idProof');
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      return res.status(200).json({
        success: true,
        data: {
          verificationStatus: user.verificationStatus || 'unverified',
          drivingLicense: user.drivingLicense || '',
          idProof: user.idProof || '',
        },
      });
    }

    // Offline / demo fallback
    const liveUser = findLiveUserById(userId) || findMockUserById(userId);

    return res.status(200).json({
      success: true,
      data: {
        verificationStatus: (liveUser && liveUser.verificationStatus) || 'approved',
        drivingLicense: (liveUser && liveUser.drivingLicense) || '',
        idProof: (liveUser && liveUser.idProof) || '',
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitVerification,
  getVerificationStatus,
};

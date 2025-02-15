const Joi = require('joi');

const issueValidation = (req, res, next) => {
    const schema = Joi.object({
        issueTitle: Joi.string().min(3).max(200).required(),
        description: Joi.string().min(10).required(),
        city: Joi.string().required(),
        state: Joi.string().required(),
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        userId: Joi.string().required(),
        // lat: Joi.number().required(),
        // lng: Joi.number().required(),

        // media: Joi.array().items(Joi.any()),
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: 'Bad Request', error: error.details[0].message });
    }

    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'At least one photo/video is required.' });
    }

    const allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'video/mp4',
        'video/webm',
        'video/ogg',
    ];
    const maxFileSize = 10 * 1024 * 1024; // 10MB

    for (const file of req.files) {
        if (!allowedMimeTypes.includes(file.mimetype)) {
            return res.status(400).json({ message: `Invalid file type: ${file.mimetype}.` });
        }
        if (file.size > maxFileSize) {
            return res.status(400).json({ message: `File size too large: ${file.originalname}. Max size is 10MB.` });
        }
    }

    next();
};

module.exports = issueValidation;

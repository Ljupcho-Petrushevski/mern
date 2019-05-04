const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const {
    check,
    validationResult
} = require('express-validator/check');

// User Model
const User = require('../../models/User');


// @route    POST api/users
// @desc     Register user
// @access   Public

router.post('/', [
        check('name', 'Name is required').not().isEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Please enter a password with 6 or more characters').isLength({
            min: 6
        })
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // In order the error messages to be visible send back via .array() in the response
            return res.status(400).json({
                errors: errors.array()
            });
        }

        const {
            name,
            email,
            password
        } = req.body;

        try {

            // See if user exists
            let user = await User.findOne({ email });
            if (user) {
                return res.status(400).json({
                    errors: [{
                        msg: 'User already exists'
                    }]
                }); // Same errors structure for the Front-end
            }
            // Get user's gravatar
            const avatar = gravatar.url(email, {
                s: '200', // Default size
                r: 'pg', // Rating
                d: 'mm'
            });

            // Creates new instance of the User Model
            user = new User({
                name,
                email,
                avatar,
                password
            })

            // Encrypt password
            const salt = await bcrypt.genSalt(10);

            user.password = await bcrypt.hash(password, salt);

            // Returns promise to get the id from the user object
            await user.save();

            // Return jsonwebtoken
            const payload = {
                user: {
                    id: user.id
                }
            }

            jwt.sign(
                payload,
                config.get('jwtSecret'), {
                    expiresIn: 3600000
                },
                (err, token) => {
                    if (err) throw err;
                    res.json({
                        token
                    });
                });

        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    });

module.exports = router;
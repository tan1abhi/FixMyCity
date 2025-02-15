const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require("../Models/User");


const signup = async (req, res) => {
    try {
        const {name, email, password, role, city, state} = req.body;
        const user = await UserModel.findOne({email});
        if(user) {
            return res.status(409)
                .json({message: 'User already exists, you can login', success: false});
        }
        const userModel = new UserModel({name, email, password, role, city, state});
        userModel.password = await bcrypt.hash(password, 10);
        await userModel.save();
        
        const createdUser = await UserModel.findOne({email});
        const jwtToken = jwt.sign(
            {email: createdUser.email, _id: createdUser._id, name: createdUser.name, role: createdUser.role },
            process.env.JWT_SECRET,
            {expiresIn: '24h'}
        )
        res.status(201)
            .json({
                message: "Signup Successful", 
                success: true,
                jwtToken,
                email,
                role,
                name: createdUser.name,
                city: createdUser.city,
                state: createdUser.state,
                userId: createdUser._id
            })
    } catch (err) {
        res.status(500)
            .json({message: "Internal Server Error", success: false})
    }
}

const login = async (req, res) => {
    try {
        const {email, password} = req.body;
        const user = await UserModel.findOne({email});
        const errorMsg = 'Authentication Failed! Email or Password is wrong.';
        if(!user) {
            return res.status(403)
                .json({message: errorMsg, success: false});
        }
        const isPassEqual = await bcrypt.compare(password, user.password);
        if(!isPassEqual) {
            return res.status(403)
                .json({message: errorMsg, success: false});
        }
        const jwtToken = jwt.sign(
            {email: user.email, _id: user._id, name: user.name, role: user.role},
            process.env.JWT_SECRET,
            {expiresIn: '24h'}
        )

        res.status(200)
            .json({
                message: "Login Successful", 
                success: true,
                jwtToken,
                email,
                role: user.role,
                name: user.name,
                city: user.city,
                state: user.state,
                userId: user._id
            })
    } catch (err) {
        res.status(500)
            .json({message: "Internal Server Error", success: false})
    }
}

module.exports = {
    signup,
    login
}
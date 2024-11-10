const User = require('../models/User')
const Note = require('../models/Note')
const bcrypt = require('bcrypt');

// @desc Get all users
// @route GET /users
// @access Private 
const getAllUsers = async (req, res) => {
    const users = await User.find().select('-password').lean()
    if (!users?.length) {
        return res.status(400).json({ message: 'No Users found' })
    }
    res.json(users)
}
// @desc Create a new user
// @route POST /users
// @access Private 
const createNewUser = async (req, res) => {
    const { username, password, roles } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'All fields are required' })
    }
    const duplicate = await User.findOne({ username }).collation({ locale: 'en', strength: 2 }).lean().exec()

    if (duplicate) {
        return res.status(409).json({ message: 'Duplicate username' })
    }

    // hash the password
    const hashedPwd = await bcrypt.hash(password, 10);

    const userObject = (!Array.isArray(roles) || !roles.length)
        ? { username, "password": hashedPwd }
        : { username, "password": hashedPwd, roles }

    // create or store new user 
    const user = await User.create(userObject)

    if (user) {
        // creted 
        res.status(200).json({ message: `New User ${username} created ` })
    } else {
        res.status(400).json({ message: `Invalid user data recevied` });
    }
}
// @desc Update a user
// @route PATCH /users
// @access Private 
const updateUser = async (req, res) => {

    const { id, username, roles, active, password } = req.body;
    // confirm data
    if (!id || !username || !Array.isArray(roles) || !roles.length || typeof active != 'boolean') {
        return res.status(400).json({ message: 'All fields are required' });
    }
    const user = await User.findById(id).exec()

    if (!user) {
        return res.status(400).json({ message: 'User not found' });
    }
    // check duplicate
    const duplicate = await User.findOne({ username }).collation({ locale: 'en', strength: 2 }).lean().exec()

    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ message: 'duplicate username' })
    }

    user.username = username
    user.roles = roles
    user.active = active
    if (password) {
        // hashing password
        user.password = await bcrypt.hash(password, 10)
    }
    const updateUser = await user.save()
    res.json({ message: `${updateUser.username} updated` })
}
// @desc Delete a user
// @route DELETE /users
// @access Private 
const deleteUser = async (req, res) => {
    const { id } = req.body
    if (!id) {
        return res.status(400).json({ message: 'User ID Required' })
    }
    const note = await Note.findOne({ user: id }).lean().exec()
    if (note) {
        return res.status(400).json({ message: 'User has assigned notes ' })
    }
    const user = await User.findById(id).exec()

    if (!user) {
        return res.status(400).json({ message: 'User not found ' });
    }
    const result = await user.deleteOne();

    const reply = `Username ${result.username} with ID ${result._id} delated`

    res.json(reply)
}

module.exports = {
    getAllUsers,
    createNewUser,
    updateUser,
    deleteUser
}

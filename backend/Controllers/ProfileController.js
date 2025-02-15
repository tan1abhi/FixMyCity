const UserModel = require("../Models/User");


const deleteUser = async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }
  
      const user = await User.findOneAndDelete({ email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
};
  

const updateUser = async (req, res) => {
try {
    const { email, city, state } = req.body;

    const user = await User.findOneAndUpdate(
    { email },
    { city, state },
    { new: true }
    );

    if (!user) {
    return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'Profile updated successfully', user });
} catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
}
};




module.exports = {
deleteUser,
updateUser,
};
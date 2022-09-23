const User = require("../models/User");
const Note = require("../models/Note");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");

//@desc get all users
//@route GET /users
//@access Private
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password").lean();

  if (!users?.length) {
    return res.status(400).json({ message: "No users found" });
  }

  res.json(users);
});

//@desc create new user
//@route POST /users
//@access Private
const createNewUser = asyncHandler(async (req, res) => {
  const { username, password, roles } = req.body;

  //confirm data
  if (!username || !password || !Array.isArray(roles) || !roles.length) {
    return res.status(400).json({ message: "All fields are required" });
  }

  //check dupes
  const duplicate = await User.findOne({ username }).lean().exec();
  if (duplicate) {
    return res.status(409).json({ message: "username already exists" });
  }

  //hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  const userObject = { username, password: hashedPassword, roles };

  //create and store user
  const user = await User.create(userObject);

  if (user) {
    res.status(201).json({ message: `User: ${username} createed` });
  } else {
    res.status(400).json({ message: "Invalid user data received" });
  }
});

//@desc update a user
//@route PATCH /users
//@access Private
const updateUser = asyncHandler(async (req, res) => {
  const { id, username, roles, active, password } = req.body;

  //confirm data
  if (
    !id ||
    !username ||
    !Array.isArray(roles) ||
    !roles.length ||
    typeof active !== "boolean"
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  //check dupes
  const duplicate = await User.findOne({ username }).lean().exec();
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Username already exists" });
  }

  user.username = username;
  user.roles = roles;
  user.active = active;

  if (password) {
    // hash password
    user.password = await bcrypt.hash(password, 10);
  }

  const updatedUser = await user.save();
  res.json({ message: `Updated ${updatedUser.username}` });
});

//@desc delete a user
//@route DELETE /users
//@access Private
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "User ID required" });
  }

  const note = await Note.findOne({ user: id }).lean().exec();
  if (note) {
    return res.status(400).json({ message: "User has assigned notes" });
  }

  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  const result = await user.deleteOne();
  const reply = `Username ${result.username} with ID ${result._id} deleted`;

  res.json(reply);
});

module.exports = { getAllUsers, createNewUser, updateUser, deleteUser };
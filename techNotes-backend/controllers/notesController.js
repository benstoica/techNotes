const Note = require("../models/Note");
const User = require("../models/User");
const asyncHandler = require("express-async-handler");

//@desc get all notes
//@route GET /notes
//@access Private
const getAllNotes = asyncHandler(async (req, res) => {
  const notes = await Note.find().lean();

  if (!notes?.length) {
    return res.status(400).json({ message: "No notes found" });
  }

  const notesWithUser = await Promise.all(
    notes.map(async (note) => {
      const user = await User.findById(note.user).lean().exec();
      return { ...note, username: user.username };
    })
  );

  res.json(notesWithUser);
});

//@desc create new note
//@route POST /notes
//@access Private
const createNewNote = asyncHandler(async (req, res) => {
  const { user, title, text } = req.body;

  //confirm data
  if (!user || !title || !text) {
    return res.status(400).json({ message: "All fields are required" });
  }

  //check for duplicate note title
  const duplicate = await Note.findOne({ title }).lean().exec();
  if (duplicate) {
    return res
      .status(409)
      .json({ message: `Note with title ${title} already exists` });
  }

  //create and store the new note
  const note = await Note.create({ user, title, text });
  if (note) {
    return res.status(201).json({ message: "New note created" });
  } else {
    return res.status(400).json({ message: "Invalid data received" });
  }
});

//@desc update a note
//@route PATCH /notes
//@access Private
const updateNote = asyncHandler(async (req, res) => {
  const { id, user, title, text, completed } = req.body;

  //confirm data
  if (!id || !user || !title || !text || typeof completed !== "boolean") {
    return res.status(400).json({ message: "All fields are required" });
  }

  //confirm note to update exists
  const note = await Note.findById(id).exec();

  if (!note) {
    return res.status(400).json({ message: "Note not found" });
  }

  //check for duplicate title
  const duplicate = await Note.findOne({ title }).lean().exec();

  //allow original note to be renamed
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate note title" });
  }

  note.user = user;
  note.title = title;
  note.text = text;
  note.completed = completed;
  const updatedNote = await note.save();

  res.json(`${updatedNote.title} updated`);
});

//@desc delete a note
//@route DELETE /notes
//@access Private
const deleteNote = asyncHandler(async (req, res) => {
  const { id } = req.body;

  //confirm data
  if (!id) {
    return res.status(400).json({ message: "Note ID required" });
  }

  //check if note exists to delete
  const note = await Note.findById(id).exec();

  if (!note) {
    return res.status(400).json({ message: "Note not found" });
  }

  const result = await note.deleteOne();
  const reply = `Note ${result.title} with ID ${result._id} deleted`;

  res.json(reply);
});

module.exports = { getallNotes, createNewNote, updateNote, deleteNote };

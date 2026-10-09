const Block = require("../models/Block");

const getBlocks = async (req, res, next) => {
  try {
    const blocks = await Block.find().sort({ name: 1 }).select("name institution hostelType floors");
    res.status(200).json(blocks);
  } catch (error) {
    next(error);
  }
};

const createBlock = async (req, res, next) => {
  try {
    const name = typeof req.body.name === "string" ? req.body.name.trim() : "";

    if (!name) {
      return res.status(400).json({ message: "Block name is required" });
    }

    if (name.length > 80) {
      return res.status(400).json({ message: "Block name must be 80 characters or fewer" });
    }

    const institution = req.body.institution;
    if (institution !== "KIET" && institution !== "KIEW") {
      return res.status(400).json({ message: "Institution must be KIET or KIEW" });
    }

    const hostelType = req.body.hostelType;
    if (hostelType !== "Boys" && hostelType !== "Girls") {
      return res.status(400).json({ message: "Hostel type must be Boys or Girls" });
    }

    const floors = Number(req.body.floors);
    if (!Number.isInteger(floors) || floors < 1) {
      return res.status(400).json({ message: "Floors must be a positive whole number" });
    }

    const normalizedName = name.toLocaleLowerCase();
    const block = await Block.create({ name, normalizedName, institution, hostelType, floors });
    res.status(201).json(block);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "A block with this name already exists" });
    }
    next(error);
  }
};

module.exports = { getBlocks, createBlock };

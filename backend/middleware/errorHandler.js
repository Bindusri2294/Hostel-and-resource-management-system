const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    if (err.name === "CastError") {
        return res.status(400).json({
            message: `Invalid ID format`,
        });
    }

    if (err.name === "ValidationError") {
        const messages = Object.values(err.errors).map((e) => e.message);
        return res.status(400).json({
            message: messages.join(", "),
        });
    }

    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(400).json({
            message: `${field} already exists`,
        });
    }

    res.status(500).json({
        message: err.message || "Server error",
    });
};

module.exports = errorHandler;
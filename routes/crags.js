const express = require("express");
const router = express.Router();
const catchAsync = require("../util/catchAsync");
const crags = require("../controllers/crags");
const { isLoggedIn, validateCrag, isAuthor } = require("../middleware");
const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });

router
    .route("/")
    .get(catchAsync(crags.index))
    .post(
        isLoggedIn,
        upload.array("image"),
        validateCrag,
        catchAsync(crags.created)
    );

router.get("/add", isLoggedIn, crags.create);

router
    .route("/:id")
    .get(catchAsync(crags.showCrag))
    .delete(isLoggedIn, isAuthor, catchAsync(crags.deleteCrag))
    .put(
        isAuthor,
        upload.array("image"),
        validateCrag,
        catchAsync(crags.updateCrag)
    );

router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(crags.editCrag));

module.exports = router;

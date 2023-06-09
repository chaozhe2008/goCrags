const ExpressError = require("./util/ExpressError");
const { cragSchema } = require("./schemas");
const { reviewSchema } = require("./schemas");
const crag = require("./models/crag");
const review = require("./models/review");

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash("error", "You must be logged in to do that");
        return res.redirect("/login");
    }
    next();
};
module.exports.validateCrag = (req, res, next) => {
    const { error } = cragSchema.validate(req.body);
    if (error) {
        const msg = error.details.map((er) => er.message).join(",");
        throw new ExpressError(400, msg);
    } else next();
};

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const cra = await crag.findById(id);
    if (!cra.author.equals(req.user._id)) {
        req.flash("error", "You don't have permission the to do that!");
        return res.redirect(`/crags/${id}`);
    }
    next();
};

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map((er) => er.message).join(",");
        throw new ExpressError(400, msg);
    } else next();
};

module.exports.isReviewed = async (req, res, next) => {
    const { reviewId, id } = req.params;
    const reviewd = await review.findById(reviewId);
    if (!reviewd.author.equals(req.user._id)) {
        req.flash("error", "You don't have permission the to do that!");
        return res.redirect(`/crags/${id}`);
    }
    next();
};

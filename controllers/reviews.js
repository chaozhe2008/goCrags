const review = require("../models/review");
const crag = require("../models/crag");
module.exports.createReview = async (req, res) => {
    const Crag = await crag.findById(req.params.id);
    const Review = new review(req.body.review);
    Review.author = req.user._id;
    Crag.reviews.push(Review);
    await Review.save();
    await Crag.save();
    req.flash("success", "Thanks for submitting your review!");
    res.redirect(`/crags/${Crag._id}`);
};
module.exports.deleteReview = async (req, res) => {
    await crag.findByIdAndUpdate(req.params.id, {
        $pull: { reviews: req.params.reviewId },
    });
    await review.findByIdAndDelete(req.params.reviewId);
    req.flash("success", "Your review has been deleted");
    res.redirect(`/crags/${req.params.id}`);
};

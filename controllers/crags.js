const crag = require("../models/crag");
const { cloudinary } = require("../cloudinary");
const geoCoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geoCoder = geoCoding({ accessToken: mapBoxToken });

module.exports.index = async (req, res) => {
    var crags = await crag.find({});
    crags = crags.reverse();
    res.render("crags/index", { crags });
};

module.exports.create = (req, res) => {
    res.render("crags/addnew");
};

module.exports.created = async (req, res) => {
    const Crag = new crag(req.body.Crag);
    Crag.images = req.files.map((f) => ({
        url: f.path,
        filename: f.filename,
    }));
    Crag.author = req.user._id;
    const geoData = await geoCoder
        .forwardGeocode({
            query: req.body.Crag.location,
            limit: 1,
        })
        .send();
    // res.send(geoData.body.features[0].geometry.coordinates);
    Crag.geometry = geoData.body.features[0].geometry;
    console.log(crag);
    await Crag.save();
    req.flash("success", "Successfully made a new crag!");
    res.redirect(`/crags/${Crag._id}`);
};

module.exports.showCrag = async (req, res) => {
    const details = await crag
        .findById(req.params.id)
        .populate({ path: "reviews", populate: { path: "author" } })
        .populate("author");
    // console.log(details);
    if (!details) {
        req.flash("error", "Sorry, Cannot find the crag!");
        return res.redirect("/crags");
    }
    res.render("crags/details", { details });
};

module.exports.editCrag = async (req, res) => {
    // const crag = await crag.findById(req.params.id);
    const { id } = req.params;
    const Crag = await crag.findById(id);
    if (!Crag) {
        req.flash("error", "Sorry, Cannot find the crag to edit!");
        return res.redirect("/crags");
    }
    res.render("crags/edit", { Crag });
};

module.exports.deleteCrag = async (req, res, next) => {
    const Crag = await crag.findById(req.params.id);
    Crag.images.forEach((item) => {
        cloudinary.uploader.destroy(item.filename);
    });
    await Crag.remove();
    if (!Crag) {
        req.flash("error", "Sorry, Cannot find the crag to delete!");
        return res.redirect("/crags");
    }
    req.flash("success", "Successfully deleted the crag!");
    res.redirect("/crags");
};

module.exports.updateCrag = async (req, res) => {
    const { id } = req.params;
    // const cragId = await crag.findById(id);
    const Crag = await crag.findByIdAndUpdate(id, {
        ...req.body.Crag,
    });
    console.log(Crag.location, req.body.Crag.location);
    if (Crag.location != req.body.Crag.location) {
        console.log("here");
        const geoData = await geoCoder
            .forwardGeocode({
                query: req.body.Crag.location,
                limit: 1,
            })
            .send();
        Crag.geometry = geoData.body.features[0].geometry;
    }
    if (!Crag) {
        req.flash("error", "Sorry, Cannot find the crag to edit!");
        return res.redirect("/crags");
    }
    const img = req.files.map((f) => ({ url: f.path, filename: f.filename }));
    Crag.images.push(...img);
    await Crag.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await Crag.updateOne({
            $pull: { images: { filename: { $in: req.body.deleteImages } } },
        });
    }
    req.flash("success", "Successfully updated the crag!");
    res.redirect(`/crags/${id}`);
};

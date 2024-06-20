const express = require("express");
const {Fav,fetchFavorites,deleteFavorite}  = require("../Controller/Favorite")
const router = express.Router();
router.post("/like",Fav);
router.get("/favoritesByPatient",fetchFavorites);
router.delete("/deleteFavoriteByPatient",deleteFavorite);
module.exports = router;
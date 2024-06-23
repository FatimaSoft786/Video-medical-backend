const express = require("express");
const {Fav,fetchFavorites,deleteFavorite}  = require("../Controller/Favorite")
const router = express.Router();
var fetchUser = require('../middleware/fetchUser');
router.post("/like",Fav);
router.get("/favoritesByPatient",fetchUser,fetchFavorites);
router.delete("/deleteFavoriteByPatient",fetchUser,deleteFavorite);
module.exports = router;
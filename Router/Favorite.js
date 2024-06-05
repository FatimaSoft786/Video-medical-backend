const express = require("express");
const {Fav,fetch}  = require("../Controller/Favorite")
const router = express.Router();
router.post("/fav",Fav);
router.get("/fetch",fetch);
module.exports = router;
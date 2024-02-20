const db = require("../../../config/index");
const country = db.country;

exports.getCountries = async (req, res) => {
  let result = await country.findAll();
  res.json({ result });
};

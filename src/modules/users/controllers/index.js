const db = require("../../../config/index");
const { errorHandler } = require("../../../helpers/errHandler");


module.exports = {
  addAddressDetails: async (req, res) => {
    try{
      const { lane1, lane2, city, region, country, postal_code } = req.body;
      const userId = req.user.id;
      if( !lane1 || !lane2 || !city || !region || !country || !postal_code )
        return res.status(400).json({
          status: 400,
          success: false,
          message:
            "Invalid input.",
        });
      await db.usersAddress.create({
        lane1, lane2, city, region, country, postal_code, userId
      });
      res.status(200).send({ 
        success: true, message: "information added."
       })
    } catch(err){
      console.log("Error", err);
      res.status(500).send({
        success: false,
        message: "Internal Server Error."
      })
    }

    
  },
  addIdentityDetails: async (req, res) => {
    try{
      const { identity_number, country_identity_name, country_identity_card, photo, passport_numer } = req.body;
      const userId = req.user.id;
      if( !identity_number || !country_identity_name || !country_identity_card || !photo || !passport_numer)
        return res.status(400).json({
          status: 400,
          success: false,
          message:
            "Invalid input.",
        });
      await db.usersAddress.update({
        identity_number, country_identity_name, country_identity_card, photo, passport_numer
      }, { where: { userId } });
      return res.status(200).send({ 
        success: true, message: "information added."
      })
    } catch(err){
      console.log("Error", err);
      res.status(500).send({
        success: false,
        message: "Internal Server Error."
      })
    }

    
  },
  addDocuments: async (req, res) => {
    try{
      const { passport_doc, affidavit_doc, agreement_doc,  proof_of_residence_doc } = req.body;
      const userId = req.user.id;
      if( !passport_doc || !affidavit_doc || !agreement_doc || !proof_of_residence_doc)
        return res.status(400).json({
          status: 400,
          success: false,
          message:
            "Invalid input.",
        });
      await db.usersAddress.update({
        passport_doc, affidavit_doc, agreement_doc,  proof_of_residence_doc
      }, { where: { userId } });
      return res.status(200).send({ 
        success: true, message: "information added."
      })
    } catch(err){
      console.log("Error", err);
      res.status(500).send({
        success: false,
        message: "Internal Server Error."
      })
    }

    
  },
}

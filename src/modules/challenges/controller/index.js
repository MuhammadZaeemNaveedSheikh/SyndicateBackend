const db = require("../../../config/index");
const data = require("../data/index.json")
const { errorHandler } = require("../../../helpers/errHandler");


module.exports = {
  getAllChallenges: async (req, res) => {
    try{
      const challenges = await db.challenges.findAll();
      if(challenges.length)
        return res.status(200).send({
          success: true, data: challenges
        })
      else
        return res.status(200).send({
          success: false, message: "Not Challenges Found.", data: challenges
        })
    } catch(err){
      console.log("Error", err);
      res.status(500).send({
        success: false,
        message: "Internal Server Error."
      })
    }
  },
  createChallenges: async (req, res) => {
    try{
      await db.challenges.bulkCreate(data)
      res.status(200).send({
        success: true,
        message: "challenges created."
      })
    } catch(err){
      console.log("Error", err)
      res.status(500).send({
        success: false,
        message: "Server Error."
      })
    }
  },
    updateChallenge: async (req, res) => {
    try{
      const challenge = req?.body;
      const { id } = req?.query;
      console.log("adsfads", challenge, id)
      if(!id || JSON.stringify(challenge) === "{}")
        return res.status(400).send({
          success: false,
          message: "Bad request."
        })
      await db.challenges.update(challenge, {
        where: {
          id
        }
      })
      res.status(200).send({
        success: true,
        message: "challenges updated."
      })
    } catch(err){
      console.log("Error", err)
      res.status(500).send({
        success: false,
        message: "Server Error."
      })
    }
  },
}

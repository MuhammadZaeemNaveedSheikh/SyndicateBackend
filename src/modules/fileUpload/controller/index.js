module.exports = {
  fileUpload: (req, res) => {
    try{
      if(!req.file)
        return res.status(400).send({
          success: false,
          message: "Bad request."
        })
      // const params = {
      //   Bucket: 'your_bucket_name',
      //   Key: req.file.originalname,
      //   Body: req.file.buffer,
      // };
    
      // s3.upload(params, (err, data) => {
      //   if (err) {
      //     console.error(err);
      //     return res.status(500).send('Error uploading file');
      //   }
    
      //   res.send('File uploaded successfully');
      // });
      
      res.status(200).send({
        success: true,
        message: "File uploaded.",
        ...req.file
      })
    } catch(err){
      console.log("Error", err)
      res.status(500).send({
        success: false,
        message: "Server Error."
      })
    }
  
  }


}
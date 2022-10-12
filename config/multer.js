import multer from "multer";

const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});
export const upload = multer({ storage: storage });

//____________________________Upload Video____________________________________//

const videoStorage = multer.diskStorage({
  destination: "videos", // Destination to store video
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});

export const videoUpload = multer({
  storage: videoStorage,
  limits: {
    fileSize: 10000000, // 10000000 Bytes = 10 MB
  },
  fileFilter(req, file, cb) {
    // upload only mp4 and mkv format
    if (!file.originalname.match(/\.(mp4|MPEG-4|mkv)$/)) {
      return cb(new Error("Please upload a video"));
    }
    cb(undefined, true);
  },
});

// router.post('/uploadVideo', videoUpload.single('video'), (req, res) => {
//     res.send(req.file)
//  }, (error, req, res, next) => {
//      res.status(400).send({ error: error.message })
//  })

//_____________________________Upload Single Image______________________________//

// const imageStorage = multer.diskStorage({
//     // Destination to store image
//     destination: 'images',
//       filename: (req, file, cb) => {
//           cb(null, file.fieldname + '_' + Date.now()
//              + path.extname(file.originalname))
//             // file.fieldname is name of the field (image)
//             // path.extname get the uploaded file extension
//     }
// });
// const imageUpload = multer({
//     storage: imageStorage,
//     limits: {
//       fileSize: 1000000 // 1000000 Bytes = 1 MB
//     },
//     fileFilter(req, file, cb) {
//       if (!file.originalname.match(/\.(png|jpg)$/)) {
//          // upload only png and jpg format
//          return cb(new Error('Please upload a Image'))
//        }
//      cb(undefined, true)
//   }
// })

// For multiple image upload

// router.post('/uploadBulkImage', imageUpload.array('images', 4),     (req, res) => {
//     res.send(req.files)
//  }, (error, req, res, next) => {
//      res.status(400).send({ error: error.message })
//  })

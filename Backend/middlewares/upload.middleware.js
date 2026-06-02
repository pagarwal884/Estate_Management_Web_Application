import multer from 'multer'

const storage = multer.memoryStorage();

const Upload = multer({storage})

export default Upload;
const multer = require('multer');
const nome1 = multer();
//vhoje = new Date();
//const hoje = formatDate(this.vhoje, 'dd/MM/yyyy HH:mm', 'en-US', 'UTC-3');

module.exports = (multer({
    storage: multer.diskStorage({
    destination: (req, file, cb)=>{
        cb(null, './public/upload/brasao')
    },
    filename:(req, file, cb)=>{
        cb(null, Date.now().toString() + "_" + file.originalname)
    },
    mzr:(req, file, cb)=>{
        cb(null, Date.now().toString() + "_" + file.originalname)
    }
    
 }),

fileFilter: (req,file, cb) => {
    const extensaoImg = ['image/png','image/jpg','image/jpeg'].find(
        formatoAceito => formatoAceito == file.mimetype);
        
        if(extensaoImg){
            return cb(null, true);
        } 
        return cb(null,false);    
},
mzr:(req, file, cb)=>{
    cb(null, Date.now().toString() + "_" + file.originalname)
}

}));
const fs = require('fs');
const bodyParser = require("body-parser");
const libre = require('libreoffice-convert');
const path = require("path");
const multer = require("multer");
const pdfMerge = require('easy-pdf-merge');
const webp=require('webp-converter');
var outputFilePath;
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
var json2xlsx = require('json2xls');
const pdf = require('html-pdf');

var convert = require("ebook-convert");
const whoisinfo = require("whois-json");
const moment = require("moment");
const isValidDomain = require("is-valid-domain");
const { exec } = require("child_process");
const res = require('express/lib/response');
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));
app.use(expressLayouts);
app.set('view engine','ejs');
var https = require('https');
var http = require('http');
var PORT = process.env.PORT || 3000;
libre.convert = require('util').promisify(libre.convert);

app.get('/',(req, res)=>{
    res.render('services');
});

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "public/uploads")
    },
    filename: function (req, file, cb) {
      cb(
        null,
        file.fieldname + "-" + Date.now() + path.extname(file.originalname)
      );
    },
});

var dir = "public";
var subDirectory = "public/uploads";
 
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
 
  fs.mkdirSync(subDirectory);
}

app.get('/docxtopdf',(req,res) => {
  res.render('docxtopdf',{title:'Docs to Pdf'})
});
 
const docxtopdf = function (req, file, callback) {
  var ext = path.extname(file.originalname);
  if (
    ext !== ".docx" &&
    ext !== ".doc"
  ) {
    return callback('The extension is not supported.');
   
     
  }
  callback(null, true);
};

const docxtopdfupload = multer({storage:storage,fileFilter:docxtopdf});

app.post('/docxtopdf',docxtopdfupload.single('file'),(req,res) => {
  if(req.file){
      const ext = '.pdf'
          const inputPath = req.file.path
          const outputPath = Date.now() + "output.pdf"
  
          const docxBuf = fs.readFileSync(inputPath);

          pdfbuf = libre.convert(docxBuf, ext, undefined);
              if(err){
                      fs.unlinkSync(req.file.path)    
                      res.send("some error taken place in conversion process")
                  }
                  fs.writeFileSync(outputPath, pdfbuf);


                  res.download(outputPath,(err) => {
                      if(err){
                        fs.unlinkSync(req.file.path)
                      fs.unlinkSync(outputPath)
              
                      res.send("some error taken place in downloading the file")
                      }
              
                      fs.unlinkSync(req.file.path)
                      fs.unlinkSync(outputPath)
                    });
              }
});
      
  
const mergepdffilter = function(req,file,callback){
    var ext = path.extname(file.originalname);
    if (
        ext !== ".pdf"
    ) {
        return callback('This Extension is not supported');
    }
    callback(null , true)
};
var mergepdffilesupload = multer({storage:storage,fileFilter:mergepdffilter});

app.get('/mergepdf',(req, res)=>{
    res.render('mergepdf',{title:'Merge Pdf'});
});



app.post('/mergepdf',mergepdffilesupload.array('files',100),(req,res) => {
    const list = []
    outputFilePath = Date.now() + "output.pdf"
    if(req.files){
      req.files.forEach(file => {
        list.push(file.path)
      });
    
    
    pdfMerge(list,outputFilePath, function(err){
      if(err){
        res.send("Some error takes place.")
        console.log(err)
      }
      res.download(outputFilePath,(err) => {
        if(err){
          req.files.forEach(file => {
            fs.unlinkSync(file.path)
          });
        fs.unlinkSync(outputFilePath)
        res.send(err)
        }
        req.files.forEach(file => {
          fs.unlinkSync(file.path)
        });
        fs.unlinkSync(outputFilePath)
        res.send(err)
      })
    });
  }}
);
  

app.get('/webpconvert',(req,res) => {
  res.render("webpconvert",{title:'Convert to Webp'})
})



var upload = multer({ storage: storage }).single('file')

 
app.post('/webpconvert',upload,(req,res) => {

    outputFilePath = Date.now() + "output.webp"

  upload(req,res,err => {
    if(err){
      fs.unlinkSync(req.file.path)
      {
        fs.unlinkSync(req.file.path)
      fs.unlinkSync(outputFilePath)
      res.send('Error')
    }}
   
     
     
  const result = webp.cwebp(req.file.path,outputFilePath,"-q 80");


  result.then((response) => {
      res.download(outputFilePath,(err) => {
        if(err){
          fs.unlinkSync(outputFilePath)
          fs.unlinkSync(req.file.path)
          res.send('Error')
        }
        fs.unlinkSync(outputFilePath)
        fs.unlinkSync(req.file.path)

}
      )
})})});

app.get('/jsontoxls',(req,res)=>{
  res.render('jsontoxls',{title:'Json to xls'})
})


const jsonfilefilter = function(req,file,callback){
  var ext = path.extname(file.originalname);
  if (
      ext !== ".json"
  ) {
      return callback('This Extension is not supported');
  }
  callback(null , true)
};
var jsontoxls = multer({ storage : storage, fileFilter:jsonfilefilter })

app.post('/jsontoxls',jsontoxls.single('file'),(req,res) => {
  if(req.file){
    const file = fs.readFileSync(req.file.path);
    outputFilePath = Date.now() + "output.xlsx"
    var xls = json2xlsx(JSON.parse(file))
    fs.writeFileSync(outputFilePath,xls,'binary');
    

      res.download(outputFilePath,(err)=>{
            if(err){
              fs.unlinkSync(outputFilePath)
              fs.unlinkSync(req.file.path)
              res.send('Error')
            }
            fs.unlinkSync(outputFilePath)
            fs.unlinkSync(req.file.path)

    }
      )
}});


app.get('/pngtopdf',(req,res)=>{
  res.render('pngtopdf')
})
        
const imageFilter = function(req , file, cb){
  if (
    file.mimetype == "image/png"
  ) {
    cb(null,true)
  }else {
    cb(null,false)
    res.send(new Error("Only .png format allowed"))
  }
};

var imageupload = multer({storage:storage, fileFilter:imageFilter});
app.post('/pngtopdf', imageupload.array("files",100),(req,res)=>{
  var list = "";
  if (req.files) {
    req.files.forEach((file) => {
      list += `${file.path}`;
      list += " ";
    });
    outputFilePath = Date.now() + "output.pdf"
    exec(`magick convert ${list} ${outputFilePath}`, (err, stderr, stdout) => {
      if (err) throw err;
 
      res.download(outputFilePath, (err) => {
        if (err) throw err;
 
        req.files.forEach((file) => {
          fs.unlinkSync(file.path);
        });
 
        fs.unlinkSync(outputFilePath);
      });
    });
  }
});

app.get('/domaininfo',(req,res)=>{
  res.render("domaininfo",{
    data: "",
    flag :false,
    date: "",
    domainAge: "",
  })
});

app.post('/domaininfo',async(req,res)=>{
  var domain = req.body.domain

  if(isValidDomain(domain)){
    var result = await whoisinfo(domain);
    var date = moment(result.creationDate).format("YYYY-MM-DD");
    var currentdate = moment(new Date()).format("YYYY-MM-DD");

    var a = moment(date);
    var b = moment(currentdate);
    var years = b.diff(a, "year");
    a.add(years, "years");

    var months = b.diff(a, "months");
    a.add(months, "months");

    var days = b.diff(a, "days");
  
    var domainAge = years + "y-" + months + "m-" + days + 'd';
    res.render("domaininfo",{
      data: result,
      flag :true,
      date: date,
      domainAge: domainAge,
    });

  }else{
    res.send("Invalid Domain")
  }
})

app.get('/epubtopdf',(req,res)=>{
  res.render('epubtopdf')
})

const epubfilefilter = function(req,file,callback){
  var ext = path.extname(file.originalname);
  if (
      ext !== ".epub"
  ) {
      return callback('This Extension is not supported');
  }
  callback(null , true)
};

var epubtopdf = multer({ storage : storage, fileFilter:epubfilefilter })

app.post('/epubtopdf',epubtopdf.single('file'), (req,res , callback) => {
  var inputfilepath = req.file.path
  outputFilePath = Date.now() + "output.pdf"
  var options = {
    input: inputfilepath,
    output: outputFilePath,
    authors: '"Seth Vincent"',
    pageBreaksBefore: '//h:h1',
    chapter: '//h:h1',
    insertBlankLine: true,
    insertBlankLineSize: '1',
    lineHeight: '12',
    marginTop: '50',
    marginRight: '20',
    marginBottom: '50',
    marginLeft: '20'
  }

  if(req.file){
    convert(options, function (err) {
      if (err) {
        console.log(err)

        fs.unlinkSync(inputfilepath)
        fs.unlinkSync(outputFilePath)

        res.send("some error has taken place")
      }
      res.download(outputFilePath,(err) => {
        if(err){
          fs.unlinkSync(inputfilepath)
          fs.unlinkSync(outputFilePath)
          res.send("some error taken place in downloading the file")

        }
        fs.unlinkSync(inputfilepath)
        fs.unlinkSync(outputFilePath)
      })
    })
     
  }
});

app.get('/pdftoepub',(req,res)=>{
  res.render('pdftoepub')
})


const pdffilefilter = function(req,file,callback){
  var ext = path.extname(file.originalname);
  if (
      ext !== ".pdf"
  ) {
      return callback('This Extension is not supported');
  }
  callback(null , true)
};

var pdftoepub = multer({ storage : storage, fileFilter:pdffilefilter })

app.post('/pdftoepub',pdftoepub.single('file'), (req,res,callback) => {
  var inputfilepath = req.file.path
  outputFilePath = Date.now() + "output.epub"
  var options = {
    input: inputfilepath,
    output: outputFilePath,
    authors: '"Seth Vincent"',
    pageBreaksBefore: '//h:h1',
    chapter: '//h:h1',
    insertBlankLine: true,
    insertBlankLineSize: '1',
    lineHeight: '12',
    marginTop: '50',
    marginRight: '20',
    marginBottom: '50',
    marginLeft: '20'
  
  }

  if(req.file){
    convert(options, function (err) {
      if (err) {
        console.log(err)

        fs.unlinkSync(inputfilepath)
        fs.unlinkSync(outputFilePath)

        res.send("some error has taken place")
      }
      res.download(outputFilePath,(err) => {
        if(err){
          fs.unlinkSync(inputfilepath)
          fs.unlinkSync(outputFilePath)
          res.send("some error taken place in downloading the file")

        }
        fs.unlinkSync(inputfilepath)
        fs.unlinkSync(outputFilePath)
      })
    })
     
  }
});

app.get('/htmltopdf',(req,res)=>{
  res.render('htmltopdf')
})

var upload = multer({ storage : storage }).single('file');

app.post('/htmltopdf',(req,res)=>{

  outputFilePath = Date.now() + "output.pdf"
  upload(req, res, (err) => {
    if (err) {
        fs.unlinkSync(req.file.path)
    }
    else {
        var html = fs.readFileSync(req.file.path, "utf8");
        var options = { format: "Letter" };

        pdf
          .create(html, options)
          .toFile(outputFilePath, function (err, response) {
            if(err) {
              fs.unlinkSync(req.file.path)
              fs.unlinkSync(response.filename)
              res.send("Error")
            }
              
              res.download(response.filename, (err) => {
                if(err){
                  fs.unlinkSync(req.file.path)
                  fs.unlinkSync(response.filename)
                  res.send("some error taken place in downloading the file")
        
                }
                fs.unlinkSync(req.file.path)
                fs.unlinkSync(response.filename)
              })
          });
    }
  });
});

app.listen(PORT, () => console.log("Port is listening..."))
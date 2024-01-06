const cors = require('cors');

const whitelist = [
    'https://us-central1-grandma-8ed4c.cloudfunctions.net', 
    'http://127.0.0.1:5001/grandma-8ed4c/us-central1', 
    'http://localhost:3000', 
    'https://grandma-8ed4c.web.app'
];
const corsOptionsDelegate = (req, callback) => {
    let corsOptions;
    if(whitelist.indexOf(req.header('Origin')) !== -1) {
        corsOptions = { 
            origin: req.header('Origin'), 
            credentials: true,
            methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
            optionsSuccessStatus: 204
        };
    } else {
        corsOptions = { origin: false };
    }
    callback(null, corsOptions);
};

exports.cors = cors();
exports.corsWithOptions = cors(corsOptionsDelegate);
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const UPLOAD_PATH = path.join(__dirname, '..', 'uploads');

// Asegurar que el directorio de uploads existe
if (!fs.existsSync(UPLOAD_PATH)) {
    fs.mkdirSync(UPLOAD_PATH, { recursive: true });
}

const fileHandler = {
    async saveFile(file) {
        return new Promise((resolve, reject) => {
            const fileExtension = path.extname(file.name);
            const fileName = crypto.randomBytes(16).toString('hex') + fileExtension;
            const filePath = path.join(UPLOAD_PATH, fileName);
            
            const fileBuffer = Buffer.from(file.data, 'binary');
            
            fs.writeFile(filePath, fileBuffer, (err) => {
                if (err) reject(err);
                else resolve(fileName);
            });
        });
    },

    async processFileUpload(req) {
        return new Promise((resolve, reject) => {
            let data = '';
            let file = {
                name: '',
                data: Buffer.from([])
            };
            let boundary = req.headers['content-type'].split('boundary=')[1];
            
            req.on('data', chunk => {
                data += chunk;
            });
            
            req.on('end', () => {
                try {
                    // Procesar el multipart/form-data manualmente
                    const parts = data.split(boundary);
                    let fileData = null;
                    const formData = {};
                    
                    parts.forEach(part => {
                        if (part.includes('filename')) {
                            const filename = part.match(/filename="(.+?)"/)?.[1];
                            if (filename) {
                                const fileContent = part.split('\r\n\r\n')[1].trim();
                                file.name = filename;
                                file.data = Buffer.from(fileContent, 'binary');
                            }
                        } else if (part.includes('name="')) {
                            const fieldName = part.match(/name="(.+?)"/)?.[1];
                            if (fieldName) {
                                const fieldValue = part.split('\r\n\r\n')[1].trim();
                                formData[fieldName] = fieldValue;
                            }
                        }
                    });
                    
                    resolve({ file, formData });
                } catch (error) {
                    reject(error);
                }
            });
        });
    }
};

module.exports = fileHandler;
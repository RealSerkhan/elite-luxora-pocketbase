import fs from 'fs';


export function appendBodyToForm(formData,req){
    // 1️⃣ Loop through all body fields
        for (const [key, value] of Object.entries(req.body)) {
          // If value is an object/array, we need to JSON.stringify it
          // Because multipart/form-data only supports text or file streams
  
          if (typeof value === 'object') {
            formData.append(key, JSON.stringify(value));
          } else {
  
            formData.append(key, value);
          }
        }
        return formData;
}

export function appendFilesToForm(formData,files){
    if (files && files.length > 0) {
        
        files.forEach(file => {
          formData.append('images',new Blob([fs.readFileSync(file.path)]), file.originalname);
        });
      }
}
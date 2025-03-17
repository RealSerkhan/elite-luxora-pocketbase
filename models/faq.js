import BaseModel from './base_model.js';


class Faq extends BaseModel {
    constructor(data, lang = "en") {
        super(data);

        this.question = data[`question_${lang}`] || data.question_en;

        this.answer = data[`answer_${lang}`] || data.answer_en;



    }
}

export default Faq;
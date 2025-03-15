

class BaseResponse {
    constructor(status, data, error_message) {


        // ✅ Localized Name
        this.status = status;

        this.data = data;

        // ✅ Image Link
        this.error_message = error_message;
    }
    // ✅ Convert class instance to JSON format
    toJSON() {
        return {
            status: this.status,
            data: this.data,
            error_message: this.error_message,

        }
    }
}

export default BaseResponse;
export class AppError extends Error {

    // HTTP Status Code
    statusCode: number;

    constructor(message: string, statusCode: number) {

        super(message);

        this.statusCode = statusCode;
        Object.setPrototypeOf(this, AppError.prototype);
    }

}
import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, ErrorHandler } from '@angular/core';


@Injectable()
export class ErrorsHandlerService implements ErrorHandler {

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    constructor() { }

    handleError(error: Error | HttpErrorResponse) {

        if (error instanceof HttpErrorResponse) {
            // Server or connection error happened

        } else {
            // Handle Client Error (Angular Error, ReferenceError...)     
        }
        console.log(error)
    }
}
package com.waterball.course.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class StageNotFoundException extends RuntimeException {
    public StageNotFoundException(String message) {
        super(message);
    }
}

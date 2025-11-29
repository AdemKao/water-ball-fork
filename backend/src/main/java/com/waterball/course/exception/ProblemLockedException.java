package com.waterball.course.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.FORBIDDEN)
public class ProblemLockedException extends RuntimeException {
    public ProblemLockedException(String message) {
        super(message);
    }
}

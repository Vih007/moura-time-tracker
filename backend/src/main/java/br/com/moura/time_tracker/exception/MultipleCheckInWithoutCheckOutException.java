package br.com.moura.time_tracker.exception;

public class MultipleCheckInWithoutCheckOutException extends RuntimeException {
    public MultipleCheckInWithoutCheckOutException(String message) {
        super(message);
    }
}

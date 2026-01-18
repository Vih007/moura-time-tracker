CREATE TABLE time_entries (
    id UUID PRIMARY KEY,
    employee_id UUID NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    duration_seconds BIGINT,
    CONSTRAINT fk_employee 
        FOREIGN KEY (employee_id) 
        REFERENCES employees(id)
);
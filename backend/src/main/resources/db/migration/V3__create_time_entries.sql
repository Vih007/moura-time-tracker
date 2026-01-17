CREATE TABLE time_entries (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    duration_seconds BIGINT,
    CONSTRAINT fk_employee 
        FOREIGN KEY (employee_id) 
        REFERENCES employees(id)
);
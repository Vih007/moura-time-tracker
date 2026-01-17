ALTER TABLE time_entries RENAME TO work_records;

ALTER TABLE work_records RENAME COLUMN start_time TO checkin_time;
ALTER TABLE work_records RENAME COLUMN end_time TO checkout_time;

ALTER TABLE work_records
    ADD COLUMN reason_id VARCHAR(50),
    ADD COLUMN details TEXT;

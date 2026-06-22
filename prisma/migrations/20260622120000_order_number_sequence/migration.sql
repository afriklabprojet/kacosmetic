-- Migration: add order_number_seq PostgreSQL sequence
-- Replaces the 6-char hex UUID suffix (collision at ~580 orders) with a
-- monotonically increasing integer. Safe under concurrent inserts.
-- The sequence starts at 1 and increments by 1 per call to nextval().
-- Compatible with the existing KA-YYYY-XXXXXX format (zero-padded to 6 digits).

CREATE SEQUENCE IF NOT EXISTS order_number_seq
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;

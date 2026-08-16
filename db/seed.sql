-- Sample seed data for BookNow

-- Venues
INSERT INTO venues (name, address, total_rows, total_cols)
VALUES ('Central Cinema', '123 Main St', 10, 20);

-- Seats for venue 1 (simple grid: rows 1..10, cols 1..20)
DELIMITER $$
BEGIN
	DECLARE r INT DEFAULT 1;
	DECLARE c INT;
	DECLARE seatcode VARCHAR(16);
	SET r = 1;
	WHILE r <= 10 DO
		SET c = 1;
		WHILE c <= 20 DO
			SET seatcode = CONCAT(CHAR(64 + r), c);
			INSERT INTO seats (venue_id, row_num, col_num, seat_code) VALUES (1, r, c, seatcode);
			SET c = c + 1;
		END WHILE;
		SET r = r + 1;
	END WHILE;
END$$
DELIMITER ;

-- Example event
INSERT INTO events (venue_id, title, start_time, end_time)
VALUES (1, 'Avengers: Evening Show', '2026-09-01 19:00:00', '2026-09-01 21:30:00');

-- Map seats to event with default price
INSERT INTO event_seats (event_id, seat_id, price)
SELECT 1 AS event_id, id AS seat_id, 200.00 AS price FROM seats WHERE venue_id = 1;

-- Example user
INSERT INTO users (email, password_hash, role) VALUES ('alice@example.com', 'HASH_PLACEHOLDER', 'customer');


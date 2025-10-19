CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100),
    role VARCHAR(20) CHECK (role IN ('Organizer', 'Participant')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE events (
    event_id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    date DATE NOT NULL,
    venue VARCHAR(150) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bookings (
    booking_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    event_id INT REFERENCES events(event_id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 1,
    booked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Remove UNIQUE(user_id, event_id) to allow multiple bookings per event

INSERT INTO events (title, date, venue, description)
VALUES
('Music Concert', '2025-11-15', 'Navi Mumbai', 'An amazing night of live music.'),
('Tech Expo', '2025-12-01', 'Bangalore', 'Explore cutting-edge technologies and startups.'),
('Art Festival', '2025-11-20', 'Pune', 'A creative showcase of art and culture.'),
('Food Carnival', '2025-12-10', 'Mumbai', 'Enjoy delicious cuisines and street food.'),
('Startup Meetup', '2025-11-25', 'Hyderabad', 'Network with entrepreneurs and investors.'),
('Marathon', '2025-12-05', 'Chennai', 'Join the annual city marathon event.'),
('Book Fair', '2025-11-18', 'Delhi', 'Find new books and meet your favorite authors.'),
('Dance Workshop', '2025-12-15', 'Kolkata', 'Learn dance from professional artists.'),
('Film Festival', '2025-12-20', 'Goa', 'Screenings of independent and classic films.'),
('Science Exhibition', '2025-11-30', 'Ahmedabad', 'Discover innovations by young scientists.');

SELECT*FROM events;
SELECT*FROM users;
SELECT*FROM bookings;
ALTER TABLE users
DROP COLUMN IF EXISTS role;
ALTER TABLE users ADD COLUMN role VARCHAR(20) CHECK (role IN ('Organizer', 'Participant'));





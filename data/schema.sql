DROP TABLE covid19;
CREATE TABLE IF NOT EXISTS covid19(
    id SERIAL PRIMARY KEY,
    country VARCHAR(255),
    countryCode VARCHAR(255),
    totalConfirmed VARCHAR(255),
    totalDeaths VARCHAR(255),
    totalRecovered VARCHAR(255),
    date VARCHAR(255)
);
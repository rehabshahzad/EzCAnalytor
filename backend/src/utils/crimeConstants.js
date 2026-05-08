const CRIME_TYPES = [
  "Homicide",
  "Narcotics",
  "Cyber Crime",
  "Fraud",
  "Traffic Violation",
  "Domestic Violence",
  "Burglary",
  "Arson",
  "Disturbance",
  "Human Trafficking"
];

const DEPARTMENTS = [
  "Homicide",
  "Narcotics",
  "Cyber Crime",
  "Financial Crimes",
  "Traffic",
  "Family Protection",
  "Property Crime",
  "Fire & Arson",
  "Public Safety",
  "Vice"
];

const CRIME_TYPE_TO_DEPARTMENTS = {
  Homicide: ["Homicide"],
  Narcotics: ["Narcotics"],
  "Cyber Crime": ["Cyber Crime"],
  Fraud: ["Financial Crimes"],
  "Traffic Violation": ["Traffic"],
  "Domestic Violence": ["Family Protection"],
  Burglary: ["Property Crime"],
  Arson: ["Fire & Arson"],
  Disturbance: ["Public Safety"],
  "Human Trafficking": ["Vice"]
};

module.exports = {
  CRIME_TYPES,
  DEPARTMENTS,
  CRIME_TYPE_TO_DEPARTMENTS
};

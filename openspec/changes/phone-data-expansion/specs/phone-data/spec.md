## MODIFIED Requirements

### Requirement: Curated phone dataset
The system SHALL maintain a curated dataset of 120-150 phones from the last 4-5 years. Each phone record SHALL include brand, model name, a stock press photo, release year, price tier, form factor, and difficulty rating.

#### Scenario: Phone record structure
- **WHEN** a phone is added to the dataset
- **THEN** it includes: brand (string), model (string), image file path (string), active flag (boolean), releaseYear (integer), priceTier (string: budget|mid|flagship), formFactor (string: bar|flip|fold), and difficulty (string: easy|medium|hard)

### Requirement: Brand coverage
The dataset SHALL include phones from at least 15 major brands including but not limited to: Apple, Samsung, Google, OnePlus, Xiaomi, Nothing, Sony, Motorola, Huawei, OPPO, vivo, Realme, ASUS, Honor, and ZTE/Nubia.

#### Scenario: Multi-brand coverage
- **WHEN** the phone dataset is queried
- **THEN** phones from at least 15 distinct brands are present

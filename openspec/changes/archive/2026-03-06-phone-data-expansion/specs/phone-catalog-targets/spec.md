## ADDED Requirements

### Requirement: Minimum catalog size
The phone catalog SHALL contain at least 120 active phones to provide 4+ months of unique daily puzzles without repeats.

#### Scenario: Catalog size check
- **WHEN** the phone catalog is queried for active phones
- **THEN** at least 120 phones with `active: true` are returned

### Requirement: Brand coverage
The phone catalog SHALL include phones from at least 15 distinct brands.

#### Scenario: Brand diversity
- **WHEN** the distinct brands in the catalog are counted
- **THEN** at least 15 different brands are present

### Requirement: Required brands
The catalog SHALL include phones from each of these brands: Apple, Samsung, Google, OnePlus, Nothing, Xiaomi, Sony, Motorola, Huawei, OPPO, vivo, Realme, ASUS, Honor, and at least one of ZTE or Nubia.

#### Scenario: All required brands present
- **WHEN** the catalog is checked for required brands
- **THEN** every required brand has at least one active phone entry

### Requirement: Brand distribution
The catalog SHALL distribute phones across brands to avoid over-representation, following these guidelines:
- Major brands (Apple, Samsung, Google): 15-20 phones each
- Mid-tier brands (OnePlus, Xiaomi, Nothing, Sony, Motorola): 6-10 phones each
- Niche brands (OPPO, vivo, Realme, ASUS, Honor, Huawei, ZTE/Nubia): 3-5 phones each

#### Scenario: No single brand dominates
- **WHEN** the phone count per brand is calculated
- **THEN** no single brand represents more than 20% of the total catalog

### Requirement: Difficulty distribution
The catalog SHALL contain a balanced mix of difficulty levels for varied gameplay.

#### Scenario: Difficulty balance
- **WHEN** phones are grouped by difficulty
- **THEN** at least 25% are `easy`, at least 25% are `medium`, and at least 20% are `hard`

### Requirement: Form factor variety
The catalog SHALL include phones of different form factors.

#### Scenario: Form factor representation
- **WHEN** phones are grouped by form factor
- **THEN** `bar` phones make up the majority, with at least 5 `flip` and at least 3 `fold` phones

### Requirement: Release year coverage
The catalog SHALL include phones from the last 4-5 model years to keep content recognizable.

#### Scenario: Year range
- **WHEN** the release years of all phones are examined
- **THEN** phones span at least 4 different years between 2021 and 2026

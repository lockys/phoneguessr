## ADDED Requirements

### Requirement: Image collection script
The system SHALL include a Node.js script (`phoneguessr/scripts/collect-images.ts`) that scrapes phone listings from GSMArena, downloads product images, and saves them locally.

#### Scenario: Running the collection script
- **WHEN** the script is executed with `npx tsx phoneguessr/scripts/collect-images.ts`
- **THEN** it fetches phone listing pages from GSMArena for each configured brand
- **AND** downloads product images for candidate phones
- **AND** saves raw images to a staging directory

#### Scenario: Brand configuration
- **WHEN** the script starts
- **THEN** it reads a list of 130+ target brands from an internal configuration array
- **AND** maps each brand name to its GSMArena URL slug

#### Scenario: Script resumability
- **WHEN** the script is interrupted and restarted
- **THEN** it skips brands and phones that already have downloaded images in the staging directory
- **AND** continues from where it left off

### Requirement: Rate limiting
The collection script SHALL implement polite scraping practices to avoid overloading the source server.

#### Scenario: Request delays
- **WHEN** the script makes consecutive HTTP requests to GSMArena
- **THEN** it waits 1-2 seconds (randomized) between each request

#### Scenario: User-Agent header
- **WHEN** the script makes an HTTP request
- **THEN** it includes a descriptive User-Agent header identifying the script

#### Scenario: Sequential requests
- **WHEN** the script is fetching pages
- **THEN** it makes at most 1 concurrent request at a time (no parallel fetching)

### Requirement: HTML parsing with cheerio
The collection script SHALL use cheerio to parse GSMArena HTML pages and extract phone model links, image URLs, and metadata.

#### Scenario: Brand page parsing
- **WHEN** the script fetches a brand's phone listing page from GSMArena
- **THEN** it extracts individual phone model links from the listing
- **AND** identifies phone names and thumbnail URLs

#### Scenario: Phone detail page parsing
- **WHEN** the script fetches an individual phone's detail page
- **THEN** it extracts the full-resolution product image URL
- **AND** extracts the release year from the specifications section
- **AND** extracts the phone type/form factor if available

### Requirement: Image processing with sharp
Downloaded images SHALL be processed to consistent dimensions and format using the sharp library.

#### Scenario: Image resizing
- **WHEN** a downloaded image has a width greater than 800 pixels
- **THEN** it is resized to 800px width with aspect ratio preserved

#### Scenario: Image format conversion
- **WHEN** a downloaded image is in any format (PNG, WebP, GIF, etc.)
- **THEN** it is converted to JPEG format

#### Scenario: Image quality optimization
- **WHEN** an image is saved as JPEG
- **THEN** the quality is set to produce a file under 200KB while maintaining visual clarity
- **AND** the JPEG quality parameter is adjusted between 60-85 to meet the size target

#### Scenario: Minimum dimension filtering
- **WHEN** a downloaded image has a width below 200 pixels or a height below 200 pixels
- **THEN** it is flagged as low-quality and excluded from the final output

### Requirement: File naming convention
Processed images SHALL follow the existing project naming convention.

#### Scenario: Image file naming
- **WHEN** an image for brand "Sony Ericsson" and model "W800" is processed
- **THEN** it is saved as `sony-ericsson-w800.jpg`

#### Scenario: Special character handling
- **WHEN** a model name contains special characters like `+`, `(`, `)`, or `/`
- **THEN** `+` is replaced with `-plus`, parentheses and slashes are removed, and extra hyphens are collapsed

#### Scenario: Output directory
- **WHEN** a processed image is saved
- **THEN** it is written to `phoneguessr/config/public/phones/`

### Requirement: Per-brand model selection
The script SHALL select 2-5 recognizable models per brand, not every phone in the brand's catalog.

#### Scenario: Major brand selection
- **WHEN** processing a major brand (Apple, Samsung, Google, Nokia, Motorola)
- **THEN** up to 5 of the most recognizable models are selected

#### Scenario: Minor brand selection
- **WHEN** processing a minor or niche brand (e.g., Benefon, Amoi, Sewon)
- **THEN** at least 2 models are selected, choosing the most distinctive or well-known ones

#### Scenario: Selection criteria
- **WHEN** choosing which models to include for a brand
- **THEN** preference is given to phones that are visually distinctive, widely recognized, or historically significant
- **AND** phones that look nearly identical to other included phones from the same brand are skipped

### Requirement: Quality filtering
The script SHALL filter out images that are not suitable for the guessing game.

#### Scenario: Render/diagram filtering
- **WHEN** an image appears to be a 3D render, line drawing, or diagram rather than a stock photo
- **THEN** it is excluded from the final output

#### Scenario: Duplicate visual filtering
- **WHEN** two phones from the same brand have nearly identical images
- **THEN** only one is kept in the final catalog

### Requirement: Metadata generation
The script SHALL generate phone-data.json entries with all required metadata fields for each collected phone.

#### Scenario: Generated entry structure
- **WHEN** a phone image is successfully collected and processed
- **THEN** a JSON entry is generated with: brand, model, imagePath, releaseYear, priceTier, formFactor, and difficulty

#### Scenario: Release year extraction
- **WHEN** the phone's GSMArena page lists a release date
- **THEN** the releaseYear field is populated with the year from that date

#### Scenario: Price tier inference
- **WHEN** metadata is generated for a phone
- **THEN** priceTier is inferred from the phone's series name and brand positioning (e.g., Samsung Galaxy S = flagship, Samsung Galaxy A = mid, Samsung Galaxy M = budget)

#### Scenario: Difficulty assignment
- **WHEN** metadata is generated for a phone
- **THEN** difficulty is assigned based on brand recognition: easy (Apple, Samsung, Google, Nokia), medium (OnePlus, Xiaomi, Motorola, Sony, Huawei, HTC, BlackBerry, LG), hard (all other brands)

#### Scenario: Form factor detection
- **WHEN** the phone's type or name indicates a foldable (flip, fold, razr)
- **THEN** formFactor is set to "flip" or "fold" accordingly
- **WHEN** the phone is a standard candy bar / slab form factor
- **THEN** formFactor is set to "bar"

### Requirement: Output report
The script SHALL produce a summary report after execution.

#### Scenario: Completion report
- **WHEN** the script finishes execution
- **THEN** it prints the total number of brands processed, images downloaded, images that passed quality filtering, and any errors encountered

#### Scenario: Error logging
- **WHEN** a brand page or image download fails
- **THEN** the error is logged with the brand/model name and URL
- **AND** the script continues processing remaining brands

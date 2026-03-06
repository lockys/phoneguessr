## ADDED Requirements

### Requirement: Image resolution
Each phone image SHALL have a minimum resolution of 800x1200 pixels (width x height) to ensure clear rendering at all zoom levels in the crop reveal component.

#### Scenario: Image meets minimum resolution
- **WHEN** a phone image is added to the catalog
- **THEN** it has at least 800px width and 1200px height

### Requirement: Image orientation
All phone images SHALL be in portrait orientation showing the back of the device.

#### Scenario: Portrait back view
- **WHEN** a phone image is displayed in the game
- **THEN** the image shows the back of the phone in portrait orientation (taller than wide)

### Requirement: Image background
Phone images SHALL have a clean, solid or near-solid background (white, light gray, or transparent) to ensure visual consistency across the catalog.

#### Scenario: Clean background
- **WHEN** a phone image is viewed
- **THEN** the background is uncluttered and does not distract from the device itself

### Requirement: Image format
Phone images SHALL be in JPG format for raster photos. PNG is acceptable when transparency is needed. SVG placeholders are used for mock mode only.

#### Scenario: Production image format
- **WHEN** a phone image file is added to `config/public/phones/`
- **THEN** the file extension is `.jpg` or `.png`

### Requirement: Image file naming
Phone image files SHALL follow the naming convention `{brand-lowercase}-{model-kebab-case}.{ext}` where brand and model use lowercase with hyphens replacing spaces.

#### Scenario: Correct file naming
- **WHEN** an image for "Samsung Galaxy Z Fold 6" is added
- **THEN** the file is named `samsung-galaxy-z-fold-6.jpg`

#### Scenario: File name matches imagePath
- **WHEN** a phone record's imagePath is `/public/phones/apple-iphone-16-pro.jpg`
- **THEN** a file named `apple-iphone-16-pro.jpg` exists in `config/public/phones/`

### Requirement: Image source preference
Phone images SHOULD be sourced from official press kits or manufacturer product pages to ensure quality and legal safety.

#### Scenario: Press kit photo preferred
- **WHEN** a new phone image is sourced
- **THEN** official press kit or product page images are preferred over user photos or review site images

### Requirement: Image file size
Phone image files SHALL be optimized to under 200KB each to keep the repository manageable and page loads fast.

#### Scenario: File size limit
- **WHEN** a phone image is added to the catalog
- **THEN** the file size does not exceed 200KB

### Requirement: Image storage location
All phone images SHALL be stored in `config/public/phones/` within the repository.

#### Scenario: Image file location
- **WHEN** a phone image is referenced by a phone record
- **THEN** the actual file exists at `config/public/phones/{filename}`

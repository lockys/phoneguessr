## 1. Block Grid Infrastructure

- [x] 1.1 Create BlockGrid component that renders a 6x6 grid of absolutely-positioned divs over the image
- [x] 1.2 Add CSS for block grid container (absolute positioning, pointer-events: none) and individual blocks (background: var(--bg), sized at 16.667%)
- [x] 1.3 Implement deterministic shuffle function (seeded by puzzle date) to create the block removal order

## 2. Progressive Block Removal

- [x] 2.1 Accept `level` and `revealed` props in BlockGrid — compute which blocks are visible at each level (6 blocks removed per wrong guess)
- [x] 2.2 Add staggered fade-out transition for blocks being removed (opacity 0, ~30ms stagger per block in batch)

## 3. Win/Loss Cascade

- [x] 3.1 On win reveal, animate remaining blocks with scale(1.3) + opacity 0 and ~40ms stagger for cascade effect
- [x] 3.2 On loss reveal, fade all remaining blocks simultaneously over 0.3s (no scale, no stagger)
- [x] 3.3 Skip block rendering entirely when returning to a completed puzzle (no blocks, no animation)

## 4. Integration

- [x] 4.1 Render BlockGrid inside CropReveal's crop-container, layered on top of the image
- [x] 4.2 Pass level, revealed, isWin props from CropReveal to BlockGrid
- [x] 4.3 Add CSS keyframes for block-cascade animation

## 5. Verification

- [x] 5.1 Verify blocks fully cover image at start, progressive removal works across all 6 guess levels
- [x] 5.2 Verify win cascade animation plays dramatically with stagger
- [x] 5.3 Verify loss clears blocks quickly without fanfare
- [x] 5.4 Verify returning to completed puzzle shows no blocks

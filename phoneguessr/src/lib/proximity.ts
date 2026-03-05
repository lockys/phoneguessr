export interface PhoneMetadata {
  releaseYear: number | null;
  priceTier: 'budget' | 'mid-range' | 'flagship' | null;
  formFactor: 'bar' | 'flip' | 'fold' | null;
}

export interface ProximityResult {
  sameYear: boolean | null;
  sameTier: boolean | null;
  sameFormFactor: boolean | null;
}

/**
 * Compute proximity feedback between a guessed phone and the answer phone.
 * Returns null for any dimension where metadata is missing on either phone.
 */
export function computeProximity(
  guess: PhoneMetadata,
  answer: PhoneMetadata,
): ProximityResult {
  return {
    sameYear:
      guess.releaseYear !== null && answer.releaseYear !== null
        ? guess.releaseYear === answer.releaseYear
        : null,
    sameTier:
      guess.priceTier !== null && answer.priceTier !== null
        ? guess.priceTier === answer.priceTier
        : null,
    sameFormFactor:
      guess.formFactor !== null && answer.formFactor !== null
        ? guess.formFactor === answer.formFactor
        : null,
  };
}

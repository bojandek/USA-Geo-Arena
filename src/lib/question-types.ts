/**
 * The shape of a question in the pool.
 *
 * It lives in its own file so the question files under `questions/` can
 * import it without creating a cycle with `game-data.ts`.
 */
export interface Question {
  id: string;
  text: string;
  lat: number;
  lng: number;
  category: 'stadium' | 'event' | 'club' | 'athlete';
  hint?: string;
  country: string;
  /**
   * The place the question is about, in a name rather than a coordinate.
   *
   * Two questions can point at the same ground - one about the stadium, one
   * about a final played there - and they must never end up in the same round.
   * Comparing coordinates catches that only when the two points are more than
   * about a kilometre apart, which is not true for a baseball park and the
   * football field next door to it. A name is exact.
   */
  venue?: string;
  /**
   * Other names for the same place.
   *
   * A question about a stadium is answered by naming the town it is in, and
   * the town is not always written down anywhere else: "Kona" and
   * "Kailua-Kona" are the same place, and only one of them is on the map.
   * Anything listed here counts as the answer as well.
   */
  aliases?: string[];
  /** 3-4 interesting facts about this location. */
  facts: string[];
  /**
   * An optional picture of the place.
   *
   * A photo is only ever shown once the answer is known, and it never
   * replaces the map. A stock photograph of the wrong stadium is worse than no
   * photograph at all, so the credit is required rather than optional: a
   * picture that cannot be traced back to its source has no place here.
   */
  image?: {
    /** Where the picture is served from. */
    url: string;
    /** A description for anyone who cannot see the picture. */
    alt: string;
    /** Who took it, or where it came from. */
    credit: string;
    /** Where the credit links to, when there is somewhere to link to. */
    creditUrl?: string;
    /**
     * True for a stock photograph used as atmosphere rather than a picture of
     * the exact place. The card says so, because a stock photo is not proof.
     */
    illustrative?: boolean;
  };
  /**
   * The sponsor of this question, if it has one.
   *
   * A sponsored question is labelled, always. A question that carries an
   * advert without saying so is not advertising, it is a trick.
   */
  sponsor?: {
    /** Who is paying for the question. */
    name: string;
    /** Where to go to find out more. */
    url?: string;
  };
}

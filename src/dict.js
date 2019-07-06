/**
 * When a module need some replacement (like english to portuguese words),
 * this class can be used.
 *
 * Usage:
 *
 * MdHub.dict.set({
 *   'address': 'endereço',
 *   'school': 'escola'
 * });
 */
class Dict {
  constructor(MdHub) {
    this._MdHub = MdHub;
    this._terms = {};
  }

  /**
   * Get a defined term
   * @param  {string} term         Term name (like "address")
   * @param  {string} termNotFound Default substitution (like "address")
   * @return {string}              Substitution (like "endereço")
   */
  get(term, termNotFound) {
    if (this._terms.hasOwnProperty(term)) {
      return JSON.parse(JSON.stringify(this._terms[term]));
    }

    return termNotFound;
  }

  /**
   * Get all defined terms
   * @return {Object} List of terms and substitutions
   */
  getAll() {
    // Clones the object to lose the reference
    return JSON.parse(JSON.stringify(this._terms));
  }

  /**
   * Define terms to be translated
   * @param {Object} terms List of terms and substitutions (like {'address': 'endereço'})
   */
  set(terms) {
    var term;

    for (term in terms) {
      if (this._terms.hasOwnProperty(term)) {
        this._terms[term] = terms[term];
      }
    }

    this._MdHub.event.trigger('core:setDictionary', this.getAll());
    return this.getAll();
  }
}

export default Dict;

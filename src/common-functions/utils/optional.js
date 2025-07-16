const isNil = val => val === null || val === undefined || val === "null" || val === "undefined";

class Optional {

    value = null;
    
    constructor(value) {
        this.value = value;
    }

    static EMPTY = new Optional(null);

    static empty() {
        return Optional.EMPTY;
    }

    static of(value) {
        return new Optional(value);
    }

    isPresent() {
        return !isNil(this.value);
    }

    get() {
        if (isNil(this.value)) {
            throw new Error("No value present");
        }
        return this.value;
    }

    orElse(other) {
        return isNil(this.value) ? other : this.value;
    }

    orElseThrow(error) {
        if (isNil(this.value)) {
            throw error;
        } else {
            return this.value;
        }
    }

    filter(predicate) {
        if (!this.isPresent()) {
          return this;
        }
        return predicate(this.value) ? this : Optional.EMPTY;
      }
    
    ifPresent(consumer) {
        if (this.isPresent()) {
            consumer(this.value);
        }
    }

    map(mapper) {
        if (!this.isPresent()) {
            return this;
        }
        return Optional.of(mapper(this.value));
    }
}

module.exports = Optional;
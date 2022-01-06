class PasswordGenerator {
    constructor() {
        this.symbols = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_-+=';
        this.length = 12;
    }

    generate() {
        let password = [];

        let seen = new Set();
        for (let i = 0; i < this.length; i++) {

            let symbol = this._getRandomSymbol();
            while (seen.has(symbol)) {
                symbol = this._getRandomSymbol();
            }

            seen.add(symbol);
            password.push(symbol);
        }
            return password.join("");
    }

    _getRandomSymbol() {
        return this.symbols.charAt(Math.floor(Math.random() * this.symbols.length));
    }

    _shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
}

module.exports = new PasswordGenerator();
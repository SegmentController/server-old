const makeid = (length, alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') => {
    let result = ''
    const charactersLength = alphabet.length
    let counter = 0
    while (counter < length) {
        result += alphabet.charAt(Math.floor(Math.random() * charactersLength))
        counter += 1
    }
    return result
}

module.exports = {
    makeid
}
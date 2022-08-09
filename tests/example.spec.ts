// import test  from "japa"
const test = require('japa')

test.group('Example', () => {
    test('assert sum', (assert) => {
        assert.equal(2 + 2, 4)
    })
})
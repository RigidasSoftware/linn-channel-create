var chai = require('chai'),
    expect = chai.expect,
    should = chai.should(),
    chaiAsPromised = require("chai-as-promised");
    create = require('../lib/create.js'),
    mock = require('./mock');

chai.use(chaiAsPromised)

//--debug-brk" add this to the test script to hit breakpoints

describe('create', function(){
    describe('.init(options)', function() {

        it("should complain about devkey", function() {
            try {
                create.init();
            }
            catch (e){
                expect(e).to.equal("devkey must be provided");
            }
        });

        it("should set the devkey", function() {
             create.init({ devkey: "123"});

             expect(create.devkey).to.equal("123");
        });

    })
})

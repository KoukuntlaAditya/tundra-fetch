'use strict';

var _fetchMock = require('fetch-mock');

var _fetchMock2 = _interopRequireDefault(_fetchMock);

var _replay = require('./replay');

var _replay2 = _interopRequireDefault(_replay);

var _stringSimilarity = require('./stringSimilarity');

var _submitRequest = require('./submitRequest');

var _submitRequest2 = _interopRequireDefault(_submitRequest);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var emptyProfile = require('./fixtures/profiles/no-requests');
var singleRequest = require('./fixtures/profiles/single-request');
var multipleRequests = require('./fixtures/profiles/multiple-requests');

jest.mock('fetch-mock', function () {
  return {
    reset: jest.fn(),
    mock: jest.fn()
  };
});

jest.mock('./submitRequest', function () {
  return jest.fn();
});

describe('replay', function () {
  describe('matchingFunction', function () {
    var profileRequest = void 0;
    var requestURL = void 0;
    var requestConfig = void 0;

    beforeEach(function () {
      profileRequest = {
        method: 'GET',
        url: 'http://www.someurl.com',
        headers: {
          abc: ['123'],
          xyz: ['456']
        },
        content: 'body'
      };

      requestURL = 'http://www.someurl.com';
      requestConfig = {
        method: 'GET',
        headers: {
          abc: ['123'],
          xyz: ['456']
        },
        body: 'body'
      };
    });

    it('should match a standard request on all factors and an empty matching config', function () {
      expect((0, _replay.matchingFunction)({}, profileRequest)(requestURL, requestConfig)).toBe(true);
      expect(_submitRequest2.default.mock.calls).toMatchSnapshot();
    });

    it('should match a standard request on all factors and a null matching config', function () {
      expect((0, _replay.matchingFunction)(null, profileRequest)(requestURL, requestConfig)).toBe(true);
      expect(_submitRequest2.default.mock.calls).toMatchSnapshot();
    });

    it('should match a standard request on all factors and a matching config with headers to omit', function () {
      profileRequest.headers.xyz = 'something else';
      expect((0, _replay.matchingFunction)({ headersToOmit: ['xyz'] }, profileRequest)(requestURL, requestConfig)).toBe(true);
      expect(_submitRequest2.default.mock.calls).toMatchSnapshot();
    });

    it('should match a standard request on all factors and a matching config with debugging enabled', function () {
      var response = {
        content: 'body',
        headers: { 1: ['1'], 2: ['2'] },
        statusCode: 200
      };
      var config = { debuggingEnabled: true, debugPort: 9091 };

      expect((0, _replay.matchingFunction)(config, profileRequest, response)(requestURL, requestConfig)).toBe(true);
      expect(_submitRequest2.default.mock.calls).toMatchSnapshot();
    });

    it('should match a standard request on all factors with a fuzzy url', function () {
      profileRequest.url = 'http://www.' + _stringSimilarity.WILDCARD_MARKER + '.com';
      expect((0, _replay.matchingFunction)({}, profileRequest)(requestURL, requestConfig)).toBe(true);
      expect(_submitRequest2.default.mock.calls).toMatchSnapshot();
    });

    it('should match a standard request on all factors with a fuzzy header', function () {
      profileRequest.headers.abc = ['1' + _stringSimilarity.WILDCARD_MARKER + '3'];
      expect((0, _replay.matchingFunction)({}, profileRequest)(requestURL, requestConfig)).toBe(true);
      expect(_submitRequest2.default.mock.calls).toMatchSnapshot();
    });

    it('should match a standard request on all factors with a fuzzy body', function () {
      profileRequest.body = 'b' + _stringSimilarity.WILDCARD_MARKER + 'y';
      expect((0, _replay.matchingFunction)({}, profileRequest)(requestURL, requestConfig)).toBe(true);
      expect(_submitRequest2.default.mock.calls).toMatchSnapshot();
    });

    it('should not match a standard request because the URL doesn\'t match', function () {
      profileRequest.url = 'bad';
      expect((0, _replay.matchingFunction)({}, profileRequest)(requestURL, requestConfig)).toBe(false);
      expect(_submitRequest2.default.mock.calls).toMatchSnapshot();
    });

    it('should not match a standard request because the headers don\'t match', function () {
      profileRequest.headers.abc = 'bad';
      expect((0, _replay.matchingFunction)({}, profileRequest)(requestURL, requestConfig)).toBe(false);
      expect(_submitRequest2.default.mock.calls).toMatchSnapshot();
    });

    it('should not match a standard request because the method doesn\'t match', function () {
      profileRequest.method = 'bad';
      expect((0, _replay.matchingFunction)({}, profileRequest)(requestURL, requestConfig)).toBe(false);
      expect(_submitRequest2.default.mock.calls).toMatchSnapshot();
    });

    it('should not match a standard request because the body doesn\'t match', function () {
      profileRequest.content = 'bad';
      expect((0, _replay.matchingFunction)({}, profileRequest)(requestURL, requestConfig)).toBe(false);
      expect(_submitRequest2.default.mock.calls).toMatchSnapshot();
    });
  });

  describe('default', function () {
    beforeEach(function () {
      jest.resetAllMocks();
      _fetchMock2.default.mock.mockImplementation(function () {
        return { catch: jest.fn() };
      });
    });

    it('should mock requests for an empty profile', function () {
      (0, _replay2.default)(emptyProfile, {});

      expect(_fetchMock2.default.reset).toBeCalled();
      expect(_fetchMock2.default.mock.mock.calls).toEqual([]);
    });

    it('should mock requests for a profile with a single request', function () {
      (0, _replay2.default)(singleRequest, {});

      expect(_fetchMock2.default.reset).toBeCalled();
      expect(_fetchMock2.default.mock.mock.calls).toMatchSnapshot();
    });

    it('should mock requests for a profile with two requests and the default repeat mode', function () {
      (0, _replay2.default)(multipleRequests, {});

      expect(_fetchMock2.default.reset).toBeCalled();
      expect(_fetchMock2.default.mock.mock.calls).toMatchSnapshot();
    });

    it('should mock requests for a profile with two requests and a repeat mode of \'first\'', function () {
      (0, _replay2.default)(multipleRequests, { repeatMode: 'first' });

      expect(_fetchMock2.default.reset).toBeCalled();
      expect(_fetchMock2.default.mock.mock.calls).toMatchSnapshot();
    });

    it('should mock requests for a profile with two requests and a repeat mode of \'last\'', function () {
      (0, _replay2.default)(multipleRequests, { repeatMode: 'last' });

      expect(_fetchMock2.default.reset).toBeCalled();
      expect(_fetchMock2.default.mock.mock.calls).toMatchSnapshot();
    });

    it('should catch unmatched requests without debugging enabled', function () {
      _fetchMock2.default.mock.mockImplementation(function () {
        return new Promise(function (response, reject) {
          return reject(singleRequest[0].request);
        });
      });

      (0, _replay2.default)(singleRequest, {});

      expect(_fetchMock2.default.reset).toBeCalled();
      expect(_submitRequest2.default).not.toHaveBeenCalled();
    });

    it('should catch unmatched requests with debugging enabled', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _fetchMock2.default.mock.mockImplementation(function () {
                return new Promise(function (response, reject) {
                  return reject(singleRequest[0].request);
                });
              });

              (0, _replay2.default)(singleRequest, { debuggingEnabled: true, debugPort: 9091 });

              expect(_fetchMock2.default.reset).toBeCalled();
              _context.t0 = expect;
              _context.next = 6;
              return _submitRequest2.default.mock.calls;

            case 6:
              _context.t1 = _context.sent;
              (0, _context.t0)(_context.t1).toMatchSnapshot();

            case 8:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, undefined);
    })));
  });
});
//# sourceMappingURL=replay.test.js.map
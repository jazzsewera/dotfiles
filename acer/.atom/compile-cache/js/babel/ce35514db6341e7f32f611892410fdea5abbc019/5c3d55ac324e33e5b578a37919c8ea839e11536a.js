'use babel';
// Borrowed from Atom core's spec.

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.beforeEach = beforeEach;
exports.afterEach = afterEach;

var conditionPromise = _asyncToGenerator(function* (condition) {
  var startTime = Date.now();

  while (true) {
    yield timeoutPromise(100);

    if (yield condition()) {
      return;
    }

    if (Date.now() - startTime > 5000) {
      throw new Error('Timed out waiting on condition');
    }
  }
});

exports.conditionPromise = conditionPromise;
exports.timeoutPromise = timeoutPromise;
exports.emitterEventPromise = emitterEventPromise;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function beforeEach(fn) {
  global.beforeEach(function () {
    var result = fn();
    if (result instanceof Promise) {
      waitsForPromise(function () {
        return result;
      });
    }
  });
}

function afterEach(fn) {
  global.afterEach(function () {
    var result = fn();
    if (result instanceof Promise) {
      waitsForPromise(function () {
        return result;
      });
    }
  });
}

;['it', 'fit', 'ffit', 'fffit'].forEach(function (name) {
  module.exports[name] = function (description, fn) {
    global[name](description, function () {
      var result = fn();
      if (result instanceof Promise) {
        waitsForPromise(function () {
          return result;
        });
      }
    });
  };
});

function timeoutPromise(timeout) {
  return new Promise(function (resolve) {
    global.setTimeout(resolve, timeout);
  });
}

function waitsForPromise(fn) {
  var promise = fn();
  global.waitsFor('spec promise to resolve', function (done) {
    promise.then(done, function (error) {
      jasmine.getEnv().currentSpec.fail(error);
      done();
    });
  });
}

function emitterEventPromise(emitter, event) {
  var timeout = arguments.length <= 2 || arguments[2] === undefined ? 15000 : arguments[2];

  return new Promise(function (resolve, reject) {
    var timeoutHandle = setTimeout(function () {
      reject(new Error('Timed out waiting for \'' + event + '\' event'));
    }, timeout);
    emitter.once(event, function () {
      clearTimeout(timeoutHandle);
      resolve();
    });
  });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2phenovLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9zcGVjL2FzeW5jLXNwZWMtaGVscGVycy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxXQUFXLENBQUE7Ozs7Ozs7OztJQWdDVyxnQkFBZ0IscUJBQS9CLFdBQWlDLFNBQVMsRUFBRTtBQUNqRCxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUE7O0FBRTVCLFNBQU8sSUFBSSxFQUFFO0FBQ1gsVUFBTSxjQUFjLENBQUMsR0FBRyxDQUFDLENBQUE7O0FBRXpCLFFBQUksTUFBTSxTQUFTLEVBQUUsRUFBRTtBQUNyQixhQUFNO0tBQ1A7O0FBRUQsUUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsU0FBUyxHQUFHLElBQUksRUFBRTtBQUNqQyxZQUFNLElBQUksS0FBSyxDQUFDLGdDQUFnQyxDQUFDLENBQUE7S0FDbEQ7R0FDRjtDQUNGOzs7Ozs7OztBQTNDTSxTQUFTLFVBQVUsQ0FBRSxFQUFFLEVBQUU7QUFDOUIsUUFBTSxDQUFDLFVBQVUsQ0FBQyxZQUFZO0FBQzVCLFFBQU0sTUFBTSxHQUFHLEVBQUUsRUFBRSxDQUFBO0FBQ25CLFFBQUksTUFBTSxZQUFZLE9BQU8sRUFBRTtBQUM3QixxQkFBZSxDQUFDO2VBQU0sTUFBTTtPQUFBLENBQUMsQ0FBQTtLQUM5QjtHQUNGLENBQUMsQ0FBQTtDQUNIOztBQUVNLFNBQVMsU0FBUyxDQUFFLEVBQUUsRUFBRTtBQUM3QixRQUFNLENBQUMsU0FBUyxDQUFDLFlBQVk7QUFDM0IsUUFBTSxNQUFNLEdBQUcsRUFBRSxFQUFFLENBQUE7QUFDbkIsUUFBSSxNQUFNLFlBQVksT0FBTyxFQUFFO0FBQzdCLHFCQUFlLENBQUM7ZUFBTSxNQUFNO09BQUEsQ0FBQyxDQUFBO0tBQzlCO0dBQ0YsQ0FBQyxDQUFBO0NBQ0g7O0FBRUQsQ0FBQyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLElBQUksRUFBRTtBQUN0RCxRQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLFVBQVUsV0FBVyxFQUFFLEVBQUUsRUFBRTtBQUNoRCxVQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsV0FBVyxFQUFFLFlBQVk7QUFDcEMsVUFBTSxNQUFNLEdBQUcsRUFBRSxFQUFFLENBQUE7QUFDbkIsVUFBSSxNQUFNLFlBQVksT0FBTyxFQUFFO0FBQzdCLHVCQUFlLENBQUM7aUJBQU0sTUFBTTtTQUFBLENBQUMsQ0FBQTtPQUM5QjtLQUNGLENBQUMsQ0FBQTtHQUNILENBQUE7Q0FDRixDQUFDLENBQUE7O0FBa0JLLFNBQVMsY0FBYyxDQUFFLE9BQU8sRUFBRTtBQUN2QyxTQUFPLElBQUksT0FBTyxDQUFDLFVBQVUsT0FBTyxFQUFFO0FBQ3BDLFVBQU0sQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFBO0dBQ3BDLENBQUMsQ0FBQTtDQUNIOztBQUVELFNBQVMsZUFBZSxDQUFFLEVBQUUsRUFBRTtBQUM1QixNQUFNLE9BQU8sR0FBRyxFQUFFLEVBQUUsQ0FBQTtBQUNwQixRQUFNLENBQUMsUUFBUSxDQUFDLHlCQUF5QixFQUFFLFVBQVUsSUFBSSxFQUFFO0FBQ3pELFdBQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLFVBQVUsS0FBSyxFQUFFO0FBQ2xDLGFBQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFBO0FBQ3hDLFVBQUksRUFBRSxDQUFBO0tBQ1AsQ0FBQyxDQUFBO0dBQ0gsQ0FBQyxDQUFBO0NBQ0g7O0FBRU0sU0FBUyxtQkFBbUIsQ0FBRSxPQUFPLEVBQUUsS0FBSyxFQUFtQjtNQUFqQixPQUFPLHlEQUFHLEtBQUs7O0FBQ2xFLFNBQU8sSUFBSSxPQUFPLENBQUMsVUFBQyxPQUFPLEVBQUUsTUFBTSxFQUFLO0FBQ3RDLFFBQU0sYUFBYSxHQUFHLFVBQVUsQ0FBQyxZQUFNO0FBQ3JDLFlBQU0sQ0FBQyxJQUFJLEtBQUssOEJBQTJCLEtBQUssY0FBVSxDQUFDLENBQUE7S0FDNUQsRUFBRSxPQUFPLENBQUMsQ0FBQTtBQUNYLFdBQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLFlBQU07QUFDeEIsa0JBQVksQ0FBQyxhQUFhLENBQUMsQ0FBQTtBQUMzQixhQUFPLEVBQUUsQ0FBQTtLQUNWLENBQUMsQ0FBQTtHQUNILENBQUMsQ0FBQTtDQUNIIiwiZmlsZSI6Ii9ob21lL2phenovLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9zcGVjL2FzeW5jLXNwZWMtaGVscGVycy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG4vLyBCb3Jyb3dlZCBmcm9tIEF0b20gY29yZSdzIHNwZWMuXG5cbmV4cG9ydCBmdW5jdGlvbiBiZWZvcmVFYWNoIChmbikge1xuICBnbG9iYWwuYmVmb3JlRWFjaChmdW5jdGlvbiAoKSB7XG4gICAgY29uc3QgcmVzdWx0ID0gZm4oKVxuICAgIGlmIChyZXN1bHQgaW5zdGFuY2VvZiBQcm9taXNlKSB7XG4gICAgICB3YWl0c0ZvclByb21pc2UoKCkgPT4gcmVzdWx0KVxuICAgIH1cbiAgfSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFmdGVyRWFjaCAoZm4pIHtcbiAgZ2xvYmFsLmFmdGVyRWFjaChmdW5jdGlvbiAoKSB7XG4gICAgY29uc3QgcmVzdWx0ID0gZm4oKVxuICAgIGlmIChyZXN1bHQgaW5zdGFuY2VvZiBQcm9taXNlKSB7XG4gICAgICB3YWl0c0ZvclByb21pc2UoKCkgPT4gcmVzdWx0KVxuICAgIH1cbiAgfSlcbn1cblxuO1snaXQnLCAnZml0JywgJ2ZmaXQnLCAnZmZmaXQnXS5mb3JFYWNoKGZ1bmN0aW9uIChuYW1lKSB7XG4gIG1vZHVsZS5leHBvcnRzW25hbWVdID0gZnVuY3Rpb24gKGRlc2NyaXB0aW9uLCBmbikge1xuICAgIGdsb2JhbFtuYW1lXShkZXNjcmlwdGlvbiwgZnVuY3Rpb24gKCkge1xuICAgICAgY29uc3QgcmVzdWx0ID0gZm4oKVxuICAgICAgaWYgKHJlc3VsdCBpbnN0YW5jZW9mIFByb21pc2UpIHtcbiAgICAgICAgd2FpdHNGb3JQcm9taXNlKCgpID0+IHJlc3VsdClcbiAgICAgIH1cbiAgICB9KVxuICB9XG59KVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY29uZGl0aW9uUHJvbWlzZSAoY29uZGl0aW9uKSB7XG4gIGNvbnN0IHN0YXJ0VGltZSA9IERhdGUubm93KClcblxuICB3aGlsZSAodHJ1ZSkge1xuICAgIGF3YWl0IHRpbWVvdXRQcm9taXNlKDEwMClcblxuICAgIGlmIChhd2FpdCBjb25kaXRpb24oKSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgaWYgKERhdGUubm93KCkgLSBzdGFydFRpbWUgPiA1MDAwKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RpbWVkIG91dCB3YWl0aW5nIG9uIGNvbmRpdGlvbicpXG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0aW1lb3V0UHJvbWlzZSAodGltZW91dCkge1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUpIHtcbiAgICBnbG9iYWwuc2V0VGltZW91dChyZXNvbHZlLCB0aW1lb3V0KVxuICB9KVxufVxuXG5mdW5jdGlvbiB3YWl0c0ZvclByb21pc2UgKGZuKSB7XG4gIGNvbnN0IHByb21pc2UgPSBmbigpXG4gIGdsb2JhbC53YWl0c0Zvcignc3BlYyBwcm9taXNlIHRvIHJlc29sdmUnLCBmdW5jdGlvbiAoZG9uZSkge1xuICAgIHByb21pc2UudGhlbihkb25lLCBmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgIGphc21pbmUuZ2V0RW52KCkuY3VycmVudFNwZWMuZmFpbChlcnJvcilcbiAgICAgIGRvbmUoKVxuICAgIH0pXG4gIH0pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBlbWl0dGVyRXZlbnRQcm9taXNlIChlbWl0dGVyLCBldmVudCwgdGltZW91dCA9IDE1MDAwKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgY29uc3QgdGltZW91dEhhbmRsZSA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgcmVqZWN0KG5ldyBFcnJvcihgVGltZWQgb3V0IHdhaXRpbmcgZm9yICcke2V2ZW50fScgZXZlbnRgKSlcbiAgICB9LCB0aW1lb3V0KVxuICAgIGVtaXR0ZXIub25jZShldmVudCwgKCkgPT4ge1xuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRIYW5kbGUpXG4gICAgICByZXNvbHZlKClcbiAgICB9KVxuICB9KVxufVxuIl19
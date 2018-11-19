webpackJsonp([1],{

/***/ 281:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__view_jsx__ = __webpack_require__(679);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "view", function() { return __WEBPACK_IMPORTED_MODULE_0__view_jsx__["a"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__reducer__ = __webpack_require__(680);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "reducer", function() { return __WEBPACK_IMPORTED_MODULE_1__reducer__["a"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__saga__ = __webpack_require__(681);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "saga", function() { return __WEBPACK_IMPORTED_MODULE_2__saga__["a"]; });




/***/ }),

/***/ 679:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_react_router_dom__ = __webpack_require__(178);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_react_redux__ = __webpack_require__(177);
/**
 * Created by fed on 2017/8/24.
 */




/* harmony default export */ __webpack_exports__["a"] = (Object(__WEBPACK_IMPORTED_MODULE_2_react_redux__["connect"])(function (state) {
  return state['b/a'];
})(function (_ref) {
  var loading = _ref.loading;
  return __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
    'div',
    null,
    '\u6211\u662Fb.a.ab.bd!',
    __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement('input', { type: 'text', 'data-bind': 'k' }),
    loading && '正在加载。。。',
    __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
      'button',
      { 'data-load': {
          fn: async function fn() {
            return new Promise(function (resolve) {
              return setTimeout(function () {
                return resolve({ k: 100 });
              }, 2000);
            });
          },
          arg: [],
          loadings: ['loading']
        } },
      'click me!'
    )
  );
}));

/***/ }),

/***/ 680:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/**
 * Created by fed on 2017/8/24.
 */
var defaultState = {
  k: ''

};

/* harmony default export */ __webpack_exports__["a"] = (function () {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultState;

  return state;
});

/***/ }),

/***/ 681:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = _callee;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_redux_saga_effects__ = __webpack_require__(78);
var _marked = /*#__PURE__*/regeneratorRuntime.mark(_callee);

/**
 * Created by fed on 2017/8/24.
 */


function _callee() {
  return regeneratorRuntime.wrap(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return Object(__WEBPACK_IMPORTED_MODULE_0_redux_saga_effects__["take"])('aaa');

        case 2:
        case 'end':
          return _context.stop();
      }
    }
  }, _marked, this);
}

/***/ })

});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9zcmMvY29tcG9uZW50cy9iL2EvbWUuanNvbiIsIndlYnBhY2s6Ly8vLi9zcmMvY29tcG9uZW50cy9iL2Evdmlldy5qc3giLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvbXBvbmVudHMvYi9hL3JlZHVjZXIuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvbXBvbmVudHMvYi9hL3NhZ2EuanMiXSwibmFtZXMiOlsiY29ubmVjdCIsInN0YXRlIiwibG9hZGluZyIsImZuIiwiUHJvbWlzZSIsInNldFRpbWVvdXQiLCJyZXNvbHZlIiwiayIsImFyZyIsImxvYWRpbmdzIiwiZGVmYXVsdFN0YXRlIiwidGFrZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQUFBO0FBQ0E7Ozs7Ozs7Ozs7OztBQ0RBO0FBQUE7OztBQUdBO0FBQ0E7QUFDQTs7QUFFQSx5REFBZSw0REFBQUEsQ0FBUTtBQUFBLFNBQVNDLE1BQU0sS0FBTixDQUFUO0FBQUEsQ0FBUixFQUErQjtBQUFBLE1BQUdDLE9BQUgsUUFBR0EsT0FBSDtBQUFBLFNBQWlCO0FBQUE7QUFBQTtBQUFBO0FBRTdELDJFQUFPLE1BQUssTUFBWixFQUFtQixhQUFVLEdBQTdCLEdBRjZEO0FBRzVEQSxlQUFXLFNBSGlEO0FBSTdEO0FBQUE7QUFBQSxRQUFRLGFBQVc7QUFDakJDLGNBQUk7QUFBQSxtQkFBWSxJQUFJQyxPQUFKLENBQVk7QUFBQSxxQkFBV0MsV0FBVztBQUFBLHVCQUFNQyxRQUFRLEVBQUVDLEdBQUcsR0FBTCxFQUFSLENBQU47QUFBQSxlQUFYLEVBQXNDLElBQXRDLENBQVg7QUFBQSxhQUFaLENBQVo7QUFBQSxXQURhO0FBRWpCQyxlQUFLLEVBRlk7QUFHakJDLG9CQUFVLENBQUMsU0FBRDtBQUhPLFNBQW5CO0FBQUE7QUFBQTtBQUo2RCxHQUFqQjtBQUFBLENBQS9CLENBQWYsRTs7Ozs7Ozs7QUNQQTs7O0FBR0EsSUFBTUMsZUFBZTtBQUNuQkgsS0FBRzs7QUFEZ0IsQ0FBckI7O0FBS0EseURBQWUsWUFBZ0M7QUFBQSxNQUF0Qk4sS0FBc0IsdUVBQWRTLFlBQWM7O0FBQzdDLFNBQU9ULEtBQVA7QUFDRCxDOzs7Ozs7Ozs7Ozs7QUNWRDs7O0FBR0E7O0FBRWU7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsaUJBQ1AsZ0VBQUFVLENBQUssS0FBTCxDQURPOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEMiLCJmaWxlIjoiYl9hLmZhZjZlYmE0OTRkMjlkNmUyNDBmLmNodW5rLmpzIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IHsgZGVmYXVsdCBhcyB2aWV3IH0gZnJvbSBcIi4vdmlldy5qc3hcIjtcbmV4cG9ydCB7IGRlZmF1bHQgYXMgcmVkdWNlciB9IGZyb20gXCIuL3JlZHVjZXJcIjtcbmV4cG9ydCB7IGRlZmF1bHQgYXMgc2FnYSB9IGZyb20gXCIuL3NhZ2FcIjtcblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvY29tcG9uZW50cy9iL2EvbWUuanNvbiIsIi8qKlxuICogQ3JlYXRlZCBieSBmZWQgb24gMjAxNy84LzI0LlxuICovXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgTGluayB9IGZyb20gJ3JlYWN0LXJvdXRlci1kb20nO1xuaW1wb3J0IHsgY29ubmVjdCB9IGZyb20gJ3JlYWN0LXJlZHV4JztcblxuZXhwb3J0IGRlZmF1bHQgY29ubmVjdChzdGF0ZSA9PiBzdGF0ZVsnYi9hJ10pKCh7IGxvYWRpbmcgfSkgPT4gPGRpdj5cbiAg5oiR5pivYi5hLmFiLmJkIVxuICA8aW5wdXQgdHlwZT1cInRleHRcIiBkYXRhLWJpbmQ9XCJrXCIgLz5cbiAge2xvYWRpbmcgJiYgJ+ato+WcqOWKoOi9veOAguOAguOAgid9XG4gIDxidXR0b24gZGF0YS1sb2FkPXt7XG4gICAgZm46IGFzeW5jICgpID0+IG5ldyBQcm9taXNlKHJlc29sdmUgPT4gc2V0VGltZW91dCgoKSA9PiByZXNvbHZlKHsgazogMTAwIH0pLCAyMDAwKSksXG4gICAgYXJnOiBbXSxcbiAgICBsb2FkaW5nczogWydsb2FkaW5nJ11cbiAgfX0+XG4gICAgY2xpY2sgbWUhXG4gIDwvYnV0dG9uPlxuPC9kaXY+KTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9jb21wb25lbnRzL2IvYS92aWV3LmpzeCIsIi8qKlxuICogQ3JlYXRlZCBieSBmZWQgb24gMjAxNy84LzI0LlxuICovXG5jb25zdCBkZWZhdWx0U3RhdGUgPSB7XG4gIGs6ICcnLFxuXG59O1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiAoc3RhdGUgPSBkZWZhdWx0U3RhdGUpIHtcbiAgcmV0dXJuIHN0YXRlO1xufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL2NvbXBvbmVudHMvYi9hL3JlZHVjZXIuanMiLCIvKipcbiAqIENyZWF0ZWQgYnkgZmVkIG9uIDIwMTcvOC8yNC5cbiAqL1xuaW1wb3J0IHsgdGFrZSB9IGZyb20gJ3JlZHV4LXNhZ2EvZWZmZWN0cyc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uICooKSB7XG4gIHlpZWxkIHRha2UoJ2FhYScpO1xufVxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9jb21wb25lbnRzL2IvYS9zYWdhLmpzIl0sInNvdXJjZVJvb3QiOiIifQ==
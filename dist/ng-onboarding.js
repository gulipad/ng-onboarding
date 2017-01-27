(function() {
  var app;

  app = angular.module('ngOnboarding', []);

  app.provider('ngOnboardingDefaults', function() {
    return {
      options: {
        overlay: true,
        overlayOpacity: 0.6,
        overlayClass: 'onboarding-overlay',
        popoverClass: 'onboarding-popover',
        titleClass: 'onboarding-popover-title',
        contentClass: 'onboarding-popover-content',
        arrowClass: 'onboarding-arrow',
        buttonContainerClass: 'onboarding-button-container',
        buttonClass: 'onboarding-button',
        acceptTourButtonClass: 'onboarding-accept',
        dontAccetpTourButtonClass: 'onboarding-reject',
        showButtons: true,
        nextButtonText: 'Next &rarr;',
        previousButtonText: '&larr; Previous',
        showDoneButton: true,
        doneButtonText: 'Done',
        showCloseButton: true,
        closeButtonClass: 'onboarding-close-button',
        closeButtonText: 'X',
        stepClass: 'onboarding-step-info',
        showStepInfo: true
      },
      $get: function() {
        return this.options;
      },
      set: function(keyOrHash, value) {
        var k, v, _results;
        if (typeof keyOrHash === 'object') {
          _results = [];
          for (k in keyOrHash) {
            v = keyOrHash[k];
            _results.push(this.options[k] = v);
          }
          return _results;
        } else {
          return this.options[keyOrHash] = value;
        }
      }
    };
  });

  app.directive('onboardingPopover', [
    'ngOnboardingDefaults', '$sce', '$timeout', function(ngOnboardingDefaults, $sce, $timeout) {
      return {
        restrict: 'E',
        scope: {
          enabled: '=',
          steps: '=',
          onFinishCallback: '<onFinishCallback',
          index: '=stepIndex'
        },
        replace: true,
        link: function(scope, element, attrs) {
          var attributesToClear, curStep, setupOverlay, setupPositioning;
          curStep = null;
          attributesToClear = ['title', 'top', 'right', 'bottom', 'left', 'width', 'height', 'position'];
          scope.stepCount = scope.steps.length;
          scope.next = function() {
            return scope.index = scope.index + 1;
          };
          scope.previous = function() {
            return scope.index = scope.index - 1;
          };
          scope.close = function(dontShowAnyMore) {
            scope.enabled = false;
            setupOverlay(false);
            if (scope.onFinishCallback) {
              return scope.onFinishCallback(dontShowAnyMore);
            }
          };
          scope.$watch('index', function(newVal, oldVal) {
            if (newVal === null) {
              scope.enabled = false;
              setupOverlay(false);
              return;
            }
            curStep = scope.steps[scope.index];
            if (curStep.preStep) {
              curStep.preStep();
            }
            return $timeout(function() {
              var attr, k, v, _i, _len;
              scope.finalStep = curStep.finalStep;
              scope.acceptTourStep = curStep.acceptTour;
              scope.lastStep = scope.index + 1 === scope.steps.length;
              scope.showNextButton = scope.index + 1 < scope.steps.length;
              scope.showPreviousButton = scope.index > 0;
              for (_i = 0, _len = attributesToClear.length; _i < _len; _i++) {
                attr = attributesToClear[_i];
                scope[attr] = null;
              }
              for (k in ngOnboardingDefaults) {
                v = ngOnboardingDefaults[k];
                if (curStep[k] === void 0) {
                  scope[k] = v;
                }
              }
              for (k in curStep) {
                v = curStep[k];
                scope[k] = v;
              }
              scope.description = $sce.trustAsHtml(scope.description);
              scope.nextButtonText = $sce.trustAsHtml(scope.nextButtonText);
              scope.previousButtonText = $sce.trustAsHtml(scope.previousButtonText);
              scope.doneButtonText = $sce.trustAsHtml(scope.doneButtonText);
              scope.closeButtonText = $sce.trustAsHtml(scope.closeButtonText);
              setupOverlay();
              return setupPositioning();
            });
          });
          setupOverlay = function(showOverlay) {
            if (showOverlay == null) {
              showOverlay = true;
            }
            $('.onboarding-focus').removeClass('onboarding-focus');
            if (showOverlay) {
              if (curStep['attachTo'] && scope.overlay) {
                $(curStep['attachTo']).addClass('onboarding-focus');
                if (curStep['alsoHighlight']) {
                  return $(curStep['alsoHighlight']).addClass('onboarding-focus');
                }
              }
            }
          };
          setupPositioning = function() {
            var attachTo, bottom, left, right, top, xMargin, yMargin;
            attachTo = curStep['attachTo'];
            scope.position = curStep['position'];
            xMargin = 15;
            yMargin = 15;
            if (attachTo) {
              if (!(scope.left || scope.right)) {
                left = null;
                right = null;
                if (scope.position === 'right') {
                  left = $(attachTo).offset().left + $(attachTo).outerWidth() + xMargin;
                } else if (scope.position === 'left') {
                  right = $(window).width() - $(attachTo).offset().left + xMargin;
                } else if (scope.position === 'top' || scope.position === 'bottom') {
                  left = $(attachTo).offset().left;
                }
                if (curStep['xOffset']) {
                  if (left !== null) {
                    left = left + curStep['xOffset'];
                  }
                  if (right !== null) {
                    right = right - curStep['xOffset'];
                  }
                }
                scope.left = left;
                scope.right = right;
              }
              if (!(scope.top || scope.bottom)) {
                top = null;
                bottom = null;
                if (scope.position === 'left' || scope.position === 'right') {
                  top = $(attachTo).offset().top;
                } else if (scope.position === 'bottom') {
                  top = $(attachTo).offset().top + $(attachTo).outerHeight() + yMargin;
                } else if (scope.position === 'top') {
                  bottom = $(window).height() - $(attachTo).offset().top + yMargin;
                }
                if (curStep['yOffset']) {
                  if (top !== null) {
                    top = top + curStep['yOffset'];
                  }
                  if (bottom !== null) {
                    bottom = bottom - curStep['yOffset'];
                  }
                }
                scope.top = top;
                scope.bottom = bottom;
              }
            }
            if (scope.position && scope.position.length) {
              return scope.positionClass = "onboarding-" + scope.position;
            } else {
              return scope.positionClass = null;
            }
          };
          if (scope.steps.length && !scope.index) {
            return scope.index = 0;
          }
        },
        template: "<div class='onboarding-container' ng-show='enabled'>\n  <div class='{{overlayClass}}' ng-style='{opacity: overlayOpacity}', ng-show='overlay'></div>\n  <div class='{{popoverClass}} {{positionClass}}' ng-style=\"{width: width + 'px', height: height + 'px', left: left + 'px', top: top + 'px', right: right + 'px', bottom: bottom + 'px'}\">\n    <div class='{{arrowClass}}'></div>\n    <h3 class='{{titleClass}}' ng-show='title' ng-bind='title'></h3>\n    <a href='' ng-if='showCloseButton' ng-click='close(true)' class='{{closeButtonClass}}' ng-bind-html='closeButtonText'></a>\n\n    <div ng-if='acceptTourStep' class='onboarding-accept-holder'>\n      <div ng-bind-html='description'></div>\n      <button ng-click='next()' class='{{buttonClass}} {{acceptTourButtonClass}}'>{{acceptTourStep.ok | translate}}</button>\n      <button ng-click='close(true)' class='{{buttonClass}} {{dontAccetpTourButtonClass}}'>{{acceptTourStep.ko | translate}}</button>\n      <p>{{acceptTourStep.disclaimer}}</p>\n    </div>\n\n    <div ng-if='!acceptTourStep'>\n      <div class='{{contentClass}}'>\n        <p ng-bind-html='description'></p>\n      </div>\n      <div class='{{buttonContainerClass}}' ng-show='showButtons'>\n        <span ng-show='showStepInfo' class='{{stepClass}}'>Step {{index + 1}} of {{stepCount}}</span>\n        <button href='' ng-click='previous()' ng-show='showPreviousButton' class='{{buttonClass}}'>{{previousButtonText | translate}}</button>\n        <button href='' ng-click='next()' ng-show='showNextButton' class='{{buttonClass}}'>{{nextButtonText | translate}}</button>\n        <button href='' ng-click='close(finalStep)' ng-show='showDoneButton && lastStep' class='{{buttonClass}}'>{{doneButtonText | translate}}</button>\n      </div>\n    </div>\n\n  </div>\n</div>"
      };
    }
  ]);

}).call(this);

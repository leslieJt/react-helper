import React from 'react';
import createDataMinusPropsReactElement from './react/data-props';
import WithPageComponent from './react/with-page-component';

React.createElement = createDataMinusPropsReactElement;
React.WithPageComponent = WithPageComponent;

import React from 'react';

const If = ({ condition, children }) => {
  if (condition) {
    return <>{children}</>;
  }
  return null;
};

export default If;

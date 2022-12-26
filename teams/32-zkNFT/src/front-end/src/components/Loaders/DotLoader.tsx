import React from 'react';

const DotLoader = () => {
  return (
    <div className="inline-flex items-center">
      <div className={'loader-dot1 bg-black dark:bg-white'} />
      <div className={'loader-dot2 bg-black dark:bg-white'} />
      <div className={'loader-dot3 bg-black dark:bg-white'} />
    </div>
  );
};

export default DotLoader;

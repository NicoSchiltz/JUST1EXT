import React from 'react';
import { render } from 'react-dom';

import './index.scss';

const Popup = () => {
  return (
    <div className="popup">
      // TODO
    </div>
  );
};

render(<Popup />, window.document.querySelector('#app'));

if (module.hot) module.hot.accept();

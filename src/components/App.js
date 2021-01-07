import React, { Fragment } from 'react';
import { Route } from 'react-router-dom';

import CalendarManager from '../pages/calendarManager';

const App = () => (
  <Fragment>
      <main>
        <Route exact path="/" component={CalendarManager} />
      </main>
  </Fragment>
);

export default (App);
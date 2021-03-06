/* @flow */

import React from 'react';
import { reduxForm, Field } from 'redux-form/immutable';
import { Link } from 'react-router';
import ReactGA from 'react-ga';
import { CardActions } from 'material-ui/Card';
import PersonIcon from 'material-ui/svg-icons/social/person';
import EmailIcon from 'material-ui/svg-icons/communication/email';
import LockIcon from 'material-ui/svg-icons/action/lock';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import { renderTextField } from 'utils/renderFields';
import CardLayout from '../../CardLayout';
import Heading from '../Heading';
import InputGroup from '../InputGroup';
import ButtonGroup from '../ButtonGroup';
import Footer from '../../Layout/Footer';

const trackSignupBtn = () => {
  ReactGA.event({
    category: 'User',
    action: 'Click Sign Up Button',
  });
};

const validate = (values) => {
  const errors = {};
  if (!values.get('email')) errors.email = 'Required';
  else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.get('email'))) errors.email = 'Email Invalid';
  if (!values.get('password')) errors.password = 'Required';
  else if (values.get('password').length < 6) errors.password = 'Password Invalid';
  return errors;
};

type LoginProps = {
  handleSubmit: Function,
  submitting: boolean
}

const Login = ({ handleSubmit, submitting }: LoginProps) => (
  <div>
    <CardLayout>
      <form onSubmit={handleSubmit}>
        <Heading>
          <PersonIcon />
          <div>User Login</div>
        </Heading>

        <InputGroup>
          <EmailIcon />
          <Field
            name="email"
            label="Email"
            type="email"
            component={renderTextField}
          />
        </InputGroup>

        <InputGroup>
          <LockIcon />
          <Field
            name="password"
            label="Password"
            type="password"
            component={renderTextField}
          />
        </InputGroup>
        <CardActions>
          <ButtonGroup>
            <RaisedButton
              type="submit"
              primary
              label="Login"
              disabled={submitting}
            />
          </ButtonGroup>
          <ButtonGroup>
            <FlatButton
              containerElement={<Link to="/account/register" />}
              label="Sign up for free"
              onTouchTap={trackSignupBtn}
            />
          </ButtonGroup>
        </CardActions>
      </form>
    </CardLayout>
    <Footer />
  </div>
);

export default reduxForm({
  form: 'login',
  validate,
})(Login);

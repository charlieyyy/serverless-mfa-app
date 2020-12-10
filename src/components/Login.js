import React, { useState } from "react";
import { Auth } from "aws-amplify";
import Form from "react-bootstrap/Form";
import { useHistory } from "react-router-dom";
import LoaderButton from "../components/LoaderButton";
import { useAppContext } from "../libs/contextLib";
import { useFormFields } from "../libs/hooksLib";
import { onError } from "../libs/errorLib";
import "./css/Login.css";

export default function Login() {
  const history = useHistory();
  const { userHasAuthenticated } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [fields, handleFieldChange] = useFormFields({
    email: "",
    password: "",
    confirmationCode: "",
  });

  function validateForm() {
    return fields.email.length > 0 && fields.password.length > 0;
  }

  function validateConfirmationForm() {
    return fields.confirmationCode.length > 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setIsLoading(true);

    try {
      const user = await Auth.signIn(fields.email, fields.password);
      setUser(user);
      console.log(user);
      if (user.challengeName === 'SMS_MFA' || user.challengeName === 'SOFTWARE_TOKEN_MFA') {
        setShowConfirmation(true);
      } else {
        userHasAuthenticated(true); 
        history.push("/profile");
      }
    } catch (e) {
      onError(e);
      setIsLoading(false);
    }
  }

  async function handleConfirmationSubmit(event) {
    event.preventDefault();

    setIsLoading(true);

    console.log('CODE:', fields.confirmationCode);
    console.log(user);

    try {
      // You need to get the code from the UI inputs
      // and then trigger the following function with a button click
      const code = fields.confirmationCode;
      // If MFA is enabled, sign-in should be confirmed with the confirmation code
      await Auth.confirmSignIn(
          user,   // Return object from Auth.signIn()
          code,   // Confirmation code  
          'SOFTWARE_TOKEN_MFA' // MFA Type e.g. SMS_MFA, SOFTWARE_TOKEN_MFA
      );
      userHasAuthenticated(true);
      history.push("/profile");
    } catch (e) {
      onError(e);
      setIsLoading(false);
    }
  }

  return (
    <div className="Login">
       {
          !showConfirmation && (
          <Form onSubmit={handleSubmit}>
            <Form.Group size="lg" controlId="email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                autoFocus
                type="email"
                value={fields.email}
                onChange={handleFieldChange}
              />
            </Form.Group>
            <Form.Group size="lg" controlId="password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={fields.password}
                onChange={handleFieldChange}
              />
            </Form.Group>
            <LoaderButton
              block
              size="lg"
              type="submit"
              isLoading={isLoading}
              disabled={!validateForm()}
            >
              Login
            </LoaderButton>
          </Form>
          )
        }
        {
          showConfirmation && (
          <Form onSubmit={handleConfirmationSubmit}>
            <Form.Group controlId="confirmationCode" size="lg">
              <Form.Label>Confirmation TOTP Code</Form.Label>
              <Form.Control
                autoFocus
                type="tel"
                onChange={handleFieldChange}
                value={fields.confirmationCode}
              />
              <Form.Text muted>Please check your google authenticator for the code.</Form.Text>
            </Form.Group>
            <LoaderButton
              block
              size="lg"
              type="submit"
              variant="success"
              isLoading={false}
              disabled={!validateConfirmationForm()}
            >
              Verify
            </LoaderButton>
          </Form>
          )
        }
    </div>
  );
}
